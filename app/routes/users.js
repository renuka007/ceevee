import User from '../models/user';

/**
 * Takes `email` and `password` from request body and creates a new user,
 * returning only the email address in the response.
 */
const usersPostRoute = async (req, res, next) => {
  const {email, password} = req.body;
  const user = await User.create({email, password});
  res.send(201, {
    email: user.email
  });
};

export { usersPostRoute };
