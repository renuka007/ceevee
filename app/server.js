import restify from 'restify';
import passport from 'passport';

import basicAuthStrategy from './auth-strategies/basic';
import jwtLoginAuthStrategy from './auth-strategies/jwt-login';
import jwtActivationAuthStrategy from './auth-strategies/jwt-activation';
import jwtPasswordResetAuthStrategy from './auth-strategies/jwt-password-reset';

import validationErrorHandler from './route-helpers/validation-error-handler';
import restifyErrorHandler from './route-helpers/restify-error-handler';
import staticResponse from './route-helpers/static-response';
import asyncRoute from './route-helpers/async-route';

import { passwordResetRequestPostRoute } from './routes/password-reset'
import { usersPostRoute } from './routes/users'
import {
  resumesGetRoute,
  resumesPostRoute,
  resumeGetRoute,
  resumePutRoute,
  resumeDeleteRoute } from './routes/resumes'

import { SERVER_NAME } from '../config/config'


// Create server
const server = restify.createServer({name: SERVER_NAME});
server.use(restify.plugins.bodyParser());
// Setup auth
passport.use(basicAuthStrategy);
passport.use(jwtActivationAuthStrategy);
passport.use(jwtLoginAuthStrategy);
passport.use(jwtPasswordResetAuthStrategy);


// Setup error handlers
// Format validation errors consistently
server.on('Validation', validationErrorHandler);
// Format other errors consistently
server.on('restifyError', restifyErrorHandler);


// Routes

// /auth/activate
server.put('/auth/activate',
  passport.authenticate('jwt-activation', {session: false}),
  staticResponse({active: true}));
// /auth/password-reset-request
server.post('/auth/password-reset-request',
  asyncRoute(passwordResetRequestPostRoute));
// /auth/password-reset
server.put('/auth/password-reset',
  passport.authenticate('jwt-password-reset', {session: false}),
  staticResponse({passwordReset: true}));
// /auth/login
server.get('/auth/login',
  passport.authenticate('basic', {session: false}),
  (req, res) => res.send(req.user));
// /auth/ping
server.get('/auth/ping',
  passport.authenticate('jwt-login', {session: false}),
  staticResponse({authenticated: true}));

// /users
server.post('/users', asyncRoute(usersPostRoute));

// /resumes
server.get('/resumes',
  passport.authenticate('jwt-login', {session: false}),
  asyncRoute(resumesGetRoute));
server.post('/resumes',
  passport.authenticate('jwt-login', {session: false}),
  asyncRoute(resumesPostRoute));
// /resume/:id
server.get('/resume/:id',
  passport.authenticate('jwt-login', {session: false}),
  asyncRoute(resumeGetRoute));
server.put('/resume/:id',
  passport.authenticate('jwt-login', {session: false}),
  asyncRoute(resumePutRoute));
server.del('/resume/:id',
  passport.authenticate('jwt-login', {session: false}),
  asyncRoute(resumeDeleteRoute));

export default server;
