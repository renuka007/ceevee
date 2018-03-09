
import mongoose from 'mongoose';

export default class DatabaseHelper {
  static async connect(done) {
    await mongoose.connect(process.env.MONGODB_URI);
  };

  static async disconnect() {
    await mongoose.disconnect();
  };

  static async empty(...models) {
    const removeOrNext = async () => {
      if (models.length) {
        await models.pop().remove();
        await removeOrNext();
      }
    };
    await removeOrNext();
  };
}
