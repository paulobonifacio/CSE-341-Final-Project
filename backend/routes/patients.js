// backend/routes/patients.js
const express   = require('express');
const router    = express.Router();
const Patient   = require('../models/patient');
const authenticate = require('../middleware/authenticate');
const validate     = require('../middleware/validate');

// CREATE a new patient
router.post(
  '/',
  authenticate,
  validate('patient'),
  async (req, res) => {
    try {
      const patient = new Patient(req.body);
      await patient.save();
      return res.status(201).json(patient);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
);

// READ all patients
router.get(
  '/',
  authenticate,
  async (req, res) => {
    try {
      const patients = await Patient.find();
      return res.status(200).json(patients);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// READ one patient by ID
router.get(
  '/:id',
  authenticate,
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      return res.status(200).json(patient);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// UPDATE a patient
router.put(
  '/:id',
  authenticate,
  validate('patient'),
  async (req, res) => {
    try {
      const patient = await Patient.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      return res.status(200).json(patient);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
);

// DELETE a patient
router.delete(
  '/:id',
  authenticate,
  async (req, res) => {
    try {
      const patient = await Patient.findByIdAndDelete(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      return res.status(200).json({ message: 'Patient deleted' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;