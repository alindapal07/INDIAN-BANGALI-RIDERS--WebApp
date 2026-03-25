const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  postId: { type: String, required: true },
  username: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toLocaleString('en-IN') },
  hidden: { type: Boolean, default: false },
  parentId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', CommentSchema);
