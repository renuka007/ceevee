import { assert } from 'chai';
import supertest from 'supertest';
import sinon from 'sinon';
import sgMail from '@sendgrid/mail';

import server from '../../app/server';
import User from '../../app/models/user';
import DatabaseHelper from '../helpers/database-helper';


let sandbox = sinon.sandbox.create();

describe('Acceptance: Route: /users', () => {

  beforeEach(async () => {
    await DatabaseHelper.connect();
    await DatabaseHelper.empty(User);
    sandbox.stub(sgMail, 'send');
  });

  afterEach(async () => {
    await DatabaseHelper.disconnect();
    sandbox.restore();
  });

  describe('POST', () => {
    it('should create and return a new user [201]', async () => {
      assert.equal(await User.count(), 0, 'no users saved');
      await supertest(server)
        .post('/users')
        .send({email: 'test@test.com', password: 'test1234'})
        .expect(201)
        .expect({email: 'test@test.com'});
      assert.equal(await User.count(), 1, 'one user saved');
    });
    it('should send an activation email', async () => {
      sinon.assert.notCalled(sgMail.send);
      await supertest(server)
        .post('/users')
        .send({email: 'test@test.com', password: 'test1234'})
        .expect(201)
        .expect({email: 'test@test.com'});
      sinon.assert.calledOnce(sgMail.send);
    });
    it('should disallow creation of a user when email and password are missing [422]', async () => {
      assert.equal(await User.count(), 0, 'no users saved');
      await supertest(server)
        .post('/users')
        .expect(422)
        .expect({
          errors: {
            email: ['required'],
            password: ['required']
          }
        });
      assert.equal(await User.count(), 0, 'no users saved');
    });
    it('should disallow creation of a user when email is missing [422]', async () => {
      assert.equal(await User.count(), 0, 'no users saved');
      await supertest(server)
        .post('/users')
        .send({password: 'test1234'})
        .expect(422)
        .expect({
          errors: {
            email: ['required']
          }
        });
      assert.equal(await User.count(), 0, 'no users saved');
    });
    it('should disallow creation of a user when password is missing [422]', async () => {
      assert.equal(await User.count(), 0, 'no users saved');
      await supertest(server)
        .post('/users')
        .send({email: 'test@test.com'})
        .expect(422)
        .expect({
          errors: {
            password: ['required']
          }
        });
      assert.equal(await User.count(), 0, 'no users saved');
    });
    it('should disallow creation of a user when email is invalid [422]', async () => {
      assert.equal(await User.count(), 0, 'no users saved');
      await supertest(server)
        .post('/users')
        .send({email: 'test@test.', password: 'test1234'})
        .expect(422)
        .expect({
          errors: {
            email: ['regexp']
          }
        });
      assert.equal(await User.count(), 0, 'no users saved');
    });
    it('should disallow creation of a user when password is weak [422]', async () => {
      assert.equal(await User.count(), 0, 'no users saved');
      await supertest(server)
        .post('/users')
        .send({email: 'test@test.com', password: 'short'})
        .expect(422)
        .expect({
          errors: {
            password: ['strength']
          }
        });
      assert.equal(await User.count(), 0, 'no users saved');
    });
    it('should disallow creation of a user with duplicate email [422]', async () => {
      assert.equal(await User.count(), 0, 'no users saved');
      await supertest(server)
        .post('/users')
        .send({email: 'test@test.com', password: 'test1234'})
        .expect(201);
      assert.equal(await User.count(), 1, 'one user saved');
      await supertest(server)
        .post('/users')
        .send({email: 'test@test.com', password: 'test1234'})
        .expect(422)
        .expect({
          errors: {
            base: ['UnprocessableEntity']
          }
        });
      assert.equal(await User.count(), 1, 'one user saved');
    });
  });

});
