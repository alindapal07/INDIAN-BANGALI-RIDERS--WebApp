const TimelinePost = require('../models/TimelinePost');
const User = require('../models/User');

// GET /api/timeline?page=1&limit=10
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;
    
    const posts = await TimelinePost.find({ isPublic: true })
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await TimelinePost.countDocuments({ isPublic: true });
    
    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/timeline — create a timeline post
exports.createPost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username profilePhoto role status');
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.status !== 'approved') return res.status(403).json({ error: 'Only approved members can post' });
    
    const { type, content, mediaUrl, backgroundColor, textColor, poll, tags } = req.body;
    if (!content && !mediaUrl && !poll?.question) return res.status(400).json({ error: 'Post must have content' });
    
    const post = await TimelinePost.create({
      author: user._id,
      authorName: user.username,
      authorPhoto: user.profilePhoto || '',
      authorRole: user.role,
      type: type || 'text',
      content: content || '',
      mediaUrl: mediaUrl || '',
      backgroundColor: backgroundColor || '',
      textColor: textColor || '#FFFFFF',
      poll: poll || undefined,
      tags: tags || [],
    });
    
    // Emit new post to all connected users
    const io = req.app.get('io');
    if (io) io.emit('timeline:new_post', post);
    
    res.status(201).json(post);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/timeline/:id/react — add/change/remove reaction
exports.reactToPost = async (req, res) => {
  try {
    const { reaction } = req.body; // 'like'|'fire'|'ride'|'wow'|'clap'|null (null = remove)
    const post = await TimelinePost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const userId = req.user.id.toString();
    if (!reaction) {
      post.reactions.delete(userId);
    } else {
      post.reactions.set(userId, reaction);
    }
    await post.save();
    
    // Emit reaction update
    const io = req.app.get('io');
    if (io) io.emit('timeline:reaction', { postId: post._id, reactions: Object.fromEntries(post.reactions) });
    
    res.json({ reactions: Object.fromEntries(post.reactions) });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/timeline/:id/comment — add a comment
exports.addComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Comment cannot be empty' });
    
    const user = await User.findById(req.user.id).select('username profilePhoto');
    const post = await TimelinePost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const comment = {
      author: req.user.id,
      authorName: user.username,
      authorPhoto: user.profilePhoto || '',
      content: content.trim().slice(0, 1000),
      parentComment: parentComment || null,
    };
    
    post.comments.push(comment);
    await post.save();
    
    const newComment = post.comments[post.comments.length - 1];
    
    const io = req.app.get('io');
    if (io) io.emit('timeline:comment', { postId: post._id, comment: newComment });
    
    res.status(201).json(newComment);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/timeline/:id/comment/:commentId/like — like a comment
exports.likeComment = async (req, res) => {
  try {
    const post = await TimelinePost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    
    const userId = req.user.id;
    const idx = comment.likes.findIndex(l => l.toString() === userId.toString());
    if (idx > -1) comment.likes.splice(idx, 1);
    else comment.likes.push(userId);
    
    await post.save();
    res.json({ likes: comment.likes.length, liked: idx === -1 });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/timeline/:id/poll/vote — vote on a poll option
exports.votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const post = await TimelinePost.findById(req.params.id);
    if (!post || !post.poll?.options?.length) return res.status(404).json({ error: 'Poll not found' });
    
    const userId = req.user.id;
    // Remove existing vote from all options
    post.poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(v => v.toString() !== userId.toString());
    });
    post.poll.options[optionIndex]?.votes.push(userId);
    await post.save();
    
    res.json({ poll: post.poll });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// DELETE /api/timeline/:id — delete a post (author or admin)
exports.deletePost = async (req, res) => {
  try {
    const post = await TimelinePost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await post.deleteOne();
    const io = req.app.get('io');
    if (io) io.emit('timeline:delete_post', { postId: req.params.id });
    res.json({ message: 'Post deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// PATCH /api/timeline/:id/pin — admin pin/unpin a post
exports.pinPost = async (req, res) => {
  try {
    const post = await TimelinePost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.isPinned = !post.isPinned;
    await post.save();
    res.json({ isPinned: post.isPinned });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
