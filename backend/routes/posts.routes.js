const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/posts.controller');
const { authMiddleware, adminGuard, approvedGuard } = require('../middleware/auth.middleware');

router.get('/', ctrl.getAll); // public - no login needed
router.post('/', authMiddleware, adminGuard, ctrl.create);
router.delete('/:id', authMiddleware, adminGuard, ctrl.delete);
router.post('/:id/like', authMiddleware, approvedGuard, ctrl.toggleLike); // approved members only
router.get('/:id/like-status', authMiddleware, ctrl.getLikedStatus);

module.exports = router;
