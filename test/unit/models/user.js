import { assert } from 'chai';
import User from '../../../app/models/user';

describe ('Unit: Model: User', () => {

  describe('defaults', () => {
    it('should include a created_on date', () => {
      const user = new User();
      assert.instanceOf(user.created_on, Date, 'created_on is an Date');
    });
  });

  describe('validate', () => {
    it('should pass on valid email and password', async () => {
      const user = new User({email: 'test@test.com'});
      await user.setPassword('test1234');
      await user.validate();
      assert.ok(user, 'valid email and password produces no error');
    });
    it('should pass on valid email and password_hash', async () => {
      const user = new User({
        email: 'test@test.com',
        password_hash: 'fakehash'
      });
      await user.validate();
      assert.ok(user, 'valid email and password_hash produces no error');
    });
    it('should fail on no values specified', async () => {
      const user = new User();
      let err = undefined;
      try {
        await user.validate();
      } catch (e) {
        err = e;
      }
      assert.isDefined(err, 'user does not validate');
    });
    it('should fail on missing email', async () => {
      const user = new User({email: null, password_hash: 'fakehash'});
      let err = undefined;
      try {
        await user.validate();
      } catch (e) {
        err = e;
      }
      assert.isDefined(err, 'user does not validate');
    });
    it('should fail on invalid email', async () => {
      const user = new User({email: 'test@test', password_hash: 'fakehash'});
      let err = undefined;
      try {
        await user.validate();
      } catch (e) {
        err = e;
      }
      assert.isDefined(err, 'user does not validate');
    });
    it('should fail on invalid password', async () => {
      const user = new User({email: 'test@test.com'});
      try {
        await user.setPassword('short');
      } catch (e) {
        // don't care about this error, as we want to prove validation will fail
      }
      let err = undefined;
      try {
        await user.validate();
      } catch (e) {
        err = e;
      }
      assert.isDefined(err, 'user does not validate');
    });
    it('should fail on missing password_hash', async () => {
      const user = new User({email: 'test@test.com'});
      let err = undefined;
      try {
        await user.validate();
      } catch (e) {
        err = e;
      }
      assert.isDefined(err, 'user does not validate');
    });
  });

  describe('setPassword()', () => {
    it('should set the value of password_hash when valid', async () => {
      const password = 'test1234';
      const user = new User({email: 'test@test.com'});
      assert.isUndefined(user.password_hash, 'password_hash is not set');
      await user.setPassword(password);
      assert.isDefined(user.password_hash, 'password_hash is set');
      assert.notEqual(password, user.password_hash, 'password and password_hash are different');
    });
    it('should throw an error if password is invalid', async () => {
      const password = 'short';
      const user = new User({email: 'test@test.com'});
      let err = undefined;
      try {
        await user.setPassword(password);
      } catch (e) {
        err = e;
      }
      assert.isDefined(err, 'password is too short');
    });
    it('should not set the value of password_hash when invalid', async () => {
      const password = 'short';
      const user = new User({email: 'test@test.com'});
      assert.isUndefined(user.password_hash, 'password_hash is not set');
      try {
        await user.setPassword(password);
      } catch (e) {
        // ignore for now
      }
      assert.isUndefined(user.password_hash, 'password_hash is not set');
    });
  });

  describe('comparePassword()', () => {
    it('should match when password and password_hash match', async () => {
      const password = 'test1234';
      const user = new User({email: 'test@test.com'});
      await user.setPassword(password);
      user.password_hash = await User.hashPassword(password);
      const isMatch = await user.comparePassword('test1234');
      assert.equal(isMatch, true, 'passwords match');
    });
    it('should not match when password and password_hash do not match', async () => {
      const password = 'test1234';
      const user = new User({email: 'test@test.com'});
      await user.setPassword(password);
      user.password_hash = await User.hashPassword(password);
      const isMatch = await user.comparePassword('wrong');
      assert.equal(isMatch, false, 'passwords do not match');
    });
  });

  describe('static comparePassword()', () => {
    it('should return true when password and hash match', async () => {
      const password = 'test1234';
      const hash = await User.hashPassword(password);
      const isMatch = await User.comparePassword(password, hash);
      assert.equal(isMatch, true, 'passwords match');
    });
    it('should return false when password and hash match', async () => {
      const password = 'test1234';
      const hash = await User.hashPassword(password);
      const isMatch = await User.comparePassword('wrong', hash);
      assert.equal(isMatch, false, 'passwords do not match');
    });
  });

  describe('static hashPassword()', () => {
    it('should return a hashed password', async () => {
      const password = 'test1234';
      const hash = await User.hashPassword(password);
      assert.isDefined(password, 'password is defined');
      assert.isDefined(hash, 'hash is defined');
      assert.notEqual(password, hash, 'hash is not equal to password');
    });
  });
});
