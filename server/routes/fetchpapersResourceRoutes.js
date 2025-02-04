const express = require('express');
const router = express.Router();
const FetchPapersResource = require('../models/fetchpapersResource');

// CREATE multiple paper resources
router.post('/', async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: 'Request body must be a non-empty array of resources' });
    }
    const resources = await FetchPapersResource.insertMany(req.body);
    return res.status(201).json(resources);
  } catch (error) {
    console.error('Error inserting paper resources:', error.message);
    return res.status(500).json({ error: 'Failed to insert paper resources' });
  }
});

// GET all
router.get('/', async (req, res) => {
  try {
    const all = await FetchPapersResource.find().sort({ createdAt: -1 });
    return res.json(all);
  } catch (error) {
    console.error('Error fetching paper resources:', error.message);
    return res.status(500).json({ error: 'Failed to fetch paper resources' });
  }
});

module.exports = router;