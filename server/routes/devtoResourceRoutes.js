const express = require('express');
const router = express.Router();
const DevtoResource = require('../models/devtoResource');

// CREATE multiple Dev.to resources
router.post('/', async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: 'Request body must be a non-empty array of resources' });
    }
    const resources = await DevtoResource.insertMany(req.body);
    return res.status(201).json(resources);
  } catch (error) {
    console.error('Error inserting Devto resources:', error.message);
    return res.status(500).json({ error: 'Failed to insert Devto resources' });
  }
});

// GET all
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/devto-resources endpoint hit');
    
    // Temporary test data
    const testData = [
      {
        _id: "1",
        title: "Test Dev.to Article",
        link: "https://dev.to/test",
        image: "https://picsum.photos/200",
        summary: "This is a test article",
        resourceBy: "Test Author",
        createdAt: new Date()
      }
    ];

    console.log('Sending test data:', testData);
    return res.json(testData);

  } catch (error) {
    console.error('Error in /api/devto-resources:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;