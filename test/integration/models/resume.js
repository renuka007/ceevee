import { assert } from 'chai';

import User from '../../../app/models/user';
import Resume from '../../../app/models/resume';
import DatabaseHelper from '../../helpers/database-helper';


let user;
let resumeData;
const userData = {email: 'test@test.com', password: 'test1234', active: true};

describe ('Integration: Model: Resume', () => {

  beforeEach(async () => {
    await DatabaseHelper.connect();
    await DatabaseHelper.empty(User);
    await DatabaseHelper.empty(Resume);
    user = await User.create(userData);
    resumeData = {user: user, objective: 'Get a job'};
  });

  afterEach(async () => {
    await DatabaseHelper.disconnect();
  });

  describe('defaults', () => {
    it('should include a created_at date', async () => {
      const resume = await Resume.create(resumeData);
      assert.instanceOf(resume.created_at, Date, 'created_at is an Date');
    });
    it('should include a updated_at date', async () => {
      const resume = await Resume.create(resumeData);
      assert.instanceOf(resume.updated_at, Date, 'updated_at is an Date');
    });
  });

});
