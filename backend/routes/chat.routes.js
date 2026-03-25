const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/chat.controller');
const { authMiddleware, adminGuard, approvedGuard } = require('../middleware/auth.middleware');

// ── DM (User ↔ Admin) ─────────────────────────────────────────
router.get('/my-thread', authMiddleware, approvedGuard, ctrl.getMyAdminThread);
router.post('/dm', authMiddleware, approvedGuard, ctrl.sendDM);
router.get('/dm/:userId', authMiddleware, ctrl.getDMConversation);
router.delete('/messages/:messageId', authMiddleware, adminGuard, ctrl.deleteMessage);

// Admin: view all DM threads
router.get('/admin/threads', authMiddleware, adminGuard, ctrl.getAllDMThreads);

// ── Group Chat ────────────────────────────────────────────────
router.get('/groups', authMiddleware, approvedGuard, ctrl.getMyGroups);
router.post('/groups', authMiddleware, adminGuard, ctrl.createGroup);
router.patch('/groups/:groupId', authMiddleware, adminGuard, ctrl.updateGroup);
router.delete('/groups/:groupId', authMiddleware, adminGuard, ctrl.deleteGroup);
router.patch('/groups/:groupId/avatar', authMiddleware, adminGuard, ctrl.updateGroupAvatar);
router.patch('/groups/:groupId/mode', authMiddleware, adminGuard, ctrl.setGroupMode);
router.get('/groups/:groupId/messages', authMiddleware, approvedGuard, ctrl.getGroupMessages);
router.post('/groups/:groupId/messages', authMiddleware, approvedGuard, ctrl.sendGroupMessage);
router.post('/groups/:groupId/members', authMiddleware, adminGuard, ctrl.addGroupMember);
router.delete('/groups/:groupId/members/:userId', authMiddleware, adminGuard, ctrl.removeGroupMember);
router.post('/groups/:groupId/pin/:messageId', authMiddleware, adminGuard, ctrl.pinMessage);
router.post('/groups/:groupId/react/:messageId', authMiddleware, approvedGuard, ctrl.reactToMessage);
router.delete('/groups/:groupId/messages/:messageId', authMiddleware, adminGuard, ctrl.deleteGroupMessage);

// Get approved users (for admin to add to groups)
router.get('/users', authMiddleware, adminGuard, ctrl.getAllUsers);

// User ban/unban
router.patch('/users/:userId/ban', authMiddleware, adminGuard, ctrl.banUser);
router.patch('/users/:userId/unban', authMiddleware, adminGuard, ctrl.unbanUser);

module.exports = router;
