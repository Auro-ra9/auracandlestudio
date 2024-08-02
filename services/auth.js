const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const dotenv = require('dotenv').config();
const userSchema = require('../model/userSchema');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CLIENT_CALLBACK,
  passReqToCallback: true
},
  async function (request, accessToken, refreshToken, profile, done) {
    try {
      let user = await userSchema.findOne({ email: profile.email });

      function createReferralCode() {
        return uuidv4().slice(0, 8); // Generate a short referral code
    }

      // If there is no user, create a new user
      if (!user) {
        user = new userSchema({
          name: profile.displayName,
          email: profile.email,
          googleID: profile.id,
          referralCode:createReferralCode()
        });
        await user.save();
      }
      done(null, user);

    } catch (error) {
      console.log(`Error in Google Auth: ${error}`);
      done(error, null);
    }
  }
));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await userSchema.findById(id);
    done(null, user);
  } catch (err) {
    console.log(`Error in Google Auth backend: ${err}`);
    done(err, null);
  }
});

module.exports=passport