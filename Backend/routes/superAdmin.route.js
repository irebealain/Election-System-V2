import express from "express";
import { createSuperAdmin, deleteSuperAdmin, getSuperAdmins, updateSuperAdmin } from "../controllers/superAdmin.controllers.js";

const router = express.Router();

//Displaying all the superAdmin
router.get('/', getSuperAdmins)
// Creating a new superAdmin
router.post('/', createSuperAdmin)
// Updating a superAdmin
router.put('/:id', updateSuperAdmin)
// Deleting superAdmin
router.delete('/:id', deleteSuperAdmin)

export default router