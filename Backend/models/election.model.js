import mongoose from "mongoose";

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed"],
    default: "upcoming"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SuperAdmin",
    required: true
  }
})

const Election = mongoose.model('Election', electionSchema);

export default Election