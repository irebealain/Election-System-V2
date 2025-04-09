import mongoose from "mongoose";

const superAdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@asyv\.org$/, // Only org emails
      "Email must be an organizational email (e.g., @asyv.org)"
    ]
  },
  googleId: {
    type: String, // Unique Google user ID
    required: true
  },
  profilePic: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    default: "superAdmin"
  }
}, { timestamps: true });

const SuperAdmin = mongoose.model("superAdmins", superAdminSchema)

export default SuperAdmin