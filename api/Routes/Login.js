const express = require("express");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const session = require('express-session');
const { UserModel, initializeQuestionsForUser } = require('../db');
const authRouter = express.Router(); 

// Session Configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 's3cret!prep',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Passport Session Setup
passport.serializeUser((user, done) => {
  done(null, user.id);
}); 
 
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "https://bprep-backend-cikh309f6-aniiiixds-projects.vercel.app/api/OGoogle/auth/google",
  passReqToCallback: true
}, async (request, accessToken, refreshToken, profile, done) => {
  try {
    let user = await UserModel.findOne({ googleId: profile.id });
    
    if (!user) {
      user = new UserModel({
        googleId: profile.id,
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        profilePicture: profile.photos[0].value,
        authSource: 'google'
      });
      
      await user.save();
      
      // Initialize questions for the new user
      await initializeQuestionsForUser(user._id);
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Middleware Setup
authRouter.use(session(sessionConfig));
authRouter.use(passport.initialize());
authRouter.use(passport.session());

// Google OAuth Routes
authRouter.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

authRouter.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/log/success',
    failureRedirect: '/log/failure'
  })
);

// Success and Failure Routes
authRouter.get('/success', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      profilePicture: req.user.profilePicture
    }
  });
});

authRouter.get('/failure', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Google OAuth authentication failed',
    session: true
  });
});

module.exports = authRouter;