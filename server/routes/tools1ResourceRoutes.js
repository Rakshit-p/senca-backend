const express = require('express');
const router = express.Router();
const Tools1Resource = require('../models/tools1Resource');

// GET all tools resources
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/tools1-resources endpoint hit');

    // Add test data for verification
    const testData = [
      {
        _id: "test1",
        title: "Test AI Tool",
        link: "https://example.com/tool",
        image: "https://example.com/image.jpg",
        summary: "This is a test AI tool",
        resourceBy: "Test Provider",
        createdAt: new Date()
      }
    ];

    // For testing, return the test data
    return res.json(testData);

    // Comment out the database query for now
    // const all = await Tools1Resource.find().sort({ createdAt: -1 });
    // return res.json(all);

  } catch (error) {
    console.error('Error in /api/tools1-resources:', error);
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

// Add a test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Tools1 route is working!' });
});

module.exports = router;
