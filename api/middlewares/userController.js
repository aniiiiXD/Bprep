const { userModel } = require('../db');

const loadAuth = (req, res) => {
    res.render('auth');
}

const successGoogleLogin = async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication failed' 
        });
      }
  
      // Optional: Generate JWT token
      // const token = generateToken(req.user);
  
      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: req.user.id,
          email: req.user.emails[0].value,
          name: req.user.displayName
        }
      });
    } catch (error) {
      console.error('Success login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  };
  
  const failureGoogleLogin = (req, res) => {
    res.status(401).json({
      success: false,
      message: 'Google authentication failed'
    });
  };
  
  module.exports = {
    loadAuth,
    successGoogleLogin,
    failureGoogleLogin
  };