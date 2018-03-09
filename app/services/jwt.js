import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_LOGIN_EXPIRES_IN } from '../../config/config';

/**
 * Creates a login token asserting the subject is authenticated.
 * @param {string} subject - the logged in user
 * @param {boolean} authenticated - optionally override authenticated in payload
 *  (default `true`)
 * @param {string} expiresIn - optional time from now until expiration
 *  in zeit/ms
 * @returns {string} a JSON web token
 */
const jwtLoginToken = (subject, authenticated=true, expiresIn=JWT_LOGIN_EXPIRES_IN) => jwt.sign({
  authenticated: authenticated
}, JWT_SECRET, {
  algorithm: 'HS256',
  expiresIn: expiresIn,
  subject: subject
});

export { jwtLoginToken };
