import express from "express";
import {
  getSuperAdmins,
  signupSuperAdmin,
  loginSuperAdmin,
  updateSuperAdmin,
  deleteSuperAdmin,
  approveAdmin,
} from "../controllers/superAdmin.controllers.js";
import { protect, isSuperAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", signupSuperAdmin);// Create SuperAdmin via Google
router.post("/login", loginSuperAdmin); // Login via Google
router.get("/", getSuperAdmins);
router.put("/:id", protect, isSuperAdmin, updateSuperAdmin);
router.delete("/:id", protect, isSuperAdmin, deleteSuperAdmin);
router.put("/approve/:adminId", protect, isSuperAdmin, approveAdmin); // Admin approval

export default router;
