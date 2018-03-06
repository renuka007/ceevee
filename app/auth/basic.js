import { BasicStrategy } from 'passport-http';
import { UnauthorizedError } from 'restify-errors';

import User from '../models/user';


export default new BasicStrategy(async (email, password, next) => {
  try {
    const user = await User.findOne({email: email});
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new UnauthorizedError());
    } else {
      return next(null, {}); // TODO return an actual JWT
    }
  } catch (e) {
    return next(new UnauthorizedError());
  }
});
