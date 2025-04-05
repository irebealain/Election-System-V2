import express from "express";
import { createVotes, deleteVote, getVotes, updateVote } from "../controllers/votes.controllers.js";

const router = express.Router();

//Displaying all the votes
router.get('/', getVotes)
// Creating a new votes
router.post('/', createVotes)
// Updating the votes
router.put('/:id', updateVote)
// Deleting votes
router.delete('/:id', deleteVote)

export default router