const mongoose = require('mongoose');

const githubResourceSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  link:       { type: String, required: true },
  image:      { type: String },
  summary:    { type: String },
  resourceBy: { type: String },
  createdAt:  { type: Date, default: Date.now }
});

// consistent name
module.exports = mongoose.model('GithubResource', githubResourceSchema);