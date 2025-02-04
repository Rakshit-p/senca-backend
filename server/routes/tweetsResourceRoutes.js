const express = require('express');
const router = express.Router();
const TweetsResource = require('../models/tweetsResource');

// CREATE multiple tweets
router.post('/', async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: 'Request body must be a non-empty array' });
    }
    const resources = await TweetsResource.insertMany(req.body);
    return res.status(201).json(resources);
  } catch (error) {
    console.error('Error inserting Tweet resources:', error.message);
    return res.status(500).json({ error: 'Failed to insert tweets' });
  }
});

// GET all
router.get('/', async (req, res) => {
  try {
    const all = await TweetsResource.find().sort({ createdAt: -1 });
    return res.json(all);
  } catch (error) {
    console.error('Error fetching tweets:', error.message);
    return res.status(500).json({ error: 'Failed to fetch tweets' });
  }
});

module.exports = router;