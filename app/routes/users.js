import User from '../models/user';

const usersPostRoute = async (req, res, next) => {
  const {email, password} = req.body;
  const user = await User.create({email, password});
  res.send(201, {
    email: user.email
  });
};

export { usersPostRoute };
