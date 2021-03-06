import { assert } from 'chai';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';

import server from '../../app/server';
import User from '../../app/models/user';

import DatabaseHelper from '../helpers/database-helper';

import { SECURE_KEY } from '../../config/config'


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


describe('Acceptance: Route: /auth/login', () => {

  beforeEach(async () => {
    await DatabaseHelper.connect();
    await DatabaseHelper.empty(User);
    user = await User.create(userData);
  });

  afterEach(async () => {
    await DatabaseHelper.disconnect();
  });

  describe('GET', () => {
    it('should return an authentication claim JWT [200]', async () => {
      assert.isTrue(user.active);
      await supertest(server)
        .get('/auth/login')
        .set('Authorization', basicAuthHeader)
        .send()
        .expect(200)
        .expect((response) => {
          const decoded = jwt.verify(response.body, SECURE_KEY);
          assert.equal(decoded.sub, user.email);
          assert.isTrue(decoded.authenticated);
        });
    });
    it('should fail when token is invalid [400]', async () => {
      await supertest(server)
        .get('/auth/login')
        .set('Authorization', 'invalidtoken')
        .send()
        .expect(400);
    });
    it('should fail when no token is passed [401]', async () => {
      await supertest(server)
        .get('/auth/login')
        .send()
        .expect(401);
    });
    it('should fail when user does not exist [401]', async () => {
      await supertest(server)
        .get('/auth/login')
        .set('Authorization', basicAuthNonExistentHeader)
        .send()
        .expect(401);
    });
    it('should fail when invalid password is passed [401]', async () => {
      await supertest(server)
        .get('/auth/login')
        .set('Authorization', basicAuthInvalidHeader)
        .send()
        .expect(401);
    });
    it('should fail when user is inactive [400]', async () => {
      user.set({active: false});
      await user.save();
      assert.isFalse(user.active);
      await supertest(server)
        .get('/auth/login')
        .set('Authorization', basicAuthHeader)
        .send()
        .expect(401);
    });
  });

});
