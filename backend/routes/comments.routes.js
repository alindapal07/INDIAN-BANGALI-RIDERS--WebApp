const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/comments.controller');
const { authMiddleware, adminGuard } = require('../middleware/auth.middleware');

const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    try {
      req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    } catch {}
  }
  next();
};

router.get('/post/:postId', optionalAuth, ctrl.getByPost);
router.post('/', authMiddleware, ctrl.create);
router.patch('/:id/toggle', authMiddleware, adminGuard, ctrl.toggleVisibility);
router.delete('/:id', authMiddleware, adminGuard, ctrl.delete);

module.exports = router;
