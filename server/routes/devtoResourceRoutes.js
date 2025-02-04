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
    // Add this temporary test data
    const testData = [
      {
        title: "Test Blog Post",
        link: "https://example.com",
        image: "https://example.com/image.jpg",
        summary: "This is a test blog post",
        resourceBy: "Test Author",
        _id: "test123"
      }
    ];

    // For testing, return the test data
    return res.json(testData);

    // Comment out the database query for now
    // const all = await DevtoResource.find().sort({ createdAt: -1 });
    // return res.json(all);
  } catch (error) {
    console.error('Error fetching Devto resources:', error.message);
    return res.status(500).json({ error: 'Failed to fetch Devto resources' });
  }
});

module.exports = router;