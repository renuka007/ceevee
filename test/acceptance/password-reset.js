import { assert } from 'chai';
import supertest from 'supertest';
import sinon from 'sinon';
import sgMail from '@sendgrid/mail';
import jwt from 'jsonwebtoken';

import server from '../../app/server';
import User from '../../app/models/user';

import DatabaseHelper from '../helpers/database-helper';

import { SECURE_KEY } from '../../config/config'


let sandbox = sinon.sandbox.create();
let user = null;
const userData = {email: 'test@test.com', password: 'test1234'};

describe('Acceptance: Route: /auth/password-reset-request', () => {

  beforeEach(async () => {
    await DatabaseHelper.connect();
    await DatabaseHelper.empty(User);
    user = await User.create(userData);
    sandbox.stub(sgMail, 'send');
  });

  afterEach(async () => {
    await DatabaseHelper.disconnect();
    sandbox.restore();
  });

  describe('POST', () => {
    it('should respond if user exists [200]', async () => {
      await supertest(server)
        .post('/auth/password-reset-request')
        .send({email: user.email})
        .expect(200);
    });
    it('should respond if user does not exist [200]', async () => {
      await supertest(server)
        .post('/auth/password-reset-request')
        .send({email: 'nosuch@email.com'})
        .expect(200);
    });
    it('should respond if no email is passed [200]', async () => {
      await supertest(server)
        .post('/auth/password-reset-request')
        .expect(200);
    });
  });

});

describe('Acceptance: Route: /auth/password-reset', () => {

  beforeEach(async () => {
    await DatabaseHelper.connect();
    await DatabaseHelper.empty(User);
    user = await User.create(userData);
  });

  afterEach(async () => {
    await DatabaseHelper.disconnect();
  });

  describe('POST', () => {
    it('should activate and reset the password of the specified user if token is valid [200]', async () => {
      const token = await user.issuePasswordResetToken();
      const bearerAuthHeader = `Bearer ${token}`;
      assert.isFalse(user.active);
      await supertest(server)
        .put('/auth/password-reset')
        .set('Authorization', bearerAuthHeader)
        .send({password: 'newpassword0987'})
        .expect(200)
        .expect({passwordReset: true});
      const foundUser = await User.findOne({email: user.email});
      assert.isTrue(foundUser.active);
      assert.notEqual(foundUser.password, user.password);
    });
    it('should fail when token is invalid [400]', async () => {
      await supertest(server)
        .put('/auth/password-reset')
        .set('Authorization', 'invalidtoken')
        .send({password: 'newpassword0987'})
        .expect(400);
    });
    it('should fail when no token is passed [401]', async () => {
      await supertest(server)
        .put('/auth/password-reset')
        .send({password: 'newpassword0987'})
        .expect(401);
    });
    it('should fail when token is expired [401]', async () => {
      const token = jwt.sign({
        passwordReset: true
      }, SECURE_KEY, {
        algorithm: 'HS512',
        expiresIn: '-1d',
        subject: user.email
      });
      const bearerAuthHeader = `Bearer ${token}`;
      await supertest(server)
        .put('/auth/password-reset')
        .set('Authorization', bearerAuthHeader)
        .send({password: 'newpassword0987'})
        .expect(401);
    });
    it('should fail when subject does not exist [401]', async () => {
      const token = jwt.sign({
        passwordReset: true
      }, SECURE_KEY, {
        algorithm: 'HS512',
        expiresIn: '10s',
        subject: 'nosuch@email.com'
      });
      const bearerAuthHeader = `Bearer ${token}`;
      await supertest(server)
        .put('/auth/password-reset')
        .set('Authorization', bearerAuthHeader)
        .send({password: 'newpassword0987'})
        .expect(401);
    });
    it('should fail when payload does not assert `passwordReset: true` [401]', async () => {
      const token = jwt.sign({
        passwordReset: false
      }, SECURE_KEY, {
        algorithm: 'HS512',
        expiresIn: '10s',
        subject: user.email
      });
      const bearerAuthHeader = `Bearer ${token}`;
      await supertest(server)
        .put('/auth/password-reset')
        .set('Authorization', bearerAuthHeader)
        .send({password: 'newpassword0987'})
        .expect(401);
    });
    it('should fail if password is invalid [422]', async () => {
      const token = jwt.sign({
        passwordReset: true
      }, SECURE_KEY, {
        algorithm: 'HS512',
        expiresIn: '10s',
        subject: user.email
      });
      const bearerAuthHeader = `Bearer ${token}`;
      await supertest(server)
        .put('/auth/password-reset')
        .set('Authorization', bearerAuthHeader)
        .send({password: 'bad'})
        .expect(422);
    });
    it('should fail if no password passed [422]', async () => {
      const token = jwt.sign({
        passwordReset: true
      }, SECURE_KEY, {
        algorithm: 'HS512',
        expiresIn: '10s',
        subject: user.email
      });
      const bearerAuthHeader = `Bearer ${token}`;
      await supertest(server)
        .put('/auth/password-reset')
        .set('Authorization', bearerAuthHeader)
        .expect(422);
    });
  });

});
