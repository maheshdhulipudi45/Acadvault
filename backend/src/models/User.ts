import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  full_name: string;
  college_name: string;
  branch?: string;
  bio?: string;
  profile_image?: string;
  role: "student" | "admin";
  points: number;
  badge: string;
  bookmarks: string[];
  created_at: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  full_name: {
    type: String,
    required: true
  },
  college_name: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  },
  profile_image: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student"
  },
  points: {
    type: Number,
    default: 0
  },
  badge: {
    type: String,
    default: "Bronze Contributor"
  },
  bookmarks: {
    type: [String],
    default: []
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IUser>("User", UserSchema);
