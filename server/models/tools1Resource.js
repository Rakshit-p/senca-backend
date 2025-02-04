const mongoose = require('mongoose');

const tools1ResourceSchema = new mongoose.Schema({
  title: {      // For the AI tool name
    type: String,
    required: true
  },
  link: {       // For the AI tool URL
    type: String,
    required: true
  },
  summary: {    // For the AI tool summary from LLM
    type: String,
    required: true
  },
  createdAt: {  // For timestamp
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tools1Resource', tools1ResourceSchema);
