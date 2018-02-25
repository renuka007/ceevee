import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import UserSchema from '../schemas/user';

/**
 * Class representing a user model.  This class is compiled into the Mongoose
 * model and thus isn't used directly.  It's just a nice syntax to express model
 * methods and properties.
 *
 * @see {@link http://mongoosejs.com/docs/advanced_schemas.html} for more
 *      information about ES6 class support in Mongoose.
 */
class UserModel {
  /**
   * Checks if the passed plaintext password matches this instance's
   * password hash.
   * @param {string} candidatePassword - a plaintext password to check
   * @return {boolean} `true` if `candidatePassword`, once hashed, matches this
   *         instance's `password_hash`.
   */
  async comparePassword(candidatePassword) {
    const hash = this.password_hash;
  	return await this.constructor.comparePassword(candidatePassword, hash);
  };

  /**
   * Checks if the passed plaintext password matches the passed password hash.
   * @param {string} candidatePassword - a plaintext password to check
   * @param {string} hash - a password hash
   * @return {boolean} `true` if `candidatePassword`, once hashed,
   *         the passed `hash`.
   */
  static async comparePassword(candidatePassword, hash) {
    return await bcrypt.compare(candidatePassword, hash);
  };

  /**
   * Hashes the passed plaintext password using bcrypt.
   * @param {string} password - a plaintext password
   * @return {string} a password hash
   */
  static async hashPassword(password) {
    const saltWorkFactor = 5;
    const salt = await bcrypt.genSalt(saltWorkFactor);
    return await bcrypt.hash(password, salt);
  };
}

UserSchema.loadClass(UserModel);

/**
 * If `password` is set on the instance being validated, assigns a hash to
 * `password_hash` and unsets `password`.
 */
UserSchema.pre('validate', async function () {
  if (this.password) {
    this.password_hash = await this.constructor.hashPassword(this.password);
    this.password = undefined;
  }
});

export default mongoose.model('User', UserSchema);
