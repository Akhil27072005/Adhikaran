const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true },
  age: { type: Number },
  address: { type: String },
  city: { type: String },
  phone: { type: String },
  description: { type: String, trim: true },
  role: { type: String, default: 'user'}
}, { timestamps: true });

// Password hashing is handled in the signup API, not in the model

// instance method to compare password
UserSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compareSync(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);
