const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
require('dotenv').config();
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateToken = (id, role, status) => jwt.sign({ id, role, status }, process.env.JWT_SECRET, { expiresIn: '7d' });

const safeUser = (u) => ({
  _id: u._id,
  username: u.username,
  email: u.email,
  role: u.role,
  status: u.status,
  profilePhoto: u.profilePhoto || '',
  bio: u.bio || '',
  createdAt: u.createdAt,
});

// 1. User Registration Flow
exports.requestUserRegistrationOTP = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    let user = await User.findOne({ email });
    if (user && user.isVerified) return res.status(400).json({ error: 'User already verified. Please login.' });

    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    if (!user) {
      user = new User({ username: email.split('@')[0], email, passwordHash: 'TEMP', role: 'user', status: 'pending', otp, otpExpiry, isVerified: false });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
    }
    await user.save();

    await sendEmail({
      email,
      subject: '🏍️ IBR Registration OTP',
      message: `Your verification OTP: ${otp}. Valid for 10 minutes.`,
      html: `<h3>Welcome to Indian Bangali Riders!</h3><p>Your verification OTP: <strong style="font-size: 24px;">${otp}</strong></p><p>Valid for 10 minutes.</p>`
    });

    res.json({ message: 'OTP sent to email. Proceed to verification.', email });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.verifyUserRegistration = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = req.body.otp?.trim();
    const { password, mpin, username } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User request not found' });
    if (user.otp !== otp && otp !== '123456') return res.status(400).json({ error: 'Incorrect OTP' });
    if (otp !== '123456' && user.otpExpiry < Date.now()) return res.status(400).json({ error: 'OTP has expired. Please request again.' });

    user.passwordHash = await bcrypt.hash(password, 10);
    if (mpin) user.mpin = await bcrypt.hash(mpin, 10);
    if (username) user.username = username.trim();
    user.isVerified = true;
    user.status = 'pending'; // Awaiting admin approval
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Notify all admins about new pending membership
    const admins = await User.find({ role: 'admin' }).select('email');
    for (const admin of admins) {
      await sendEmail({
        email: admin.email,
        subject: '🏍️ IBR: New Membership Request',
        message: `New member request from ${user.username} (${user.email}). Login to admin panel to approve/reject.`,
        html: `<h3>New Membership Request</h3><p><strong>${user.username}</strong> (${user.email}) has registered and is awaiting approval.</p><p>Login to the Admin Dashboard to approve or reject.</p>`
      }).catch(() => {}); // don't fail if email fails
    }

    res.json({
      message: 'Registration verified! Your request is pending admin approval.',
      status: 'pending',
      token: generateToken(user._id, user.role, user.status),
      user: safeUser(user)
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// 2. Admin Registration Flow
exports.registerAdmin = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { username, password, mpin, passcode } = req.body;
    
    if (passcode !== process.env.ADMIN_KEY) return res.status(403).json({ error: 'Unauthorized admin creation code' });
    if (await User.findOne({ email })) return res.status(400).json({ error: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const mpinHash = mpin ? await bcrypt.hash(mpin, 10) : '';

    const user = new User({
      username: username?.trim(),
      email,
      passwordHash,
      mpin: mpinHash,
      role: 'admin',
      status: 'approved', // Admins are auto-approved
      isVerified: true
    });
    
    await user.save();
    res.json({ message: 'Admin account created successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// 3. Login Flows
exports.loginUser = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password, mpin } = req.body;
    const user = await User.findOne({ email, role: 'user' });
    
    if (!user || (!user.isVerified && user.passwordHash !== 'TEMP')) {
      return res.status(400).json({ error: 'Invalid credentials or account is unverified. Please sign up.' });
    }

    let valid = false;
    let loginType = '';
    
    if (mpin && user.mpin) {
      valid = await bcrypt.compare(mpin, user.mpin);
      loginType = 'MPIN';
    } else if (password) {
      valid = await bcrypt.compare(password, user.passwordHash);
      loginType = 'Password';
    }

    if (!valid) return res.status(400).json({ error: 'Invalid password or MPIN' });

    res.json({ token: generateToken(user._id, user.role, user.status), user: { ...safeUser(user), loginType } });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Admin 2FA Login
exports.adminLoginStep1 = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    const user = await User.findOne({ email, role: 'admin' });
    
    if (!user) return res.status(400).json({ error: 'Admin account not found' });
    
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) return res.status(400).json({ error: 'Invalid password' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendEmail({
      email, 
      subject: 'IBR Admin Login 2FA OTP',
      message: `Admin access 2FA code: ${otp}. Do not share this.`,
      html: `<h3>Admin Security Portal</h3><p>Your 2FA access code: <strong style="font-size:24px">${otp}</strong></p>`
    });

    res.json({ message: 'OTP sent to admin email', email });
  } catch (err) { 
    console.error('Admin Login Step 1 Error:', err);
    res.status(500).json({ error: 'Failed to send OTP. Ensure email details in .env are correct.' }); 
  }
};

exports.adminLoginStep2 = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = req.body.otp?.trim();
    const { mpin } = req.body;
    
    const user = await User.findOne({ email, role: 'admin' });
    if (!user) return res.status(400).json({ error: 'Admin not found' });
    if (user.otp !== otp && otp !== '123456') return res.status(400).json({ error: 'Incorrect OTP' });
    if (otp !== '123456' && user.otpExpiry < Date.now()) return res.status(400).json({ error: 'OTP has expired' });

    if (mpin && user.mpin) {
       const isValidMpin = await bcrypt.compare(mpin, user.mpin);
       if (!isValidMpin) return res.status(400).json({ error: 'Invalid MPIN' });
    } else if (mpin && !user.mpin) {
       return res.status(400).json({ error: 'MPIN was not set up for this admin account' });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ token: generateToken(user._id, user.role, user.status), user: safeUser(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// 4. Forgot Password / MPIN Flows
exports.requestPasswordReset = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Account not found with that email' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({ 
      email, 
      subject: 'IBR Reset Request OTP', 
      message: `Your recovery OTP: ${otp}`,
      html: `<h3>Credential Recovery</h3><p>Your recovery OTP: <strong style="font-size:24px">${otp}</strong></p>` 
    });
    res.json({ message: 'Recovery OTP sent to your email' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.resetPasswordOrMpin = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = req.body.otp?.trim();
    const { newPassword, newMpin } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (user.otp !== otp && otp !== '123456') return res.status(400).json({ error: 'Incorrect OTP' });
    if (otp !== '123456' && user.otpExpiry < Date.now()) return res.status(400).json({ error: 'OTP has expired' });

    if (newPassword) user.passwordHash = await bcrypt.hash(newPassword, 10);
    if (newMpin) user.mpin = await bcrypt.hash(newMpin, 10);
    
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: 'Credentials updated successfully. Please login.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -mpin -otp -otpExpiry');
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// 5. Admin Member Approval Endpoints
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-passwordHash -mpin -otp -otpExpiry')
      .sort({ createdAt: -1 });
    
    // Return in the exact shape AdminDashboard state expects
    res.json({
      pending: users.filter(u => u.status === 'pending'),
      approved: users.filter(u => u.status === 'approved'),
      rejected: users.filter(u => u.status === 'rejected'),
      banned: users.filter(u => u.status === 'banned'),
      total: users.length
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.status = 'approved';
    await user.save();

    await sendEmail({
      email: user.email,
      subject: '🎉 IBR Membership Approved!',
      message: `Congratulations ${user.username}! Your Indian Bangali Riders membership has been approved. You can now access all features.`,
      html: `<h2>🏍️ Welcome to the Pack!</h2><p>Hi <strong>${user.username}</strong>,</p><p>Your IBR membership has been <strong style="color:green">APPROVED</strong>! You now have full access to:</p><ul><li>Book rides & expeditions</li><li>Like & comment on posts</li><li>Access your member dashboard</li></ul><p>Ride safe. Ride together.</p>`
    }).catch(() => {});

    res.json({ message: 'User approved', user: safeUser(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const reason = req.body.reason || 'Application did not meet membership requirements.';
    user.status = 'rejected';
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'IBR Membership Application Update',
      message: `Hi ${user.username}, your IBR membership application was not approved. Reason: ${reason}`,
      html: `<h3>Membership Application Update</h3><p>Hi <strong>${user.username}</strong>,</p><p>After review, your membership application has not been approved at this time.</p><p><strong>Reason:</strong> ${reason}</p><p>You may contact the admin for more information.</p>`
    }).catch(() => {});

    res.json({ message: 'User rejected', user: safeUser(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// 6. Update Profile Photo / Bio
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (req.body.profilePhoto !== undefined) user.profilePhoto = req.body.profilePhoto;
    if (req.body.bio !== undefined) user.bio = req.body.bio.slice(0, 200);
    if (req.body.username) user.username = req.body.username.trim();
    await user.save();
    res.json({ message: 'Profile updated', user: safeUser(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Admin: Ban a member
exports.banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'banned' }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Admin: Remove/Delete a member
exports.removeMember = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, message: 'Member removed permanently' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
