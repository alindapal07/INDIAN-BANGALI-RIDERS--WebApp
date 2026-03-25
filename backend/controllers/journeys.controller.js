const Journey = require('../models/Journey');

const refreshStatuses = async () => {
  const now = new Date();
  await Journey.updateMany(
    { status: 'upcoming', date: { $lt: now.toISOString().split('T')[0] } },
    { $set: { status: 'completed' } }
  );
};

exports.getAll = async (req, res) => {
  try {
    await refreshStatuses();
    const journeys = await Journey.find().sort({ date: -1 });
    res.json(journeys);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { title, date, route, description, price, duration, distance, seats, coverPhoto, photos } = req.body;
    const journey = await Journey.create({
      title, date, route, description, price,
      duration, distance, seats,
      coverPhoto: coverPhoto || '',
      photos: photos || [],
      status: 'upcoming'
    });
    res.status(201).json(journey);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const journey = await Journey.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(journey);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.delete = async (req, res) => {
  try {
    await Journey.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Admin: add photos to a journey ──────────────────────────────
exports.addPhotos = async (req, res) => {
  try {
    const { photos, coverPhoto } = req.body; // photos: array of base64 or URLs
    const journey = await Journey.findByIdAndUpdate(
      req.params.id,
      {
        $push: { photos: { $each: photos || [] } },
        ...(coverPhoto ? { $set: { coverPhoto } } : {})
      },
      { new: true }
    );
    if (!journey) return res.status(404).json({ error: 'Journey not found' });
    res.json(journey);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Admin: remove a specific photo ──────────────────────────────
exports.removePhoto = async (req, res) => {
  try {
    const { photoUrl } = req.body;
    const journey = await Journey.findByIdAndUpdate(
      req.params.id,
      { $pull: { photos: photoUrl } },
      { new: true }
    );
    if (!journey) return res.status(404).json({ error: 'Journey not found' });
    res.json(journey);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
