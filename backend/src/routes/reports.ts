import { Router, Response } from "express";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import Report from "../models/Report";
import Resource from "../models/Resource";

const router = Router();

// POST /api/reports - Flag/report a resource
router.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { resource_id, reason, details } = req.body;
    if (!resource_id || !reason) {
      return res.status(400).json({ error: "resource_id and reason are required" });
    }

    const validReasons = ["Spam", "Broken Link", "Duplicate", "Fake Material"];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ error: "Invalid reason category" });
    }

    const resource = await Resource.findById(resource_id);
    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    // Check if the user has already reported this resource for the same reason
    const existing = await Report.findOne({
      resource_id,
      user_id: req.user.id,
      reason
    });

    if (existing) {
      return res.status(400).json({ error: "You have already reported this resource for this reason." });
    }

    const report = new Report({
      resource_id,
      user_id: req.user.id,
      reason,
      details: details || null
    });

    await report.save();

    // Increment reports_count in Resource
    resource.reports_count = (resource.reports_count || 0) + 1;
    await resource.save();

    return res.status(201).json({
      message: "Resource flagged successfully. Administrators will review it.",
      report
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
