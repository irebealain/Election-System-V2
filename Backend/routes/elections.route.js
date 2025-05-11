import express from "express";
import { createElections, deleteElection, getElections, updateElection, deleteAllElections } from "../controllers/election.controllers.js";
const router = express.Router();

//Displaying all the elections
router.get('/', getElections)
// Creating a new election
router.post('/', createElections)
// Updating the election
router.put('/:id', updateElection)
// Delete all elections (superAdmin only)
router.delete('/delete-all', deleteAllElections)
// Deleting the election
router.delete('/:id', deleteElection)

export default router