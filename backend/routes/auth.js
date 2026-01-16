import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, return user
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          profilePicture: profile.photos[0].value,
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token with user data
    const token = jwt.sign(
      { userId: req.user._id, email: req.user.email, name: req.user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Determine cookie settings based on environment
    const isProduction = process.env.NODE_ENV === 'production';

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction, // Secure in prod (HTTPS), Not secure in dev (HTTP)
      sameSite: isProduction ? 'none' : 'lax', // None for cross-domain prod, lax for local dev
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Redirect to frontend without token in URL
    res.redirect(`${process.env.FRONTEND_URL}`);
  }
);

// @route   GET /api/auth/me
// @desc    Get current user info
router.get('/me', async (req, res) => {
  try {
    // Get token from httpOnly cookie or Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-__v');

    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user and clear cookie
router.post('/logout', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
  res.json({ success: true, message: 'Logged out' });
});

export default router;
