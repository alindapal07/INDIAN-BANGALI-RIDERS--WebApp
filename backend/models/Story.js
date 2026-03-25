const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  type: { type: String, enum: ['image', 'video'], required: true },
  url: { type: String, required: true },
  thumbnail: { type: String, required: true },
  isHighlight: { type: Boolean, default: false },
  createdAt: { type: Number, default: () => Date.now() }
});

module.exports = mongoose.model('Story', StorySchema);
