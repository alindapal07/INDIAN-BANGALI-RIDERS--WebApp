const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  // Membership approval status
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'banned'], default: 'pending' },
  mpin: { type: String },
  otp: { type: String },
  otpExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },
  // Profile photo (stored as base64 or URL)
  profilePhoto: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 200 },
}, { timestamps: true });

userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
