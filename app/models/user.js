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

  // =instance methods

  /**
   * Hashes the plaintext password and assigns it to the
   * `password_hash` property.
   */
  async setPasswordHash() {
    if (this.password) {
      let password = this.password;
      this.password = undefined;
      this.password_hash = await this.constructor.hashPassword(password);
    }
  };

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
    const saltWorkFactor = 5;
    const salt = await bcrypt.genSalt(saltWorkFactor);
    return await bcrypt.hash(password, salt);
  };
}

UserSchema.loadClass(UserModel);

UserSchema.pre('validate', function () {
  if (!this.password && !this.password_hash) {
    throw new Error('Either password or password_hash required.');
  }
});

/**
 * Calls the instance's `setPasswordHash()` method before save.
 */
UserSchema.pre('save', async function () {
  await this.setPasswordHash();
});

export default mongoose.model('User', UserSchema);
