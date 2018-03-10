import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import UserSchema from '../schemas/user';
import { SALT_WORK_FACTOR } from '../../config/config'

/**
 * Class representing a user model.  This class is compiled into the Mongoose
 * model and thus isn't used directly.  It's just a nice syntax to express model
 * methods and properties.
 *
 * @see {@link http://mongoosejs.com/docs/advanced_schemas.html} for more
 *      information about ES6 class support in Mongoose.
 */
class UserModel {

  // =instance methods

  /**
   * Hashes the plaintext password into the same field.
   */
  async setPasswordHash() {
    if (this.password && !this.constructor.isHash(this.password)) {
      this.password = await this.constructor.hashPassword(this.password);
    }
  };

  /**
   * Checks if the passed plaintext password matches this instance's
   * password hash.
   * @param {string} candidatePassword - a plaintext password to check
   * @return {boolean} `true` if `candidatePassword`, once hashed, matches this
   *         instance's hashed `password`.
   */
  async comparePassword(candidatePassword) {
    const hash = this.password;
  	return await this.constructor.comparePassword(candidatePassword, hash);
  };

  // =class methods

  /**
   * Checks if the passed plaintext password matches the passed password hash.
   * @param {string} candidatePassword - a plaintext password to check
   * @param {string} hash - a password hash
   * @return {boolean} `true` if `candidatePassword`, once hashed, matches
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
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    return await bcrypt.hash(password, salt);
  };

  /**
   * Returns true if the passed value is a hash, false otherwise.
   * @param {string} candidateHash - a value that may or may not be a hash
   * @return {boolean}
   */
  static isHash(candidateHash) {
    let isHash = false;
    try {
      bcrypt.getRounds(candidateHash);
      isHash = true;
    } catch (e) {}
    return isHash;
  };

  /**
   * Returns a user with the given email if the provided password matches.
   * @param {string} email - an email
   * @param {string} password - password to compare against user
   * @return {UserModel}
   */
  static async findOneWithPassword(email, password) {
    const user = password ? await this.findOne({email: email}) : null;
    const isMatch = user ? await user.comparePassword(password) : false;
    if (isMatch) return user;
  };
}

UserSchema.loadClass(UserModel);

/**
 * Calls the instance's `setPasswordHash()` method before save.
 */
UserSchema.pre('save', async function () {
  await this.setPasswordHash();
});

export default mongoose.model('User', UserSchema);
