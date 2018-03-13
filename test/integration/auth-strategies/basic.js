import chai from 'chai';
import { assert } from 'chai';
import passportTest from 'chai-passport-strategy';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from 'restify-errors';

import server from '../../../app/server';
import User from '../../../app/models/user';
import basicAuthStrategy from '../../../app/auth-strategies/basic';

import DatabaseHelper from '../../helpers/database-helper';

import { JWT_SECRET } from '../../../config/config';


chai.use(passportTest);

let user = null;
const userData = {email: 'test@test.com', password: 'test1234', active: true};
const nonExistentUserData = {email: 'foo@bar.com', password: 'nosuchuser'};
const invalidUserData = {email: 'test@test.com', password: 'wrongpassword'};
const basicAuthHeader = ['Basic',
  new Buffer(`${userData.email}:${userData.password}`).toString('base64')
].join(' ');
const basicAuthNonExistentHeader = ['Basic',
  new Buffer(`${nonExistentUserData.email}:${nonExistentUserData.password}`)
    .toString('base64')
].join(' ');
const basicAuthInvalidHeader = ['Basic',
  new Buffer(`${invalidUserData.email}:${invalidUserData.password}`)
    .toString('base64')
].join(' ');

describe ('Integration: Auth Strategy: Basic', () => {

  beforeEach(async () => {
    await DatabaseHelper.connect();
    await DatabaseHelper.empty(User);
    user = await User.create(userData);
  });

  afterEach(async () => {
    await DatabaseHelper.disconnect();
  });

  describe('strategy', () => {
    it('should return an authentication claim JWT', (done) => {
      assert.isTrue(user.active);
      chai.passport.use(basicAuthStrategy)
        .success(function (response) {
          const decoded = jwt.verify(response, JWT_SECRET);
          assert.equal(decoded.sub, user.email);
          assert.isTrue(decoded.authenticated);
          done();
        })
        .req(function (req) {
          req.headers.authorization = basicAuthHeader;
        })
        .authenticate();
    });
    it('should fail with 400 when an invalid token is passed', (done) => {
      chai.passport.use(basicAuthStrategy)
        .fail(function (status) {
          assert.equal(status, 400);
          done();
        })
        .req(function (req) {
          req.headers.authorization = 'invalidtoken';
        })
        .authenticate();
    });
    it('should fail when no token is passed', (done) => {
      chai.passport.use(basicAuthStrategy)
        .fail(function (status) {
          assert.ok(status);
          done();
        })
        .authenticate();
    });
    it('should return UnauthorizedError when user does not exist', (done) => {
      chai.passport.use(basicAuthStrategy)
        .error(function (err) {
          assert.instanceOf(err, UnauthorizedError);
          done();
        })
        .req(function (req) {
          req.headers.authorization = basicAuthNonExistentHeader;
        })
        .authenticate();
    });
    it('should return UnauthorizedError when invalid password is passed', (done) => {
      chai.passport.use(basicAuthStrategy)
        .error(function (err) {
          assert.instanceOf(err, UnauthorizedError);
          done();
        })
        .req(function (req) {
          req.headers.authorization = basicAuthInvalidHeader;
        })
        .authenticate();
    });
    it('should return UnauthorizedError when user is inactive', async () => {
      user.set({active: false});
      await user.save();
      assert.isFalse(user.active);
      chai.passport.use(basicAuthStrategy)
        .error(function (err) {
          assert.instanceOf(err, UnauthorizedError);
        })
        .req(function (req) {
          req.headers.authorization = basicAuthInvalidHeader;
        })
        .authenticate();
    });
  });

});
