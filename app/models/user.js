import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import UserSchema from '../schemas/user';
import encrypt from 'mongoose-encryption';

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
   * Hashes the passed plaintext password and assigns it to
   * the `password_hash` property.
   * @param {string} password - a plaintext password
   * @throws {Error} throws error if password is less than 8 characters long.
   */
  async setPassword(password) {
    if (password && password.length >= 8) {
      this.password_hash = await this.constructor.hashPassword(password);
    } else {
      throw new Error('minimum password length is 8');
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
UserSchema.plugin(encrypt, {
  secret: process.env.DB_ENCRYPTION_SECRET,
  excludeFromEncryption: ['email'],
  additionalAuthenticatedFields: ['email']
});

export default mongoose.model('User', UserSchema);
