// // server/routes/resourceRoutes.js
// const express = require('express');
// const router = express.Router();
// const Resource = require('../models/resource'); // Ensure this path matches your actual model file

// // CREATE multiple resources (from scrapers)
// router.post('/', async (req, res) => {
//   try {
//     if (!Array.isArray(req.body) || req.body.length === 0) {
//       return res.status(400).json({ error: 'Request body must be a non-empty array of resources' });
//     }

//     const resources = await Resource.insertMany(req.body);
//     return res.status(201).json(resources); // 201 for successful resource creation
//   } catch (error) {
//     console.error('Error inserting resources:', error.message);
//     return res.status(500).json({ error: 'Failed to insert resources' });
//   }
// });

// // GET all resources
// router.get('/', async (req, res) => {
//   try {
//     const resources = await Resource.find().sort({ createdAt: -1 });
//     if (resources.length === 0) {
//       return res.status(404).json({ message: 'No resources found' });
//     }

//     return res.json(resources);
//   } catch (error) {
//     console.error('Error fetching all resources:', error.message);
//     return res.status(500).json({ error: 'Failed to fetch resources' });
//   }
// });

// // GET resources by category, e.g., /api/resources/category/research-paper
// router.get('/category/:cat', async (req, res) => {
//   try {
//     const category = req.params.cat;
//     const resources = await Resource.find({ category }).sort({ createdAt: -1 });

//     if (resources.length === 0) {
//       return res.status(404).json({ message: `No resources found for category: ${category}` });
//     }

//     return res.json(resources);
//   } catch (error) {
//     console.error(`Error fetching resources by category (${req.params.cat}):`, error.message);
//     return res.status(500).json({ error: 'Failed to fetch resources by category' });
//   }
// });

// // Invalid Route Fallback
// router.use((req, res) => {
//   return res.status(404).json({ error: 'Invalid route' });
// });

// module.exports = router;