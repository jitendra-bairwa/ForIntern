const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

const router = express.Router();

// Google OAuth 2.0 setup
passport.use(new GoogleStrategy({
  clientID: process.env.clientID,
  clientSecret: process.env.clientSecret,
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = new User({
        email: profile.emails[0].value,
        googleId: profile.id,
      });
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Google authentication route
router.get('/', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

// Google callback route
router.get('/callback', passport.authenticate('google', {
  failureRedirect: '/login',
}), (req, res) => {

    // Store user information in the session after successful login
    req.session.user = {
    id: req.user._id,
    email: req.user.email
  };

  // Successful authentication, redirect to landing page
  res.redirect('/payment');
});

module.exports = router;
