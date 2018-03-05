import restify from 'restify';
import asyncRoute from './helpers/async-route';
import validationErrorHandler from './helpers/validation-error-handler';
import restifyErrorHandler from './helpers/restify-error-handler';
import User from './models/user';

const server = restify.createServer();
server.use(restify.plugins.bodyParser());

// Format validation errors consistently
server.on('Validation', validationErrorHandler);
// Format other errors consistently
server.on('restifyError', restifyErrorHandler);

// /users
server.post('/users', asyncRoute(async (req, res, next) => {
  const {email, password} = req.body;
  const user = await User.create({email, password});
  res.send(201, {
    email: user.email
  });
}));

export default server;
