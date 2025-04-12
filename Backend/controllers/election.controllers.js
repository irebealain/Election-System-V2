import mongoose from "mongoose";
import Election from "../models/election.model.js";

// Getting all the elections
export const getElections = async (req, res) => {
  try {
    const election = await Election.find({})
    res.status(200).json({success: true, data: election})
  } catch (error) {
    res.status(500).json({success: false, message: "Server error"})
  }
}
// Creating a new election
export const createElections = async (req, res) => {
  const election = req.body

  // Validate required fields
  if (!election.title || !election.startDate || !election.createdBy) {
    return res.status(400).json({ success: false, message: "Please provide all required fields." })
  }

  // Parse and validate the startDate
  const parsedDate = new Date(election.startDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Normalize today's date

  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD." })
  }

  // Prevent past dates
  if (parsedDate < today) {
    return res.status(400).json({ success: false, message: "Start date cannot be in the past." })
  }

  // Determining the election status
  let status = "upcoming"
  if (parsedDate.toDateString() === today.toDateString()) {
    status = "ongoing"
  }
  else if (status === "ongoing" && parsedDate < today) {
    status = "completed"
  }
  try {
    // Check for duplicates (by title and startDate)
    const existingElection = await Election.findOne({
      title: election.title,
      startDate: parsedDate,
    })

    if (existingElection) {
      return res.status(400).json({ success: false, message: "Election with this title and date already exists." })
    }

    // Create the new election with status
    const newElection = new Election({
      ...election,
      startDate: parsedDate,
      status,
    })

    await newElection.save()
    res.status(201).json({ success: true, data: newElection });
  } catch (error) {
    console.error("Error in creating election:", error.message);
    res.status(500).json({ success: false, message: "Server Error" })
  }
}
// Updating a election
export const updateElection = async (req, res) => {
  const { id } = req.params
  const updates = req.body

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Election not found." })
  }

  try {
    const updatedElection = await Election.findByIdAndUpdate(id, updates, { new: true })
    res.status(200).json({ success: true, data: updatedElection })
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." })
  }
}
// Deleting a election
export const deleteElection = async (req, res) => {
  const {id} = req.params
  try {
    await Election.findByIdAndDelete(id)
    res.status(200).json({success: true, message: "Election deleted."})
  } catch (error) {
    res.status(404).json({success: false, message: "Election not found."})
  }
  
}