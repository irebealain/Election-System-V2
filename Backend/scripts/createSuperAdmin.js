import mongoose from "mongoose";
import dotenv from "dotenv";
import SuperAdmin from "../models/superAdmin.model.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const createSuperAdmin = async () => {
  const email = "irebalain@gmail.com";
  const googleId = "google-oauth-id-string123456789-fake"; // Replace with real Google ID
  try {
    const existing = await SuperAdmin.findOne({ email });
    if (existing) {
      console.log("SuperAdmin already exists.");
      return process.exit(0);
    }

    const superAdmin = new SuperAdmin({
      email,
      googleId,
    });

    await superAdmin.save();
    console.log("SuperAdmin created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error creating SuperAdmin:", err.message);
    process.exit(1);
  }
};

await connectDB();
await createSuperAdmin();
