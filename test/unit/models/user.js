import { assert } from 'chai';
import jwt from 'jsonwebtoken';

import User from '../../../app/models/user';
import { JWT_SECRET } from '../../../config/config'


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
    it('should fail on weak password', () => {
      const user = new User({email: 'test@test.com', password: 'short'});
      const err = user.validateSync();
      assert.equal(err.name, 'ValidationError', 'user does not validate');
    });
    it('should fail when password equals email', () => {
      const email = 'test@test.com';
      const user = new User({email: email, password: email});
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
      const isMatch = await user.comparePassword('wrong');
      assert.equal(isMatch, false, 'passwords do not match');
    });
  });

  describe('issueJWTAuthenticationToken()', () => {
    it('should return a JWT claiming the user is authenticated if password is a match', async () => {
      const user = new User({email: 'test@test.com', password: 'test1234'});
      await user.setPasswordHash();
      const token = await user.issueJWTAuthenticationToken('test1234');
      const decoded = jwt.verify(token, JWT_SECRET);
      assert.equal(decoded.sub, 'test@test.com');
      assert.isTrue(decoded.authenticated);
    });
    it('should return undefined if password is not a match', async () => {
      const user = new User({email: 'test@test.com', password: 'test1234'});
      await user.setPasswordHash();
      const token = await user.issueJWTAuthenticationToken('wrong');
      assert.isUndefined(token);
    });
    it('should return undefined if no password is passed', async () => {
      const user = new User({email: 'test@test.com', password: 'test1234'});
      await user.setPasswordHash();
      const token = await user.issueJWTAuthenticationToken();
      assert.isUndefined(token);
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
    it('should return false when no arguments passed', async () => {
      const password = 'test1234';
      const hash = await User.hashPassword(password);
      const isMatch = await User.comparePassword();
      assert.equal(isMatch, false, 'passwords do not match');
    });
    it('should return false when password is undefined', async () => {
      const password = 'test1234';
      const hash = await User.hashPassword(password);
      const isMatch = await User.comparePassword(undefined, hash);
      assert.equal(isMatch, false, 'passwords do not match');
    });
    it('should return false when hash is undefined', async () => {
      const password = 'test1234';
      const hash = await User.hashPassword(password);
      const isMatch = await User.comparePassword(password);
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

  describe('static isHash()', () => {
    it('should return false for non-hashes', () => {
      const isHash = User.isHash('test1234');
      assert.isFalse(isHash);
    });
    it('should return true for hashes', async () => {
      const hash = await User.hashPassword('test1234');
      const isHash = User.isHash(hash);
      assert.isTrue(isHash);
    });
  });

  describe('static verifyAuthenticationToken()', () => {
    it('should return the email from the token if the authentication claim is valid', async () => {
      const validToken = jwt.sign({
        authenticated: true
      }, JWT_SECRET, {
        algorithm: 'HS512',
        expiresIn: '10s',
        subject: 'test@test.com'
      });
      const email = User.verifyAuthenticationToken(validToken);
      assert.equal(email, 'test@test.com', 'email returned');
    });
    it('should return null if authenticated is false', async () => {
      const token = jwt.sign({
        authenticated: false
      }, JWT_SECRET, {
        algorithm: 'HS512',
        expiresIn: '10s',
        subject: 'test@test.com'
      });
      const email = User.verifyAuthenticationToken(token);
      assert.isNull(email, 'no email returned');
    });
    it('should return null if token is invalid', async () => {
      const email = User.verifyAuthenticationToken('invalid token');
      assert.isNull(email, 'no email returned');
    });
    it('should return null if no token is passed', async () => {
      const email = User.verifyAuthenticationToken();
      assert.isNull(email, 'no email returned');
    });
  });
});
