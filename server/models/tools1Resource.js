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
  image: {
    type: String,
    required: true
  },
  summary: {    // For the AI tool summary from LLM
    type: String,
    required: true
  },
  resourceBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Add index for better query performance
tools1ResourceSchema.index({ createdAt: -1 });

const Tools1Resource = mongoose.model('Tools1Resource', tools1ResourceSchema);

module.exports = Tools1Resource;
