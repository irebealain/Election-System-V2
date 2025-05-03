import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/users.model.js";
import Admin from "../models/admin.model.js";
import SuperAdmin from "../models/superAdmin.model.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || "secretkey"; // Add fallback secret

// 🔐 Auth middleware
export const protect = async (req, res, next) => {
  try {
    // Check for Bearer token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Check SuperAdmin first
        let superAdmin = await SuperAdmin.findById(decoded.id);
        if (superAdmin) {
          req.user = {...superAdmin._doc, role: "superAdmin" };
          return next();
        }

        // Check User
        let user = await User.findById(decoded.id).select("-password");
        if (user) {
          req.user = {...user._doc, role: "user" };
          return next();
        }

        // Check Admin
        let admin = await Admin.findById(decoded.id).select("-password");
        if (admin) {
          req.user = {...admin._doc, role: "admin" };
          return next();
        }

        return res.status(401).json({ success: false, message: "User not found" });
      } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid token" });
      }
    }

    // Check for Google token
    const googleToken = req.body?.token;
    if (googleToken) {
      try {
        const ticket = await client.verifyIdToken({
          idToken: googleToken,
          audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const superAdmin = await SuperAdmin.findOne({ email: payload.email });

        if (!superAdmin) {
          return res.status(401).json({ success: false, message: "SuperAdmin not found" });
        }

        req.user = {...superAdmin._doc, role: "superAdmin" };
        return next();
      } catch (err) { 
        return res.status(401).json({ success: false, message: "Invalid Google token" });
      }
    }

    return res.status(401).json({ 
      success: false, 
      message: "No authorization token provided. Please provide a Bearer token or Google token." 
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error during authentication" 
    });
  }
};

// Only SuperAdmin Access
export const isSuperAdmin = (req, res, next) => {
  if (req.user?.role === "superAdmin") return next();
  return res.status(403).json({ success: false, message: "Only SuperAdmins can access this route" });
};

// Only Admin Access
export const isAdmin = (req, res, next) => {
  if (req.user?.role === "admin" || req.user?.role === "superAdmin") return next();
  return res.status(403).json({ success: false, message: "Only Admins and Super Admins can access this route" });
};
