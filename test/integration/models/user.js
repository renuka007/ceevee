import { assert } from 'chai';
import User from '../../../app/models/user';
import DatabaseHelper from '../../helpers/database-helper';

describe ('Integration: Model: User', () => {

  beforeEach(async () => {
    await DatabaseHelper.connect();
    await DatabaseHelper.empty(User);
  });

  afterEach(async () => {
    await DatabaseHelper.disconnect();
  });

  describe('email uniqueness', () => {
    it('should allow users with distinct email addresses', async () => {
      const user1 = await User.create({email: 'test@test.com', password: 'test1234'});
      const user2 = await User.create({email: 'foo@test.com', password: 'test1234'});
      await assert.ok(!user1.isNew, 'users with different emails may be saved');
    });
    it('should not allow users with the same email address', async () => {
      const user1 = await User.create({email: 'test@test.com', password: 'test1234'});
      const user2 = new User({email: 'test@test.com', password: 'test1234'});
      let err = undefined;
      try {
        await user2.save();
      } catch (e) {
        err = e;
      }
      assert.isDefined(err, 'user with the same email address cannot be saved');
      assert.equal(user1.email, user2.email, 'user emails are duplicates');
      assert.ok(!user1.isNew, 'user 1 is saved');
      assert.notOk(!user2.isNew, 'user 2 is not saved');
    });
  });

});
