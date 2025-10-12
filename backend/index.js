require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const casesRouter = require('./routes/cases');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Import models to register schemas
require('./models/user');
require('./models/judge');
require('./models/cases');
require('./models/evidence');
require('./models/MLanalysis');

const app = express();

// Middleware
app.use(express.json()); // parse JSON requests
app.use(cors());
app.use(cookieParser());
app.use('/api/cases', casesRouter);
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/', healthRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('AI Judicial System Backend running');
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to start server', err);
  });
