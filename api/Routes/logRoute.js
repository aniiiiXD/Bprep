const express = require('express');
const logRouter = express(); 
const passport = require('passport');
require('../passport');
const userController = require('../middlewares/userController');
const {userModel} = require('../db')

logRouter.use(passport.initialize());
logRouter.use(passport.session());


logRouter.get('/', userController.loadAuth); 


logRouter.get('/auth/google' , passport.authenticate('google', { scope: 
	[ 'email', 'profile' ] 
}));   

logRouter.get( '/auth/google/callback', 
	passport.authenticate( 'google', { 
		failureRedirect: 'http://localhost:3000/it6/frontend/pages/login.html',
    successRedirect: 'http://localhost:3000/it6/frontend/pages/interview2.html'
}));

logRouter.get('/success', async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect('/api/OGoogle/failure');
      }
  
      // Find or create user in database
      let user = await userModel.findOne({ googleId: req.user.id });
      
      if (!user) {
        user = new userModel({
          googleId: req.user.id,
          email: req.user.emails[0].value,
          firstName: req.user.name.givenName,
          lastName: req.user.name.familyName,
          profilePicture: req.user.photos[0].value
        });
        await user.save();
      }
  
      // You might want to create a JWT or session here
      res.redirect('http://localhost:3000/dashboard'); // Redirect to frontend dashboard
    } catch (error) {
      console.error('Authentication error:', error);
      res.redirect('/api/OGoogle/failure');
    }
  });
  
  // Failure Handler
  logRouter.get('/failure', userController.failureGoogleLogin);
  
  module.exports = logRouter;
