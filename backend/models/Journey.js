const mongoose = require('mongoose');

const JourneySchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  route: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  status: { type: String, enum: ['upcoming', 'completed'], default: 'upcoming' },
  duration: { type: String, default: '' },
  distance: { type: String, default: '' },
  seats: { type: Number, default: 0 },
  // Admin-uploaded photos for this journey (array of URLs/base64)
  photos: [{ type: String }],
  // Primary cover photo
  coverPhoto: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

JourneySchema.index({ status: 1 });
JourneySchema.index({ date: 1 });
JourneySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Journey', JourneySchema);
