import { BasicStrategy } from 'passport-http';
import { UnauthorizedError } from 'restify-errors';
import User from '../models/user';


/**
 * Basic authentication strategy for login with an email and password.
 * Successful authentication issues a JSON web token.
 */
export default new BasicStrategy(async (email, password, next) => {
  const user = await User.findOne({email});
  const token = user ? await user.issueJWTAuthenticationToken(password) : null;
  if (token) {
    return next(null, token);
  }
  return next(new UnauthorizedError());
});
