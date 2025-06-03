
const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: { type: String },
    specialization: { type: String },
    contactInfo: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', DoctorSchema);
