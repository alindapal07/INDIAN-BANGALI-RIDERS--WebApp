const Highlight = require('../models/Highlight');

exports.getAll = async (req, res) => {
  try {
    const highlights = await Highlight.find().sort({ createdAt: -1 });
    res.json(highlights);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const highlight = await Highlight.create(req.body);
    res.status(201).json(highlight);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.delete = async (req, res) => {
  try {
    await Highlight.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
