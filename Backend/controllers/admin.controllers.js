import mongoose from "mongoose";
import Admin from "../models/admin.model.js";

// Getting all the admins
export const getAdmins = async (req, res) => {
  try {
    const admin = await Admin.find({})
    res.status(200).json({success: true, data: admin})
  } catch (error) {
    res.status(500).json({success: false, message: "Server error"})
  }
}
// Creating a new superAdmin
export const createAdmin = async (req, res) => {
  const admin = req.body

  if (!admin.firstName || !admin.lastName || !admin.email || !admin.password || !admin.createdBy){
    return res.status(400).json({success: false, message: "Please provide all the fields."})
  }

  const newAdmin = new Admin(admin)

  try {
    await newAdmin.save()
    res.status(201).json({success: true, data: newAdmin})
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