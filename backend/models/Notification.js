const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { 
    type: String, 
    enum: ['like', 'comment', 'message', 'group_message', 'story_upload', 'post_upload', 'approval', 'announcement'],
    required: true 
  },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
