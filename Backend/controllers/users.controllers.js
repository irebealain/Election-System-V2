import mongoose from "mongoose";
import User from "../models/users.model.js";
import Election from "../models/election.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
// Getting all the elections
export const getUsers = async (req, res) => {
  try {
    const user = await User.find({})
    res.status(200).json({success: true, data: user})
  } catch (error) {
    res.status(500).json({success: false, message: "Server error."})
  }
}
// Signup as new user.
export const userSignup = async (req, res) => {
  const user = req.body
  // checking all the fields
  if(!user.firstName || !user.lastName ||!user.email || !user.password || !user.electionId || !user.level){
    return res.status(400).json({success: false, message: "Please provide all required fields"})
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
    // Checking if the user exists
    const existingUser = await User.findOne({email: user.email})

    if (existingUser){
      return res.status(400).json({success: false, message: "User already exists."})
    }
    // Hashing password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(user.password, salt)
    // Saving a new user
    const newUser = new User({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: hashedPassword,
      electionId: user.electionId,
      level: user.level
    })
    await newUser.save()
    // Generate JWT token
    const token = jwt.sign({id: newUser._id, role: newUser.role}, JWT_SECRET, {expiresIn: '4d'})
    res.status(201).json({
      success: true, 
      message: "User created successfully.",
      data: {
        token,
        newUser
      }
    })
  } catch (error) {
    console.error("Error in created User:", error.message)
    res.status(500).json({success: false, message: "Server Error"})
  }
}
// Updating a users
export const updateUser = async (req, res) => {
  const { id } = req.params
  const updates = req.body

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "User not found." })
  }

  try {
    const updateUser = await User.findByIdAndUpdate(id, updates, { new: true })
    res.status(200).json({ success: true, data: updateUser })
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." })
  }
}
// Deleting a User
export const deleteUser = async (req, res) => {
  const {id} = req.params
  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({success: true, message: "User deleted."})
  } catch (error) {
    res.status(404).json({success: false, message: "User not found."})
  }
  
}
