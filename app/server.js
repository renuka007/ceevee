import restify from 'restify';
import { UnprocessableEntityError } from 'restify-errors';
import User from './models/user';

const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((e) => {
    if (e.name === 'ValidationError') {
      // Pass validation errors as is.
      next(e);
    } else {
      // All errors other than validation errors result in the same response.
      // This helps to prevent leaking internal server state.
      next(new UnprocessableEntityError());
    }
  });
};

const server = restify.createServer();
server.use(restify.plugins.bodyParser());

// Format validation errors consistently
server.on('Validation', (req, res, err, next) => {
  err.statusCode = 422;
  err.toJSON = () => {
    const errJSON = {
      errors: {}
    };
    Object.keys(err.errors).forEach((key) => {
      errJSON.errors[key] = [err.errors[key].kind];
    });
    return(errJSON);
  };
  next();
});

// Format other errors consistently
server.on('restifyError', (req, res, err, next) => {
  if (err.body) {
    err.toJSON = () => {
      return {
        errors: {
          base: [err.body.code]
        }
      };
    };
  }
  next();
});

// /users
server.post('/users', asyncMiddleware(async (req, res, next) => {
  const {email, password} = req.body;
  const user = await User.create({email, password});
  res.send(201, {
    email: user.email
  });
}));

export default server;
