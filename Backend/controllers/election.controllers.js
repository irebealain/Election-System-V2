import mongoose from "mongoose";
import Election from "../models/election.model.js";
import Position from "../models/postion.model.js";
import Candidate from "../models/candidate.model.js";
import Vote from "../models/votes.model.js";
import StudentId from "../models/studentId.model.js";
import User from "../models/users.model.js";
import fs from 'fs';
import path from 'path';

// Getting all the elections
export const getElections = async (req, res) => {
  try {
    // Update statuses before fetching
    await updateElectionStatuses()
    
    const elections = await Election.find()
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: elections,
    })
  } catch (error) {
    console.error("Error fetching elections:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch elections",
      error: error.message,
    })
  }
}

// Function to update election statuses
const updateElectionStatuses = async () => {
  try {
    const now = new Date()
    const elections = await Election.find({
      $or: [
        { status: "upcoming" },
        { status: "ongoing" }
      ]
    })

    for (const election of elections) {
      if (election.endDate <= now) {
        election.status = "completed"
        await election.save()
        
        // Mark all student IDs for this election as used
        await StudentId.updateMany(
          { electionId: election._id, status: 'available' },
          { status: 'used' }
        )
      } else if (election.startDate <= now && election.endDate > now) {
        election.status = "ongoing"
        await election.save()
      }
    }
  } catch (error) {
    console.error("Error updating election statuses:", error)
  }
}

// Creating a new election
export const createElections = async (req, res) => {
  const election = req.body

  // Validate required fields
  if (!election.title || !election.startDate || !election.endDate || !election.createdBy) {
    return res.status(400).json({ success: false, message: "Please provide all required fields." })
  }

  // Parse and validate the dates
  const parsedStartDate = new Date(election.startDate)
  const parsedEndDate = new Date(election.endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Normalize today's date

  if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
    return res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD." })
  }

  // Prevent past dates for start date
  if (parsedStartDate < today) {
    return res.status(400).json({ success: false, message: "Start date cannot be in the past." })
  }

  // Ensure end date is after start date
  if (parsedEndDate <= parsedStartDate) {
    return res.status(400).json({ success: false, message: "End date must be after start date." })
  }

  try {
    // Check for duplicates (by title and startDate)
    const existingElection = await Election.findOne({
      title: election.title,
      startDate: parsedStartDate,
    })

    if (existingElection) {
      return res.status(400).json({ success: false, message: "Election with this title and date already exists." })
    }

    // Create the new election
    const newElection = new Election({
      title: election.title,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      createdBy: election.createdBy,
    })

    await newElection.save()
    res.status(201).json({ success: true, data: newElection });
  } catch (error) {
    console.error("Error in creating election:", error.message);
    res.status(500).json({ success: false, message: "Server Error" })
  }
}

// Updating a election
export const updateElection = async (req, res) => {
  const { id } = req.params
  const updates = req.body

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Election not found." })
  }

  try {
    const updatedElection = await Election.findByIdAndUpdate(id, updates, { new: true })
    res.status(200).json({ success: true, data: updatedElection })
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." })
  }
}

// Deleting a election
export const deleteElection = async (req, res) => {
  const {id} = req.params
  try {
    // Delete the election
    const deletedElection = await Election.findByIdAndDelete(id)
    
    if (!deletedElection) {
      return res.status(404).json({success: false, message: "Election not found."})
    }

    // Delete all associated positions
    await Position.deleteMany({ electionId: id });
    
    // Delete all associated candidates
    await Candidate.deleteMany({ electionId: id });
    
    // Delete all associated votes
    await Vote.deleteMany({ electionId: id });

    // Delete all associated student IDs
    await StudentId.deleteMany({ electionId: id });

    // Remove studentId field for all users associated with this election
    await User.updateMany(
      { electionId: id },
      { $unset: { studentId: "" } }
    );

    // Delete associated Excel files from uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(file => {
        // Check if the file is an Excel file and contains the election ID in its name
        if (file.endsWith('.xlsx') || file.endsWith('.xls')) {
          const filePath = path.join(uploadsDir, file);
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error(`Error deleting file ${file}:`, err);
          }
        }
      });
    }

    res.status(200).json({
      success: true, 
      message: "Election and all associated data have been deleted successfully."
    })
  } catch (error) {
    console.error("Error deleting election:", error);
    res.status(500).json({
      success: false, 
      message: "Failed to delete election and associated data."
    })
  }
}

// Delete all elections
export const deleteAllElections = async (req, res) => {
  try {
    // Check if user is superAdmin from request body
    if (req.body.role !== "superAdmin") {
      return res.status(403).json({ 
        success: false, 
        message: "Only super admins can delete all elections" 
      });
    }

    // Delete all elections
    await Election.deleteMany({});
    
    // Delete all associated positions
    await Position.deleteMany({});
    
    // Delete all associated candidates
    await Candidate.deleteMany({});
    
    // Delete all associated votes
    await Vote.deleteMany({});

    // Delete all associated studentIds
    await StudentId.deleteMany({});
    
    res.status(200).json({ 
      success: true, 
      message: "All elections and associated data have been deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting all elections:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete all elections" 
    });
  }
};