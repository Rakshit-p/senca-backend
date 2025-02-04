const mongoose = require('mongoose');

const FetchPapersResourceSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  link:       { type: String, required: true },
  image:      { type: String },
  summary:    { type: String },
  resourceBy: { type: String },
  createdAt:  { type: Date, default: Date.now }
});

// use "FetchPapersResource" as the model name
module.exports = mongoose.model('FetchPapersResource', FetchPapersResourceSchema);