const session = require('express-session');
const { UserModel } = require('../db'); 
    
const sessionMiddleware = async (req, res, next) => {
  console.log('Session middleware called');
  console.log('Session:', req.session);

  try {
      // Check if user is authenticated via Passport
      if (req.session && req.session.passport && req.session.passport.user) {
          const userId = req.session.passport.user;

          // Find user to ensure session corresponds to valid user
          const user = await UserModel.findById(userId);
          if (user) {
              console.log('User found:', user);
              req.user = {
                  id: user._id,
                  email: user.email,
              };
              return next();
          } else {
              console.log('No user found for session');
              req.session.destroy((err) => {
                  if (err) {
                      console.error('Session destruction error:', err);
                  }
                  return res.status(401).json({
                      success: false,
                      message: 'Invalid session',
                  });
              });
          }
      } else {
          console.log('User not authenticated');
          return res.status(401).json({
              success: false,
              message: 'Unauthorized: Please log in',
          });
      }
  } catch (error) {
      console.error('Authentication middleware error:', error);
      return res.status(500).json({
          success: false,
          message: 'Authentication error',
          error: error.message,
      });
  }
};



// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 's3cret!prep', // Use strong secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Use secure in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Example of how to use in a route
const protectedRoute = [
  sessionMiddleware,
  (req, res) => {
    // This route is now protected
    res.json({
      success: true,
      user: req.user // Access user info
    });
  }
];

module.exports = {
  sessionMiddleware,
  sessionConfig,
  protectedRoute
};