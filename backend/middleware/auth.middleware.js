const jwt = require('jsonwebtoken');
const User = require('../models/User');


const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const adminGuard = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const approvedGuard = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Login required' });
    if (req.user.role === 'admin') return next();
    const user = await User.findById(req.user.id).select('status');
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (user.status === 'pending') {
      return res.status(403).json({ error: 'PENDING_APPROVAL', message: 'Your membership is pending admin approval. Please wait.' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'REJECTED', message: 'Your membership application was rejected. Contact admin.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// alias names to match routes
const protect = authMiddleware;
const adminOnly = adminGuard;



module.exports = {
  authMiddleware,
  adminGuard,
  approvedGuard,
  protect,
  adminOnly
};