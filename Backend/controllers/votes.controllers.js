import mongoose from "mongoose";
import Candidate from "../models/candidate.model.js";
import Election from "../models/election.model.js";
import Position from "../models/postion.model.js";
import Vote from "../models/votes.model.js";

// Getting all the votes
export const getVotes = async (req, res) => {
  try {
    const votes = await Vote.find({})
    res.status(200).json({success: true, data: votes})
  } catch (error) {
    res.status(500).json({success: false, message: "Server error"})
  }
}
// Casting a new vote.
export const createVotes = async (req, res) => {
  const vote = req.body
  if (!vote.studentId || !vote.candidateId || !vote.positionId ||!vote.electionId){
    return res.status(400).json({success: false, message: "Please provide all the fields."})
  }
  try {
    // Validating if the student has already voted in this election
    const existingVote = await Vote.findOne({ studentId: vote.studentId, electionId: vote.electionId });
    
    if (existingVote) {
      return res.status(400).json({ success: false, message: "Student has already voted in this election." });
    }
    const position = await Position.findById(vote.positionId)
    // Validating the position of the vote
    if (!position) {
      return res.status(400).json({success: false, message: "Position not found."})
    }
    // Checking the election status
    const election = await Election.findById(vote.electionId)
    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found." })
    }
    if (election.status === "completed") {
      return res.status(400).json({ success: false, message: "You cannot register for a completed election." });
    }
    const newVote = new Vote(vote)
    await newVote.save()
    res.status(201).json({success: true, data: newVote})
  } catch (error) {
    console.error("Error in created vote:", error.message)
    res.status(500).json({success: false, message: "Server Error"})
  }
}
// Updating a vote
export const updateVote = async (req, res) => {
  const {id} = req.params
  const vote = req.body
  if (!mongoose.Types.ObjectId.isValid(id)){
    return res.status(404).json({success: false, message: "vote not found."})
  }
  try {
    const updatedVote = await vote.findByIdAndUpdate(id, vote, {new: true})
    res.status(200).json({success: true, data: updatedVote})
  } catch (error) {
    res.status(500).json({success: true, message: "Server error."})
  }
}
// Deleting a vote
export const deleteVote = async (req, res) => {
  const {id} = req.params
  try {
    await Vote.findByIdAndDelete(id);
    res.status(200).json({success: true, message: "Vote deleted."})
  } catch (error) {
    res.status(404).json({success: false, message: "Vote not found."})
  }
  
}