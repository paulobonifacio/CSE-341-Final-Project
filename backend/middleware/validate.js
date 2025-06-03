
const Joi = require('joi');

const schemas = {
  user: Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    password: Joi.string().min(6).required()
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  google: Joi.object({
    credential: Joi.string().required()
  }),
  medication: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    quantity: Joi.number().min(0).required(),
    expirationDate: Joi.date().optional()
  }),
  
  patient: Joi.object({
    name: Joi.string().required(),
    birthDate: Joi.date().required(),
    medicalRecordNumber: Joi.string().required(),
    notes: Joi.string().optional()
  }),
  doctor: Joi.object({
    name: Joi.string().required(),
    department: Joi.string().optional(),
    specialization: Joi.string().optional(),
    contactInfo: Joi.string().optional()
  }),
  stock: Joi.object({
    medication: Joi.string().required(),
    quantity: Joi.number().min(1).required(),
    takenBy: Joi.string().required(),
    patientName: Joi.string().required(),
    doctorName: Joi.string().required(),
    withdrawalDate: Joi.date().optional()
  })
};

module.exports = (type) => (req, res, next) => {
  const schema = schemas[type];
  if (!schema) return res.status(500).json({ message: `Validation schema not found for type: ${type}` });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};
