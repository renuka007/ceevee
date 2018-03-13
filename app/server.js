import restify from 'restify';
import passport from 'passport';

import basicAuthStrategy from './auth-strategies/basic';
import jwtLoginAuthStrategy from './auth-strategies/jwt-login';
import jwtActivationAuthStrategy from './auth-strategies/jwt-activation';

import validationErrorHandler from './route-helpers/validation-error-handler';
import restifyErrorHandler from './route-helpers/restify-error-handler';
import staticResponse from './route-helpers/static-response';
import asyncRoute from './route-helpers/async-route';

import { usersPostRoute } from './routes/users'
import { SERVER_NAME } from '../config/config'


// Create server
const server = restify.createServer({name: SERVER_NAME});
server.use(restify.plugins.bodyParser());
// Setup auth
passport.use(basicAuthStrategy);
passport.use(jwtActivationAuthStrategy);
passport.use(jwtLoginAuthStrategy);


// Setup error handlers
// Format validation errors consistently
server.on('Validation', validationErrorHandler);
// Format other errors consistently
server.on('restifyError', restifyErrorHandler);


// Routes

// /users
server.post('/users', asyncRoute(usersPostRoute));

// /auth/activate
server.put('/auth/activate',
  passport.authenticate('jwt-activation', {session: false}),
  staticResponse({active: true}));
// /auth/login
server.get('/auth/login',
  passport.authenticate('basic', {session: false}),
  (req, res) => res.send(req.user));
// /auth/ping
server.get('/auth/ping',
  passport.authenticate('jwt-login', {session: false}),
  staticResponse({authenticated: true}));

export default server;
