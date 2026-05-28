import { Router, Response, NextFunction } from "express";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import User from "../models/User";
import Resource from "../models/Resource";
import Report from "../models/Report";

const router = Router();

// Middleware to restrict access to administrators only
async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Administrative privileges required." });
  }
  next();
}

// All admin routes require authentication and admin privileges
router.use(requireAuth);
router.use(requireAdmin);

// GET /api/admin/analytics - Retrieve dashboard metrics
router.get("/analytics", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalResources = await Resource.countDocuments();
    const verifiedResources = await Resource.countDocuments({ verified: true });
    const reportedResources = await Resource.countDocuments({ reports_count: { $gt: 0 } });
    
    // Sum total downloads
    const resources = await Resource.find({}, "downloads branch category");
    const totalDownloads = resources.reduce((sum, r) => sum + (r.downloads || 0), 0);

    // Count by branch
    const branchCounts: { [key: string]: number } = {};
    const categoryCounts: { [key: string]: number } = {};
    resources.forEach((r) => {
      if (r.branch) {
        branchCounts[r.branch] = (branchCounts[r.branch] || 0) + 1;
      }
      if (r.category) {
        categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
      }
    });

    // Top contributors
    const topContributors = await User.find({}, "full_name points badge email")
      .sort({ points: -1 })
      .limit(5);

    return res.json({
      totalUsers,
      totalResources,
      verifiedResources,
      reportedResources,
      totalDownloads,
      branchDistribution: branchCounts,
      categoryDistribution: categoryCounts,
      topContributors
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/reports - Retrieve all flagged reports with populated data
router.get("/reports", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reports = await Report.find().sort({ created_at: -1 });
    
    const userIds = Array.from(new Set(reports.map(r => r.user_id)));
    const resourceIds = Array.from(new Set(reports.map(r => r.resource_id)));

    const users = await User.find({ _id: { $in: userIds } }, "full_name email");
    const resources = await Resource.find({ _id: { $in: resourceIds } }, "title user_id reports_count verified");

    const uploaderIds = Array.from(new Set(resources.map(r => r.user_id)));
    const uploaders = await User.find({ _id: { $in: uploaderIds } }, "full_name email");

    const userMap = new Map(users.map(u => [u._id.toString(), u]));
    const resourceMap = new Map(resources.map(r => [r._id.toString(), r]));
    const uploaderMap = new Map(uploaders.map(u => [u._id.toString(), u]));

    const result = reports.map((rep) => {
      const reporter = userMap.get(rep.user_id);
      const resource = resourceMap.get(rep.resource_id);
      const uploader = resource ? uploaderMap.get(resource.user_id) : null;

      return {
        id: rep._id.toString(),
        reason: rep.reason,
        details: rep.details,
        created_at: rep.created_at,
        reporter: reporter ? { id: reporter._id, name: reporter.full_name, email: reporter.email } : { name: "Unknown" },
        resource: resource ? {
          id: resource._id,
          title: resource.title,
          verified: resource.verified,
          reports_count: resource.reports_count,
          uploader: uploader ? { id: uploader._id, name: uploader.full_name, email: uploader.email } : { name: "Unknown" }
        } : null
      };
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/verify/:id - Verify/unverify a resource
router.put("/verify/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);
    if (!resource) return res.status(404).json({ error: "Resource not found" });

    // Toggle verified status
    const previousVerified = resource.verified;
    resource.verified = !resource.verified;
    await resource.save();

    // If verified successfully, award reward points to the uploader
    if (resource.verified && !previousVerified) {
      const uploader = await User.findById(resource.user_id);
      if (uploader) {
        uploader.points += 50; // Extra +50 points for admin validation!
        if (uploader.points >= 850) uploader.badge = "Top Uploader";
        else if (uploader.points >= 300) uploader.badge = "Gold Contributor";
        else if (uploader.points >= 100) uploader.badge = "Silver Contributor";
        await uploader.save();
      }
    }

    return res.json({
      message: `Resource has been successfully ${resource.verified ? "verified" : "unverified"}`,
      verified: resource.verified
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/resource/:id - Permanently delete a resource and its reports
router.delete("/resource/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByIdAndDelete(id);
    if (!resource) return res.status(404).json({ error: "Resource not found" });

    // Remove all flag reports associated with this resource
    await Report.deleteMany({ resource_id: id });

    return res.json({ message: "Resource and all associated reports permanently deleted." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users - List all users with contributor level metrics
router.get("/users", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await User.find({}, "full_name email college_name branch role points badge created_at").sort({ points: -1 });
    return res.json(users);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/users/:id - Delete a user and their uploaded resources
router.delete("/users/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Optional: Delete their resources as well, or keep them anonymous
    // Let's delete the files uploaded by this user to keep the database clean
    await Resource.deleteMany({ user_id: id });
    await Report.deleteMany({ user_id: id });

    return res.json({ message: `User "${user.full_name}" has been permanently banned and removed from AcadVault.` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
