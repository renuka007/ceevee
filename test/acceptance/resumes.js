import { assert } from 'chai';
import supertest from 'supertest';

import server from '../../app/server';
import User from '../../app/models/user';
import Resume from '../../app/models/resume';
import DatabaseHelper from '../helpers/database-helper';


const userData1 = {email: 'test@test.com', password: 'test1234', active: true};
const userData2 = {email: 'foo@bar.com', password: 'test1234', active: true};

let resumeData1;
let resumeData2;
let resumeData3;

let user1;
let user2;
let userToken1;
let userToken2;
let bearerAuthHeader1;
let bearerAuthHeader2;
let resume1;
let resume2;
let resume3;

describe('Acceptance: Route: /resumes', () => {

  beforeEach(async () => {
    await DatabaseHelper.connect();
    await DatabaseHelper.empty(User);
    await DatabaseHelper.empty(Resume);
    user1 = await User.create(userData1);
    user2 = await User.create(userData2);
    userToken1 = await user1.issueAuthenticationToken(userData1.password);
    userToken2 = await user2.issueAuthenticationToken(userData2.password);
    bearerAuthHeader1 = `Bearer ${userToken1}`;
    bearerAuthHeader2 = `Bearer ${userToken2}`;
    resumeData1 = {user: user1, objective: 'Get a job'};
    resumeData2 = {user: user2, objective: 'Get a real job'};
    resumeData3 = {user: user2, objective: 'Make money'};
    resume1 = await Resume.create(resumeData1);
    resume2 = await Resume.create(resumeData2);
    resume3 = await Resume.create(resumeData3);
  });

  afterEach(async () => {
    await DatabaseHelper.disconnect();
  });

  describe('GET', () => {
    it('should return resumes for logged in user [200]', async () => {
      // user1 has 1 resume
      await supertest(server)
        .get('/resumes')
        .set('Authorization', bearerAuthHeader1)
        .send()
        .expect(200)
        .expect((res) => {
          const expectedJSON = JSON.parse(JSON.stringify(resume1));
          assert.equal(res.body.resumes.length, 1);
          assert.deepEqual(res.body.resumes[0], expectedJSON);
        });
      // user2 has 2 resumes
      await supertest(server)
        .get('/resumes')
        .set('Authorization', bearerAuthHeader2)
        .send()
        .expect(200)
        .expect((res) => {
          assert.equal(res.body.resumes.length, 2);
        });
    });
  });

  describe('POST', () => {
    it('should create a resume for the logged in user [201]', async () => {
      assert.equal(await Resume.count(), 3);
      await supertest(server)
        .post('/resumes')
        .set('Authorization', bearerAuthHeader1)
        .send({resume: {objective: 'foobar'}})
        .expect(201);
      assert.equal(await Resume.count(), 4);
    });
    it('should disallow creation of resume with missing objective [422]', async () => {
      assert.equal(await Resume.count(), 3);
      await supertest(server)
        .post('/resumes')
        .set('Authorization', bearerAuthHeader1)
        .send({resume: {}})
        .expect(422);
      assert.equal(await Resume.count(), 3);
    });
  });

});
