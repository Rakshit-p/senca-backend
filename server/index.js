// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./db');

const app = express();

// Enhanced error handling
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

// Middleware
app.use(cors());
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Import routes
const devtoRoutes = require('./routes/devtoResourceRoutes');
const githubRoutes = require('./routes/githubResourceRoutes');
const tools1Routes = require('./routes/tools1ResourceRoutes');
// ... other routes

// Use routes
app.use('/api/devto-resources', devtoRoutes);
app.use('/api/github-resources', githubRoutes);
app.use('/api/tools1-resources', tools1Routes);
// ... other route uses

// Initialize server
const PORT = process.env.PORT || 5001;

// Connect to MongoDB first, then start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 
