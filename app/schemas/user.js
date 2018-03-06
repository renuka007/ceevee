import { Schema } from 'mongoose';
import zxcvbn from 'zxcvbn';
import { MIN_ZXCVBN_PASSWORD_STRENGTH } from '../../config/config'

/**
 * A UserSchema for Mongoose.
 */
const UserSchema = new Schema({
  created_on: {
    type: Date,
    required: true,
    default: Date.now
  },
  email: {
    type: String,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
});

UserSchema.path('password').validate(function (value) {
  const userInputs = [this.email];
  const strength = zxcvbn(value, userInputs);
  return strength.score >= MIN_ZXCVBN_PASSWORD_STRENGTH;
}, 'Password is too weak.  Try a longer plain-language phrase.', 'strength');

export default UserSchema;
