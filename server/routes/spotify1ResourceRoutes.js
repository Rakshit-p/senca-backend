const express = require('express');
const router = express.Router();
const Spotify1Resource = require('../models/spotify1Resource');

// CREATE multiple Spotify resources
router.post('/', async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: 'Request body must be a non-empty array' });
    }
    const resources = await Spotify1Resource.insertMany(req.body);
    return res.status(201).json(resources);
  } catch (error) {
    console.error('Error inserting Spotify resources:', error.message);
    return res.status(500).json({ error: 'Failed to insert Spotify resources' });
  }
});

// GET all
router.get('/', async (req, res) => {
  try {
    const all = await Spotify1Resource.find().sort({ createdAt: -1 });
    return res.json(all);
  } catch (error) {
    console.error('Error fetching Spotify resources:', error.message);
    return res.status(500).json({ error: 'Failed to fetch Spotify resources' });
  }
});

module.exports = router;