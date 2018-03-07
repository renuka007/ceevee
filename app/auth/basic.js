import jwt from 'jsonwebtoken';
import { BasicStrategy } from 'passport-http';
import { UnauthorizedError } from 'restify-errors';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../../config/config'

import User from '../models/user';


/**
 * Basic authentication strategy for login with an email and password.
 * Successful authentication issues a JSON web token.
 */
export default new BasicStrategy(async (email, password, next) => {
  try {
    // get user and check if password is correct
    const user = await User.findOne({email: email});
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // return unauthorized if password is incorrect
      return next(new UnauthorizedError());
    } else {
      // email and password are valid
      // build and return a JWT
      const jwtOptions = {
        algorithm: 'HS512',
        expiresIn: JWT_EXPIRES_IN,
        subject: user.email
      };
      const token = jwt.sign({}, JWT_SECRET, jwtOptions);
      return next(null, {token});
    }
  } catch (e) {
    // return unauthorized for all other errors
    return next(new UnauthorizedError());
  }
});
