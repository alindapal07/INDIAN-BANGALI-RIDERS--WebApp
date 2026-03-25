const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Attach io to every request for controllers to emit events
app.use((req, res, next) => { req.io = io; next(); });

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/stories', require('./routes/stories.routes'));
app.use('/api/highlights', require('./routes/highlights.routes'));
app.use('/api/posts', require('./routes/posts.routes'));
app.use('/api/journeys', require('./routes/journeys.routes'));
app.use('/api/bookings', require('./routes/bookings.routes'));
app.use('/api/riders', require('./routes/riders.routes'));
app.use('/api/places', require('./routes/places.routes'));
app.use('/api/hero-slides', require('./routes/heroSlides.routes'));
app.use('/api/comments', require('./routes/comments.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));
app.use('/api/timeline', require('./routes/timeline.routes'));
app.use('/api/reviews', require('./routes/reviews.routes'));

// Attach io instance to app for controllers
app.set('io', io);
app.get("/", (req, res) => {
  res.send("Indian Bangali Riders Backend Running 🚀");
});
// Health check
app.get('/api/health', (req, res) => res.json({ status: 'IBR_BACKEND_ONLINE', timestamp: Date.now() }));

// Socket.io real-time
io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  // User joins personal room + group rooms + notification room
  socket.on('join', ({ userId, groupIds = [] }) => {
    socket.join(userId.toString());       // for notifications
    socket.join(`user_${userId}`);        // for DMs
    groupIds.forEach(gid => socket.join(`group_${gid}`));
    console.log(`👤 User ${userId} joined rooms`);
  });

  socket.on('join_group', (groupId) => { socket.join(`group_${groupId}`); });
  socket.on('leave_group', (groupId) => { socket.leave(`group_${groupId}`); });

  socket.on('typing', ({ to, from, isGroup }) => {
    if (isGroup) socket.to(`group_${to}`).emit('typing', { from });
    else socket.to(`user_${to}`).emit('typing', { from });
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

// Connect to MongoDB and start
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

server.listen(PORT, () => console.log(`🚀 IBR Server running on port ${PORT} (with Socket.io)`));

module.exports = { app, server };
