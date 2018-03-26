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

export { resumesGetRoute };
