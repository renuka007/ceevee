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
      const user = new User({email: 'test@test.com', password: 'test1234'});
      await user.validate();
      assert.ok(user, 'valid email and password produces no error');
    });
    it('should fail on no values specified', () => {
      const user = new User();
      const err = user.validateSync();
      assert.equal(err.name, 'ValidationError', 'user does not validate');
    });
    it('should fail on missing email', () => {
      const user = new User({password: 'test1234'});
      const err = user.validateSync();
      assert.equal(err.name, 'ValidationError', 'user does not validate');
    });
    it('should fail on missing password', () => {
      const user = new User({email: 'test@test.com'});
      const err = user.validateSync();
      assert.equal(err.name, 'ValidationError', 'user does not validate');
    });
    it('should fail on invalid email', () => {
      const user = new User({email: 'test@test', password: 'test1234'});
      const err = user.validateSync();
      assert.equal(err.name, 'ValidationError', 'user does not validate');
    });
    it('should fail on invalid password', () => {
      const user = new User({email: 'test@test.com', password: 'short'});
      const err = user.validateSync();
      assert.equal(err.name, 'ValidationError', 'user does not validate');
    });
  });

  describe('setPasswordHash()', () => {
    it('should set the value of password to a hash', async () => {
      const user = new User({email: 'test@test.com', password: 'test1234'});
      assert.isDefined(user.password, 'password is set');
      await user.setPasswordHash();
      assert.isDefined(user.password, 'password is set');
      assert.notEqual(user.password, 'test1234', 'password is hashed');
      assert.ok(user.password.match(/^\$/), 'password is hashed');
    });
    it('should not set the value of password if password is unset', async () => {
      const user = new User({email: 'test@test.com'});
      assert.isUndefined(user.password, 'password is not set');
      await user.setPasswordHash();
      assert.isUndefined(user.password, 'password is not set');
    });
  });

  describe('comparePassword()', () => {
    it('should match when password and hashed password match', async () => {
      const password = 'test1234';
      const user = new User({email: 'test@test.com', password: password});
      await user.setPasswordHash();
      const isMatch = await user.comparePassword('test1234');
      assert.equal(isMatch, true, 'passwords match');
    });
    it('should not match when password and hashed password do not match', async () => {
      const password = 'test1234';
      const user = new User({email: 'test@test.com', password: password});
      await user.setPasswordHash();
      const isMatch = await user.comparePassword('wrong');
      assert.equal(isMatch, false, 'passwords do not match');
    });
    it('should fail if password is not set', async () => {
      const user = new User({email: 'test@test.com'});
      let err = undefined;
      try {
        await user.comparePassword('wrong');
      } catch (e) {
        err = e;
      }
      assert.isUndefined(user.password, 'password is not set');
      assert.isDefined(err, 'comparePassword() threw an error');
    });
  });

  describe('static comparePassword()', () => {
    it('should return true when password and hash match', async () => {
      const password = 'test1234';
      const hash = await User.hashPassword(password);
      const isMatch = await User.comparePassword(password, hash);
      assert.equal(isMatch, true, 'passwords match');
    });
    it('should return false when password and hash do not match', async () => {
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
