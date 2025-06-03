
const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  campoId:{ type: String, required: true, unique: true }, 
  name: { type: String, required: true },
  description: String,
  quantity: { type: Number, default: 0 },
  expirationDate: Date
}, { timestamps: true });

module.exports = mongoose.model('Medication', MedicationSchema);
