import express from "express";
import { createElections, deleteElection, getElections, updateElection, deleteAllElections, getElectionResults } from "../controllers/election.controllers.js";
const router = express.Router();

//Displaying all the elections
router.get('/', getElections)

// Get election results
router.get('/:id/results', getElectionResults)

// Creating a new election
router.post('/', createElections)

// Updating the election
router.put('/:id', updateElection)

// Delete all elections (superAdmin only)
router.delete('/delete-all', deleteAllElections)

// Deleting the election
router.delete('/:id', deleteElection)

export default router