import { Router, Response } from "express";
import crypto from "crypto";
import Resource from "../models/Resource";
import User from "../models/User";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// GET /api/resources - Retrieve resources with smart backend search filters
router.get("/", async (req, res) => {
  try {
    const { q, category, semester, branch, verified } = req.query;
    let query: any = {};

    if (verified === "true") {
      query.verified = true;
    }
    if (category && category !== "All") {
      query.category = category;
    }
    if (semester && semester !== "All") {
      query.semester = semester;
    }
    if (branch && branch !== "All") {
      query.branch = branch;
    }

    if (q) {
      const searchStr = String(q).trim();
      const searchRegex = new RegExp(searchStr, "i");
      query.$or = [
        { title: searchRegex },
        { subject: searchRegex },
        { description: searchRegex },
        { college: searchRegex },
        { university: searchRegex },
        { tags: { $in: [searchStr] } }
      ];

      // Smart semantic/keyword parser (e.g. "DBMS 3rd sem" or "MCA Java notes")
      const lowerQ = searchStr.toLowerCase();
      const semMatch = lowerQ.match(/(\d)(?:st|nd|rd|th)?\s*(?:sem|semester|year)/i);
      if (semMatch) {
        const digit = semMatch[1];
        let suffix = "th";
        if (digit === "1") suffix = "st";
        else if (digit === "2") suffix = "nd";
        else if (digit === "3") suffix = "rd";
        query.semester = `${digit}${suffix} Semester`;
      }
      
      if (lowerQ.includes("mca")) {
        query.category = "MCA Notes";
      } else if (lowerQ.includes("btech") || lowerQ.includes("b.tech")) {
        query.category = "BTech Notes";
      } else if (lowerQ.includes("interview") || lowerQ.includes("placement")) {
        query.$or = [
          { category: "Interview Questions" },
          { category: "Placement Materials" },
          { category: "Coding Resources" }
        ];
      }
    }

    const data = await Resource.find(query, "-file_data").sort({ created_at: -1 });
    const users = await User.find({}, "_id full_name profile_image");
    const userMap = new Map<string, { full_name: string; profile_image?: string }>();
    users.forEach((u) => {
      userMap.set(u._id.toString(), {
        full_name: u.full_name,
        profile_image: u.profile_image,
      });
    });

    const result = data.map((r: any) => {
      const uploader = userMap.get(r.user_id) ?? { full_name: "Anonymous Student" };
      return {
        id: r._id.toString(),
        user_id: r.user_id,
        uploader_name: uploader.full_name,
        uploader_avatar: uploader.profile_image || null,
        title: r.title,
        description: r.description,
        university: r.university,
        college: r.college,
        branch: r.branch,
        year: r.year,
        semester: r.semester,
        subject: r.subject,
        resource_type: r.resource_type,
        category: r.category || "BTech Notes",
        tags: r.tags,
        file_url: r.file_url,
        file_path: r.file_path,
        file_type: r.file_type,
        url_link: r.url_link,
        verified: r.verified,
        downloads: r.downloads,
        likes: r.likes || [],
        ratings: r.ratings || [],
        created_at: r.created_at,
      };
    });
    return res.json(result ?? []);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/resources/saved - Fetch bookmarked resources for authenticated user
router.get("/saved", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userProfile = await User.findById(req.user.id);
    if (!userProfile) return res.status(404).json({ error: "User not found" });

    const data = await Resource.find({ _id: { $in: userProfile.bookmarks } }, "-file_data").sort({ created_at: -1 });
    const users = await User.find({}, "_id full_name profile_image");
    const userMap = new Map<string, { full_name: string; profile_image?: string }>();
    users.forEach((u) => {
      userMap.set(u._id.toString(), {
        full_name: u.full_name,
        profile_image: u.profile_image,
      });
    });

    const result = data.map((r: any) => {
      const uploader = userMap.get(r.user_id) ?? { full_name: "Anonymous Student" };
      return {
        id: r._id.toString(),
        user_id: r.user_id,
        uploader_name: uploader.full_name,
        uploader_avatar: uploader.profile_image || null,
        title: r.title,
        description: r.description,
        university: r.university,
        college: r.college,
        branch: r.branch,
        year: r.year,
        semester: r.semester,
        subject: r.subject,
        resource_type: r.resource_type,
        category: r.category || "BTech Notes",
        tags: r.tags,
        file_url: r.file_url,
        file_path: r.file_path,
        file_type: r.file_type,
        url_link: r.url_link,
        verified: r.verified,
        downloads: r.downloads,
        likes: r.likes || [],
        ratings: r.ratings || [],
        created_at: r.created_at,
      };
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/resources/latest - Retrieve 8 latest resources
router.get("/latest", async (req, res) => {
  try {
    const data = await Resource.find({}, "title subject branch semester downloads created_at file_type user_id category url_link verified likes ratings")
      .sort({ created_at: -1 })
      .limit(8);
    const users = await User.find({}, "_id full_name profile_image");
    const userMap = new Map<string, { full_name: string; profile_image?: string }>();
    users.forEach((u) => {
      userMap.set(u._id.toString(), {
        full_name: u.full_name,
        profile_image: u.profile_image,
      });
    });

    const result = data.map((r: any) => {
      const uploader = userMap.get(r.user_id) ?? { full_name: "Anonymous Student" };
      return {
        id: r._id.toString(),
        user_id: r.user_id,
        uploader_name: uploader.full_name,
        uploader_avatar: uploader.profile_image || null,
        title: r.title,
        subject: r.subject,
        branch: r.branch,
        semester: r.semester,
        downloads: r.downloads,
        created_at: r.created_at,
        file_type: r.file_type,
        category: r.category || "BTech Notes",
        url_link: r.url_link,
        verified: r.verified,
        likes: r.likes || [],
        ratings: r.ratings || [],
      };
    });
    return res.json(result ?? []);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/resources/trending - Retrieve 8 trending resources sorted by downloads
router.get("/trending", async (req, res) => {
  try {
    const data = await Resource.find({}, "title subject branch semester downloads created_at file_type user_id category url_link verified likes ratings")
      .sort({ downloads: -1 })
      .limit(8);
    const users = await User.find({}, "_id full_name profile_image");
    const userMap = new Map<string, { full_name: string; profile_image?: string }>();
    users.forEach((u) => {
      userMap.set(u._id.toString(), {
        full_name: u.full_name,
        profile_image: u.profile_image,
      });
    });

    const result = data.map((r: any) => {
      const uploader = userMap.get(r.user_id) ?? { full_name: "Anonymous Student" };
      return {
        id: r._id.toString(),
        user_id: r.user_id,
        uploader_name: uploader.full_name,
        uploader_avatar: uploader.profile_image || null,
        title: r.title,
        subject: r.subject,
        branch: r.branch,
        semester: r.semester,
        downloads: r.downloads,
        created_at: r.created_at,
        file_type: r.file_type,
        category: r.category || "BTech Notes",
        url_link: r.url_link,
        verified: r.verified,
        likes: r.likes || [],
        ratings: r.ratings || [],
      };
    });
    return res.json(result ?? []);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/resources/my-uploads - Fetch resources uploaded by authenticated user
router.get("/my-uploads", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await Resource.find({ user_id: req.user.id }, "-file_data").sort({ created_at: -1 });
    const users = await User.find({}, "_id full_name profile_image");
    const userMap = new Map<string, { full_name: string; profile_image?: string }>();
    users.forEach((u) => {
      userMap.set(u._id.toString(), {
        full_name: u.full_name,
        profile_image: u.profile_image,
      });
    });

    const result = data.map((r: any) => {
      const uploader = userMap.get(r.user_id) ?? { full_name: "Anonymous Student" };
      return {
        id: r._id.toString(),
        user_id: r.user_id,
        uploader_name: uploader.full_name,
        uploader_avatar: uploader.profile_image || null,
        title: r.title,
        description: r.description,
        university: r.university,
        college: r.college,
        branch: r.branch,
        year: r.year,
        semester: r.semester,
        subject: r.subject,
        resource_type: r.resource_type,
        category: r.category || "BTech Notes",
        tags: r.tags,
        file_url: r.file_url,
        file_path: r.file_path,
        file_type: r.file_type,
        url_link: r.url_link,
        verified: r.verified,
        downloads: r.downloads,
        likes: r.likes || [],
        ratings: r.ratings || [],
        created_at: r.created_at,
      };
    });
    return res.json(result ?? []);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/resources/:id/recommendations - Recommendation Engine (same branch, semester, or category)
router.get("/:id/recommendations", async (req, res) => {
  try {
    const { id } = req.params;
    const current = await Resource.findById(id);
    if (!current) return res.status(404).json({ error: "Resource not found" });

    const data = await Resource.find({
      _id: { $ne: id },
      $or: [
        { branch: current.branch },
        { semester: current.semester },
        { category: current.category }
      ]
    }, "-file_data").limit(4);

    const users = await User.find({}, "_id full_name profile_image");
    const userMap = new Map<string, { full_name: string; profile_image?: string }>();
    users.forEach((u) => {
      userMap.set(u._id.toString(), {
        full_name: u.full_name,
        profile_image: u.profile_image,
      });
    });

    const result = data.map((r: any) => {
      const uploader = userMap.get(r.user_id) ?? { full_name: "Anonymous Student" };
      return {
        id: r._id.toString(),
        user_id: r.user_id,
        uploader_name: uploader.full_name,
        uploader_avatar: uploader.profile_image || null,
        title: r.title,
        description: r.description,
        university: r.university,
        college: r.college,
        branch: r.branch,
        year: r.year,
        semester: r.semester,
        subject: r.subject,
        resource_type: r.resource_type,
        category: r.category || "BTech Notes",
        tags: r.tags,
        file_url: r.file_url,
        file_path: r.file_path,
        file_type: r.file_type,
        url_link: r.url_link,
        verified: r.verified,
        downloads: r.downloads,
        likes: r.likes || [],
        ratings: r.ratings || [],
        created_at: r.created_at,
      };
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/resources - Save resource metadata and file/link data in MongoDB (requires auth)
router.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      description,
      university,
      college,
      branch,
      year,
      semester,
      subject,
      resource_type,
      category,
      tags,
      file_type,
      file_data,
      url_link,
    } = req.body;

    if (!title || !resource_type || !file_type) {
      return res.status(400).json({ error: "Title, type, and format are required fields." });
    }

    // Link Validation System
    if (url_link) {
      try {
        const parsedUrl = new URL(url_link);
        const host = parsedUrl.hostname.toLowerCase();
        const isValid = host.includes("drive.google.com") || 
                        host.includes("youtube.com") || 
                        host.includes("youtu.be") || 
                        host.includes("github.com") || 
                        host.includes("http");
        if (!isValid) {
          return res.status(400).json({ error: "Only Google Drive, YouTube, GitHub, or secure HTTPS educational links are allowed." });
        }
      } catch {
        return res.status(400).json({ error: "Invalid link URL provided." });
      }
    }

    // Metadata Duplication Prevention
    const duplicateByMeta = await Resource.findOne({
      title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
      subject: { $regex: new RegExp(`^${(subject || "").trim()}$`, "i") },
      semester
    });
    if (duplicateByMeta) {
      return res.status(400).json({ error: "Similar resource already exists." });
    }

    if (url_link) {
      const duplicateByUrl = await Resource.findOne({ url_link });
      if (duplicateByUrl) {
        return res.status(400).json({ error: "Similar resource already exists." });
      }
    }

    // Calculate file hash if file is being uploaded
    let file_hash: string | undefined;
    if (file_data) {
      file_hash = crypto.createHash("sha256").update(file_data).digest("hex");
      const duplicateByHash = await Resource.findOne({ file_hash });
      if (duplicateByHash) {
        return res.status(400).json({ error: "Similar resource already exists." });
      }
    }

    const newResource = new Resource({
      user_id: req.user.id,
      title,
      description: description || null,
      university: university || null,
      college: college || null,
      branch: branch || null,
      year: year || null,
      semester: semester || null,
      subject: subject || null,
      resource_type,
      category: category || "BTech Notes",
      tags: tags || [],
      file_url: url_link || "temp", // updated below for files
      file_path: url_link ? "link" : "database",
      file_type,
      file_data: file_data || null,
      file_hash: file_hash || null,
      url_link: url_link || null,
      verified: false,
    });

    await newResource.save();

    if (!url_link) {
      newResource.file_url = `http://localhost:5000/api/resources/${newResource._id}/file`;
      await newResource.save();
    }

    // Upload Rewards System: Award +20 points to the uploader!
    const uploader = await User.findById(req.user.id);
    if (uploader) {
      uploader.points += 20;
      if (uploader.points >= 850) uploader.badge = "Top Uploader";
      else if (uploader.points >= 300) uploader.badge = "Gold Contributor";
      else if (uploader.points >= 100) uploader.badge = "Silver Contributor";
      await uploader.save();
    }

    return res.status(201).json({
      id: newResource._id.toString(),
      user_id: newResource.user_id,
      title: newResource.title,
      description: newResource.description,
      university: newResource.university,
      college: newResource.college,
      branch: newResource.branch,
      year: newResource.year,
      semester: newResource.semester,
      subject: newResource.subject,
      resource_type: newResource.resource_type,
      category: newResource.category,
      tags: newResource.tags,
      file_url: newResource.file_url,
      file_path: newResource.file_path,
      file_type: newResource.file_type,
      url_link: newResource.url_link,
      verified: newResource.verified,
      downloads: newResource.downloads,
      created_at: newResource.created_at,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/resources/:id/like - Toggle resource like
router.post("/:id/like", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const resource = await Resource.findById(id);
    if (!resource) return res.status(404).json({ error: "Resource not found" });

    const idx = resource.likes.indexOf(userId);
    let liked = false;
    if (idx > -1) {
      resource.likes.splice(idx, 1);
    } else {
      resource.likes.push(userId);
      liked = true;

      // Award +5 points to the uploader for receiving a like!
      const uploader = await User.findById(resource.user_id);
      if (uploader) {
        uploader.points += 5;
        if (uploader.points >= 850) uploader.badge = "Top Uploader";
        else if (uploader.points >= 300) uploader.badge = "Gold Contributor";
        else if (uploader.points >= 100) uploader.badge = "Silver Contributor";
        await uploader.save();
      }
    }

    await resource.save();
    return res.json({ likes: resource.likes, liked });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/resources/:id/rate - Rate a resource 1-5 stars
router.post("/:id/rate", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { score } = req.body;
    const userId = req.user.id;

    if (typeof score !== "number" || score < 1 || score > 5) {
      return res.status(400).json({ error: "Score must be a number between 1 and 5" });
    }

    const resource = await Resource.findById(id);
    if (!resource) return res.status(404).json({ error: "Resource not found" });

    const idx = resource.ratings.findIndex((r) => r.user_id === userId);
    if (idx > -1) {
      resource.ratings[idx].score = score;
    } else {
      resource.ratings.push({ user_id: userId, score });
    }

    await resource.save();
    return res.json({ ratings: resource.ratings });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/resources/:id/bookmark - Toggle resource bookmark
router.post("/:id/bookmark", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userProfile = await User.findById(userId);
    if (!userProfile) return res.status(404).json({ error: "User not found" });

    const idx = userProfile.bookmarks.indexOf(id);
    let bookmarked = false;
    if (idx > -1) {
      userProfile.bookmarks.splice(idx, 1);
    } else {
      userProfile.bookmarks.push(id);
      bookmarked = true;
    }

    await userProfile.save();
    return res.json({ bookmarks: userProfile.bookmarks, bookmarked });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/resources/:id/file - Serve binary file directly from MongoDB
router.get("/:id/file", async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);
    if (!resource || !resource.file_data) {
      return res.status(404).json({ error: "File not found" });
    }

    const base64Data = resource.file_data.split(";base64,").pop();
    if (!base64Data) {
      return res.status(400).json({ error: "Invalid file format in database" });
    }

    const buffer = Buffer.from(base64Data, "base64");

    let mimeType = "application/octet-stream";
    if (resource.file_type === "pdf") mimeType = "application/pdf";
    else if (resource.file_type === "zip") mimeType = "application/zip";
    else if (resource.file_type === "docx") mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (resource.file_type === "doc") mimeType = "application/msword";
    else if (resource.file_type === "pptx") mimeType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    else if (resource.file_type === "ppt") mimeType = "application/vnd.ms-powerpoint";

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${resource.title.replace(/[^a-zA-Z0-9.-]/g, "_")}.${resource.file_type}"`);
    return res.send(buffer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/resources/:id - Delete a resource (requires auth)
router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Resource.findOneAndDelete({ _id: id, user_id: req.user.id });

    if (!deleted) {
      return res.status(404).json({ error: "Resource not found or unauthorized to delete" });
    }

    return res.json({
      message: "Deleted successfully",
      deleted: {
        id: deleted._id.toString(),
        user_id: deleted.user_id,
        title: deleted.title,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/resources/:id/download - Increment download count
router.post("/:id/download", async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);
    if (!resource) return res.status(404).json({ error: "Resource not found" });

    resource.downloads += 1;
    await resource.save();

    // Award +5 points to the uploader for receiving a download!
    const uploader = await User.findById(resource.user_id);
    if (uploader) {
      uploader.points += 5;
      if (uploader.points >= 850) uploader.badge = "Top Uploader";
      else if (uploader.points >= 300) uploader.badge = "Gold Contributor";
      else if (uploader.points >= 100) uploader.badge = "Silver Contributor";
      await uploader.save();
    }

    return res.json({ message: "Download count incremented" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
