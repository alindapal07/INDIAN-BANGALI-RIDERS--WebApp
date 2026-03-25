const mongoose = require('mongoose');

// Reaction subdocument
const ReactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  emoji: { type: String },
}, { _id: false });

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null for group messages
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupChat' }, // null for DM

  content: { type: String, default: '', maxlength: 4000 },
  type: {
    type: String,
    enum: ['text', 'image', 'voice', 'file', 'system', 'call'],
    default: 'text'
  },

  // For voice messages: URL/base64 of audio blob
  voiceUrl: { type: String, default: '' },
  voiceDuration: { type: Number, default: 0 }, // seconds

  // For image/file
  fileUrl: { type: String, default: '' },
  fileName: { type: String, default: '' },

  // For call-log messages
  callType: { type: String, enum: ['voice', 'group-voice'], default: 'voice' },
  callDuration: { type: Number, default: 0 }, // seconds, 0 = missed

  // Reply thread
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },

  // Emoji reactions
  reactions: [ReactionSchema],

  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isAdminBroadcast: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // delete-for-me
  isPinned: { type: Boolean, default: false },

  // Forwarded from
  forwardedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },

  // Expiry for disappearing messages
  expiresAt: { type: Date, default: null },
}, { timestamps: true });

messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ group: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Message', messageSchema);
