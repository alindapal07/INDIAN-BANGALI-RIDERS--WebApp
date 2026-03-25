const mongoose = require('mongoose');

const HighlightSchema = new mongoose.Schema({
  title: { type: String, required: true },
  cover: { type: String, required: true },
  storyIds: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Highlight', HighlightSchema);
