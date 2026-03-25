const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/journeys.controller');
const { authMiddleware, adminGuard } = require('../middleware/auth.middleware');

router.get('/', ctrl.getAll);
router.post('/', authMiddleware, adminGuard, ctrl.create);
router.put('/:id', authMiddleware, adminGuard, ctrl.update);
router.delete('/:id', authMiddleware, adminGuard, ctrl.delete);

// Admin: upload photos for a journey
router.post('/:id/photos', authMiddleware, adminGuard, ctrl.addPhotos);
router.delete('/:id/photos', authMiddleware, adminGuard, ctrl.removePhoto);

module.exports = router;
