import express from "express";
import { 
  createElection, 
  deleteElection, 
  getElections, 
  updateElection,
  deleteAllElections 
} from "../controllers/election.controllers.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get all elections
router.get('/', getElections)

// Create a new election
router.post('/', verifyToken, createElection)

// Update an election
router.put('/:id', verifyToken, updateElection)

// Delete an election
router.delete('/:id', verifyToken, deleteElection)

// Delete all elections (superAdmin only)
router.delete('/delete-all', verifyToken, deleteAllElections)

export default router; 