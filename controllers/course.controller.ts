import { Course } from '@/models/course.model';
import { Lecture } from '@/models/lecture.model';
import { User } from '@/models/user.model';
import {
  sendErrorResponse,
  sendSuccessResponse
} from '@/utils/responseHandler';
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
    const instructorId = request.id;

    const courses = await Course.find({ instructor: instructorId })
      .populate({
        path: 'enrolledStudents',
        select: 'name avatar'
      })
      .populate({
        path: 'lectures',
        select: 'title description'
      });

    sendSuccessResponse({
      response,
      data: courses,
      message: 'Courses fetched successfully'
    });
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
    const { courseId } = request.params;

    const course = await Course.findById(courseId)
      .populate({
        path: 'enrolledStudents',
        select: 'name avatar'
      })
      .populate({
        path: 'lectures',
        select: 'title description'
      });

    sendSuccessResponse({
      response,
      data: course,
      message: 'Course fetched successfully'
    });
  }
);

/**
 * Add lecture to course
 * @route POST /api/v1/courses/:courseId/lectures
 */
export const addLectureToCourse: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const courseId = request.params.courseId;
    const instructorId = request.id;

    const course = await Course.findById(courseId);

    if (!course) {
      return sendErrorResponse({
        response,
        message: 'Course not found'
      });
    }

    if (course.instructor.toString() !== instructorId) {
      return sendErrorResponse({
        response,
        message: 'Not authorized to update this course'
      });
    }

    const { title, description, isPreview } = request.body;

    const lecture = await Lecture.create({
      title,
      description,
      isPreview,
      order: course.lectures.length + 1,
      videoUrl: 'TO BE ADDED LATER',
      publicId: 'TO BE ADDED LATER',
      duration: 0
    });

    course.lectures.push(lecture._id);
    await course.save();

    sendSuccessResponse({
      response,
      message: 'Lectures added successfully',
      data: course
    });
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
