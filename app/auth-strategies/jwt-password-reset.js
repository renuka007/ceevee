import jwt from 'jsonwebtoken';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { UnauthorizedError } from 'restify-errors';

import User from '../models/user';
import { SECURE_KEY } from '../../config/config';


/**
 * JWT password reset strategy.
 * Checks that the password reset token is valid, that the subject exists, and
 * updates the password accordingly.
 *
 * Password reset also activates the user.
 */
const jwtPasswordResetAuthStrategy = new BearerStrategy(
  {passReqToCallback: true},
  async (req, token, next) => {
    const {password} = (req.body || {});
    try {
      const user = await User.findOneAndResetPassword(token, password);
      if (user) return next(null, user);
    } catch (e) {
      // e will always be a ValidationError
      return next(e);
    }
    return next(new UnauthorizedError());
  });

jwtPasswordResetAuthStrategy.name = 'jwt-password-reset';

export default jwtPasswordResetAuthStrategy;
