const mongoose = require('mongoose');

const Spotify1ResourceSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  link:       { type: String, required: true },
  image:      { type: String },
  summary:    { type: String },
  resourceBy: { type: String },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Spotify1Resource', Spotify1ResourceSchema);