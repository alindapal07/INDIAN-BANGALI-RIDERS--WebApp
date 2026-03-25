const Comment = require('../models/Comment');
const RidePost = require('../models/RidePost');

exports.getByPost = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const filter = { postId: req.params.postId };
    if (!isAdmin) filter.hidden = { $ne: true };
    const comments = await Comment.find(filter).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { postId, text, parentId } = req.body;
    const username = req.user ? req.user.username : 'Guest';
    const comment = await Comment.create({
      postId, text, username,
      timestamp: new Date().toLocaleString('en-IN'),
      parentId: parentId || null
    });
    await RidePost.findByIdAndUpdate(postId, { $inc: { comments: 1 } });
    res.status(201).json(comment);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.toggleVisibility = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    comment.hidden = !comment.hidden;
    await comment.save();
    res.json({ hidden: comment.hidden });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.delete = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (comment) {
      await RidePost.findByIdAndUpdate(comment.postId, { $inc: { comments: -1 } });
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
