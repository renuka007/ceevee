import mongoose from 'mongoose';
import ResumeSchema from '../schemas/resume';


/**
 * Resume contains basic information about a resume or C.V.
 */
class ResumeModel {

  // =instance methods

  /**
   * Converts model instance to a plain object appropriate for user with
   * JSON stringification.
   * @return {object} plain object representation of this instance for JSON
   */
  toJSON() {
    // user might be populated, but we only want the ID
    let userID = this.populated('user') || this.user;
    return {
      id: this._id,
      user: userID,
      objective: this.objective,
      updated_at: this.updated_at,
      created_at: this.created_at
    }
  };

  // =class methods

}

ResumeSchema.loadClass(ResumeModel);

export default mongoose.model('Resume', ResumeSchema);
