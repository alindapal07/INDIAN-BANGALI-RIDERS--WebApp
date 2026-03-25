const express = require('express');
const router = express.Router();
const { authMiddleware, approvedGuard, adminGuard } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/timeline.controller');

// Public: GET posts (read-only public feed)
router.get('/', ctrl.getPosts);

// Admin only: create posts (strictly controlled)
router.post('/', authMiddleware, adminGuard, ctrl.createPost);

// Authenticated (any approved user): reactions, comments, votes
router.post('/:id/react', authMiddleware, approvedGuard, ctrl.reactToPost);
router.post('/:id/comment', authMiddleware, approvedGuard, ctrl.addComment);
router.post('/:id/comment/:commentId/like', authMiddleware, approvedGuard, ctrl.likeComment);
router.post('/:id/poll/vote', authMiddleware, approvedGuard, ctrl.votePoll);
router.delete('/:id', authMiddleware, ctrl.deletePost);

// Admin only:
router.patch('/:id/pin', authMiddleware, adminGuard, ctrl.pinPost);

module.exports = router;
