const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const authenticateToken = require('../auth/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');
const { uploadSingle, handleMulterError } = require('../middleware/multerMemory');
const cloudinaryUpload = require('../middleware/cloudinaryUpload');
const { generateReadableCaseId, generateNextHearingDate } = require('../utils/caseUtils');

const Case = require('../models/cases');
const Evidence = require('../models/evidence');
const MLAnalysis = require('../models/MLanalysis');
const User = require('../models/user');
const Judge = require('../models/judge');

/**
 * GET /api/cases/user
 * Returns cases where the logged-in user is filer or defendant.
 * Requires Authorization: Bearer <token>
 * Output fields per item: title, status, date, time, caseId
 */
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const cases = await Case.find({
      $or: [
        { filer: userId },
        { defendant: userId }
      ]
    })
    .sort({ next_hearing: 1, createdAt: -1 })
    .select('case_title status filing_date next_hearing readable_case_id');

    const formatted = (cases || []).map(c => {
      const dateObj = c.next_hearing || c.filing_date || c.createdAt;
      let date = '';
      let time = '';
      if (dateObj) {
        const d = new Date(dateObj);
        date = d.toISOString().slice(0, 10);
        time = d.toTimeString().slice(0, 5);
      }
      return {
        title: c.case_title,
        status: c.status,
        date,
        time,
        caseId: c._id.toString(),
        readableCaseId: c.readable_case_id || `CAS-${new Date().getFullYear()}-${c._id.toString().slice(-4).toUpperCase()}`
      };
    });

    return res.json({ cases: formatted });
  } catch (err) {
    console.error('GET /api/cases/user error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/cases/upcoming
 * Returns upcoming cases assigned to the logged-in judge (filed, under_review, ai_analyzed, pre_verdict)
 */
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const judgeId = req.user?.sub;
    if (!judgeId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const UPCOMING_STATUSES = ["filed", "under_review", "ai_analyzed", "pre_verdict"];
    const upcomingCases = await Case.find(
      { 
        status: { $in: UPCOMING_STATUSES },
        assignedJudge: judgeId
      },
      { _id: 1, case_title: 1, case_type: 1, next_hearing: 1, assignedJudge: 1, status: 1 }
    );
    
    const results = upcomingCases.map(c => ({
      caseId: c._id.toString(),
      title: c.case_title,
      type: c.case_type,
      nextHearing: c.next_hearing ? c.next_hearing.toISOString().split("T")[0] : null,
      judgeId: c.assignedJudge ? c.assignedJudge.toString() : null,
      status: c.status
    }));
    
    res.json(results);
  } catch (err) {
    console.error('GET /api/cases/upcoming error:', err);
    res.status(500).json({ error: "Error fetching upcoming cases" });
  }
});

/**
 * GET /api/cases/closed
 * Returns closed cases assigned to the logged-in judge (post_verdict status)
 */
router.get('/closed', authenticateToken, async (req, res) => {
  try {
    const judgeId = req.user?.sub;
    if (!judgeId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const closedCases = await Case.find(
      { 
        status: "post_verdict",
        assignedJudge: judgeId
      },
      { _id: 1, case_title: 1, case_type: 1, assignedJudge: 1, final_verdict: 1, judgement_date: 1 }
    );

    const results = [];
    for (const c of closedCases) {
      const analysis = await MLAnalysis.findOne({ case: c._id });

      results.push({
        caseId: c._id.toString(),
        judgeId: c.assignedJudge ? c.assignedJudge.toString() : null,
        title: c.case_title,
        type: c.case_type,
        verdict: c.final_verdict ? c.final_verdict.split(" ")[0] : null,
        judgmentDate: c.judgement_date ? c.judgement_date.toISOString().split("T")[0] : null,
        summary: analysis ? analysis.summary : null,
      });
    }

    res.json(results);
  } catch (err) {
    console.error('GET /api/cases/closed error:', err);
    res.status(500).json({ error: "Error fetching closed cases" });
  }
});

/**
 * POST /api/cases/add
 * Creates a new case with assigned lawyer and auto-assigned judge
 * Body expected: { title, type, description, defendantId, city, lawyerId }
 */
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const filerId = req.user?.sub;
    if (!filerId) return res.status(401).json({ message: 'Unauthorized' });

    const { title, type, description, defendantId, city, lawyerId, draft } = req.body || {};
    
    // For drafts, only require title and type
    if (draft) {
      if (!title || !type) {
        return res.status(400).json({ message: 'Title and type are required for drafts' });
      }
    } else {
      // For filed cases, require all fields
      if (!title || !type || !description || !defendantId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
    }

    // Validate defendant exists only if provided
    let defendant = null;
    if (defendantId) {
      defendant = await User.findById(defendantId).select('_id fullName');
      if (!defendant) return res.status(404).json({ message: 'Defendant not found' });
    }

    // Pick a judge - filter by postedCity when available; fallback to any
    const judgeCandidates = await Judge.find({ postedCity: city }).select('_id fullName');
    const judgesPool = judgeCandidates.length > 0 ? judgeCandidates : await Judge.find().select('_id fullName');
    if (!judgesPool.length) return res.status(400).json({ message: 'No judges available' });
    const assignedJudge = judgesPool[Math.floor(Math.random() * judgesPool.length)];

    // Determine next hearing if not draft
    let nextHearing = null;
    if (!draft) {
      nextHearing = await generateNextHearingDate(assignedJudge._id, Case);
    }

    // Create case
    const newCase = await Case.create({
      filer: filerId,
      defendant: defendant?._id || null,
      case_title: title,
      case_type: String(type).toLowerCase(),
      case_description: description || '',
      status: draft ? 'draft' : 'filed',
      filing_date: new Date(),
      assignedJudge: assignedJudge._id,
      assigned_lawyer: lawyerId || null,
      ...(nextHearing ? { next_hearing: nextHearing } : {})
    });

    // Generate readable case ID after creation
    const readableCaseId = generateReadableCaseId(newCase._id.toString());
    newCase.readable_case_id = readableCaseId;
    await newCase.save();

    console.log(`✅ Case created: ${readableCaseId} (MongoDB ID: ${newCase._id})`);
    if (nextHearing) {
      console.log(`📅 Next hearing scheduled: ${nextHearing.toISOString()}`);
    }

    return res.status(201).json({
      message: draft ? 'Case saved as draft' : 'Case filed successfully',
      caseId: newCase._id,
      readableCaseId: readableCaseId,
      assignedJudge: assignedJudge.fullName,
      assignedLawyer: lawyerId || null,
      nextHearingDate: nextHearing ? nextHearing.toISOString() : null
    });
  } catch (err) {
    console.error('POST /api/cases/add error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/cases/:id/evidence
 * Add evidence to a case (multipart/form-data)
 * Body: file (file), description (string)
 */
router.post('/:id/evidence', authenticateToken, uploadSingle, handleMulterError, cloudinaryUpload, async (req, res) => {
  console.log('📤 Evidence upload route hit:', req.params.id);
  try {
    const userId = req.user?.sub;
    const caseId = req.params.id;
    const { description } = req.body;
    const { uploadResult } = req;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find case and verify ownership
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Verify user is involved in the case (filer, defendant, or assigned judge)
    const userRole = req.user?.role;
    const isInvolved = caseDoc.filer.toString() === userId || 
                      caseDoc.defendant.toString() === userId ||
                      (userRole === 'judge' && caseDoc.assignedJudge && caseDoc.assignedJudge.toString() === userId);
    
    if (!isInvolved) {
      return res.status(403).json({ message: 'Not authorized to add evidence to this case' });
    }

    // Create evidence entry in separate Evidence collection
    const evidenceEntry = await Evidence.create({
      case: caseId,
      title: uploadResult.originalName,
      description: description || '',
      fileUrl: uploadResult.url,
      fileType: req.file.mimetype,
      uploadedBy: userId,
      uploadedAt: new Date(),
      metadata: {
        publicId: uploadResult.publicId,
        fileName: uploadResult.originalName,
        fileSize: req.file.size,
        cloudProvider: 'cloudinary'
      }
    });

    console.log(`✅ Evidence added to case ${caseId} by user ${userId}`);

    return res.status(201).json({
      message: 'Evidence uploaded successfully',
      evidence: {
        id: evidenceEntry._id,
        title: evidenceEntry.title,
        description: evidenceEntry.description,
        fileUrl: evidenceEntry.fileUrl,
        fileType: evidenceEntry.fileType,
        uploadedAt: evidenceEntry.uploadedAt
      }
    });
  } catch (err) {
    console.error('POST /api/cases/:id/evidence error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/cases/:id/evidence
 * Get all evidence for a specific case
 */
router.get('/:id/evidence', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.sub;
    const caseId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find case and verify ownership
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Verify user is involved in the case (filer, defendant, or assigned judge)
    const userRole = req.user?.role;
    const isInvolved = caseDoc.filer.toString() === userId || 
                      caseDoc.defendant.toString() === userId ||
                      (userRole === 'judge' && caseDoc.assignedJudge && caseDoc.assignedJudge.toString() === userId);
    
    if (!isInvolved) {
      return res.status(403).json({ message: 'Not authorized to view evidence for this case' });
    }

    // Fetch evidence for this case
    const evidence = await Evidence.find({ case: caseId })
      .populate('uploadedBy', 'fullName email')
      .sort({ uploadedAt: -1 });

    return res.json({
      evidence: evidence.map(e => ({
        id: e._id,
        title: e.title,
        description: e.description,
        fileUrl: e.fileUrl,
        fileType: e.fileType,
        uploadedBy: e.uploadedBy,
        uploadedAt: e.uploadedAt,
        metadata: e.metadata
      }))
    });
  } catch (err) {
    console.error('GET /api/cases/:id/evidence error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/cases/:id
 * Returns a single case for editing (with populated fields)
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.sub;
    const caseId = req.params.id;
    
    const caseDoc = await Case.findById(caseId)
      .populate('filer', 'fullName email')
      .populate('defendant', 'fullName email phone city')
      .populate('assignedJudge', 'fullName court postedCity')
      .populate('assigned_lawyer', 'name city jurisdiction phone');

    if (!caseDoc) return res.status(404).json({ message: 'Case not found' });
    
    // Verify ownership
    if (caseDoc.filer._id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this case' });
    }

    return res.json({
      _id: caseDoc._id,
      readableCaseId: caseDoc.readable_case_id || generateReadableCaseId(caseDoc._id.toString()),
      title: caseDoc.case_title,
      type: caseDoc.case_type,
      description: caseDoc.case_description,
      status: caseDoc.status,
      defendant: caseDoc.defendant,
      assigned_lawyer: caseDoc.assigned_lawyer,
      city: caseDoc.defendant?.city || '',
      filing_date: caseDoc.filing_date,
      next_hearing: caseDoc.next_hearing
    });
  } catch (err) {
    console.error('GET /api/cases/:id error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/cases/:id/summary
 * Aggregator: returns case + evidence + latest MLAnalysis
 */
router.get('/:id/summary', async (req, res) => {
  const id = req.params.id;
  try {
    const caseDoc = await Case.findById(id)
      .populate('filer', 'fullName email phone city')
      .populate('defendant', 'fullName email phone city')
      .populate('assignedJudge', 'fullName court postedCity')
      .populate('witnesses', 'fullName email phone city');

    if (!caseDoc) return res.status(404).json({ message: 'Case not found' });

    const [evidence, mlLatest] = await Promise.all([
      Evidence.find({ case: id })
        .sort({ uploadedAt: -1 })
        .populate('uploadedBy', 'fullName email'),
      MLAnalysis.findOne({ case: id }).sort({ createdAt: -1 })
    ]);

    return res.json({
      case: caseDoc,
      evidence,
      mlAnalysis: mlLatest || null
    });
  } catch (err) {
    console.error('GET /api/cases/:id/summary error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /api/cases/:id/update
 * Updates an existing case (primarily for draft -> filed conversion)
 * Body expected: { title, type, description, defendantId, city, lawyerId, draft }
 */
router.put('/:id/update', authenticateToken, async (req, res) => {
  try {
    const filerId = req.user?.sub;
    if (!filerId) return res.status(401).json({ message: 'Unauthorized' });

    const caseId = req.params.id;
    const { title, type, description, defendantId, city, lawyerId, draft } = req.body || {};
    
    // For drafts, only require title and type
    if (draft) {
      if (!title || !type) {
        return res.status(400).json({ message: 'Title and type are required for drafts' });
      }
    } else {
      // For filed cases, require all fields
      if (!title || !type || !description || !defendantId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
    }

    // Find existing case and verify ownership
    const existingCase = await Case.findById(caseId);
    if (!existingCase) return res.status(404).json({ message: 'Case not found' });
    if (existingCase.filer.toString() !== filerId) {
      return res.status(403).json({ message: 'Not authorized to edit this case' });
    }

    // Validate defendant exists only if provided
    let defendant = null;
    if (defendantId) {
      defendant = await User.findById(defendantId).select('_id fullName');
      if (!defendant) return res.status(404).json({ message: 'Defendant not found' });
    }

    // Pick a judge - filter by postedCity when available; fallback to any
    const judgeCandidates = await Judge.find({ postedCity: city }).select('_id fullName');
    const judgesPool = judgeCandidates.length > 0 ? judgeCandidates : await Judge.find().select('_id fullName');
    if (!judgesPool.length) return res.status(400).json({ message: 'No judges available' });
    const assignedJudge = judgesPool[Math.floor(Math.random() * judgesPool.length)];

    // Determine next hearing if not draft
    let nextHearing = null;
    if (!draft) {
      nextHearing = await generateNextHearingDate(assignedJudge._id, Case);
    }

    // Update case
    const updatedCase = await Case.findByIdAndUpdate(caseId, {
      case_title: title,
      case_type: String(type).toLowerCase(),
      case_description: description || '',
      defendant: defendant?._id || null,
      status: draft ? 'draft' : 'filed',
      assignedJudge: assignedJudge._id,
      assigned_lawyer: lawyerId || null,
      ...(nextHearing ? { next_hearing: nextHearing } : {})
    }, { new: true });

    // Generate readable case ID if it doesn't exist
    if (!updatedCase.readable_case_id) {
      const readableCaseId = generateReadableCaseId(updatedCase._id.toString());
      updatedCase.readable_case_id = readableCaseId;
      await updatedCase.save();
    }

    console.log(`✅ Case updated: ${updatedCase.readable_case_id || updatedCase._id}`);
    if (nextHearing) {
      console.log(`📅 Next hearing scheduled: ${nextHearing.toISOString()}`);
    }

    return res.status(200).json({
      message: draft ? 'Case updated as draft' : 'Case filed successfully',
      caseId: updatedCase._id,
      readableCaseId: updatedCase.readable_case_id,
      assignedJudge: assignedJudge.fullName,
      assignedLawyer: lawyerId || null,
      nextHearingDate: nextHearing ? nextHearing.toISOString() : null
    });
  } catch (err) {
    console.error('PUT /api/cases/:id/update error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/cases/judge/hearings
 * Returns all cases assigned to the logged-in judge with hearing details.
 * Requires Authorization: Bearer <token>
 * Output fields per item: caseId, case_title, status, case_type, next_hearing_date, next_hearing_time, priority
 */
router.get('/judge/hearings', authenticateToken, async (req, res) => {
  try {
    const judgeId = req.user?.sub;
    if (!judgeId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify the user is a judge
    const judge = await Judge.findById(judgeId);
    if (!judge) {
      return res.status(403).json({ message: 'Access denied. Judge role required.' });
    }

    // Fetch all cases assigned to this judge, excluding post-verdict and closed cases
    const cases = await Case.find({ 
      assignedJudge: judgeId,
      status: { $nin: ['post_verdict', 'closed'] }
    })
      .select('readable_case_id case_title status case_type next_hearing')
      .populate('filer', 'fullName email')
      .populate('defendant', 'fullName email')
      .sort({ next_hearing: 1 }); // Sort by upcoming date (earliest first)

    // Format the response with priority calculation
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
    const sevenDaysFromNow = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));

    // Process cases and ensure readable case IDs exist
    const hearings = [];
    for (const caseDoc of cases) {
      const nextHearing = caseDoc.next_hearing;
      let priority = 'Low Priority';
      
      if (nextHearing) {
        const hearingDate = new Date(nextHearing);
        if (hearingDate <= threeDaysFromNow) {
          priority = 'High Priority';
        } else if (hearingDate <= sevenDaysFromNow) {
          priority = 'Medium Priority';
        }
      }

      // Ensure readable case ID exists
      let readableCaseId = caseDoc.readable_case_id;
      if (!readableCaseId) {
        readableCaseId = generateReadableCaseId(caseDoc._id.toString());
        // Update the case with the readable ID
        await Case.findByIdAndUpdate(caseDoc._id, { readable_case_id: readableCaseId });
      }

      hearings.push({
        caseId: caseDoc._id.toString(),
        readableCaseId: readableCaseId,
        case_title: caseDoc.case_title,
        status: caseDoc.status,
        case_type: caseDoc.case_type,
        next_hearing_date: nextHearing ? new Date(nextHearing).toISOString().split('T')[0] : null,
        next_hearing_time: nextHearing ? new Date(nextHearing).toTimeString().split(' ')[0].substring(0, 5) : null,
        priority: priority,
        filer: caseDoc.filer?.fullName || 'Unknown',
        defendant: caseDoc.defendant?.fullName || 'Unknown'
      });
    }

    return res.status(200).json({ hearings });
  } catch (err) {
    console.error('GET /api/cases/judge/hearings error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PATCH /api/cases/:id
 * Judge-only endpoint for partial case updates
 * Allowed fields: case_description, case_type, final_verdict, next_hearing, witnesses
 */
router.patch('/:id', authenticateToken, authorizeRole(['judge']), async (req, res) => {
  try {
    const caseId = req.params.id;
    const userId = req.user.sub;
    const updateData = req.body;

    // Validate case exists
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Define allowed fields for editing
    const allowedFields = [
      'case_description',
      'status', 
      'final_verdict',
      'sentence',
      'next_hearing',
      'witnesses'
    ];

    // Filter update data to only include allowed fields
    const filteredUpdate = {};
    for (const field of allowedFields) {
      if (updateData.hasOwnProperty(field)) {
        filteredUpdate[field] = updateData[field];
      }
    }

    // Validate status if provided
    if (filteredUpdate.status) {
      const validStatuses = ['filed', 'draft', 'under_review', 'ai_analyzed', 'pre_verdict', 'post_verdict', 'closed'];
      if (!validStatuses.includes(filteredUpdate.status)) {
        return res.status(400).json({ 
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        });
      }
    }

    // Validate next_hearing if provided
    if (filteredUpdate.next_hearing) {
      const hearingDate = new Date(filteredUpdate.next_hearing);
      if (isNaN(hearingDate.getTime())) {
        return res.status(400).json({ message: 'Invalid next_hearing date format' });
      }
      filteredUpdate.next_hearing = hearingDate;
    }

    // Validate witnesses if provided
    if (filteredUpdate.witnesses) {
      if (!Array.isArray(filteredUpdate.witnesses)) {
        return res.status(400).json({ message: 'Witnesses must be an array' });
      }
      
      // Validate that all witness IDs are valid ObjectIds
      for (let i = 0; i < filteredUpdate.witnesses.length; i++) {
        const witnessId = filteredUpdate.witnesses[i];
        if (!mongoose.Types.ObjectId.isValid(witnessId)) {
          return res.status(400).json({ message: `Invalid witness ID format at index ${i}: ${witnessId}` });
        }
      }
    }

    // Add editing metadata
    filteredUpdate.lastEditedBy = userId;
    filteredUpdate.lastEditedAt = new Date();

    // Update the case
    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      filteredUpdate,
      { new: true, runValidators: true }
    )
    .populate('filer', 'fullName email phone city')
    .populate('defendant', 'fullName email phone city')
    .populate('assignedJudge', 'fullName court postedCity')
    .populate('witnesses', 'fullName email phone city')
    .populate('lastEditedBy', 'fullName email');


    return res.json({
      message: 'Case updated successfully',
      case: updatedCase
    });

  } catch (err) {
    console.error('PATCH /api/cases/:id error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
