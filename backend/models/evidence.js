const mongoose = require('mongoose');

const EvidenceSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true }, // case_id
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String },   // link to file stored in cloud (Cloudinary / S3), or path if internal storage
  fileType: { type: String },  // mime type or logical type: image/pdf/audio
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional uploader id
  uploadedAt: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed } // e.g., size, pages, extractedText, etc.
}, { timestamps: true });

module.exports = mongoose.model('Evidence', EvidenceSchema);
