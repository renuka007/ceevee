import chai from 'chai';
import { assert } from 'chai';
import passportTest from 'chai-passport-strategy';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from 'restify-errors';

import server from '../../../app/server';
import User from '../../../app/models/user';
import jwtLoginAuthStrategy from '../../../app/auth-strategies/jwt-login';

import DatabaseHelper from '../../helpers/database-helper';

import { JWT_SECRET, JWT_LOGIN_EXPIRES_IN } from '../../../config/config'

chai.use(passportTest);

let user = null;
let token = null;
let bearerAuthHeader = null;
const userData = {email: 'test@test.com', password: 'test1234'};

describe ('Integration: Auth Strategy: JWT Login', () => {

  beforeEach(async () => {
    await DatabaseHelper.connect();
    await DatabaseHelper.empty(User);
    user = await User.create(userData);
    token = await user.issueJWTAuthenticationToken(userData.password);
    bearerAuthHeader = `Bearer ${token}`;
  });

  afterEach(async () => {
    await DatabaseHelper.disconnect();
  });

  describe('strategy', () => {
    it('should return email if token is valid', (done) => {
      chai.passport.use(jwtLoginAuthStrategy)
        .success((response) => {
          assert.deepEqual(response, {email: 'test@test.com'});
          done();
        })
        .req((req) => {
          req.headers.authorization = bearerAuthHeader;
        })
        .authenticate();
    });
    it('should fail with 400 when an invalid token is passed', (done) => {
      chai.passport.use(jwtLoginAuthStrategy)
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
      chai.passport.use(jwtLoginAuthStrategy)
        .fail(function (status) {
          assert.ok(status);
          done();
        })
        .authenticate();
    });
    it('should return UnauthorizedError when token is expired', (done) => {
      const expiredToken = jwt.sign({
        authenticated: true
      }, JWT_SECRET, {
        algorithm: 'HS512',
        expiresIn: '-1d',
        subject: user.email
      });
      const bearerAuthHeader = `Bearer ${expiredToken}`;
      chai.passport.use(jwtLoginAuthStrategy)
        .error(function (err) {
          assert.instanceOf(err, UnauthorizedError);
          done();
        })
        .req(function (req) {
          req.headers.authorization = bearerAuthHeader;
        })
        .authenticate();
    });
    it('should return UnauthorizedError when subject does not exist', (done) => {
      const token = jwt.sign({
        authenticated: true
      }, JWT_SECRET, {
        algorithm: 'HS512',
        expiresIn: JWT_LOGIN_EXPIRES_IN,
        subject: 'nosuch@email.com'
      });
      const bearerAuthHeader = `Bearer ${token}`;
      chai.passport.use(jwtLoginAuthStrategy)
        .error(function (err) {
          assert.instanceOf(err, UnauthorizedError);
          done();
        })
        .req(function (req) {
          req.headers.authorization = bearerAuthHeader;
        })
        .authenticate();
    });
    it('should return UnauthorizedError when payload does not assert `authenticated: true`', (done) => {
      const unauthenticatedToken = jwt.sign({
        authenticated: false
      }, JWT_SECRET, {
        algorithm: 'HS512',
        expiresIn: JWT_LOGIN_EXPIRES_IN,
        subject: user.email
      });
      const bearerAuthHeader = `Bearer ${unauthenticatedToken}`;
      chai.passport.use(jwtLoginAuthStrategy)
        .error(function (err) {
          assert.instanceOf(err, UnauthorizedError);
          done();
        })
        .req(function (req) {
          req.headers.authorization = bearerAuthHeader;
        })
        .authenticate();
    });
  });

});
