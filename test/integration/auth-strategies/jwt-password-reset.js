import chai from 'chai';
import { assert } from 'chai';
import passportTest from 'chai-passport-strategy';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from 'restify-errors';

import server from '../../../app/server';
import User from '../../../app/models/user';
import jwtPasswordResetAuthStrategy from '../../../app/auth-strategies/jwt-password-reset';

import DatabaseHelper from '../../helpers/database-helper';

import { SECURE_KEY, JWT_PASSWORD_RESET_EXPIRES_IN } from '../../../config/config'

chai.use(passportTest);

let user = null;
let token = null;
let bearerAuthHeader = null;
const userData = {email: 'test@test.com', password: 'test1234'};

describe ('Integration: Auth Strategy: JWT Password Reset', () => {

  beforeEach(async () => {
    await DatabaseHelper.connect();
    await DatabaseHelper.empty(User);
    user = await User.create(userData);
    token = user.issuePasswordResetToken();
    bearerAuthHeader = `Bearer ${token}`;
  });

  afterEach(async () => {
    await DatabaseHelper.disconnect();
  });

  describe('strategy', () => {
    it('should return matching user, activate, and change password when token is valid', (done) => {
      assert.isFalse(user.active);
      chai.passport.use(jwtPasswordResetAuthStrategy)
        .success((foundUser) => {
          assert.deepEqual(foundUser.email, 'test@test.com');
          assert.isTrue(foundUser.active);
          assert.notEqual(user.password, foundUser.password);
          done();
        })
        .req((req) => {
          req.headers.authorization = bearerAuthHeader;
          req.body = {password: 'newpassword0987'};
        })
        .authenticate();
    });
    it('should fail with 400 when an invalid token is passed', (done) => {
      chai.passport.use(jwtPasswordResetAuthStrategy)
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
      chai.passport.use(jwtPasswordResetAuthStrategy)
        .fail(function (status) {
          assert.ok(status);
          done();
        })
        .authenticate();
    });
    it('should return UnauthorizedError when token is expired', (done) => {
      const token = jwt.sign({
        passwordReset: true
      }, SECURE_KEY, {
        algorithm: 'HS512',
        expiresIn: '-1d',
        subject: 'nosuch@email.com'
      });
      chai.passport.use(jwtPasswordResetAuthStrategy)
        .error((err) => {
          assert.equal(err.name, 'UnauthorizedError');
          done();
        })
        .req((req) => {
          req.headers.authorization = `Bearer ${token}`;
          req.body = {password: 'newpassword0987'};
        })
        .authenticate();
    });
    it('should return UnauthorizedError when payload does not assert `passwordReset: true`', (done) => {
      const token = jwt.sign({
        passwordReset: false
      }, SECURE_KEY, {
        algorithm: 'HS512',
        expiresIn: JWT_PASSWORD_RESET_EXPIRES_IN,
        subject: 'nosuch@email.com'
      });
      chai.passport.use(jwtPasswordResetAuthStrategy)
        .error((err) => {
          assert.equal(err.name, 'UnauthorizedError');
          done();
        })
        .req((req) => {
          req.headers.authorization = `Bearer ${token}`;
          req.body = {password: 'newpassword0987'};
        })
        .authenticate();
    });
    it('should return UnauthorizedError when subject does not exist', (done) => {
      const token = jwt.sign({
        passwordReset: true
      }, SECURE_KEY, {
        algorithm: 'HS512',
        expiresIn: JWT_PASSWORD_RESET_EXPIRES_IN,
        subject: 'nosuch@email.com'
      });
      chai.passport.use(jwtPasswordResetAuthStrategy)
        .error((err) => {
          assert.equal(err.name, 'UnauthorizedError');
          done();
        })
        .req((req) => {
          req.headers.authorization = `Bearer ${token}`;
          req.body = {password: 'newpassword0987'};
        })
        .authenticate();
    });
    it('should return ValidationError when password is invalid', (done) => {
      chai.passport.use(jwtPasswordResetAuthStrategy)
        .error((err) => {
          assert.equal(err.name, 'ValidationError');
          done();
        })
        .req((req) => {
          req.headers.authorization = bearerAuthHeader;
          req.body = {password: 'bad'};
        })
        .authenticate();
    });
    it('should return ValidationError when password is not passed', (done) => {
      chai.passport.use(jwtPasswordResetAuthStrategy)
        .error((err) => {
          assert.equal(err.name, 'ValidationError');
          done();
        })
        .req((req) => {
          req.headers.authorization = bearerAuthHeader;
        })
        .authenticate();
    });
  });

});
