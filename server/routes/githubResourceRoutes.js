const express = require('express');
const router = express.Router();
const GithubResource = require('../models/githubResource');

// CREATE multiple GitHub repos
router.post('/', async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: 'Request body must be a non-empty array of resources' });
    }
    const resources = await GithubResource.insertMany(req.body);
    return res.status(201).json(resources);
  } catch (error) {
    console.error('Error inserting GitHub resources:', error.message);
    return res.status(500).json({ error: 'Failed to insert GitHub resources' });
  }
});

// GET all
router.get('/', async (req, res) => {
  try {
    const all = await GithubResource.find().sort({ createdAt: -1 });
    return res.json(all);
  } catch (error) {
    console.error('Error fetching GitHub resources:', error.message);
    return res.status(500).json({ error: 'Failed to fetch GitHub resources' });
  }
});

module.exports = router;