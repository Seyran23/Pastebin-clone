import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '@/utils/env';

import { findOrCreateGoogleUser } from './google.service';

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    (_accessToken, _refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        done(new Error('No email returned from Google'));
        return;
      }

      findOrCreateGoogleUser({
        googleId: profile.id,
        email,
        displayName: profile.displayName,
      })
        .then((user) => done(null, user as unknown as Express.User))
        .catch((err: Error) => done(err));
    },
  ),
);

export default passport;
