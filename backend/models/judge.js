const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const JudgeSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true },
  postedCity: { type: String },      // posted_city
  court: { type: String },          // court name or id
  phone: { type: String },
  description: { type: String, trim: true },
  role: { type: String, default: 'judge' }
}, { timestamps: true });

// Password hashing is handled in the signup API, not in the model

JudgeSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compareSync(candidate, this.password);
};

module.exports = mongoose.model('Judge', JudgeSchema);
