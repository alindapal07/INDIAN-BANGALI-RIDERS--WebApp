const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/highlights.controller');
const { authMiddleware, adminGuard } = require('../middleware/auth.middleware');

router.get('/', ctrl.getAll);
router.post('/', authMiddleware, adminGuard, ctrl.create);
router.delete('/:id', authMiddleware, adminGuard, ctrl.delete);

module.exports = router;
