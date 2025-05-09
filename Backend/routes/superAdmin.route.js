import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getSuperAdmins,
  signupSuperAdmin,
  loginSuperAdmin,
  updateSuperAdmin,
  deleteSuperAdmin,
  approveAdmin,
  rejectAdmin,
  uploadStudentIdsExcel
} from "../controllers/superAdmin.controllers.js";
import { protect, isSuperAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed!'), false);
    }
  }
});

// uploading studentsid through an Excel StyleSheet.
router.post('/upload-student-ids', protect, isSuperAdmin, upload.single('file'), uploadStudentIdsExcel);
router.post("/signup", signupSuperAdmin);// Create SuperAdmin via Google
router.post("/login", loginSuperAdmin); // Login via Google
router.get("/", getSuperAdmins);
router.put("/:id", protect, isSuperAdmin, updateSuperAdmin);
router.delete("/:id", protect, isSuperAdmin, deleteSuperAdmin);

// Admin approval routes
router.put("/approve/:adminId", protect, isSuperAdmin, approveAdmin);
router.put("/reject/:adminId", protect, isSuperAdmin, rejectAdmin);


export default router;
