
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const medicationRoutes = require('./routes/medications');
const stockRoutes = require('./routes/stocks');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Updated welcome route
app.get('/', (req, res) => {
  res.send(`
    <h2>Pharmacy Control API is running 🚀</h2>
    <h2>Access the <a href="/api-docs" target="_blank">Swagger Documentation 📚</a></h2>
  `);
});

// Mongoose connection status logging
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to database');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Database connection successful');
    app.listen(process.env.PORT || 3000, () => {
      console.log('Server running on port', process.env.PORT || 3000);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
