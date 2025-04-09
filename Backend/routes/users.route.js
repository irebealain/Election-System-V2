import express from "express";
import {deleteUser, getUsers, updateUser, userLogin, userSignup } from "../controllers/users.controllers.js";

const router = express.Router();

//Displaying all the users
router.get('/', getUsers)
// Creating a new user
router.post('/signup', userSignup)
// Login user
router.post('/login', userLogin)
// Updating the user
router.put('/:id', updateUser)
// Deleting user
router.delete('/:id', deleteUser)

export default router