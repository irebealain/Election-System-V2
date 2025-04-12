import express from "express";
import { adminLogin, adminSignup, deleteAdmin, getAdmins, googleAdminLogin, googleAdminSignup, updateAdmin } from "../controllers/admin.controllers.js";
import { isAdmin, isSuperAdmin, protect } from "../middlewares/auth.js";
const router = express.Router();

//Displaying all the admin
router.get('/', getAdmins)
// Creating a new admin
router.post('/signup', adminSignup)
// Signup using google auth
router.post('/auth/signup', googleAdminSignup)
// Login in an admin
router.post('/login', adminLogin)
// Loging using google auth
router.post('/auth/login', googleAdminLogin)
// Updating the admin
router.put('/:id', protect, isAdmin, updateAdmin)
// Deleting admin
router.delete('/:id', protect, isAdmin, deleteAdmin)

export default router