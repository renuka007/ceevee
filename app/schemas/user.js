import { Schema } from 'mongoose';
import timestamp from 'mongoose-timestamp';
import zxcvbn from 'zxcvbn';
import { MIN_ZXCVBN_PASSWORD_STRENGTH } from '../../config/config'

/**
 * A UserSchema for Mongoose.
 */
const UserSchema = new Schema({
  active: {
    type: Boolean,
    default: false
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

UserSchema.plugin(timestamp,  {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default UserSchema;
