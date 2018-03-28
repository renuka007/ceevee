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

/**
 * Updates a resume by ID for the logged-in user.
 */
const resumePutRoute = async (req, res, next) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    user: req.user
  });
  if (!resume) throw new NotFoundError();
  resume.set({objective: req.body.resume.objective});
  await resume.save();
  res.json(200, {resume});
};

/**
 * Deletes a resume by ID for the logged-in user.
 */
const resumeDeleteRoute = async (req, res, next) => {
  const resume = await Resume.findOneAndRemove({
    _id: req.params.id,
    user: req.user
  });
  if (!resume) throw new NotFoundError();
  res.send(204);
};

export {
  resumesGetRoute,
  resumesPostRoute,
  resumeGetRoute,
  resumePutRoute,
  resumeDeleteRoute
};
