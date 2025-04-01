import express from "express";
import { createAdmin, deleteAdmin, getAdmins, updateAdmin } from "../controllers/admin.controllers.js";
const router = express.Router();

//Displaying all the admin
router.get('/', getAdmins)
// Creating a new admin
router.post('/', createAdmin)
// Updating the admin
router.put('/:id', updateAdmin)
// Deleting admin
router.delete('/:id', deleteAdmin)

export default router