import { assert } from 'chai';
import supertest from 'supertest';
import server from '../../app/server';
import User from '../../app/models/user';
import DatabaseHelper from '../helpers/database-helper';

describe('Acceptance: Route: /users', () => {

  beforeEach(async () => {
    await DatabaseHelper.connect();
    await DatabaseHelper.empty(User);
  });

  afterEach(async () => {
    await DatabaseHelper.disconnect();
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
    it('should disallow creation of a user when email and password are missing [422]', async () => {
      assert.equal(await User.count(), 0, 'no users saved');
      await supertest(server)
        .post('/users')
        .expect(422)
        .expect({
          errors: {
            base: ['UnprocessableEntity']
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
    it('should disallow creation of a user when password is invalid [422]', async () => {
      assert.equal(await User.count(), 0, 'no users saved');
      await supertest(server)
        .post('/users')
        .send({email: 'test@test.com', password: 'short'})
        .expect(422)
        .expect({
          errors: {
            password: ['minlength']
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
