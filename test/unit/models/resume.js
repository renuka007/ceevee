import { assert } from 'chai';

import User from '../../../app/models/user';
import Resume from '../../../app/models/resume';


let user;

describe ('Unit: Model: Resume', () => {

  beforeEach(() => {
    user = new User({email: 'test@test.com', password: 'test1234'});
  });

  describe('validate', () => {
    it('should pass on valid values', async () => {
      const resume = new Resume({user: user, objective: 'hello world'});
      await resume.validate();
      assert.ok(resume, 'valid values produce no error');
    });
    it('should fail on no values specified', () => {
      const resume = new Resume();
      const err = resume.validateSync();
      assert.equal(err.name, 'ValidationError', 'resume does not validate');
    });
    it('should fail on missing user', () => {
      const resume = new Resume({objective: 'hello world'});
      const err = resume.validateSync();
      assert.equal(err.name, 'ValidationError', 'resume does not validate');
    });
    it('should fail on missing objected', () => {
      const resume = new Resume({user: user});
      const err = resume.validateSync();
      assert.equal(err.name, 'ValidationError', 'resume does not validate');
    });
  });

});
