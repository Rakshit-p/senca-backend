const express = require('express');
const router = express.Router();
const ScrapeResource = require('../models/scrapeResource');

// CREATE multiple arXiv resources
router.post('/', async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: 'Request body must be a non-empty array' });
    }
    const resources = await ScrapeResource.insertMany(req.body);
    return res.status(201).json(resources);
  } catch (error) {
    console.error('Error inserting arXiv resources:', error.message);
    return res.status(500).json({ error: 'Failed to insert arXiv resources' });
  }
});

// GET all
router.get('/', async (req, res) => {
  try {
    const all = await ScrapeResource.find().sort({ createdAt: -1 });
    return res.json(all);
  } catch (error) {
    console.error('Error fetching arXiv resources:', error.message);
    return res.status(500).json({ error: 'Failed to fetch arXiv resources' });
  }
});

module.exports = router;