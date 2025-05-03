import mongoose from "mongoose";
import Admin from "../models/admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import Election from "../models/election.model.js";
import SuperAdmin from "../models/superAdmin.model.js";

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
      createdBy: admin.createdBy,
      isApproved: false  // Initially, the admin is not approved
    })
    await newAdmin.save()

    // Generate JWT token
    const token = jwt.sign(
      { id: newAdmin._id, role: newAdmin.role },
      JWT_SECRET,
      { expiresIn: "4d" }
    );

    res.status(201).json({
      success: true, 
      message: "Admin created successfully. Awaiting approval from super admin.",
      data: {
        token,
        user: {
          id: newAdmin._id,
          firstName: newAdmin.firstName,
          lastName: newAdmin.lastName,
          email: newAdmin.email,
          role: newAdmin.role,
          isApproved: newAdmin.isApproved,
          electionId: newAdmin.electionId
        }
      }
    })
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

    // Update last login time
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign({id: admin._id, role: admin.role}, JWT_SECRET, {expiresIn: '4d'})
    res.status(200).json({
      success: true,
      message: "Admin logged in successfully.",
      data: {
        token,
        user: {
          id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: admin.role,
          isApproved: admin.isApproved,
          electionId: admin.electionId,
          lastLogin: admin.lastLogin
        }
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
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token is required.",
    });
  }

  try {
    const currentElection = await Election.findOne({
      status: { $in: ['ongoing', 'upcoming'] }
    });

    if (!currentElection) {
      return res.status(400).json({
        success: false,
        message: "No active election found. Please try again later."
      });
    }

    const superAdmin = await SuperAdmin.findOne({});
    if (!superAdmin) {
      return res.status(400).json({
        success: false,
        message: "No superadmin found in the system. Please contact support."
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const [firstName, ...rest] = payload.name.split(" ");
    const lastName = rest.join(" ") || "";

    const user = new Admin({
      firstName,
      lastName,
      email,
      profilePic: payload.picture || "",
      googleId: payload.sub,
      electionId: currentElection._id,
      createdBy: superAdmin._id,
      isApproved: false
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Admin registered successfully. Waiting for superadmin approval.",
      token: jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '4d' }),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePic: user.profilePic,
        electionId: user.electionId,
        createdBy: user.createdBy,
        isApproved: user.isApproved,
        role: user.role,
        requiresApproval: true
      }
      
    });
    const superAdmins = await SuperAdmin.find({});
    for (const superAdmin of superAdmins) {
      const notification = new Notification ({
        recepient: superAdmin._id,
        type: "admin_signup",
        message: `${user.firstName} ${user.lastName} has registered as an admin. Please review their registration and approve or reject it.`,
        read: false,
        relatedId: user._id
      });
      await notification.save();
    }
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
  const { token: googleToken } = req.body;

  try {
    // First, find the current election
    const currentElection = await Election.findOne({
      status: { $in: ['ongoing', 'upcoming'] }
    });

    if (!currentElection) {
      return res.status(400).json({
        success: false,
        message: "No active election found. Please try again later."
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture || "";

    // Check if the Admin exists
    const user = await Admin.findOne({email});
    if (!user) {
      // If user doesn't exist, create a new Admin
      const [firstName, ...rest] = name.split(" ");
      const lastName = rest.join(" ") || "";

      const newAdmin = new Admin({
        firstName,
        lastName,
        email,
        profilePic: picture,
        googleId: payload.sub,
        electionId: currentElection._id,
        isApproved: false // Default to false
      });

      await newAdmin.save();

      const appToken = jwt.sign(
        { id: newAdmin._id, role: newAdmin.role },
        JWT_SECRET,
        { expiresIn: "4d" }
      );

      return res.status(201).json({
        success: true,
        message: "Admin registered successfully. Waiting for superadmin approval.",
        token: appToken,
        user: {
          id: newAdmin._id,
          firstName: newAdmin.firstName,
          lastName: newAdmin.lastName,
          email: newAdmin.email,
          profilePic: newAdmin.profilePic,
          electionId: newAdmin.electionId,
          isApproved: newAdmin.isApproved,
          role: newAdmin.role,
          lastLogin: newAdmin.lastLogin
        }
      });
    }
    if (!user.isApproved){
      return res.status(400).json({
        success: false,
        message: "Admin is not approved. Please wait for approval from superadmin."
      });
    }
    // Update last login time for existing admin
    user.lastLogin = new Date();
    await user.save();

    const appToken = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "4d" }
    );

    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully.",
      token: appToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePic: user.profilePic,
        electionId: user.electionId,
        isApproved: user.isApproved,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error("Error in Google login:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
