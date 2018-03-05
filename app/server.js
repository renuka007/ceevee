import restify from 'restify';
import { makeConstructor } from 'restify-errors';
import User from './models/user';

const server = restify.createServer();

server.use(restify.plugins.bodyParser());

// /users
const UserNotCreatedError = makeConstructor('UserNotCreatedError', {
    statusCode: 422,
    message: 'User could not be created.'
});
server.post('/users', async (req, res, next) => {
  try {
    const {email, password} = req.body;
    const user = await User.create({email, password});
    // success state
    res.send(201, {
      email: user.email
    });
    next();
  } catch (e) {
    // error state
    // All errors result in the same response.  This helps to prevent
    // inadvertantly leaking information about which users already
    // exist in the database, although it is not foolproof.
    next(new UserNotCreatedError());
  }
});

export default server;
