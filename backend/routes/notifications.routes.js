const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/notifications.controller');

router.use(authMiddleware);
router.get('/', ctrl.getMyNotifications);
router.put('/read', ctrl.markAllRead);           // mark all read
router.put('/:id/read', ctrl.markOneRead);       // mark one read

module.exports = router;
