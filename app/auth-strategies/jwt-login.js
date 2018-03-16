import jwt from 'jsonwebtoken';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { UnauthorizedError } from 'restify-errors';

import User from '../models/user';
import { SECURE_KEY } from '../../config/config';


/**
 * JWT authentication strategy for securing routes that require authorization.
 * Checks that the token is valid and that the authenticated subject exists.
 */
const jwtLoginAuthStrategy = new BearerStrategy(async (token, next) => {
  const user = await User.findOneAuthenticated(token);
  if (user) return next(null, user);
  return next(new UnauthorizedError());
});

jwtLoginAuthStrategy.name = 'jwt-login';

export default jwtLoginAuthStrategy;
