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
export const createCandidates = async (req, res) => {
  const candidate = req.body

  if (!candidate.firstName || !candidate.lastName || !candidate.profilePic || !candidate.mandate ||!candidate.positionId || !candidate.electionId){
    return res.status(400).json({success: false, message: "Please provide all the fields."})
  }
  try {
    const position = await Position.findById(candidate.positionId)
    // Validating the position of the candidate
    if (!position) {
      return res.status(400).json({success: false, message: "Position not found."})
    }
    // Checking the election status
    const election = await Election.findById(candidate.electionId)
    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found." })
    }
    if (election.status === "completed") {
      return res.status(400).json({ success: false, message: "You cannot register for a completed election." });
    }
    const newCandidate = new Candidate(candidate)
    await newCandidate.save()
    res.status(201).json({success: true, data: newCandidate})
  } catch (error) {
    console.error("Error in created candidate:", error.message)
    res.status(500).json({success: false, message: "Server Error"})
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