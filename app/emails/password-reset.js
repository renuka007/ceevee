import sgMail from '@sendgrid/mail';
import {
  SENDGRID_API_KEY,
  EMAIL_SANDBOX_MODE,
  FROM_EMAIL,
  EMAIL_PASSWORD_RESET_URL,
  SERVICE_NAME } from '../../config/config';


sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * Sends a password reset link to the specified user.
 * @param {UserModel} user - user instance
 */
const sendPasswordResetEmail = async (user) => {
  const token = user.issuePasswordResetToken();
  const msg = {
    to: user.email,
    from: FROM_EMAIL,
    subject: `Password reset requested for your ${SERVICE_NAME} account`,
    text: `
Reset your password by following the link below:

${EMAIL_PASSWORD_RESET_URL}?token=${token}
    `,
    html: `
<p>Reset your password by following the link below:</p>
<p>
  <b><a href="${EMAIL_PASSWORD_RESET_URL}?token=${token}">Reset Password</a></b>
</p>
    `,
    mail_settings: {
      sandbox_mode: {enable: EMAIL_SANDBOX_MODE}
    }
  };
  await sgMail.send(msg);
};

export default sendPasswordResetEmail;
