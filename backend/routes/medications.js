const express      = require('express');
const router       = express.Router();
const Medication   = require('../models/medication');
const authenticate = require('../middleware/authenticate');

// CREATE a new medication
router.post('/', authenticate, async (req, res) => {
    try {
        const {
            campoId,
            name,
            description,
            quantity,
            expirationDate
        } = req.body;

        const med = new Medication({
            campoId,
            name,
            description,
            quantity,
            expirationDate
        });

        await med.save();
        return res.status(201).json(med);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

// READ ALL
router.get('/', authenticate, async (req, res) => {
    try {
        const meds = await Medication.find();
        return res.status(200).json(meds);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// READ ONE
router.get('/:id', authenticate, async (req, res) => {
    try {
        const med = await Medication.findById(req.params.id);
        if (!med) {
            return res.status(404).json({ error: 'Not found' });
        }
        return res.status(200).json(med);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// UPDATE
router.put('/:id', authenticate, async (req, res) => {
    try {
        const med = await Medication.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!med) {
            return res.status(404).json({ error: 'Not found' });
        }
        return res.status(200).json(med);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

// DELETE
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const med = await Medication.findByIdAndDelete(req.params.id);
        if (!med) {
            return res.status(404).json({ error: 'Not found' });
        }
        return res.status(200).json({ message: 'Medication deleted' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;