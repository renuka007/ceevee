import { assert } from 'chai';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';

import server from '../../app/server';
import User from '../../app/models/user';
import { jwtLoginToken } from '../../app/services/jwt';

import DatabaseHelper from '../helpers/database-helper';

import { JWT_SECRET } from '../../config/config'


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
      const token = jwtLoginToken(user.email);
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
      const expiredToken = jwtLoginToken(user.email, true, '-1d');
      const bearerAuthHeader = `Bearer ${expiredToken}`;
      await supertest(server)
        .get('/auth/ping')
        .set('Authorization', bearerAuthHeader)
        .send()
        .expect(401);
    });
    it('should fail when subject does not exist [401]', async () => {
      const token = jwtLoginToken('nosuch@email.com');
      const bearerAuthHeader = `Bearer ${token}`;
      await supertest(server)
        .get('/auth/ping')
        .set('Authorization', bearerAuthHeader)
        .send()
        .expect(401);
    });
    it('should fail when payload does not assert `authenticated: true` [401]', async () => {
      const unauthenticatedToken = jwtLoginToken(user.email, false);
      const bearerAuthHeader = `Bearer ${unauthenticatedToken}`;
      await supertest(server)
        .get('/auth/ping')
        .set('Authorization', bearerAuthHeader)
        .send()
        .expect(401);
    });
  });

});
