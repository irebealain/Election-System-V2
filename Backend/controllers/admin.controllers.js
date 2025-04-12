import mongoose from "mongoose";
import Admin from "../models/admin.model.js";
import Election from "../models/election.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
// Getting all the admins
export const getAdmins = async (req, res) => {
  try {
    const admin = await Admin.find({})
    res.status(200).json({success: true, data: admin})
  } catch (error) {
    res.status(500).json({success: false, message: "Server error"})
  }
}
// Signing up a new admin
export const adminSignup = async (req, res) => {
  const admin = req.body

  if (!admin.firstName || !admin.lastName || !admin.email || !admin.password ||!admin.electionId){
    return res.status(400).json({success: false, message: "Please provide all the fields."})
  }

  try {
    // Check if the election exists and if its status is not 'completed'
    const election = await Election.findById(admin.electionId);

    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found." });
    }

    if (election.status === "completed") {
      return res.status(400).json({ success: false, message: "You cannot register for a completed election." });
    }
    // Checking if the admin exists
    const existingAdmin = await Admin.findOne({email: admin.email})
    if (existingAdmin){
      return res.status(400).json({success: false, message: "Admin already exists."})
    }
    // Hashing password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(admin.password, salt)
    // Saving a new admin in the database
    const newAdmin = new Admin({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email, 
      password: hashedPassword,
      electionId: admin.electionId,
      createdBy: null,
      approved: false  // Initially, the admin is not approved
    })
    await newAdmin.save()
    res.status(201).json({
      success: true, 
      message: "Admin created successfully. Awaiting approval from super admin.",
      data: {
        newAdmin
      }})
  } catch (error) {
    console.error("Error in created Admin:", error.message)
    res.status(500).json({success: false, message: "Server Error"})
  }
}
//Login an Admin
export const adminLogin = async (req, res) => {
  const {email, password} = req.body
  // Checking if the user exists
  if (!email || !password) {
    return res.status(400).json({success: false, message: "Please provide all required fields."})
  }
  try {
    const admin = await Admin.findOne({email})
    if (!admin) {
      return res.status(404).json({success: false, message: "User not found."})
    }
    // Checking the password
    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) {
      return res.status(400).json({success: false, message: "Invalid credentials."})
    }
    // Generate JWT token
    const token = jwt.sign({id: admin._id, role: admin.role}, JWT_SECRET, {expiresIn: '4d'})
    res.status(200).json({
      success: true,
      message: "Admin logged in successfully.",
      data: {
        token,
        admin
      }
    })
  } catch (error) {
    console.error("Error in login Admin:", error.message)
    res.status(500).json({success: false, message: "Server Error"})
  }
};
// Updating a Admin
export const updateAdmin = async (req, res) => {
  const { id } = req.params
  const updates = req.body

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Admin not found." })
  }

  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(id, updates, { new: true })
    res.status(200).json({ success: true, data: updatedAdmin })
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." })
  }
}
// Deleting a Admin
export const deleteAdmin = async (req, res) => {
  const {id} = req.params
  try {
    await Admin.findByIdAndDelete(id);
    res.status(200).json({success: true, message: "Admin deleted."})
  } catch (error) {
    res.status(404).json({success: false, message: "Admin not found."})
  }
  
}
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Sign up the admin sign up using Google Auth
export const googleAdminSignup = async (req, res) => {
  const { token, electionId, createdBy } = req.body;

  // Validate required fields
  if (!token || !electionId || !createdBy) {
    return res.status(400).json({
      success: false,
      message: "Token, electionId, and createdBy are required.",
    });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    // Optional domain check
    if (process.env.NODE_ENV === "production") {
      if (!email.endsWith("@asyv.org")) {
        return res.status(403).json({
          success: false,
          message: "Email must be from the organization domain",
        });
      }
    }

    // Check if Admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin already exists",
      });
    }

    // Check if election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Split name
    const [firstName, ...rest] = payload.name.split(" ");
    const lastName = rest.join(" ") || "";

    // Create Admin
    const newAdmin = new Admin({
      firstName,
      lastName,
      email,
      profilePic: payload.picture || "",
      googleId: payload.sub,
      electionId,
      createdBy,
    });

    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: { admin: newAdmin },
    });
  } catch (error) {
    console.log("Error during Google signup:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Error during signup, please try again",
    });
  }
};
// Login the Admin using Google Auth
export const googleAdminLogin = async (req, res) => {
  const { token } = req.body;

  try {
    // DEV MODE ONLY: Mock login
    if (process.env.NODE_ENV === "development") {
      const mockEmail = "irebalain@gmail.com";
      const mockGoogleId = "google-oauth-id-string123456789-fake";
      const admin = await Admin.findOne({
        email: mockEmail,
        googleId: mockGoogleId,
      });
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Admin not found, please sign up",
        });
      }

      if (!admin.isApproved) {
        return res.status(403).json({
          success: false,
          message: "Admin account is pending approval by the SuperAdmin.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Logged in successfully",
        data: { admin },
      });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    // Check if the Admin exists
    const admin = await Admin.findOne({ email, googleId: payload.sub });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found, please sign up",
      });
    }

    // Check if Admin is approved
    if (!admin.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Admin account is pending approval by the SuperAdmin.",
      });
    }

    // Login successful
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: { admin },
    });
  } catch (error) {
    console.error("Error during Google login:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error during login, please try again",
    });
  }
};
