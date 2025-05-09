import mongoose from "mongoose";
import SuperAdmin from "../models/superAdmin.model.js";
import Admin from "../models/admin.model.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import Notification from "../models/notifications.model.js";
import ExcelJS from 'exceljs';
import StudentId from "../models/studentId.model.js";

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
  const { adminId } = req.params;

  try {
    // Find the admin by ID and update their status to approved
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { 
        isApproved: true,
        status: 'approved',
        createdBy: req.user._id
      },
      { new: true }
    );

    if (!updatedAdmin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Create a notification for the admin
    const notification = new Notification({
      recipient: adminId,
      recipientModel: 'Admins',
      type: 'admin_approved',
      message: 'Your admin account has been approved. You can now access the admin dashboard.',
      read: false,
      relatedId: adminId,
      relatedModel: 'Admins'
    });
    await notification.save();

    res.status(200).json({ success: true, data: updatedAdmin });
  } catch (error) {
    console.error("Error approving admin:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reject an admin
export const rejectAdmin = async (req, res) => {
  const { adminId } = req.params;

  try {
    // Find the admin by ID and update their status to rejected
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { 
        isApproved: false,
        status: 'rejected',
        createdBy: req.user._id
      },
      { new: true }
    );

    if (!updatedAdmin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Create a notification for the admin
    const notification = new Notification({
      recipient: adminId,
      recipientModel: 'Admins',
      type: 'admin_rejected',
      message: 'Your admin account request has been rejected. Please contact the super admin for more information.',
      read: false,
      relatedId: adminId,
      relatedModel: 'Admins'
    });
    await notification.save();

    res.status(200).json({ success: true, data: updatedAdmin });
  } catch (error) {
    console.error("Error rejecting admin:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Upload student IDs via Excel
export const uploadStudentIdsExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an Excel file'
      });
    }

    const { electionId } = req.body;
    if (!electionId) {
      return res.status(400).json({
        success: false,
        message: 'Election ID is required'
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.getWorksheet(1); // Get first worksheet

    const studentIds = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        const studentId = row.getCell(1).value;
        if (studentId) {
          studentIds.push(studentId.toString().trim());
        }
      }
    });

    if (studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No student IDs found in the Excel file'
      });
    }

    // Check for duplicates in the input
    const uniqueIds = [...new Set(studentIds)];
    if (uniqueIds.length !== studentIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate student IDs found in the Excel file'
      });
    }

    // Check for existing IDs in the database for this election
    const existingIds = await StudentId.find({
      studentId: { $in: studentIds },
      electionId
    }).select('studentId');

    if (existingIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some student IDs already exist for this election',
        existingIds: existingIds.map(id => id.studentId)
      });
    }

    // Create new student IDs
    const newStudentIds = studentIds.map(id => ({
      studentId: id,
      electionId
    }));

    await StudentId.insertMany(newStudentIds);

    // Create notification for super admin
    const notification = new Notification({
      recipient: req.user._id,
      recipientModel: 'SuperAdmins',
      type: 'election_created',
      message: `Successfully uploaded ${newStudentIds.length} student IDs for the election`,
      read: false,
      relatedId: electionId,
      relatedModel: 'Elections'
    });
    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Student IDs uploaded successfully',
      count: newStudentIds.length
    });
  } catch (error) {
    console.error('Error uploading student IDs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload student IDs'
    });
  }
};
