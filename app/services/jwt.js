import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_LOGIN_EXPIRES_IN } from '../../config/config';

/**
 * Creates a login token asserting the subject is authenticated.
 * @param {string} subject - the logged in user
 * @returns {string} a JSON web token
 */
const jwtLoginToken = (subject) => jwt.sign({
  authenticated: true
}, JWT_SECRET, {
  algorithm: 'HS512',
  expiresIn: JWT_LOGIN_EXPIRES_IN,
  subject: subject
});

export { jwtLoginToken };
