const RidePost = require('../models/RidePost');
const Comment = require('../models/Comment');

exports.getAll = async (req, res) => {
  try {
    const posts = await RidePost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { type, imageUrl, description, placeId } = req.body;
    const post = await RidePost.create({ type: type || 'photo', imageUrl, description, placeId: placeId || null });
    res.status(201).json(post);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.delete = async (req, res) => {
  try {
    await RidePost.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ postId: req.params.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.toggleLike = async (req, res) => {
  try {
    const userIdentifier = req.user ? (req.user.email || req.user.username) : null;
    if (!userIdentifier) return res.status(401).json({ error: 'Login to like posts' });
    
    const post = await RidePost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const alreadyLiked = post.likedBy.includes(userIdentifier);
    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter(u => u !== userIdentifier);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userIdentifier);
      post.likes += 1;
    }
    await post.save();
    res.json({ liked: !alreadyLiked, likes: post.likes });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getLikedStatus = async (req, res) => {
  try {
    const userIdentifier = req.user ? (req.user.email || req.user.username) : null;
    if (!userIdentifier) return res.json({ liked: false });
    const post = await RidePost.findById(req.params.id);
    if (!post) return res.json({ liked: false });
    res.json({ liked: post.likedBy.includes(userIdentifier) });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
