import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found or session expired" });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      full_name: user.full_name,
      college_name: user.college_name,
      branch: user.branch || null,
      bio: user.bio || null,
      profile_image: user.profile_image || null,
      role: user.role
    };
    
    next();
  } catch (err: any) {
    return res.status(401).json({ error: "Invalid or expired session token" });
  }
}
