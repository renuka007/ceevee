import { assert } from 'chai';
import jwt from 'jsonwebtoken';
import { jwtLoginToken } from '../../../app/services/jwt';
import { JWT_SECRET } from '../../../config/config';

describe ('Unit: Service: jwt', () => {

  describe('jwtLoginToken', () => {
    it('should return a JSON web token asserting the subject is authenticated', () => {
      const token = jwtLoginToken('test@test.com');
      const decoded = jwt.verify(token, JWT_SECRET);
      assert.equal(decoded.sub, 'test@test.com');
      assert.isTrue(decoded.authenticated);
    });
    it('should allow overriding of `authenticated` value', () => {
      const token = jwtLoginToken('test@test.com', false);
      const decoded = jwt.verify(token, JWT_SECRET);
      assert.isFalse(decoded.authenticated);
    });
    it('should allow overriding of `expiresIn` value', () => {
      const token = jwtLoginToken('test@test.com', true, '-1d');
      assert.throws(() => {
        // verify step throws an error when token is expired, demonstrating that
        // the expiration was indeed overriden
        jwt.verify(token, JWT_SECRET);
      }, Error, 'jwt expired');
    });
  });

});
