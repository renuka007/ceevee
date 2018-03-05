import restify from 'restify';
import { UnprocessableEntityError } from 'restify-errors';
import User from './models/user';

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
    if (e.name === 'ValidationError') {
      next(e);
    } else {
      // All errors other than validation errors result in the same response.
      // This helps to prevent inadvertantly leaking information about which users
      // already exist in the database, although it is not foolproof.
      next(new UnprocessableEntityError());
    }
  }
});

export default server;
