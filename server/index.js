// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

// Create the app
const app = express();

// Middleware
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: '*', // Temporarily allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Test route to verify server is running
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Connect to DB
connectDB();

/*
// Remove or fix this if you don't actually have resourceRoutes.js
// const resourceRoutes = require('./routes/resourceRoutes');
// app.use('/api/resources', resourceRoutes);
*/

// Then your specialized routes
const devtoRoutes          = require('./routes/devtoResourceRoutes');
const githubRoutes         = require('./routes/githubResourceRoutes');
const youtubeRoutes        = require('./routes/youtubeResourceRoutes');
const huggingfaceRoutes    = require('./routes/huggingfaceResourceRoutes');
const fetchpapersRoutes    = require('./routes/fetchpapersResourceRoutes');
const newsapiRoutes        = require('./routes/newsapiResourceRoutes');
const spotify1Routes       = require('./routes/spotify1ResourceRoutes');
const scrapeRoutes         = require('./routes/scrapeResourceRoutes');
const tweetsRoutes         = require('./routes/tweetsResourceRoutes');
const tools1Routes         = require('./routes/tools1ResourceRoutes');

// Then the rest of your routes
app.use('/api/devto-resources', devtoRoutes);
app.use('/api/github-resources', githubRoutes);
app.use('/api/youtube-resources', youtubeRoutes);
app.use('/api/huggingface-resources', huggingfaceRoutes);
app.use('/api/papers-resources', fetchpapersRoutes);
app.use('/api/newsapi-resources', newsapiRoutes);
app.use('/api/spotify1-resources', spotify1Routes);
app.use('/api/arxiv-resources', scrapeRoutes);
app.use('/api/tweet-resources', tweetsRoutes);
app.use('/api/tools1-resources', tools1Routes);

// Start server on PORT=5001
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});