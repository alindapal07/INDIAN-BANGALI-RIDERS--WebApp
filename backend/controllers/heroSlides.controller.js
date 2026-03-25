const HeroSlide = require('../models/HeroSlide');

exports.getAll = async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ createdAt: 1 });
    res.json(slides);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const slide = await HeroSlide.create(req.body);
    res.status(201).json(slide);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.delete = async (req, res) => {
  try {
    await HeroSlide.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
