
/**
 * Salt work factor determines how strong bcrypt's hash will be.  A minimum of
 * 10 in production is recommended.  A lower number may be used for testing.
 */
const SALT_WORK_FACTOR = parseInt(process.env.SALT_WORK_FACTOR || '10', 10);
const MIN_ZXCVBN_PASSWORD_STRENGTH = parseInt(process.env.MIN_ZXCVBN_PASSWORD_STRENGTH || '2', 10);
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export {
  SALT_WORK_FACTOR,
  MIN_ZXCVBN_PASSWORD_STRENGTH,
  JWT_SECRET,
  JWT_EXPIRES_IN
}
