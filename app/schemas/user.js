import mongoose from 'mongoose';

const Schema = mongoose.Schema;
export default new Schema({
  email: {
    type: String,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {type: String, minlength: 8},
  password_hash: {type: String, required: true},
  created_on: {type: Date, required: true, default: Date.now}
});
