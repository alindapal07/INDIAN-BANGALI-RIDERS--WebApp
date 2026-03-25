const mongoose = require('mongoose');

const RiderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bike: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, enum: ['founder', 'elite', 'community'], default: 'community' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rider', RiderSchema);
