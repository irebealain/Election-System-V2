import mongoose from "mongoose";
import User from "../models/users.model.js";
import Election from "../models/election.model.js";
// Getting all the elections
export const getUsers = async (req, res) => {
  try {
    const user = await User.find({})
    res.status(200).json({success: true, data: user})
  } catch (error) {
    res.status(500).json({success: false, message: "Server error."})
  }
}
// Creating a new user.
export const createUsers = async (req, res) => {
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
    // Saving a new user
    const newUser = new User(user)
    await newUser.save()
    res.status(201).json({success: true, data: newUser})
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
