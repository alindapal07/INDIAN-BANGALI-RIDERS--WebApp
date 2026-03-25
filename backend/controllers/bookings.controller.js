const Booking = require('../models/Booking');
const User = require('../models/User');
const Journey = require('../models/Journey');

exports.getAll = async (req, res) => {
  try {
    // Get all bookings and enrich with journey + user info
    const bookings = await Booking.find().sort({ timestamp: -1 }).lean();
    
    // Batch-fetch journeys and users referenced
    const journeyIds = [...new Set(bookings.map(b => b.journeyId).filter(Boolean))];
    const emails = [...new Set(bookings.map(b => b.email).filter(Boolean))];

    const [journeys, users] = await Promise.all([
      Journey.find({ _id: { $in: journeyIds } }).select('title date route price').lean().catch(() => []),
      User.find({ email: { $in: emails } }).select('username email profilePhoto status createdAt').lean()
    ]);

    const journeyMap = Object.fromEntries(journeys.map(j => [j._id.toString(), j]));
    const userMap = Object.fromEntries(users.map(u => [u.email.toLowerCase(), u]));

    const enriched = bookings.map(b => ({
      ...b,
      journeyDetails: journeyMap[b.journeyId] || null,
      userDetails: userMap[b.email?.toLowerCase()] || null
    }));

    res.json(enriched);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMyBookings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const bookings = await Booking.find({ email: user.email }).sort({ timestamp: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const booking = await Booking.create({ ...req.body, timestamp: Date.now() });
    res.status(201).json(booking);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.delete = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
