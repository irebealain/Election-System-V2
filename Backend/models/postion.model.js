import mongoose from "mongoose";

const positionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Election",
    required: true
  }
})

const Position = mongoose.model("Positions", positionSchema)

export default Position