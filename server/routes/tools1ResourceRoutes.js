const express = require('express');
const router = express.Router();
const Tools1Resource = require('../models/tools1Resource');

// CREATE multiple AI tools resources
router.post('/', async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: 'Request body must be a non-empty array' });
    }
    const resources = await Tools1Resource.insertMany(req.body);
    return res.status(201).json(resources);
  } catch (error) {
    console.error('Error inserting AI tools resources:', error.message);
    return res.status(500).json({ error: 'Failed to insert AI tools resources' });
  }
});

// GET all
router.get('/', async (req, res) => {
  try {
    const all = await Tools1Resource.find().sort({ createdAt: -1 });
    return res.json(all);
  } catch (error) {
    console.error('Error fetching AI tools resources:', error.message);
    return res.status(500).json({ error: 'Failed to fetch AI tools resources' });
  }
});

module.exports = router;
