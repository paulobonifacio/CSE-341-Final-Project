const express    = require('express');
const router     = express.Router();
const Doctor     = require('../models/doctor');
const authenticate = require('../middleware/authenticate');
const validate     = require('../middleware/validate');

// CREATE a new doctor
router.post(
  '/',
  authenticate,
  validate('doctor'),
  async (req, res) => {
    try {
      const doctor = new Doctor(req.body);
      await doctor.save();
      return res.status(201).json(doctor);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
);

// READ all doctors
router.get(
  '/',
  authenticate,
  async (req, res) => {
    try {
      const doctors = await Doctor.find();
      return res.status(200).json(doctors);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// READ one doctor by ID
router.get(
  '/:id',
  authenticate,
  async (req, res) => {
    try {
      const doctor = await Doctor.findById(req.params.id);
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }
      return res.status(200).json(doctor);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// UPDATE a doctor
router.put(
  '/:id',
  authenticate,
  validate('doctor'),
  async (req, res) => {
    try {
      const doctor = await Doctor.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }
      return res.status(200).json(doctor);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
);

// DELETE a doctor
router.delete(
  '/:id',
  authenticate,
  async (req, res) => {
    try {
      const doctor = await Doctor.findByIdAndDelete(req.params.id);
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }
      return res
        .status(200)
        .json({ message: 'Doctor deleted' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;