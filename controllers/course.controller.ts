import { Course } from '@/models/course.model';
import { User } from '@/models/user.model';
import { sendSuccessResponse } from '@/utils/responseHandler';
import { catchAsync } from '@middlewares/error.middleware';
import type { Request, RequestHandler, Response } from 'express';

/**
 * Create a new course
 * @route POST /api/v1/courses
 */
export const createNewCourse: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const { title, subtitle, description, category, level, price } =
      request.body;

    const userId = request.id;

    const course = await Course.create({
      title,
      subtitle,
      description,
      category,
      level,
      price,
      thumbnail: 'WILL ADD LATER',
      instructor: userId
    });

    await User.findByIdAndUpdate(userId, {
      $push: { createdCourses: course._id }
    });

    sendSuccessResponse({
      response,
      message: 'Course created Successfully',
      data: { id: course.id, title }
    });
  }
);

/**
 * Search courses with filters
 * @route GET /api/v1/courses/search
 */
export const searchCourses: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    // TODO: Implement search courses functionality
  }
);

/**
 * Get all published courses
 * @route GET /api/v1/courses/published
 */
export const getPublishedCourses: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    // TODO: Implement get published courses functionality
  }
);

/**
 * Get courses created by the current user
 * @route GET /api/v1/courses
 */
export const getMyCreatedCourses: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    // TODO: Implement get my created courses functionality
  }
);

/**
 * Update course details
 * @route PATCH /api/v1/courses/:courseId
 */
export const updateCourseDetails: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    // TODO: Implement update course details functionality
  }
);

/**
 * Get course by ID
 * @route GET /api/v1/courses/:courseId
 */
export const getCourseDetails: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    // TODO: Implement get course details functionality
  }
);

/**
 * Add lecture to course
 * @route POST /api/v1/courses/:courseId/lectures
 */
export const addLectureToCourse: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    // TODO: Implement add lecture to course functionality
  }
);

/**
 * Get course lectures
 * @route GET /api/v1/courses/:courseId/lectures
 */
export const getCourseLectures: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    // TODO: Implement get course lectures functionality
  }
);
