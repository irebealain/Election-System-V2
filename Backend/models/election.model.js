import mongoose from "mongoose";

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Election title is required"],
    trim: true,
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
  },
  endDate: {
    type: Date,
    required: [true, "End date is required"],
  },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed"],
    default: "upcoming",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "superAdmins",
    required: true,
  },
}, {
  timestamps: true,
})

// Add a pre-save middleware to update status based on dates
electionSchema.pre('save', function(next) {
  const now = new Date()
  if (this.endDate <= now) {
    this.status = "completed"
  } else if (this.startDate <= now && this.endDate > now) {
    this.status = "ongoing"
  } else {
    this.status = "upcoming"
  }
  next()
})

const Election = mongoose.model('Election', electionSchema);

export default Election