import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || "",
      profileFields: ["id", "emails"],
    },
    async (_, __, profile, done) => {
      const email = profile.emails;

      if (!email) return done(null, false);

      return done(null, profile);
    }
  )
);
