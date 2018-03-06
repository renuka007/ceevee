import passport from 'passport';
import basicAuthStrategy from '../auth/basic';

passport.use(basicAuthStrategy);

/**
 * A basic auth (username/password) handler used before routes such as login.
 */
export default passport.authenticate('basic', {session: false});
