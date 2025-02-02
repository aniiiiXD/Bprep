const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const { UserModel } = require("./db");
require("dotenv").config();

passport.serializeUser((user, done) => {
  console.log("Serializing user:", user);
  done(null, user);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, null);
  }
});
 
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://bprep-backend-cikh309f6-aniiiixds-projects.vercel.app/api/OGoogle/auth/google/callback",
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user
        console.log("Google Profile:", profile);
        let user = await UserModel.findOne({ googleId: profile.id });

        if (!user) {
          user = new UserModel({
            googleId: profile.id,
            email: profile.emails[0].value,
            // other user details
          });
          await user.save();
        }

        // Store user ID in session
        console.log("Session before setting userId:", request.session);
        request.session.userId = user._id;
        request.session.save((err) => {
          if (err) console.log("Error saving session:", err);
        });
        console.log("Session after setting userId:", request.session);

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
