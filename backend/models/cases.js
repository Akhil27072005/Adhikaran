const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  readable_case_id: { type: String, unique: true, sparse: true }, // Human-readable case ID like CAS-2025-4B89
  case_title: { type: String, required: true, trim: true },
  case_type: {
    type: String,
    enum: ['civil','criminal','family','property','corporate','other'],
    default: 'other'
  },
  case_description: { type: String},
  filer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },        // filer_id
  defendant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   // defendant_id
  status: {
    type: String,
    enum: ['filed','draft','under_review','ai_analyzed','pre_verdict','post_verdict','closed'],
    default: 'filed'
  },
  filing_date: { type: Date, default: Date.now },
  assignedJudge: { type: mongoose.Schema.Types.ObjectId, ref: 'Judge', default: null }, // assigned_judge_id
  notes: { type: String }, // judge-only notes (store who wrote in audit logs later)
  requirements: { type: String }, // additional requirements / instructions
  final_verdict: { type: String }, // final_verdict text
  sentence: { type: String },
  judgement_date: { type: Date },
  next_hearing: { type: Date },
  assigned_lawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'Lawyer', default: null },
  witnesses: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastEditedAt: { type: Date }
}, { timestamps: true });

// text index for search on title + description
CaseSchema.index({ case_title: 'text', case_description: 'text' });

module.exports = mongoose.model('Case', CaseSchema);
