
/**
 * Salt work factor determines how strong bcrypt's hash will be.  A minimum of
 * 10 in production is recommended.  A lower number may be used for testing.
 */
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;
const SERVER_NAME = process.env.SERVER_NAME || 'Server';
const SALT_WORK_FACTOR = parseInt(process.env.SALT_WORK_FACTOR || '10', 10);
const MIN_ZXCVBN_PASSWORD_STRENGTH =
  parseInt(process.env.MIN_ZXCVBN_PASSWORD_STRENGTH || '2', 10);
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_LOGIN_EXPIRES_IN = process.env.JWT_LOGIN_EXPIRES_IN || '7d';
const JWT_ACTIVATION_EXPIRES_IN = process.env.JWT_ACTIVATION_EXPIRES_IN || '1d';

export {
  PORT,
  MONGODB_URI,
  SERVER_NAME,
  SALT_WORK_FACTOR,
  MIN_ZXCVBN_PASSWORD_STRENGTH,
  JWT_SECRET,
  JWT_LOGIN_EXPIRES_IN,
  JWT_ACTIVATION_EXPIRES_IN
}
