import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
  resource_id: string;
  user_id: string;
  reason: "Spam" | "Broken Link" | "Duplicate" | "Fake Material";
  details?: string;
  created_at: Date;
}

const ReportSchema = new Schema<IReport>({
  resource_id: { type: String, required: true, index: true },
  user_id: { type: String, required: true },
  reason: { type: String, enum: ["Spam", "Broken Link", "Duplicate", "Fake Material"], required: true },
  details: { type: String },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model<IReport>("Report", ReportSchema);
