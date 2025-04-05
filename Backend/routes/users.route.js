import express from "express";
import { createUsers, deleteUser, getUsers, updateUser } from "../controllers/users.controllers.js";

const router = express.Router();

//Displaying all the users
router.get('/', getUsers)
// Creating a new user
router.post('/', createUsers)
// Updating the user
router.put('/:id', updateUser)
// Deleting user
router.delete('/:id', deleteUser)

export default router