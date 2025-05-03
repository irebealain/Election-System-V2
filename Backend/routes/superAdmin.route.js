import express from "express";
import {
  getSuperAdmins,
  signupSuperAdmin,
  loginSuperAdmin,
  updateSuperAdmin,
  deleteSuperAdmin,
  approveAdmin,
  rejectAdmin,
} from "../controllers/superAdmin.controllers.js";
import { protect, isSuperAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", signupSuperAdmin);// Create SuperAdmin via Google
router.post("/login", loginSuperAdmin); // Login via Google
router.get("/", getSuperAdmins);
router.put("/:id", protect, isSuperAdmin, updateSuperAdmin);
router.delete("/:id", protect, isSuperAdmin, deleteSuperAdmin);

// Admin approval routes
router.put("/approve/:adminId", protect, isSuperAdmin, approveAdmin);
router.put("/reject/:adminId", protect, isSuperAdmin, rejectAdmin);

export default router;
