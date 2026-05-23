const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { googleCallback, getMe, completeOnboarding, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @route  GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route  GET /api/auth/google/callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL || 'https://krishibazar-1.onrender.com'}/auth?error=oauth_failed`, session: false }),
  googleCallback
);

// @route  POST /api/auth/demo
// Bypass Google OAuth — create/find a demo user and return JWT
router.post('/demo', async (req, res) => {
  try {
    const { name = 'Demo Farmer', email = 'demo@krishibazar.app' } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        googleId: `demo_${Date.now()}`,
        email,
        name,
        avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=${name}`,
        isOnboarded: false,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Protected routes
router.get('/me', protect, getMe);
router.put('/onboarding', protect, completeOnboarding);
router.put('/profile', protect, updateProfile);

module.exports = router;
