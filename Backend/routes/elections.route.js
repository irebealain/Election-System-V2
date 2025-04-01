import express from "express";
import { createElections, deleteElection, getElections, updateElection } from "../controllers/election.controllers.js";

const router = express.Router();

//Displaying all the election
router.get('/', getElections)
// Creating a new election
router.post('/', createElections)
// Updating the Election
router.put('/:id', updateElection)
// Deleting election
router.delete('/:id', deleteElection)

export default router