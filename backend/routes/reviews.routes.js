const express = require('express');
const router = express.Router();

const { protect, adminOnly } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/reviews.controller');

// Routes
router.get('/', ctrl.getReviews);
router.post('/', protect, ctrl.createReview);
router.post('/:id/helpful', protect, ctrl.markHelpful);
router.delete('/:id', protect, ctrl.deleteReview);

module.exports = router;