import mongoose from "mongoose";
import SuperAdmin from "../models/superAdmin.model.js"

// Getting all the super Admins
export const getSuperAdmins = async (req, res) => {
  try {
    const mainAdmin = await SuperAdmin.find({})
    res.status(200).json({success: true, data: mainAdmin})
  } catch (error) {
    res.status(500).json({success: false, message: "Server error"})
  }
}
// Creating a new superAdmin
export const createSuperAdmin = async (req, res) => {
  const mainAdmin = req.body

  if (!mainAdmin){
    return res.status(400).json({success: false, message: "Please provide all the fields."})
  }

  const newSuperAdmin = new SuperAdmin(mainAdmin)

  try {
    await newSuperAdmin.save()
    res.status(201).json({success: true, data: newSuperAdmin})
  } catch (error) {
    console.error("Error in created SuperAdmin:", error.message)
    res.status(500).json({success: false, message: "Server Error"})
  }
}
// Updating a superAdmin
export const updateSuperAdmin = async (req, res) => {
  const { id } = req.params
  const updates = req.body

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "SuperAdmin not found." })
  }

  try {
    const updatedSuperAdmin = await SuperAdmin.findByIdAndUpdate(id, updates, { new: true })
    res.status(200).json({ success: true, data: updatedSuperAdmin })
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." })
  }
}
// Deleting a superAdmin
export const deleteSuperAdmin = async (req, res) => {
  const {id} = req.params
  try {
    await SuperAdmin.findByIdAndDelete(id);
    res.status(200).json({success: true, message: "superAdmin deleted."})
  } catch (error) {
    res.status(404).json({success: false, message: "superAdmin not found."})
  }
  
}