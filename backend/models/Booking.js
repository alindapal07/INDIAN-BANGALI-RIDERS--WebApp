const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  journeyId: { type: String, required: true },
  journeyTitle: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  bikeModel: { type: String, required: true },
  availability: { type: String, required: true },
  details: { type: String, default: '' },
  timestamp: { type: Number, default: () => Date.now() },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);
