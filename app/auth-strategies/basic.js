import { BasicStrategy } from 'passport-http';
import { UnauthorizedError } from 'restify-errors';

import { jwtLoginToken } from '../services/jwt';
import User from '../models/user';


/**
 * Basic authentication strategy for login with an email and password.
 * Successful authentication issues a JSON web token.
 */
export default new BasicStrategy(async (email, password, next) => {
  // get user and check if password is correct
  const user = await User.findOneWithPassword(email, password);
  if (user) {
    // email and password are valid
    // build and return a JWT
    return next(null, {
      token: jwtLoginToken(user.email)
    });
  } else {
    // return unauthorized if password is incorrect
    return next(new UnauthorizedError());
  }
});
