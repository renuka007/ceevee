import { assert } from 'chai';
import supertest from 'supertest';
import sinon from 'sinon';
import sgMail from '@sendgrid/mail';

import server from '../../app/server';
import User from '../../app/models/user';

import DatabaseHelper from '../helpers/database-helper';


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
