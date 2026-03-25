const Rider = require('../models/Rider');

exports.getAll = async (req, res) => {
  try {
    const riders = await Rider.find().sort({ createdAt: 1 });
    res.json(riders);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const rider = await Rider.create(req.body);
    res.status(201).json(rider);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.delete = async (req, res) => {
  try {
    await Rider.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
