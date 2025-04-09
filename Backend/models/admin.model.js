import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  firstName: {
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
  },
  googleId: {
    type: String,
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    default: "admin",
  },
  electionId :{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Elections",
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SuperAdmins",
    required: true
  }
}, {timestamps: true})

const Admin = mongoose.model("Admins", adminSchema)

export default Admin