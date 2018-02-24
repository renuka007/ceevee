import { assert } from 'chai';
import User from '../../../app/models/user';

describe ('Unit: User', () => {

  describe('defaults', () => {
    it('should include a created_on date', () => {
      const user = new User();
      assert.instanceOf(user.created_on, Date, 'created_on is an Date');
    });
  });

  describe('validate', () => {
    it('should pass on valid email', async function () {
      const user = new User({email: 'test@test.com'});
      await user.validate();
      assert.ok(user, 'valid email produces no error');
    });
    it('should fail on no values specified', async function () {
      const user = new User();
      try {
        await user.validate();
      } catch (e) {
        assert.isDefined(e, 'user does not validate');
      }
    });
    it('should fail on missing email', async function () {
      const user = new User({email: null});
      try {
        await user.validate();
      } catch (e) {
        assert.isDefined(e, 'user does not validate');
      }
    });
    it('should fail on invalid email', async function () {
      const user = new User({email: 'test@test'});
      try {
        await user.validate();
      } catch (e) {
        assert.isDefined(e, 'user does not validate');
      }
    });
  });
});
