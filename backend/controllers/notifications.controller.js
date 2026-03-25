const Notification = require('../models/Notification');
const User = require('../models/User');

// Helper to create + emit notification
exports.createNotification = async (io, { recipient, sender, type, title, body, link, data }) => {
  try {
    if (recipient.toString() === sender?.toString()) return; // no self-notify
    const notif = await Notification.create({ recipient, sender, type, title, body: body || '', link: link || '', data: data || {} });
    if (io) io.to(recipient.toString()).emit('notification', { ...notif.toObject() });
    return notif;
  } catch (err) { console.error('Notification create error:', err.message); }
};

// GET /api/notifications  — user's own notifications
exports.getMyNotifications = async (req, res) => {
  try {
    const notifs = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'username profilePhoto role');
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    res.json({ notifications: notifs, unreadCount });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// PUT /api/notifications/read — mark all as read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// PUT /api/notifications/:id/read — mark one as read
exports.markOneRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user.id }, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
