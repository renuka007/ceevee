import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import UserSchema from '../schemas/user';
import {
  SALT_WORK_FACTOR,
  JWT_SECRET,
  JWT_LOGIN_EXPIRES_IN,
  JWT_ACTIVATION_EXPIRES_IN } from '../../config/config';

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
   * Updates `active` to `true` in the DB.  While this action seems trivial, the
   * meaning of "activation" is intentionally encapsulated within the user model
   * so that it can easily change if necessary.
   */
  async activate() {
    this.set({active: true});
    await this.save();
  };

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

  /**
   * Creates an authentication claim JWT for this user if the passed password is
   * a match according to `comparePassword()`.
   * @param {string} password - a plaintext password to check
   * @returns {string|undefined} a JWT asserting the authentication claim of
   *  this user; undefined if password is wrong
   */
  async issueAuthenticationToken(password) {
    if (await this.comparePassword(password)) {
      return jwt.sign({
        authenticated: true
      }, JWT_SECRET, {
        algorithm: 'HS512',
        expiresIn: JWT_LOGIN_EXPIRES_IN,
        subject: this.email
      });
    }
  };

  /**
   * Creates an activation claim JWT for this user.
   * @returns {string|undefined} a JWT asserting the activation claim of
   *  this user; undefined if password is wrong
   */
  issueActivationToken() {
    return jwt.sign({
      activate: true
    }, JWT_SECRET, {
      algorithm: 'HS512',
      expiresIn: JWT_ACTIVATION_EXPIRES_IN,
      subject: this.email
    });
  };

  // =class methods

  /**
   * Checks if the passed plaintext password matches the passed password hash.
   * @param {string} candidatePassword - a plaintext password to check
   * @param {string} hash - a password hash
   * @return {boolean} `true` if `candidatePassword`, once hashed, matches
   *         the passed `hash`; `false` otherwise
   */
  static async comparePassword(candidatePassword, hash) {
    if (candidatePassword && hash) {
      return await bcrypt.compare(candidatePassword, hash);
    }
    return false;
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
   * Returns the token JSON, if the token is valid,
   * empty JSON otherwise.
   * @param {string} jwtToken - a JSON web token
   * @return {json}
   */
  static verifyToken(jwtToken) {
    try {
      // Inside try since `jwt.verify` throws an exception if token is expired,
      // invalid, or undefined.
      // Semantically, no authenticated user is found under these circumstances,
      // so we don't want the error to propagate.  Instead, we just return null.
      const decoded = jwt.verify(jwtToken, JWT_SECRET);
      return decoded;
    } catch (e) { }
    return {};
  }

  /**
   * Returns the email from the token, if the claim is valid.
   * @param {string} jwtToken - a token claiming authenticated user
   * @return {string|null}
   */
  static verifyAuthenticationToken(jwtToken) {
    const decoded = this.verifyToken(jwtToken);
    if (decoded.authenticated) return decoded.sub;
  };

  /**
   * Returns the email from the token, if the claim is valid.
   * @param {string} jwtToken - a token claiming a user may activate
   * @return {string|null}
   */
  static verifyActivationToken(jwtToken) {
    const decoded = this.verifyToken(jwtToken);
    if (decoded.activate) return decoded.sub;
  };

  /**
   * Returns a user matching the authentication token, if the claim is valid.
   * @param {string} jwtToken - a token claiming an authenticated user
   * @return {UserModel|null}
   */
  static async findOneAuthenticated(jwtToken) {
    const email = this.verifyAuthenticationToken(jwtToken);
    return await this.findOneActiveByEmail(email);
  };

  /**
   * Finds a user matching the activation claim, if valid, activates the user,
   * and returns the user instance.
   * @param {string} jwtToken - a token claiming activation for a user
   * @return {UserModel|null}
   */
  static async findOneAndActivate(jwtToken) {
    const email = this.verifyActivationToken(jwtToken);
    const user = await this.findOne({email});
    if (user) {
      await user.activate();
      return user;
    }
    return null;
  };

  /**
   * Returns an active user.
   * @param {string} email - a user email
   * @return {UserModel|null}
   */
  static async findOneActiveByEmail(email) {
    return await this.findOne({email, active: true});
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
