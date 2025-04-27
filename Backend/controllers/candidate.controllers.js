import mongoose from "mongoose";
import Candidate from "../models/candidate.model.js";
import Election from "../models/election.model.js";
import Position from "../models/postion.model.js";

// Getting all the candidates
export const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({})
    res.status(200).json({success: true, data: candidates})
  } catch (error) {
    res.status(500).json({success: false, message: "Server error"})
  }
}
// Creating a new candidate
export const createCandidate = async (req, res) => {
  const candidate = req.body

  // Validate required fields
  if (!candidate.firstName || !candidate.lastName || !candidate.positionId || !candidate.electionId) {
    return res.status(400).json({ success: false, message: "Please provide all required fields." })
  }

  try {
    // Check if candidate already exists for this position
    const existingCandidate = await Candidate.findOne({
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      positionId: candidate.positionId,
      electionId: candidate.electionId
    })

    if (existingCandidate) {
      return res.status(400).json({ 
        success: false, 
        message: "A candidate with this name already exists for this position." 
      })
    }

    // Create the new candidate
    const newCandidate = new Candidate(candidate)
    await newCandidate.save()
    
    res.status(201).json({ success: true, data: newCandidate })
  } catch (error) {
    console.error("Error in creating candidate:", error.message)
    res.status(500).json({ success: false, message: "Server Error" })
  }
}
// Updating a candidate
export const updateCandidate = async (req, res) => {
  const {id} = req.params
  const candidate = req.body
  if (!mongoose.Types.ObjectId.isValid(id)){
    return res.status(404).json({success: false, message: "Candidate not found."})
  }
  try {
    const updatedCandidate = await Candidate.findByIdAndUpdate(id, candidate, {new: true})
    res.status(200).json({success: true, data: updatedCandidate})
  } catch (error) {
    res.status(500).json({success: true, message: "Server error."})
  }
}
// Deleting a candidate
export const deleteCandidate = async (req, res) => {
  const {id} = req.params
  try {
    await Candidate.findByIdAndDelete(id);
    res.status(200).json({success: true, message: "Candidate deleted."})
  } catch (error) {
    res.status(404).json({success: false, message: "Candidate not found."})
  }
  
}