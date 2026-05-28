import mongoose, { Schema, Document } from "mongoose";

export interface IResource extends Document {
  user_id: string;
  title: string;
  description?: string;
  university?: string;
  college?: string;
  branch?: string;
  year?: string;
  semester?: string;
  subject?: string;
  resource_type: string;
  category: string;
  tags: string[];
  file_url: string;
  file_path: string;
  file_type: string;
  file_data?: string;
  file_hash?: string;
  url_link?: string;
  verified: boolean;
  downloads: number;
  likes: string[];
  ratings: { user_id: string; score: number }[];
  reports_count: number;
  created_at: Date;
}

const ResourceSchema = new Schema<IResource>({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  university: {
    type: String
  },
  college: {
    type: String
  },
  branch: {
    type: String
  },
  year: {
    type: String
  },
  semester: {
    type: String
  },
  subject: {
    type: String
  },
  resource_type: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    default: "BTech Notes"
  },
  tags: {
    type: [String],
    default: []
  },
  file_url: {
    type: String,
    required: true
  },
  file_path: {
    type: String,
    required: true
  },
  file_type: {
    type: String,
    required: true
  },
  file_data: {
    type: String
  },
  file_hash: {
    type: String,
    index: true,
    default: null
  },
  url_link: {
    type: String,
    default: null
  },
  verified: {
    type: Boolean,
    default: false
  },
  downloads: {
    type: Number,
    default: 0
  },
  likes: {
    type: [String],
    default: []
  },
  ratings: {
    type: [{ user_id: String, score: Number }],
    default: []
  },
  reports_count: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IResource>("Resource", ResourceSchema);
