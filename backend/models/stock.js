const express      = require('express');
const router       = express.Router();
const Stock        = require('../models/stock');
const Medication   = require('../models/medication');
const authenticate = require('../middleware/authenticate');

// Create a new stock withdrawal record
router.post('/', authenticate, async (req, res) => {
    try {
        const {
            medication: medicationId,
            quantity,
            takenBy,
            patientName,
            doctorName,
            withdrawalDate
        } = req.body;

        // Find the medication
        const med = await Medication.findById(medicationId);
        if (!med) {
            return res.status(404).json({ error: 'Medication not found' });
        }

        // Check stock availability
        if (med.quantity < quantity) {
            return res.status(400).json({ error: 'Not enough stock' });
        }

        // Reduce the stock
        med.quantity -= quantity;
        await med.save();

        // Create the stock withdrawal record
        const stock = new Stock({
            medication:      medicationId,
            quantity:        quantity,
            takenBy:         takenBy,
            patientName:     patientName,
            doctorName:      doctorName,
            withdrawalDate:  withdrawalDate
        });
        await stock.save();

        return res.status(201).json(stock);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get all stock withdrawal records
router.get('/', authenticate, async (req, res) => {
    try {
        const stocks = await Stock.find().populate('medication');
        return res.status(200).json(stocks);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get a single stock record by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const stock = await Stock
            .findById(req.params.id)
            .populate('medication');
        if (!stock) {
            return res.status(404).json({ error: 'Stock record not found' });
        }
        return res.status(200).json(stock);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Update a stock withdrawal record
router.put('/:id', authenticate, async (req, res) => {
    try {
        const stock = await Stock.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('medication');
        if (!stock) {
            return res.status(404).json({ error: 'Stock record not found' });
        }
        return res.status(200).json(stock);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

// Delete a stock withdrawal record
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const stock = await Stock.findByIdAndDelete(req.params.id);
        if (!stock) {
            return res.status(404).json({ error: 'Stock record not found' });
        }
        return res.status(200).json({ message: 'Stock record deleted' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;