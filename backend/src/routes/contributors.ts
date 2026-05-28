import { Router } from "express";
import Resource from "../models/Resource";
import User from "../models/User";

const router = Router();

// GET /api/contributors - Aggregate uploads and downloads for user profiles
router.get("/", async (req, res) => {
  try {
    const resources = await Resource.find({}, "user_id downloads");
    const users = await User.find({}, "_id full_name college_name");

    const totals = new Map<string, { uploads: number; downloads: number }>();
    resources.forEach((r) => {
      if (!r.user_id) return;
      const cur = totals.get(r.user_id) ?? { uploads: 0, downloads: 0 };
      cur.uploads += 1;
      cur.downloads += r.downloads ?? 0;
      totals.set(r.user_id, cur);
    });

    const result = users
      .map((p) => {
        const userId = p._id.toString();
        const stats = totals.get(userId) ?? { uploads: 0, downloads: 0 };
        return {
          id: userId,
          full_name: p.full_name,
          college_name: p.college_name,
          uploads: stats.uploads,
          downloads: stats.downloads,
        };
      })
      .filter((p) => p.uploads > 0)
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 50);

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
