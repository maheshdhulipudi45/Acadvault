import express from "express";
import cors from "cors";
import { connectDB } from "./config/mongodb";
import authRouter from "./routes/auth";
import resourcesRouter from "./routes/resources";
import contributorsRouter from "./routes/contributors";
import statsRouter from "./routes/stats";
import reportsRouter from "./routes/reports";
import adminRouter from "./routes/admin";

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// API Endpoints
app.use("/api/auth", authRouter);
app.use("/api/resources", resourcesRouter);
app.use("/api/contributors", contributorsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/admin", adminRouter);

// Base health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

export default app;
