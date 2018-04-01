import { Schema } from 'mongoose';
import timestamp from 'mongoose-timestamp';


const BioSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
name: {
  type:String,
  required:true,
},
title: string,
location: user: {
    type: Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
email: string,
voice: string,
url: {
  type: String,
  match: /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  },
linked_in_username: string,
facebook_username: string,
twitter_username: string,
github_username: string,
});

BioSchema.plugin(timestamp,  {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default BioSchema;
