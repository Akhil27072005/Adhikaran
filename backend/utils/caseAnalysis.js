const Case = require('../models/cases');
const MLAnalysis = require('../models/MLanalysis');
const { analyzeCase } = require('../services/geminiService');

/**
 * Generates AI analysis for a case using Gemini API
 * Runs asynchronously - doesn't block the calling function
 * @param {string} caseId - MongoDB case ID
 */
async function generateCaseAnalysis(caseId) {
  try {
    // Ensure caseId is a string (in case it's passed as ObjectId)
    const caseIdStr = caseId.toString();
    console.log(`🔍 Looking up case with ID: ${caseIdStr}`);
    
    // Fetch case with populated fields
    const caseDoc = await Case.findById(caseIdStr)
      .populate('filer', 'fullName email')
      .populate('defendant', 'fullName email')
      .populate('witnesses', 'fullName email');

    if (!caseDoc) {
      console.error(`❌ Case not found: ${caseIdStr}`);
      return;
    }

    // Skip analysis if case description is empty
    if (!caseDoc.case_description || caseDoc.case_description.trim().length === 0) {
      console.log(`⏭️  Skipping analysis for case ${caseIdStr} - no description provided`);
      return;
    }

    console.log(`🤖 Starting Gemini analysis for case: ${caseDoc.readable_case_id || caseId}`);

    // Prepare case data for analysis
    const caseData = {
      case_title: caseDoc.case_title,
      case_type: caseDoc.case_type,
      case_description: caseDoc.case_description,
      filer: caseDoc.filer,
      defendant: caseDoc.defendant,
      witnesses: caseDoc.witnesses || []
    };

    // Call Gemini service
    const analysisResult = await analyzeCase(caseData);

    // Create or update MLAnalysis document
    // Find existing analysis for this case
    let mlAnalysis = await MLAnalysis.findOne({ case: caseIdStr }).sort({ createdAt: -1 });

    if (mlAnalysis) {
      // Update existing analysis
      mlAnalysis.summary = analysisResult.summary;
      mlAnalysis.ipc_section_violated = analysisResult.ipc_section_violated;
      mlAnalysis.penalties = analysisResult.penalties;
      mlAnalysis.reasoning = analysisResult.reasoning;
      mlAnalysis.confidence_score = analysisResult.confidence_score;
      mlAnalysis.probability = analysisResult.probability;
      mlAnalysis.key_points = analysisResult.key_points;
      mlAnalysis.ml_prediction = analysisResult.ml_prediction;
      mlAnalysis.createdAt = new Date(); // Update timestamp
      
      await mlAnalysis.save();
      console.log(`✅ Updated ML analysis for case: ${caseDoc.readable_case_id || caseId}`);
    } else {
      // Create new analysis
      mlAnalysis = await MLAnalysis.create({
        case: caseIdStr,
        summary: analysisResult.summary,
        ipc_section_violated: analysisResult.ipc_section_violated,
        penalties: analysisResult.penalties,
        reasoning: analysisResult.reasoning,
        confidence_score: analysisResult.confidence_score,
        probability: analysisResult.probability,
        key_points: analysisResult.key_points,
        ml_prediction: analysisResult.ml_prediction
      });
      console.log(`✅ Created ML analysis for case: ${caseDoc.readable_case_id || caseId}`);
    }

    // Optionally update case status to 'ai_analyzed' if it's in a prior state
    if (caseDoc.status && ['filed', 'under_review'].includes(caseDoc.status)) {
      caseDoc.status = 'ai_analyzed';
      await caseDoc.save();
      console.log(`📊 Updated case status to 'ai_analyzed' for: ${caseDoc.readable_case_id || caseId}`);
    }

    return mlAnalysis;
  } catch (error) {
    // Log error but don't throw - we don't want to break case creation/update
    const caseIdStr = caseId?.toString() || 'unknown';
    console.error(`❌ Error generating case analysis for ${caseIdStr}:`, error.message);
    
    // Optionally, create a partial analysis record with error info
    try {
      const caseIdStr = caseId?.toString() || 'unknown';
      const caseDoc = await Case.findById(caseIdStr);
      if (caseDoc) {
        await MLAnalysis.findOneAndUpdate(
          { case: caseIdStr },
          {
            case: caseIdStr,
            summary: `Analysis failed: ${error.message}`,
            reasoning: 'Analysis could not be completed due to an error.',
            confidence_score: 0,
            probability: 0,
            ml_prediction: {
              label: 'insufficient_evidence',
              details: { error: error.message }
            }
          },
          { upsert: true, new: true }
        );
      }
    } catch (saveError) {
      console.error('❌ Failed to save error analysis record:', saveError.message);
    }
  }
}

module.exports = {
  generateCaseAnalysis
};

