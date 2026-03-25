const mongoose = require('mongoose');

const groupChatSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '', maxlength: 500 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // group admins (super-admin auto-included)
  avatar: { type: String, default: '' }, // emoji, base64 or URL
  isPublic: { type: Boolean, default: false },

  // Conversation mode: 'two-way' = everyone can send | 'one-way' = only admins broadcast
  chatMode: { type: String, enum: ['two-way', 'one-way'], default: 'two-way' },

  // Pinned message
  pinnedMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },

  // Group invite link token
  inviteToken: { type: String, default: '' },

  // Disappearing messages ttl (0 = disabled, seconds)
  disappearingTTL: { type: Number, default: 0 },

  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('GroupChat', groupChatSchema);
