import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  email: {
    type: String,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  created_on: {
    type: Date,
    required: true,
    default: Date.now
  }
});

export default mongoose.model('User', UserSchema);
