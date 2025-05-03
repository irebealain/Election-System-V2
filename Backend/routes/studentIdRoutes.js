import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  uploadStudentIds,
  getStudentIds,
  validateStudentId,
  markStudentIdAsUsed
} from '../controllers/studentIdController.js';

const router = express.Router();

// Protected routes (superadmin only)
router.post('/upload', auth, uploadStudentIds);
router.get('/:electionId', auth, getStudentIds);

export default router; 