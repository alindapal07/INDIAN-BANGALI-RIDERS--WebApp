const Message = require('../models/Message');
const GroupChat = require('../models/GroupChat');
const User = require('../models/User');

// ── DM: user sends message to admin ──────────────────────────────
exports.sendDM = async (req, res) => {
  try {
    const { content, type = 'text', voiceUrl, voiceDuration, fileUrl, fileName, replyTo } = req.body;
    const senderId = req.user.id;

    let recipientId = req.body.recipientId;
    if (!recipientId) {
      const admin = await User.findOne({ role: 'admin' }).select('_id');
      if (!admin) return res.status(404).json({ error: 'No admin found' });
      recipientId = admin._id;
    }

    const msg = await Message.create({
      sender: senderId, recipient: recipientId, content, type,
      voiceUrl, voiceDuration, fileUrl, fileName, replyTo
    });
    const populated = await msg.populate('sender', 'username profilePhoto role');

    if (req.io) {
      req.io.to(`user_${recipientId}`).emit('new_message', populated);
      req.io.to(`user_${senderId}`).emit('new_message', populated);
    }

    res.json(populated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── DM: get conversation ──────────────────────────────────────────
exports.getDMConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: otherId },
        { sender: otherId, recipient: userId }
      ],
      group: null,
      isDeleted: false,
      $nor: [{ deletedFor: userId }]
    }).populate('sender', 'username profilePhoto role')
      .populate('replyTo', 'content sender')
      .sort({ createdAt: 1 }).limit(300);

    res.json(messages);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Admin: get all DM threads ──────────────────────────────────
exports.getAllDMThreads = async (req, res) => {
  try {
    const adminId = req.user.id;
    const msgs = await Message.find({
      $or: [{ recipient: adminId }, { sender: adminId }],
      group: null
    }).populate('sender', 'username profilePhoto status')
      .populate('recipient', 'username profilePhoto status')
      .sort({ createdAt: -1 });

    const threads = {};
    msgs.forEach(m => {
      const other = m.sender._id.toString() === adminId ? m.recipient : m.sender;
      if (!other) return;
      const key = other._id.toString();
      if (!threads[key]) threads[key] = { user: other, lastMessage: m, unread: 0 };
      if (!m.readBy.includes(adminId) && m.sender._id.toString() !== adminId) threads[key].unread++;
    });

    res.json(Object.values(threads));
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── User: get my admin thread ─────────────────────────────────────
exports.getMyAdminThread = async (req, res) => {
  try {
    const userId = req.user.id;
    const admin = await User.findOne({ role: 'admin' }).select('_id username profilePhoto');
    if (!admin) return res.json({ messages: [], admin: null });

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: admin._id },
        { sender: admin._id, recipient: userId }
      ],
      group: null, isDeleted: false
    }).populate('sender', 'username profilePhoto role')
      .populate('replyTo', 'content sender')
      .sort({ createdAt: 1 }).limit(300);

    res.json({ messages, admin });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Admin: delete a message ───────────────────────────────────────
exports.deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.messageId, { isDeleted: true, content: '🚫 Message deleted by admin' });
    if (req.io) req.io.emit('message_deleted', { messageId: req.params.messageId });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Group: create ─────────────────────────────────────────────────
exports.createGroup = async (req, res) => {
  try {
    const { name, description, members = [], isPublic = false, avatar, chatMode = 'two-way' } = req.body;
    const group = await GroupChat.create({
      name, description,
      avatar: avatar || '🏍️',
      createdBy: req.user.id,
      members: [req.user.id, ...members],
      admins: [req.user.id],
      isPublic, chatMode
    });
    const populated = await group.populate('members', 'username profilePhoto');
    if (req.io) req.io.emit('group_created', populated);
    res.json(populated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Group: update ─────────────────────────────────────────────────
exports.updateGroup = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const group = await GroupChat.findByIdAndUpdate(
      req.params.groupId,
      { $set: { name, description, isPublic } },
      { new: true }
    ).populate('members', 'username profilePhoto role');
    if (req.io) req.io.to(`group_${group._id}`).emit('group_updated', group);
    res.json(group);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Group: delete ─────────────────────────────────────────────────
exports.deleteGroup = async (req, res) => {
  try {
    const group = await GroupChat.findByIdAndUpdate(req.params.groupId, { isDeleted: true }, { new: true });
    if (req.io) req.io.to(`group_${req.params.groupId}`).emit('group_deleted', { groupId: req.params.groupId });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Group: update avatar (base64 or URL) ──────────────────────────
exports.updateGroupAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const group = await GroupChat.findByIdAndUpdate(
      req.params.groupId,
      { $set: { avatar } },
      { new: true }
    ).populate('members', 'username profilePhoto role');
    if (req.io) req.io.to(`group_${group._id}`).emit('group_updated', group);
    res.json(group);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Group: set chat mode (one-way / two-way) ──────────────────────
exports.setGroupMode = async (req, res) => {
  try {
    const { chatMode } = req.body;
    const group = await GroupChat.findByIdAndUpdate(
      req.params.groupId,
      { $set: { chatMode } },
      { new: true }
    );
    if (req.io) req.io.to(`group_${group._id}`).emit('group_mode_changed', { groupId: group._id, chatMode });
    res.json(group);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Group: get my groups ──────────────────────────────────────────
exports.getMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const groups = await GroupChat.find({
      $or: [{ members: userId }, { isPublic: true }],
      isDeleted: false
    }).populate('members', 'username profilePhoto role status')
      .populate('createdBy', 'username')
      .populate('pinnedMessage', 'content sender type');
    res.json(groups);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Group: get messages ───────────────────────────────────────────
exports.getGroupMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await Message.find({
      group: req.params.groupId,
      isDeleted: false,
      $nor: [{ deletedFor: userId }]
    }).populate('sender', 'username profilePhoto role')
      .populate('replyTo', 'content sender type voiceUrl')
      .sort({ createdAt: 1 }).limit(300);
    res.json(messages);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Group: send message ───────────────────────────────────────────
exports.sendGroupMessage = async (req, res) => {
  try {
    const { content, type = 'text', voiceUrl, voiceDuration, fileUrl, fileName, replyTo } = req.body;
    const group = await GroupChat.findById(req.params.groupId);
    if (!group || group.isDeleted) return res.status(404).json({ error: 'Group not found' });

    const isMember = group.members.some(m => m.toString() === req.user.id) || group.isPublic;
    if (!isMember) return res.status(403).json({ error: 'Not a group member' });

    // One-way mode: only admins/group-admins can send
    if (group.chatMode === 'one-way') {
      const isAdmin = group.admins.some(a => a.toString() === req.user.id) || req.user.role === 'admin';
      if (!isAdmin) return res.status(403).json({ error: 'This group is in broadcast mode — only admins can send messages' });
    }

    // Compute expiry for disappearing messages
    let expiresAt = null;
    if (group.disappearingTTL > 0) {
      expiresAt = new Date(Date.now() + group.disappearingTTL * 1000);
    }

    const msg = await Message.create({
      sender: req.user.id, group: req.params.groupId,
      content: content || '', type,
      voiceUrl, voiceDuration, fileUrl, fileName, replyTo, expiresAt
    });
    const populated = await msg.populate([
      { path: 'sender', select: 'username profilePhoto role' },
      { path: 'replyTo', select: 'content sender type voiceUrl' }
    ]);

    if (req.io) req.io.to(`group_${req.params.groupId}`).emit('new_group_message', populated);
    res.json(populated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Group: add member ─────────────────────────────────────────────
exports.addGroupMember = async (req, res) => {
  try {
    const group = await GroupChat.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    const { userId } = req.body;
    if (!group.members.includes(userId)) group.members.push(userId);
    await group.save();
    const populated = await group.populate('members', 'username profilePhoto role status');
    if (req.io) {
      req.io.to(`group_${group._id}`).emit('member_added', { groupId: group._id, userId });
      req.io.to(`user_${userId}`).emit('added_to_group', populated);
    }
    res.json(populated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Group: remove member ──────────────────────────────────────────
exports.removeGroupMember = async (req, res) => {
  try {
    const group = await GroupChat.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    group.members = group.members.filter(m => m.toString() !== req.params.userId);
    group.admins = group.admins.filter(a => a.toString() !== req.params.userId);
    await group.save();
    if (req.io) {
      req.io.to(`group_${group._id}`).emit('member_removed', { groupId: group._id, userId: req.params.userId });
      req.io.to(`user_${req.params.userId}`).emit('removed_from_group', { groupId: group._id });
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Group: pin message ────────────────────────────────────────────
exports.pinMessage = async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.messageId, { isPinned: true });
    await GroupChat.findByIdAndUpdate(req.params.groupId, { pinnedMessage: req.params.messageId });
    if (req.io) req.io.to(`group_${req.params.groupId}`).emit('message_pinned', { messageId: req.params.messageId });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Group: react to message ───────────────────────────────────────
exports.reactToMessage = async (req, res) => {
  try {
    const { emoji } = req.body;
    const userId = req.user.id;
    const msg = await Message.findById(req.params.messageId);
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    // Toggle: remove existing reaction from same user, add new one
    msg.reactions = msg.reactions.filter(r => r.user.toString() !== userId);
    if (emoji) msg.reactions.push({ user: userId, emoji });
    await msg.save();

    if (req.io) req.io.to(`group_${req.params.groupId}`).emit('reaction_updated', {
      messageId: msg._id, reactions: msg.reactions
    });
    res.json(msg.reactions);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Group: admin delete message ───────────────────────────────────
exports.deleteGroupMessage = async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.messageId, {
      isDeleted: true, content: '🚫 Message deleted by admin'
    });
    if (req.io) req.io.to(`group_${req.params.groupId}`).emit('message_deleted', { messageId: req.params.messageId });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Get all users ─────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'approved' }).select('username profilePhoto _id role');
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Admin: ban user ───────────────────────────────────────────────
exports.banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: { status: 'rejected' } },
      { new: true }
    ).select('username email status');
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (req.io) req.io.to(`user_${req.params.userId}`).emit('account_banned');
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Admin: unban user ─────────────────────────────────────────────
exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: { status: 'approved' } },
      { new: true }
    ).select('username email status');
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (req.io) req.io.to(`user_${req.params.userId}`).emit('account_unbanned');
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
