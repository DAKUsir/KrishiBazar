const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

// @route  GET /api/auth/google
const googleAuth = (req, res, next) => {
  // Handled by passport middleware in route
  next();
};

// @route  GET /api/auth/google/callback
const googleCallback = async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Redirect to frontend with token
    res.redirect(`${clientUrl}/auth/callback?token=${token}&onboarded=${req.user.isOnboarded}`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/auth?error=oauth_failed`);
  }
};

// @route  GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  PUT /api/auth/onboarding
const completeOnboarding = async (req, res) => {
  try {
    const { language, crops, farmDetails } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { language, crops, farmDetails, isOnboarded: true },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, language, crops, farmDetails } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, language, crops, farmDetails },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { googleAuth, googleCallback, getMe, completeOnboarding, updateProfile };
