import mongoose from "mongoose";

const superAdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          // Only enforce email domain restriction in production
          if (process.env.NODE_ENV === "production") {
            return /^[a-zA-Z0-9._%+-]+@asyv\.org$/.test(value);
          }
          // In non-production environments, just ensure it's a valid email format
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
        },
        message: (props) => {
          if (process.env.NODE_ENV === "production") {
            return "Email must be an organizational email (e.g., @asyv.org)";
          }
          return "Please provide a valid email address";
        },
      },
    },
    googleId: {
      type: String, // Unique Google user ID
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "superAdmin",
    },
  },
  { timestamps: true }
);

const SuperAdmin = mongoose.model("superAdmins", superAdminSchema);

export default SuperAdmin;
