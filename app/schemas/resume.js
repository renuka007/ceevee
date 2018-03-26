import { Schema } from 'mongoose';
import timestamp from 'mongoose-timestamp';


const ResumeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  objective: {
    type: String,
    required: true
  }
});

ResumeSchema.plugin(timestamp,  {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default ResumeSchema;
