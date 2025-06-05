const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
    medication:     { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true },
    quantity:       { type: Number,                      required: true },
    takenBy:        { type: String,                      required: true },
    patientName:    { type: String,                      required: true },
    doctorName:     { type: String,                      required: true },
    withdrawalDate: { type: Date,                        default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Stock', StockSchema);
