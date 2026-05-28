import { Router } from "express";
import Resource from "../models/Resource";
import User from "../models/User";

const router = Router();

// GET /api/stats - Fetch dynamic MongoDB stats
router.get("/", async (req, res) => {
  try {
    const uploadsCount = await Resource.countDocuments();
    const usersCount = await User.countDocuments();

    // Aggregate total downloads
    const downloadsAgg = await Resource.aggregate([
      { $group: { _id: null, total: { $sum: "$downloads" } } }
    ]);
    const downloadsCount = downloadsAgg[0]?.total ?? 0;

    // Aggregate unique colleges
    const collegesList = await User.distinct("college_name");
    const collegesCount = collegesList.length;

    return res.json({
      uploads: uploadsCount,
      downloads: downloadsCount,
      users: usersCount,
      colleges: collegesCount
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
