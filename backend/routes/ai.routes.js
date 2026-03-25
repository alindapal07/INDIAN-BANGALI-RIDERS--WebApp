const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ai.controller');
const { authMiddleware, adminGuard } = require('../middleware/auth.middleware');

router.post('/ask-ria', ctrl.askRIA);
router.post('/mission-visuals', ctrl.getMissionVisuals);
router.get('/analytics', authMiddleware, adminGuard, ctrl.getAnalytics);

module.exports = router;
