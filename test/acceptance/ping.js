import { assert } from 'chai';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';

import server from '../../app/server';
import User from '../../app/models/user';

import DatabaseHelper from '../helpers/database-helper';

import { JWT_SECRET, JWT_LOGIN_EXPIRES_IN } from '../../config/config'


let user = null;
const userData = {email: 'test@test.com', password: 'test1234'};

describe('Acceptance: Route: /auth/ping', () => {

  beforeEach(async () => {
    await DatabaseHelper.connect();
    await DatabaseHelper.empty(User);
    user = await User.create(userData);
  });

  afterEach(async () => {
    await DatabaseHelper.disconnect();
  });

  describe('GET', () => {
    it('should acknowledge authentication if token is valid [200]', async () => {
      const token = user.issueJWTAuthenticationToken();
      const bearerAuthHeader = `Bearer ${token}`;
      await supertest(server)
        .get('/auth/ping')
        .set('Authorization', bearerAuthHeader)
        .send()
        .expect(200)
        .expect({authenticated: true});
    });
    it('should fail when no token is passed [401]', async () => {
      await supertest(server)
        .get('/auth/ping')
        .send()
        .expect(401);
    });
    it('should fail when invalid token is passed [401]', async () => {
      await supertest(server)
        .get('/auth/ping')
        .set('Authorization', 'invalid token')
        .send()
        .expect(401);
    });
    it('should fail when token is expired [401]', async () => {
      const expiredToken = jwt.sign({
        authenticated: true
      }, JWT_SECRET, {
        algorithm: 'HS512',
        expiresIn: '-1d',
        subject: user.email
      });
      const bearerAuthHeader = `Bearer ${expiredToken}`;
      await supertest(server)
        .get('/auth/ping')
        .set('Authorization', bearerAuthHeader)
        .send()
        .expect(401);
    });
    it('should fail when subject does not exist [401]', async () => {
      const token = jwt.sign({
        authenticated: true
      }, JWT_SECRET, {
        algorithm: 'HS512',
        expiresIn: JWT_LOGIN_EXPIRES_IN,
        subject: 'nosuch@email.com'
      });
      const bearerAuthHeader = `Bearer ${token}`;
      await supertest(server)
        .get('/auth/ping')
        .set('Authorization', bearerAuthHeader)
        .send()
        .expect(401);
    });
    it('should fail when payload does not assert `authenticated: true` [401]', async () => {
      const unauthenticatedToken = jwt.sign({
        authenticated: false
      }, JWT_SECRET, {
        algorithm: 'HS512',
        expiresIn: JWT_LOGIN_EXPIRES_IN,
        subject: user.email
      });
      const bearerAuthHeader = `Bearer ${unauthenticatedToken}`;
      await supertest(server)
        .get('/auth/ping')
        .set('Authorization', bearerAuthHeader)
        .send()
        .expect(401);
    });
  });

});
