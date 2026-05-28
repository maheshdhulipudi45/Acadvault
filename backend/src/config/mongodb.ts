import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("Missing MONGODB_URI in backend environment variables");
}

export async function connectDB() {
  try {
    await mongoose.connect(mongoUri as string);
    console.log("[MongoDB] Connected successfully to Atlas Cluster");
  } catch (error) {
    console.error("[MongoDB] Connection failed:", error);
    process.exit(1);
  }
}
