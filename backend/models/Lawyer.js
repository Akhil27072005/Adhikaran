const mongoose = require('mongoose');

// Lawyer schema and model
// Fields:
// - lawyerId: String, required, unique (external identifier)
// - name: String, required
// - city: String, required
// - jurisdiction: String, required, enum as specified
// - phone: String, required

const LawyerSchema = new mongoose.Schema({
  lawyerId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  jurisdiction: { 
    type: String, 
    required: true, 
    enum: ['civil', 'criminal', 'family', 'property', 'corporate'] 
  },
  phone: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Lawyer', LawyerSchema);


