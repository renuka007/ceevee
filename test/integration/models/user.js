import { assert } from 'chai';
import jwt from 'jsonwebtoken';

import User from '../../../app/models/user';
import DatabaseHelper from '../../helpers/database-helper';
import { SECURE_KEY } from '../../../config/config';


const userData = {email: 'test@test.com', password: 'test1234', active: true};

describe ('Integration: Model: User', () => {

  beforeEach(async () => {
    await DatabaseHelper.connect();
    await DatabaseHelper.empty(User);
  });

  afterEach(async () => {
    await DatabaseHelper.disconnect();
  });

  describe('email uniqueness', () => {
    it('should allow users with distinct email addresses', async () => {
      const user1 = await User.create(userData);
      const user2 = await User.create({email: 'foo@test.com', password: 'test1234'});
      await assert.ok(!user1.isNew, 'users with different emails may be saved');
    });
    it('should not allow users with the same email address', async () => {
      const user1 = await User.create(userData);
      const user2 = new User({email: 'test@test.com', password: 'test1234'});
      let err = undefined;
      try {
        await user2.save();
      } catch (e) {
        err = e;
      }
      assert.isDefined(err, 'user with the same email address cannot be saved');
      assert.equal(user1.email, user2.email, 'user emails are duplicates');
      assert.ok(!user1.isNew, 'user 1 is saved');
      assert.notOk(!user2.isNew, 'user 2 is not saved');
    });
  });

  describe('activate()', () => {
    it('should set `active` to `true` and save', async () => {
      const user = await User.create({
        email: 'test@test.com',
        password: 'test1234'
      });
      assert.isFalse(user.active);
      await user.activate();
      const foundUser = await User.findOne({email: userData.email});
      assert.isTrue(foundUser.active);
    });
    it('should pass even if user is already activated', async () => {
      const user = await User.create({
        email: 'test@test.com',
        password: 'test1234',
        active: true
      });
      assert.isTrue(user.active);
      await user.activate();
      const foundUser = await User.findOne({email: userData.email});
      assert.isTrue(foundUser.active);
    });
  });

  describe('findOneAuthenticated()', () => {
    it('should return a matching user if the authentication claim token is valid', async () => {
      const user = await User.create(userData);
      const validToken = jwt.sign({
        authenticated: true
      }, SECURE_KEY, {
        algorithm: 'HS512',
        expiresIn: '10s',
        subject: user.email
      });
      const foundUser = await User.findOneAuthenticated(validToken);
      assert.equal(foundUser.email, userData.email, 'user was found');
    });
    it('should return null if no matching email is found', async () => {
      const user = await User.create(userData);
      const validToken = jwt.sign({
        authenticated: true
      }, SECURE_KEY, {
        algorithm: 'HS512',
        expiresIn: '10s',
        subject: 'nosuch@email.com'
      });
      const foundUser = await User.findOneAuthenticated(validToken);
      assert.isNull(foundUser);
    });
    it('should return null if authenticated is false', async () => {
      const user = await User.create(userData);
      const validToken = jwt.sign({
        authenticated: false
      }, SECURE_KEY, {
        algorithm: 'HS512',
        expiresIn: '10s',
        subject: user.email
      });
      const foundUser = await User.findOneAuthenticated(validToken);
      assert.isNull(foundUser);
    });
    it('should return null if token is invalid', async () => {
      const user = await User.create(userData);
      const foundUser = await User.findOneAuthenticated('invalid token');
      assert.isNull(foundUser);
    });
    it('should return null if no token is passed', async () => {
      const user = await User.create(userData);
      const foundUser = await User.findOneAuthenticated();
      assert.isNull(foundUser);
    });
  });

  describe('findOneAndActivate()', () => {
    it('should activate and return a matching user if the activation claim token is valid', async () => {
      const user = await User.create({
        email: 'test@test.com',
        password: 'test1234'
      });
      const validToken = jwt.sign({
        activate: true
      }, SECURE_KEY, {
        algorithm: 'HS512',
        expiresIn: '10s',
        subject: user.email
      });
      assert.isFalse(user.active);
      const foundUser = await User.findOneAndActivate(validToken);
      assert.equal(foundUser.email, userData.email, 'user was found');
      assert.isTrue(foundUser.active);
    });
    it('should return null if no matching email is found', async () => {
      const user = await User.create(userData);
      const validToken = jwt.sign({
        activate: true
      }, SECURE_KEY, {
        algorithm: 'HS512',
        expiresIn: '10s',
        subject: 'nosuch@email.com'
      });
      const foundUser = await User.findOneAndActivate(validToken);
      assert.isNull(foundUser);
    });
    it('should return null if activation is false', async () => {
      const user = await User.create(userData);
      const validToken = jwt.sign({
        activate: false
      }, SECURE_KEY, {
        algorithm: 'HS512',
        expiresIn: '10s',
        subject: user.email
      });
      const foundUser = await User.findOneAndActivate(validToken);
      assert.isNull(foundUser);
    });
    it('should return null if token is invalid', async () => {
      const user = await User.create(userData);
      const foundUser = await User.findOneAndActivate('invalid token');
      assert.isNull(foundUser);
    });
    it('should return null if no token is passed', async () => {
      const user = await User.create(userData);
      const foundUser = await User.findOneAndActivate();
      assert.isNull(foundUser);
    });
  });

  describe('findOneActiveByEmail()', () => {
    it('should return a matching active user', async () => {
      const user = await User.create(userData);
      const foundUser = await User.findOneActiveByEmail(user.email);
      assert.equal(foundUser.email, userData.email, 'user was found');
    });
    it('should return null if an otherwise matching user is inactive', async () => {
      const user = await User.create(userData);
      user.set({active: false});
      await user.save();
      const foundUser = await User.findOneActiveByEmail(user.email);
      assert.isNull(foundUser);
    });
    it('should return null if no matching user is found', async () => {
      const user = await User.create(userData);
      const foundUser = await User.findOneActiveByEmail('nosuch@email.com');
      assert.isNull(foundUser);
    });
    it('should return null if no email is passed', async () => {
      const user = await User.create(userData);
      const foundUser = await User.findOneActiveByEmail();
      assert.isNull(foundUser);
    });
  });

});
