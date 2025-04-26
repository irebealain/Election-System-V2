import mongoose from "mongoose";
import User from "../models/users.model.js";
import Election from "../models/election.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
// Getting all the elections
export const getUsers = async (req, res) => {
  try {
    const user = await User.find({});
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};
// Signup as new user.
export const userSignup = async (req, res) => {
  const user = req.body;
  // checking all the fields
  if (
    !user.firstName ||
    !user.lastName ||
    !user.email ||
    !user.password ||
    !user.electionId ||
    !user.level
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all required fields" });
  }
  try {
    // Check if the election exists and if its status is not 'completed'
    const election = await Election.findById(user.electionId);

    if (!election) {
      return res
        .status(404)
        .json({ success: false, message: "Election not found." });
    }

    if (election.status === "completed") {
      return res
        .status(400)
        .json({
          success: false,
          message: "You cannot register for a completed election.",
        });
    }
    // Checking if the user exists
    const existingUser = await User.findOne({ email: user.email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists." });
    }
    // Hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    // Saving a new user
    const newUser = new User({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: hashedPassword,
      electionId: user.electionId,
      level: user.level,
    });
    await newUser.save();
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "4d" }
    );
    res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: {
        token,
        newUser,
      },
    });
  } catch (error) {
    console.error("Error in created User:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// Login to a user
export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  // Checking if the user exists
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all required fields." });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    // Checking the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials." });
    }
    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "4d",
    });
    res.status(200).json({
      success: true,
      message: "User logged in successfully.",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    console.error("Error in login User:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}; 
// Updating a users
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  try {
    const updateUser = await User.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ success: true, data: updateUser });
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
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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

    // 1. Verify Google ID Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists.",
      });
    }

    // 3. Split name into firstName and lastName
    const [firstName, ...rest] = payload.name.split(" ");
    const lastName = rest.join(" ") || " ";

    // 4. Create user
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

    // 5. Generate JWT token
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "4d" }
    );
    // 6. Send response
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
      idToken: token,
      audience: process.env.GOOGLE_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture || "";
    // Check if the User exists
    const user = await User.findOne({ email });
    if (!user) {
      return googleUserSignup(req, res);
    }
    const appToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "4d" }
    );
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
