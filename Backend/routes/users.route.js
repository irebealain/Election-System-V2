import express from "express";
import {deleteUser, getUsers, googleUserLogin, googleUserSignup, updateUser, userLogin, userSignup, deleteAllStudents } from "../controllers/users.controllers.js";
import { isAdmin, protect } from "../middlewares/auth.js";

const router = express.Router();

//Displaying all the users
router.get('/', getUsers)

// Deleting all students (superadmin only)
router.delete('/all-students', protect, isAdmin, deleteAllStudents)

// Creating a new user
router.post('/signup', userSignup)
//User Signup using Google Auth
router.post('/auth/signup', googleUserSignup)
// Login user
router.post('/login', userLogin)
// User login using Google Auth
router.post('/auth/login', googleUserLogin)
// Updating the user
router.put('/:id',protect, isAdmin, updateUser)
// Deleting user
router.delete('/:id', protect, isAdmin, deleteUser)

export default router