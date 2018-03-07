import jwt from 'jsonwebtoken';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { UnauthorizedError } from 'restify-errors';

import User from '../models/user';
import { JWT_SECRET } from '../../config/config';


/**
 * JWT authentication strategy for securing routes that require authorization.
 * Checks that the token is valid and that the authenticated subject exists.
 */
const jwtLoginAuthStrategy = new BearerStrategy(async (token, next) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const isAuthenticated = decoded.authenticated;
    const user = await User.findOne({email: decoded.sub});
    if (isAuthenticated && user) {
      // email and password are valid
      // build and return a JWT
      return next(null, {
        email: user.email
      });
    } else {
      // return unauthorized if token is invalid
      return next(new UnauthorizedError());
    }
  } catch (e) {
    // return unauthorized for all other errors
    return next(new UnauthorizedError());
  }
});

jwtLoginAuthStrategy.name = 'jwt-login';

export default jwtLoginAuthStrategy;
