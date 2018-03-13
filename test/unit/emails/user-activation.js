import { assert } from 'chai';
import sgMail from '@sendgrid/mail';

import User from '../../../app/models/user';
import sendUserActivationEmail from '../../../app/emails/user-activation';
import {
  EMAIL_SANDBOX_MODE,
  FROM_EMAIL,
  EMAIL_ACTIVATION_URL,
  SERVICE_NAME } from '../../../config/config';


let sendCount = 0;
let sentMessage = null;

// mock the send function to intercept send count and message data
sgMail.send = (msg) => {
  sendCount++;
  sentMessage = msg;
};

describe ('Unit: Email: User Activation', () => {

  beforeEach(() => {
    sendCount = 0;
    sentMessage = null;
  });

  describe('EMAIL_SANDBOX_MODE', () => {
    it('should be true', () => {
      assert.isTrue(EMAIL_SANDBOX_MODE, true, 'EMAIL_SANDBOX_MODE should always be true during tests');
    });
  });

  describe('sendUserActivationEmail()', () => {
    it('should send email via `sgMail.send()`', async () => {
      const user = new User({email: 'test@test.com'});
      assert.equal(sendCount, 0);
      await sendUserActivationEmail(user);
      assert.equal(sendCount, 1);
    });
    it('should send email from FROM_EMAIL', async () => {
      const user = new User({email: 'test@test.com'});
      await sendUserActivationEmail(user);
      assert.equal(sentMessage.from, FROM_EMAIL);
    });
    it('should send email to `user.email`', async () => {
      const user = new User({email: 'test@test.com'});
      await sendUserActivationEmail(user);
      assert.equal(sentMessage.to, user.email);
    });
    it('should send email with subject containing SERVICE_NAME', async () => {
      const user = new User({email: 'test@test.com'});
      await sendUserActivationEmail(user);
      assert.include(sentMessage.subject, SERVICE_NAME);
    });
    it('should send email with body containing EMAIL_ACTIVATION_URL', async () => {
      const user = new User({email: 'test@test.com'});
      await sendUserActivationEmail(user);
      assert.include(sentMessage.text, EMAIL_ACTIVATION_URL);
      assert.include(sentMessage.html, EMAIL_ACTIVATION_URL);
    });
  });

});
