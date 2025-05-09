import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import ExcelJS from 'exceljs';
import User from "../models/users.model.js";
import Election from "../models/election.model.js";
import { validateStudentId, markStudentIdAsUsed } from './studentIdController.js';
import StudentId from "../models/studentId.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Getting all the users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Signup as new user
export const userSignup = async (req, res) => {
  const user = req.body;
  if (!user.firstName || !user.lastName || !user.email || !user.password || !user.electionId || !user.level || !user.studentId) {
    return res.status(400).json({ success: false, message: "Please provide all required fields" });
  }

  try {
    // Check if the election exists and if its status is not 'completed'
    const election = await Election.findById(user.electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found." });
    }

    if (election.status === "completed") {
      return res.status(400).json({ success: false, message: "You cannot register for a completed election." });
    }

    // Check if student ID exists and is available for this election
    const validStudentId = await StudentId.findOne({
      studentId: user.studentId,
      electionId: user.electionId,
      status: 'available'
    });

    if (!validStudentId) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid student ID or already registered for this election." 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: user.email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    // Create new user
    const newUser = new User({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: hashedPassword,
      electionId: user.electionId,
      level: user.level,
      studentId: user.studentId,
      role: 'student'
    });

    await newUser.save();

    // Mark student ID as used
    await StudentId.findByIdAndUpdate(validStudentId._id, {
      status: 'used',
      usedBy: newUser._id
    });

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: "4d" });

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: {
        token,
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          level: newUser.level,
          role: newUser.role,
          electionId: newUser.electionId,
          studentId: newUser.studentId
        }
      }
    });
  } catch (error) {
    console.error("Error in creating User:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Login to a user
export const userLogin = async (req, res) => {
  const { email, password, electionId } = req.body;
  
  if (!email || !password || !electionId) {
    return res.status(400).json({ success: false, message: "Please provide all required fields." });
  }

  try {
    // Check if election exists and is active
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found." });
    }

    if (election.status === "completed") {
      return res.status(400).json({ success: false, message: "This election has been completed." });
    }

    // Find user
    const user = await User.findOne({ email, electionId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found for this election." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "4d" });

    res.status(200).json({
      success: true,
      message: "User logged in successfully.",
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          level: user.level,
          role: user.role,
          electionId: user.electionId,
          studentId: user.studentId
        }
      }
    });
  } catch (error) {
    console.error("Error in login User:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Updating a user
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "User not found." });
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Deleting a User
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "User deleted." });
  } catch (error) {
    res.status(404).json({ success: false, message: "User not found." });
  }
};

// Sign up the user using Google Auth
export const googleUserSignup = async (req, res) => {
  const { token, level } = req.body;
  if (!token || !level) {
    return res.status(400).json({
      success: false,
      message: "Token and level are required.",
      token,
      level,
    });
  }
  try {
    const currentElection = await Election.findOne({ status: { $in: ['ongoing', 'upcoming'] } });
    if (!currentElection) {
      return res.status(400).json({
        success: false,
        message: "No active election found. Please try again later."
      });
    }
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists.",
      });
    }
    const [firstName, ...rest] = payload.name.split(" ");
    const lastName = rest.join(" ") || " ";
    const user = new User({
      firstName,
      lastName,
      email,
      googleId: payload.sub,
      level,
      role: "student",
      electionId: currentElection._id,
      picture: payload.picture || "",
    });
    await user.save();
    const jwtToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "4d" });
    res.status(201).json({
      success: true,
      message: "Logged in successfully",
      token: jwtToken,
      user: { 
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        level: user.level,
        electionId: currentElection._id,
        picture: user.picture,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in Google signup:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Login the user using Google Auth
export const googleUserLogin = async (req, res) => {
  const { token } = req.body;
  try {
    const currentElection = await Election.findOne({ status: { $in: ['ongoing', 'upcoming'] } });
    if (!currentElection) {
      return res.status(400).json({
        success: false,
        message: "No active election found. Please try again later."
      });
    }
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const picture = payload.picture || "";
    const user = await User.findOne({ email });
    if (!user) {
      return googleUserSignup(req, res);
    }
    const appToken = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "4d" });
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token: appToken,
      user: { 
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        level: user.level,
        electionId: currentElection._id,
        picture: picture,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error during Google login:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Error during login, please try again",
    });
  }
};

// Export students to Excel
export const exportStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('firstName lastName email studentId level createdAt')
      .lean();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');
    worksheet.columns = [
      { header: 'First Name', key: 'firstName', width: 15 },
      { header: 'Last Name', key: 'lastName', width: 15 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Student ID', key: 'studentId', width: 15 },
      { header: 'Level', key: 'level', width: 10 },
      { header: 'Registration Date', key: 'createdAt', width: 20 }
    ];
    worksheet.addRows(students);
    worksheet.getColumn('createdAt').numFmt = 'yyyy-mm-dd hh:mm:ss';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting students:', error);
    res.status(500).json({ success: false, message: 'Failed to export students' });
  }
};

// Register new user
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, studentId, level } = req.body;
    if (studentId) {
      const validation = await validateStudentId(studentId);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, message: validation.message });
      }
    }
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      studentId,
      level,
      role: 'student'
    });
    await user.save();
    if (studentId) {
      await markStudentIdAsUsed(studentId, user._id);
    }
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, message: 'Failed to register user' });
  }
};

// Delete all students
export const deleteAllStudents = async (req, res) => {
  try {
    const result = await User.deleteMany({ role: 'student' });
    res.status(200).json({ 
      success: true, 
      message: `${result.deletedCount} students deleted successfully.` 
    });
  } catch (error) {
    console.error('Error deleting all students:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete students.' 
    });
  }
};
