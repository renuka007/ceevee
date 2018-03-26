import mongoose from 'mongoose';
import ResumeSchema from '../schemas/resume';


/**
 * Resume contains basic information about a resume or C.V.
 */
class ResumeModel {

  // =instance methods

  // =class methods

}

ResumeSchema.loadClass(ResumeModel);

export default mongoose.model('Resume', ResumeSchema);
