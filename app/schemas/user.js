import { Schema } from 'mongoose';

/**
 * A UserSchema for Mongoose.
 */
export default new Schema({
  email: {
    type: String,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {type: String, required: true, minlength: 8},
  created_on: {type: Date, required: true, default: Date.now}
});
