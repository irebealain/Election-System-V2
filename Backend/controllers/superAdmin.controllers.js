import mongoose from "mongoose";
import SuperAdmin from "../models/superAdmin.model.js";
import Admin from "../models/admin.model.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// Getting all the super Admins
export const getSuperAdmins = async (req, res) => {
  try {
    const mainAdmin = await SuperAdmin.find({});
    res.status(200).json({ success: true, data: mainAdmin });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// Updating a superAdmin
export const updateSuperAdmin = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "SuperAdmin not found." });
  }

  try {
    const updatedSuperAdmin = await SuperAdmin.findByIdAndUpdate(id, updates, {
      new: true,
    });
    res.status(200).json({ success: true, data: updatedSuperAdmin });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};
// Deleting a superAdmin
export const deleteSuperAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    await SuperAdmin.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "superAdmin deleted." });
  } catch (error) {
    res.status(404).json({ success: false, message: "superAdmin not found." });
  }
};
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Sign up the superAdmin using Google Auth
export const signupSuperAdmin = async (req, res) => {
  const { token } = req.body; // Google ID Token
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token is required.",
    });
  }
  // Verify the Google token
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Ensure the token is from your app
    });
    const payload = ticket.getPayload();
    const email = payload.email;

    // Check if the email domain matches the organization (only in production)
    if (process.env.NODE_ENV === "production" && !email.endsWith("@asyv.org")) {
      return res.status(403).json({
        success: false,
        message: "Email must be from the organization domain (@asyv.org)",
      });
    }

    // Check if the SuperAdmin already exists
    const existingSuperAdmin = await SuperAdmin.findOne({ email });
    if (existingSuperAdmin) {
      return res
        .status(409)
        .json({ success: false, message: "SuperAdmin already exists" });
    }

    // Create a new SuperAdmin
    const newSuperAdmin = new SuperAdmin({
      name: payload.name,
      email: payload.email,
      profilePic: payload.picture || "", // optional profile picture
      googleId: payload.sub, // Google ID
    });

    await newSuperAdmin.save();

    // Send success response
    res.status(201).json({
      success: true,
      message: "SuperAdmin registered successfully",
      data: { superAdmin: newSuperAdmin },
    });
  } catch (error) {
    console.log("Error during Google signup:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Error during signup, please try again",
    });
  }
};
// Login the superAdmin using Google Auth
export const loginSuperAdmin = async (req, res) => {
  const { token } = req.body; // Google ID Token

  try {
    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;

    // Check if the email domain matches the organization (only in production)
    if (process.env.NODE_ENV === "production" && !email.endsWith("@asyv.org")) {
      return res.status(403).json({
        success: false,
        message: "Email must be from the organization domain (@asyv.org)",
      });
    }

    // Check if the SuperAdmin exists
    const user = await SuperAdmin.findOne({ email });

    if (!user) {
      // If user doesn't exist, create a new SuperAdmin
      const newSuperAdmin = new SuperAdmin({
        name: payload.name,
        email: payload.email,
        profilePic: payload.picture || "",
        googleId: payload.sub,
      });

      await newSuperAdmin.save();

      // Generate JWT token for the new user
      const appToken = jwt.sign(
        { id: newSuperAdmin._id, role: newSuperAdmin.role },
        JWT_SECRET,
        { expiresIn: "4d" }
      );

      return res.status(201).json({
        success: true,
        message: "SuperAdmin registered and logged in successfully",
        token: appToken,
        user: {
          id: newSuperAdmin._id,
          name: newSuperAdmin.name,
          email: newSuperAdmin.email,
          profilePic: newSuperAdmin.profilePic,
          googleId: newSuperAdmin.googleId,
          role: newSuperAdmin.role,
        },
      });
    }

    // Generate JWT token for existing user
    const appToken = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "4d" }
    );

    // Login successful, return superAdmin details
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token: appToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        googleId: user.googleId,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error during Google login:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error during login, please try again",
    });
  }
};
// Approve an admin
export const approveAdmin = async (req, res) => {
  const { adminId } = req.params; // Get the admin ID from the request parameters

  try {
    // Find the admin by ID and update their status to approved
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { isApproved: true, createdBy:  req.user.firstName && req.user.lastName},
      { new: true }
    )
    if (!updatedAdmin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    res.status(200).json({ success: true, data: updatedAdmin });
  } catch (error) {
    console.error("Error approving admin:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
