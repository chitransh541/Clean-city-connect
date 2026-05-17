import express from 'express';
import { upload } from '../config/cloudinary.js';
import { authMiddleware, officerOnly } from '../middlewares/authMiddleware.js';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  getRewardsHistory,
  getPublicStats,
  getPublicComplaints,
  analyzeMedia,
} from '../controllers/complaintsController.js';

const router = express.Router();

// ─── Public routes (no auth) ───
router.get('/stats', getPublicStats);
router.get('/map', getPublicComplaints);

// ─── Protected routes (require login) ───
router.post(
  '/',
  authMiddleware,
  upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'video', maxCount: 1 }]),
  createComplaint
);
router.post(
  '/analyze',
  authMiddleware,
  upload.fields([{ name: 'photo', maxCount: 1 }]),
  analyzeMedia
);
router.get('/', authMiddleware, getComplaints);
router.get('/rewards', authMiddleware, getRewardsHistory);
router.get('/:id', authMiddleware, getComplaintById);

// ─── Officer-only routes ───
router.put('/:id/status', authMiddleware, officerOnly, updateComplaintStatus);

export default router;
