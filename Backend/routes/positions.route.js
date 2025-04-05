import express from "express";
import { createPositions, deletePosition, getPositions, updatePosition } from "../controllers/position.controllers.js";

const router = express.Router();

//Displaying all the Position
router.get('/', getPositions)
// Creating a new position
router.post('/', createPositions)
// Updating the position
router.put('/:id', updatePosition)
// Deleting position
router.delete('/:id', deletePosition)

export default router