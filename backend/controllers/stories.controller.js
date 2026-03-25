const Story = require('../models/Story');

exports.getAll = async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { type, url, thumbnail } = req.body;
    const story = await Story.create({ type, url, thumbnail: thumbnail || url, createdAt: Date.now() });
    res.status(201).json(story);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.delete = async (req, res) => {
  try {
    await Story.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
