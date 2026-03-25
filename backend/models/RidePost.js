const mongoose = require('mongoose');

const RidePostSchema = new mongoose.Schema({
  type: { type: String, enum: ['photo', 'video', 'reel'], required: true, default: 'photo' },
  imageUrl: { type: String, required: true },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }], // stores usernames/emails who liked
  comments: { type: Number, default: 0 },
  description: { type: String, required: true },
  placeId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Database Indexing for fast retrieval
RidePostSchema.index({ type: 1 });
RidePostSchema.index({ placeId: 1 });
RidePostSchema.index({ createdAt: -1 });
RidePostSchema.index({ likes: -1 });

module.exports = mongoose.model('RidePost', RidePostSchema);
