const express = require('express');
const router = express.Router();
const YoutubeResource = require('../models/youtubeResource');

// CREATE multiple YouTube resources
router.post('/', async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: 'Request body must be a non-empty array' });
    }
    const resources = await YoutubeResource.insertMany(req.body);
    return res.status(201).json(resources);
  } catch (error) {
    console.error('Error inserting YouTube resources:', error.message);
    return res.status(500).json({ error: 'Failed to insert YouTube resources' });
  }
});

// GET all
router.get('/', async (req, res) => {
  try {
    const all = await YoutubeResource.find().sort({ createdAt: -1 });
    return res.json(all);
  } catch (error) {
    console.error('Error fetching YouTube resources:', error.message);
    return res.status(500).json({ error: 'Failed to fetch YouTube resources' });
  }
});

module.exports = router;