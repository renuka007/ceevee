import restify from 'restify';
import { UnprocessableEntityError } from 'restify-errors';
import User from './models/user';

const server = restify.createServer();
server.use(restify.plugins.bodyParser());

// /users
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
    // Errors other than validation errors result in the same response.
    // This helps to prevent inadvertantly leaking information about which users
    // already exist in the database, although it is not foolproof.
    next(new UnprocessableEntityError());
  }
});

export default server;
