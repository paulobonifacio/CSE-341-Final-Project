
const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    birthDate: { type: Date, required: true },
    medicalRecordNumber: { type: String, required: true, unique: true },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);
