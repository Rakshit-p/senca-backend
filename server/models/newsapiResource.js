const mongoose = require('mongoose');

const NewsApiResourceSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  link:       { type: String, required: true },
  image:      { type: String },
  summary:    { type: String },
  resourceBy: { type: String },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('NewsApiResource', NewsApiResourceSchema);