import express from 'express';
import { isAuthenticated, restrictTo } from '@middlewares/auth.middleware';
import {
  createNewCourse,
  searchCourses,
  getPublishedCourses,
  getMyCreatedCourses,
  updateCourseDetails,
  getCourseDetails,
  addLectureToCourse,
  getCourseLectures
} from '@controllers/course.controller';
import upload from '@utils/multer';
import { validateRequestPayload } from '@/middlewares/validation.middleware';
import { createCourseSchema, updateCourseSchema } from '@/validations/course';
import { createLectureSchema } from '@/validations/lecture';

const router = express.Router();

// Public routes
router.get('/published', getPublishedCourses);
router.get('/search', searchCourses);

// Protected routes
router.use(isAuthenticated);

// Course management
router
  .route('/')
  .post(
    restrictTo('instructor'),
    validateRequestPayload(createCourseSchema),
    upload.single('thumbnail'),
    createNewCourse
  )
  .get(restrictTo('instructor'), getMyCreatedCourses);

// Course details and updates
router
  .route('/c/:courseId')
  .get(getCourseDetails)
  .patch(
    restrictTo('instructor'),
    validateRequestPayload(updateCourseSchema),
    updateCourseDetails
  );

// Lecture management
router
  .route('/c/:courseId/lectures')
  .get(getCourseLectures)
  .post(
    restrictTo('instructor'),
    validateRequestPayload(createLectureSchema),
    addLectureToCourse
  );

export default router;
