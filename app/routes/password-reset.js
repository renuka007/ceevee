import User from '../models/user';
import sendPasswordResetEmail from '../emails/password-reset';

/**
 * Takes `email` from request body and sends password reset email to a matching
 * user, if one exists.  Always responds with 200 so as to avoid leaking
 * information about which users exist.
 */
const passwordResetRequestPostRoute = async (req, res, next) => {
  const {email} = (req.body || {});
  const user = await User.findOne({email});
  if (user) await sendPasswordResetEmail(user);
  res.send(200);
};

export { passwordResetRequestPostRoute };
