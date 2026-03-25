const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bookings.controller');
const { authMiddleware, adminGuard, approvedGuard } = require('../middleware/auth.middleware');

router.get('/', authMiddleware, adminGuard, ctrl.getAll);
router.get('/my', authMiddleware, ctrl.getMyBookings);
router.post('/', authMiddleware, approvedGuard, ctrl.create); // must be approved member
router.delete('/:id', authMiddleware, adminGuard, ctrl.delete);

module.exports = router;
