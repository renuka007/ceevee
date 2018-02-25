import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import UserSchema from '../schemas/user';

class UserModel {
  async comparePassword(candidatePassword) {
    const hash = this.password_hash;
  	return await this.constructor.comparePassword(candidatePassword, hash);
  };
  static async comparePassword(candidatePassword, hash) {
    return await bcrypt.compare(candidatePassword, hash);
  };
  static async hashPassword(password) {
    const saltWorkFactor = 5;
    const salt = await bcrypt.genSalt(saltWorkFactor);
    return await bcrypt.hash(password, salt);
  };
}

UserSchema.loadClass(UserModel);

UserSchema.pre('validate', async function () {
  if (this.password) {
    this.password_hash = await this.constructor.hashPassword(this.password);
    this.password = undefined;
  }
});

export default mongoose.model('User', UserSchema);
