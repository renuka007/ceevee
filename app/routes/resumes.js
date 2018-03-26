import { NotFoundError } from 'restify-errors';

import Resume from '../models/resume';

/**
 * Looks up resumes associated with the logged-in user.
 */
const resumesGetRoute = async (req, res, next) => {
  const resumes = await Resume.find({user: req.user});
  res.json(200, {
    resumes: resumes
  });
};

/**
 * Creates a resume for the logged-in user.
 */
const resumesPostRoute = async (req, res, next) => {
  const resume = await Resume.create({
    user: req.user,
    objective: req.body.resume.objective
  });
  res.json(201, {
    resume: resume
  });
};

/**
 * Looks up a resume by ID for the logged-in user.
 */
const resumeGetRoute = async (req, res, next) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    user: req.user
  });
  if (!resume) throw new NotFoundError();
  res.json(200, {
    resume: resume
  });
};

export { resumesGetRoute, resumesPostRoute, resumeGetRoute };
