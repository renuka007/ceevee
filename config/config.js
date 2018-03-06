
/**
 * Salt work factor determines how strong bcrypt's hash will be.  A minimum of
 * 10 in production is recommended.  A lower number may be used for testing.
 */
const SALT_WORK_FACTOR = parseInt(process.env.SALT_WORK_FACTOR || '10', 10);

export {
  SALT_WORK_FACTOR
}
