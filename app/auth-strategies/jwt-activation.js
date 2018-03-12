import jwt from 'jsonwebtoken';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { UnauthorizedError } from 'restify-errors';

import User from '../models/user';
import { JWT_SECRET } from '../../config/config';


/**
 * JWT authentication strategy for securing activation routes.
 * Checks that the activation token is valid and that the token subject exists.
 */
const jwtActivationAuthStrategy = new BearerStrategy(async (token, next) => {
  const user = await User.findOneActivation(token);
  if (user) {
    return next(null, user);
  }
  return next(new UnauthorizedError());
});

jwtActivationAuthStrategy.name = 'jwt-activation';

export default jwtActivationAuthStrategy;
