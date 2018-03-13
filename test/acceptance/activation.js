import { assert } from 'chai';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';

import server from '../../app/server';
import User from '../../app/models/user';

import DatabaseHelper from '../helpers/database-helper';

import { SECURE_KEY, JWT_ACTIVATION_EXPIRES_IN } from '../../config/config'


let user = null;
const userData = {email: 'test@test.com', password: 'test1234'};

describe('Acceptance: Route: /auth/activate', () => {

  beforeEach(async () => {
    await DatabaseHelper.connect();
    await DatabaseHelper.empty(User);
    user = await User.create(userData);
  });

  afterEach(async () => {
    await DatabaseHelper.disconnect();
  });

  describe('GET', () => {
    it('should activate the specified user if token is valid [200]', async () => {
      const token = await user.issueActivationToken();
      const bearerAuthHeader = `Bearer ${token}`;
      await supertest(server)
        .put('/auth/activate')
        .set('Authorization', bearerAuthHeader)
        .send()
        .expect(200)
        .expect({active: true});
    });
    it('should activate the specified user even if already active if token is valid [200]', async () => {
      const user = await User.create({
        email: 'foo@test.com',
        password: 'test1234',
        active: true
      });
      const token = await user.issueActivationToken();
      const bearerAuthHeader = `Bearer ${token}`;
      await supertest(server)
        .put('/auth/activate')
        .set('Authorization', bearerAuthHeader)
        .send()
        .expect(200)
        .expect({active: true});
    });
    it('should fail when no token is passed [401]', async () => {
      await supertest(server)
        .put('/auth/activate')
        .send()
        .expect(401);
    });

    it('should fail when invalid token is passed [401]', async () => {
      await supertest(server)
        .put('/auth/activate')
        .set('Authorization', 'invalid token')
        .send()
        .expect(401);
    });
    it('should fail when token is expired [401]', async () => {
      const expiredToken = jwt.sign({
        activate: true
      }, SECURE_KEY, {
        algorithm: 'HS512',
        expiresIn: '-1d',
        subject: user.email
      });
      const bearerAuthHeader = `Bearer ${expiredToken}`;
      await supertest(server)
        .put('/auth/activate')
        .set('Authorization', bearerAuthHeader)
        .send()
        .expect(401);
    });
    it('should fail when subject does not exist [401]', async () => {
      const token = jwt.sign({
        activate: true
      }, SECURE_KEY, {
        algorithm: 'HS512',
        expiresIn: JWT_ACTIVATION_EXPIRES_IN,
        subject: 'nosuch@email.com'
      });
      const bearerAuthHeader = `Bearer ${token}`;
      await supertest(server)
        .put('/auth/activate')
        .set('Authorization', bearerAuthHeader)
        .send()
        .expect(401);
    });
    it('should fail when payload does not assert `activate: true` [401]', async () => {
      const nonActivationToken = jwt.sign({
        activate: false
      }, SECURE_KEY, {
        algorithm: 'HS512',
        expiresIn: JWT_ACTIVATION_EXPIRES_IN,
        subject: user.email
      });
      const bearerAuthHeader = `Bearer ${nonActivationToken}`;
      await supertest(server)
        .put('/auth/activate')
        .set('Authorization', bearerAuthHeader)
        .send()
        .expect(401);
    });
  });

});
