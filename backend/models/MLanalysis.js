const mongoose = require('mongoose');

const MLAnalysisSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true }, // case_id
  summary: { type: String },                      // detailed NLP summary (AI Summary)
  ipc_section_violated: { type: [String], default: [] }, // list of IPC sections (or legal codes)
  penalties: [{
    section: { type: String },                   // IPC section code
    penalty: { type: String },                   // Penalty description
    severity: { type: String }                   // Optional: severity level
  }],
  reasoning: { type: String },                   // Detailed reasoning for the judgement
  confidence_score: { type: Number, min: 0, max: 1 }, // Confidence in the analysis (0-1)
  probability: { type: Number, min: 0, max: 1 }, // Probability of the judgement (0-1)
  key_points: [{ type: String }],               // Key points that led to the decision
  ml_prediction: {                                       // model output
    label: { type: String },           // e.g. "guilty", "not_guilty", "insufficient_evidence"
    details: { type: mongoose.Schema.Types.Mixed } // e.g., feature scores, explanation etc.
  },
  createdAt: { type: Date, default: Date.now }
});

// useful index so you can fetch latest analysis for a case quickly
MLAnalysisSchema.index({ case: 1, createdAt: -1 });

module.exports = mongoose.model('MLAnalysis', MLAnalysisSchema);
