import express from "express";
import { getCandidates, createCandidate, updateCandidate, deleteCandidate } from "../controllers/candidate.controllers.js";

const router = express.Router();

//Displaying all the candidates
router.get('/', getCandidates)
// Creating a new Candidatess
router.post('/', createCandidate)
// Updating the Candidatess
router.put('/:id', updateCandidate)
// Deleting Candidatess
router.delete('/:id', deleteCandidate)

export default router