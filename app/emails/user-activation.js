import sgMail from '@sendgrid/mail';
import {
  SENDGRID_API_KEY,
  EMAIL_SANDBOX_MODE,
  FROM_EMAIL,
  EMAIL_ACTIVATION_URL,
  SERVICE_NAME } from '../../config/config';


sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * Sends an activation link to the specified user.
 * @param {UserModel} user - user instance
 */
const sendUserActivationEmail = async (user) => {
  const token = user.issueActivationToken();
  const msg = {
    to: user.email,
    from: FROM_EMAIL,
    subject: `Activate your new ${SERVICE_NAME} account`,
    text: `
Your new ${SERVICE_NAME} account is waiting for you!  Activate it by following
the link below:

${EMAIL_ACTIVATION_URL}?token=${token}
    `,
    html: `
<p>Your new <strong>${SERVICE_NAME}</strong> account is waiting for you!
Activate it by following the link below:</p>
<p><b><a href="${EMAIL_ACTIVATION_URL}?token=${token}">Activate Now</a></b></p>
    `,
    mail_settings: {
      sandbox_mode: {enable: EMAIL_SANDBOX_MODE}
    }
  };
  await sgMail.send(msg);
};

export default sendUserActivationEmail;
