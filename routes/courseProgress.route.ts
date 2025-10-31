import express from 'express';
import { isAuthenticated } from '@middlewares/auth.middleware';
import {
  getCourseProgress,
  updateLectureProgress,
  markCourseAsCompleted,
  resetCourseProgress
} from '@controllers/courseProgress.controller';

const router = express.Router();

// Get course progress
router.get('/:courseId', isAuthenticated, getCourseProgress);

// Update lecture progress
router.patch(
  '/:courseId/lectures/:lectureId',
  isAuthenticated,
  updateLectureProgress
);

// Mark course as completed
router.patch('/:courseId/complete', isAuthenticated, markCourseAsCompleted);

// Reset course progress
router.patch('/:courseId/reset', isAuthenticated, resetCourseProgress);

export default router;
