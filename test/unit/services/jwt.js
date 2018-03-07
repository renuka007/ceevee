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
  });

});
