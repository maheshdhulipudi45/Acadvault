import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, full_name, college_name } = req.body;
    if (!email || !password || !full_name || !college_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "A user with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      passwordHash,
      full_name,
      college_name,
      role: email.toLowerCase() === "admin@acadvault.com" ? "admin" : "student"
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id.toString(), email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      user: {
        id: newUser._id.toString(),
        email: newUser.email,
        full_name: newUser.full_name,
        college_name: newUser.college_name,
        branch: null,
        bio: null,
        profile_image: null,
        role: newUser.role
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        full_name: user.full_name,
        college_name: user.college_name,
        branch: user.branch || null,
        bio: user.bio || null,
        profile_image: user.profile_image || null,
        role: user.role
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    return res.json({ user: req.user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/profile - Update user profile
router.put("/profile", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { full_name, college_name, branch, bio, profile_image } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (full_name !== undefined) user.full_name = full_name;
    if (college_name !== undefined) user.college_name = college_name;
    if (branch !== undefined) user.branch = branch;
    if (bio !== undefined) user.bio = bio;
    if (profile_image !== undefined) user.profile_image = profile_image;

    await user.save();

    return res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        full_name: user.full_name,
        college_name: user.college_name,
        branch: user.branch || null,
        bio: user.bio || null,
        profile_image: user.profile_image || null,
        role: user.role
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password (mock for development)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ message: "Password reset link sent to your email (mocked)" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset-password (mock for development)
router.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and new password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    await user.save();
    return res.json({ message: "Password updated successfully" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
