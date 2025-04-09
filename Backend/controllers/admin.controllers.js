import mongoose from "mongoose";
import Admin from "../models/admin.model.js";
import Election from "../models/election.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

  if (!admin.firstName || !admin.lastName || !admin.email || !admin.password ||!admin.electionId || !admin.createdBy){
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