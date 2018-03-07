import restify from 'restify';
import passport from 'passport';

import basicAuthStrategy from './auth-strategies/basic';

import validationErrorHandler from './route-helpers/validation-error-handler';
import restifyErrorHandler from './route-helpers/restify-error-handler';
import asyncRoute from './route-helpers/async-route';

import { usersPostRoute } from './routes/users'


// Create server
const server = restify.createServer();
server.use(restify.plugins.bodyParser());
// Setup auth
passport.use(basicAuthStrategy);

// Setup error handlers
// Format validation errors consistently
server.on('Validation', validationErrorHandler);
// Format other errors consistently
server.on('restifyError', restifyErrorHandler);

// Routes
// /auth/login
server.get('/auth/login',
  passport.authenticate('basic', {session: false}),
  (req, res) => res.send(req.user));

// /users
server.post('/users', asyncRoute(usersPostRoute));

export default server;
