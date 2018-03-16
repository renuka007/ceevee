import { assert } from 'chai';
import sinon from 'sinon';
import sgMail from '@sendgrid/mail';

import User from '../../../app/models/user';
import sendPasswordResetEmail from '../../../app/emails/password-reset';
import {
  EMAIL_SANDBOX_MODE,
  FROM_EMAIL,
  EMAIL_PASSWORD_RESET_URL,
  SERVICE_NAME } from '../../../config/config';


let sandbox = sinon.sandbox.create();

describe ('Unit: Email: Password Reset', () => {

  beforeEach(() => {
    sandbox.stub(sgMail, 'send');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('EMAIL_SANDBOX_MODE', () => {
    it('should be true', () => {
      assert.isTrue(EMAIL_SANDBOX_MODE, true, 'EMAIL_SANDBOX_MODE should always be true during tests');
    });
  });

  describe('sendUserActivationEmail()', () => {
    it('should send email via `sgMail.send()`', async () => {
      const user = new User({email: 'test@test.com'});
      sinon.assert.notCalled(sgMail.send);
      await sendPasswordResetEmail(user);
      sinon.assert.calledOnce(sgMail.send);
    });
    it('should send email from FROM_EMAIL', async () => {
      const user = new User({email: 'test@test.com'});
      await sendPasswordResetEmail(user);
      assert.equal(sgMail.send.firstCall.args[0].from, FROM_EMAIL);
    });
    it('should send email to `user.email`', async () => {
      const user = new User({email: 'test@test.com'});
      await sendPasswordResetEmail(user);
      assert.equal(sgMail.send.firstCall.args[0].to, user.email);
    });
    it('should send email with subject containing SERVICE_NAME', async () => {
      const user = new User({email: 'test@test.com'});
      await sendPasswordResetEmail(user);
      assert.include(sgMail.send.firstCall.args[0].subject, SERVICE_NAME);
    });
    it('should send email with body containing EMAIL_PASSWORD_RESET_URL', async () => {
      const user = new User({email: 'test@test.com'});
      await sendPasswordResetEmail(user);
      assert.include(sgMail.send.firstCall.args[0].text, EMAIL_PASSWORD_RESET_URL);
      assert.include(sgMail.send.firstCall.args[0].html, EMAIL_PASSWORD_RESET_URL);
    });
  });

});
