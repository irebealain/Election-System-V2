import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/users.model.js";
import Admin from "../models/admin.model.js";
import SuperAdmin from "../models/superAdmin.model.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;

// 🔐 Auth middleware
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user =
        await User.findById(decoded.id).select("-password") ||
        await Admin.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ success: false, message: "Invalid token or user not found" });
      }

      return next();
    } catch (err) {
      return res.status(401).json({ success: false, message: "JWT verification failed" });
    }
  }

  // Google token fallback (for SuperAdmins only)
  if (req.body.token) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: req.body.token,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      const superAdmin = await SuperAdmin.findOne({ email: payload.email });

      if (!superAdmin) {
        return res.status(401).json({ success: false, message: "SuperAdmin not found" });
      }

      req.user = superAdmin;
      return next();
    } catch (err) {
      return res.status(401).json({ success: false, message: "Google token invalid" });
    }
  }

  return res.status(401).json({ success: false, message: "No authorization token provided" });
};

// 🔐 Only SuperAdmin Access
export const isSuperAdmin = (req, res, next) => {
  if (req.user?.role === "superAdmin") return next();
  return res.status(403).json({ success: false, message: "Only SuperAdmins can access this route" });
};

// 🔐 Only Admin Access
export const isAdmin = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ success: false, message: "Only Admins can access this route" });
};
