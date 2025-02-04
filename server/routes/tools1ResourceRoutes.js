const express = require('express');
const router = express.Router();
const Tools1Resource = require('../models/tools1Resource');

// GET all tools resources
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/tools1-resources endpoint hit');

    // First, verify the model exists
    console.log('Model name:', Tools1Resource.modelName);
    
    // Check if collection exists
    const collections = await Tools1Resource.db.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Add timeout option to the query
    const all = await Tools1Resource.find()
      .sort({ createdAt: -1 })
      .lean() // For better performance
      .timeout(30000); // 30 second timeout
    
    console.log('Query completed, found items:', all.length);

    // If no items found, return empty array instead of error
    if (!all || all.length === 0) {
      console.log('No resources found');
      return res.json([]);
    }

    return res.json(all);

  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({ 
      error: 'Failed to fetch AI tools resources',
      details: error.message 
    });
  }
});

// CREATE multiple AI tools resources
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/tools1-resources endpoint hit');
    console.log('Request body:', req.body);

    if (!Array.isArray(req.body) || req.body.length === 0) {
      console.log('Invalid request body - not an array or empty');
      return res.status(400).json({ error: 'Request body must be a non-empty array' });
    }

    const resources = await Tools1Resource.insertMany(req.body);
    console.log('Successfully inserted resources:', resources.length);
    return res.status(201).json(resources);

  } catch (error) {
    console.error('Error in POST /api/tools1-resources:', error);
    return res.status(500).json({ 
      error: 'Failed to insert AI tools resources',
      details: error.message 
    });
  }
});

// Test route to verify the endpoint is working
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Tools1 route is working!',
    timestamp: new Date(),
    modelName: Tools1Resource.modelName
  });
});

module.exports = router;
