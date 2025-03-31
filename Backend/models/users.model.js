import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName:{
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate emails
    lowercase: true, // Converts to lowercase
    trim: true, // Removes spaces before & after
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address"
    ]
  },
  password: {
    type: String,
    required: true
  },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,  // Reference to Election model
    ref: "Election",
    required: true
  },
  level: {
    type: String,
    enum: ["lower", "upper"],  // Restricting values
    required: true
  }
}, {
  timestamps: true
})

const User = mongoose.model('Users', userSchema)

export default User