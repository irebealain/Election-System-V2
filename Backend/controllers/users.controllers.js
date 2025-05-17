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

    // Mark student ID as used and associate it with the user
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
  const { email, password, studentId } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid password." });
    }

    // If student ID is provided, validate it
    if (studentId) {
      const studentIdRecord = await StudentId.findOne({
        studentId: studentId,
        electionId: user.electionId
      });

      if (!studentIdRecord) {
        return res.status(400).json({ 
          success: false, 
          message: "Student ID not found for this election." 
        });
      }

      // If student ID is already registered, find the user who registered it
      if (studentIdRecord.status === 'used' && studentIdRecord.usedBy) {
        const registeredUser = await User.findById(studentIdRecord.usedBy);
        
        if (!registeredUser) {
          return res.status(400).json({
            success: false,
            message: "Error finding registered user for this student ID."
          });
        }

        // If the email matches the registered user's email, proceed with login
        if (registeredUser.email === email) {
          // Generate JWT token
          const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "4d" });

          return res.status(200).json({
            success: true,
            message: "Login successful.",
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
        } else {
          // If email doesn't match, this is a different user trying to use the same student ID
          return res.status(400).json({
            success: false,
            message: "This student ID is registered to a different account. Please use your own student ID."
          });
        }
      }

      // If student ID is available, mark it as used and associate with user
      await StudentId.findByIdAndUpdate(studentIdRecord._id, {
        status: 'used',
        usedBy: user._id
      });

      // Update user's student ID
      user.studentId = studentId;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "4d" });

    res.status(200).json({
      success: true,
      message: "Login successful.",
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
    console.error("Error in user login:", error.message);
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
  const { token, level, studentId } = req.body;
  if (!token || !level || !studentId) {
    return res.status(400).json({
      success: false,
      message: "Token, level, and student ID are required.",
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

    // Verify student ID
    const validStudentId = await StudentId.findOne({
      studentId: studentId,
      electionId: currentElection._id,
      status: 'available'
    });

    if (!validStudentId) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid student ID or already registered for this election." 
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
      studentId: studentId
    });
    await user.save();

    // Mark student ID as used and associate it with the user
    await StudentId.findByIdAndUpdate(validStudentId._id, {
      status: 'used',
      usedBy: user._id
    });

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
        studentId: user.studentId
      },
    });
  } catch (error) {
    console.error("Error in Google signup:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Login the user using Google Auth
export const googleUserLogin = async (req, res) => {
  const { token, studentId } = req.body;
  if (!token || !studentId) {
    return res.status(400).json({
      success: false,
      message: "Token and student ID are required."
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
      audience: process.env.GOOGLE_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const picture = payload.picture || "";

    // First check if this student ID is already registered
    const studentIdRecord = await StudentId.findOne({
      studentId: studentId,
      electionId: currentElection._id
    });

    if (!studentIdRecord) {
      return res.status(400).json({ 
        success: false, 
        message: "Student ID not found for this election." 
      });
    }

    // If student ID is already registered, find the user who registered it
    if (studentIdRecord.status === 'used' && studentIdRecord.usedBy) {
      const registeredUser = await User.findById(studentIdRecord.usedBy);
      
      if (!registeredUser) {
        return res.status(400).json({
          success: false,
          message: "Error finding registered user for this student ID."
        });
      }

      // If the email matches the registered user's email, log them in
      if (registeredUser.email === email) {
        const appToken = jwt.sign({ id: registeredUser._id, email: registeredUser.email, role: registeredUser.role }, JWT_SECRET, { expiresIn: "4d" });
        return res.status(200).json({
          success: true,
          message: "Logged in successfully",
          token: appToken,
          user: { 
            id: registeredUser._id,
            firstName: registeredUser.firstName,
            lastName: registeredUser.lastName,
            email: registeredUser.email,
            level: registeredUser.level,
            electionId: currentElection._id,
            picture: picture,
            role: registeredUser.role,
            studentId: registeredUser.studentId
          },
        });
      } else {
        // If email doesn't match, this is a different user trying to use the same student ID
        return res.status(400).json({
          success: false,
          message: "This student ID is registered to a different account. Please use your own student ID."
        });
      }
    }

    // If student ID is available, proceed with normal login/signup flow
    const user = await User.findOne({ email });

    if (!user) {
      return googleUserSignup(req, res);
    }

    // Check if the student ID is already associated with this user in the current election
    if (user.studentId === studentId && user.electionId.toString() === currentElection._id.toString()) {
      const appToken = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "4d" });
      return res.status(200).json({
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
          studentId: user.studentId
        },
      });
    }

    // Mark student ID as used and associate it with the user
    await StudentId.findByIdAndUpdate(studentIdRecord._id, {
      status: 'used',
      usedBy: user._id
    });

    // Update user's student ID and election ID
    user.studentId = studentId;
    user.electionId = currentElection._id;
    await user.save();

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
        studentId: user.studentId
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
