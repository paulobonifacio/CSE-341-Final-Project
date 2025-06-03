// backend/routes/stocks.js
const express      = require('express');
const router       = express.Router();
const Stock        = require('../models/stock');
const Medication   = require('../models/medication');
const authenticate = require('../middleware/authenticate');

// CREATE a new stock withdrawal record
router.post('/', authenticate, async (req, res) => {
    console.log('POST /api/stocks →', req.body);
    try {
        const {
            medication: medicationId,
            quantity,
            takenBy,
            patientName,
            doctorName,
            withdrawalDate
        } = req.body;

        // 1) Buscar o medicamento
        const med = await Medication.findById(medicationId);
        if (!med) {
            return res.status(404).json({ error: 'Medication not found' });
        }

        // 2) Verificar estoque
        if (med.quantity < quantity) {
            return res.status(400).json({ error: 'Not enough stock' });
        }

        // 3) Deduzir e salvar
        med.quantity -= quantity;
        await med.save();

        // 4) Criar registro de retirada
        const stock = new Stock({
            medication:     medicationId,
            quantity:       quantity,
            takenBy:        takenBy,
            patientName:    patientName,
            doctorName:     doctorName,
            withdrawalDate: withdrawalDate
        });
        await stock.save();

        return res.status(201).json(stock);
    } catch (err) {
        console.error('Erro em POST /api/stocks:', err);
        return res.status(400).json({ error: err.message });
    }
});

// READ all stock withdrawal records
router.get('/', authenticate, async (req, res) => {
    try {
        const stocks = await Stock.find().populate('medication');
        return res.status(200).json(stocks);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// READ a single stock record by ID
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

// UPDATE a stock withdrawal record
router.put('/:id', authenticate, async (req, res) => {
    try {
        const {
            medication: medicationId,
            quantity,
            takenBy,
            patientName,
            doctorName,
            withdrawalDate
        } = req.body;

        const stock = await Stock.findByIdAndUpdate(
            req.params.id,
            {
                medication:     medicationId,
                quantity:       quantity,
                takenBy:        takenBy,
                patientName:    patientName,
                doctorName:     doctorName,
                withdrawalDate: withdrawalDate
            },
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

// DELETE a stock withdrawal record
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