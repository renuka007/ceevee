import restify from 'restify';
import validationErrorHandler from './helpers/validation-error-handler';
import restifyErrorHandler from './helpers/restify-error-handler';
import asyncRoute from './helpers/async-route';
import { usersPostRoute } from './routes/users'

const server = restify.createServer();
server.use(restify.plugins.bodyParser());

// Format validation errors consistently
server.on('Validation', validationErrorHandler);
// Format other errors consistently
server.on('restifyError', restifyErrorHandler);

// /users
server.post('/users', asyncRoute(usersPostRoute));

export default server;
