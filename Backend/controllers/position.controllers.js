import mongoose from "mongoose";
import Position from "../models/postion.model.js";
import Election from "../models/election.model.js";

// Gettinga all the positions
export const getPositions = async (req, res) => {
  try {
    const position = await Position.find({})
    res.status(200).json({success: true, data: position})
  } catch (error) {
    res.status(500).json({success: false, message: "Server error"})
  }
}
// Creating a new positions.
export const createPositions = async (req, res) => {
  const position = req.body
  // checking all the fields
  if(!position.name || !position.electionId){
    return res.status(400).json({success: false, message: "Please provide all required fields"})
  }
  try {
    // Check if the election exists and if its status is not 'completed'
    const election = await Election.findById(position.electionId);

    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found." });
    }

    if (election.status === "completed") {
      return res.status(400).json({ success: false, message: "You cannot register for a completed election." });
    }
    // Saving a new position
    const newPosition = new Position(position)
    await newPosition.save()
    res.status(201).json({success: true, data: newPosition})
  } catch (error) {
    console.error("Error in created Position:", error.message)
    res.status(500).json({success: false, message: "Server Error"})
  }
}
// Updating a Positions
export const updatePosition = async (req, res) => {
  const { id } = req.params
  const updates = req.body

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Position not found." })
  }

  try {
    const updatePosition = await Position.findByIdAndUpdate(id, updates, { new: true })
    res.status(200).json({ success: true, data: updatePosition })
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." })
  }
}
// Deleting a Position
export const deletePosition = async (req, res) => {
  const {id} = req.params
  try {
    await Position.findByIdAndDelete(id);
    res.status(200).json({success: true, message: "Position deleted."})
  } catch (error) {
    res.status(404).json({success: false, message: "Position not found."})
  }
  
}