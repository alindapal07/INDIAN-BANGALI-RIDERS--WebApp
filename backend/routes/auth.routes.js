const router = require('express').Router();
const auth = require('../controllers/auth.controller');
const { authMiddleware, adminGuard } = require('../middleware/auth.middleware');

// Public User Routes
router.post('/register/request', auth.requestUserRegistrationOTP);
router.post('/register/verify', auth.verifyUserRegistration);
router.post('/login', auth.loginUser);

// Public Admin Auth Routes
router.post('/admin/register', auth.registerAdmin);
router.post('/admin/login/step1', auth.adminLoginStep1);
router.post('/admin/login/step2', auth.adminLoginStep2);

// Forgot Crypto Flows
router.post('/forgot/request', auth.requestPasswordReset);
router.post('/forgot/reset', auth.resetPasswordOrMpin);

// Protected Routes
router.get('/me', authMiddleware, auth.getMe);
router.put('/profile', authMiddleware, auth.updateProfile);

// Admin: Member Management
router.get('/admin/members', authMiddleware, adminGuard, auth.getPendingUsers);
router.put('/admin/approve/:id', authMiddleware, adminGuard, auth.approveUser);
router.put('/admin/reject/:id', authMiddleware, adminGuard, auth.rejectUser);
router.put('/admin/ban/:id', authMiddleware, adminGuard, auth.banUser);
router.delete('/admin/remove/:id', authMiddleware, adminGuard, auth.removeMember);

module.exports = router;
