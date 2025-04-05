import mongoose from "mongoose";

const superAdminSchema = new mongoose.Schema({
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
  profilePic: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
})

const SuperAdmin = mongoose.model("superAdmins", superAdminSchema)

export default SuperAdmin