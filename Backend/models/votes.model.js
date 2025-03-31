import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidates",
    required: true
  },
  positionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Positions",
    required: true
  },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Election",
    required: true
  },
})

const Vote = mongoose.model("Votes", voteSchema)
export default Vote