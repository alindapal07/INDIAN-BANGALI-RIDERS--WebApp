const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String },
  authorPhoto: { type: String, default: '' },
  content: { type: String, required: true, maxlength: 1000 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  parentComment: { type: mongoose.Schema.Types.ObjectId, default: null }, // for threaded replies
}, { timestamps: true });

const TimelinePostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String },
  authorPhoto: { type: String, default: '' },
  authorRole: { type: String, default: 'user' },
  
  // Content types
  type: { 
    type: String, 
    enum: ['text', 'photo', 'video', 'announcement', 'poll', 'ride_update', 'poster'],
    default: 'text'
  },
  content: { type: String, default: '', maxlength: 5000 },
  mediaUrl: { type: String, default: '' },
  
  // Announcement / poster fields
  backgroundColor: { type: String, default: '' }, // for styled announcements
  textColor: { type: String, default: '#FFFFFF' },
  
  // Poll
  poll: {
    question: { type: String, default: '' },
    options: [{ 
      text: String, 
      votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],
  },
  
  // Reactions: { userId: 'like'|'fire'|'ride'|'wow'|'clap' }
  reactions: { type: Map, of: String, default: {} },
  
  // Comments (embedded for perf)
  comments: [CommentSchema],
  
  tags: [String],
  isPublic: { type: Boolean, default: true },
  isPinned: { type: Boolean, default: false },
  
}, { timestamps: true });

TimelinePostSchema.index({ createdAt: -1, isPublic: 1 });
TimelinePostSchema.index({ author: 1 });

module.exports = mongoose.model('TimelinePost', TimelinePostSchema);
