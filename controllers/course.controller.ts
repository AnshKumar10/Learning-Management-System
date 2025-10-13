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
      message: 'Course created successfully.',
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
  async (_: Request, response: Response) => {
    const courses = await Course.find({
      isPublished: true
    }).populate({
      path: 'lectures',
      select: 'title description'
    });

    sendSuccessResponse({
      response,
      message: 'All published courses fetched successfully.',
      data: courses
    });
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
      message: 'Your created courses fetched successfully.'
    });
  }
);

/**
 * Update course details
 * @route PATCH /api/v1/courses/:courseId
 */
export const updateCourseDetails: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const { courseId } = request.params;

    const payload = request.body;

    const course = await Course.findByIdAndUpdate(courseId, payload, {
      new: true,
      runValidators: true
    });

    if (!course) {
      return sendErrorResponse({
        response,
        message: 'Course not found.'
      });
    }

    sendSuccessResponse({
      response,
      message: 'Course details updated successfully.',
      data: course
    });
  }
);

/**
 * Get course by ID
 * @route GET /api/v1/courses/:courseId
 */
export const getCourseDetails: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const { courseId } = request.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return sendErrorResponse({
        response,
        message: 'Course not found.'
      });
    }

    const result = await course.populate([
      { path: 'enrolledStudents', select: 'name avatar' },
      { path: 'lectures', select: 'title description' }
    ]);

    sendSuccessResponse({
      response,
      message: 'Course details fetched successfully.',
      data: result
    });
  }
);

/**
 * Add lecture to course
 * @route POST /api/v1/courses/:courseId/lectures
 */
export const addLectureToCourse: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const { courseId } = request.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return sendErrorResponse({
        response,
        message: 'Course not found.'
      });
    }

    const instructorId = request.id;

    if (course.instructor.toString() !== instructorId) {
      return sendErrorResponse({
        response,
        message: 'You are not authorized to add lectures to this course.'
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
      message: 'Lecture added successfully to the course.',
      data: course.lectures
    });
  }
);

/**
 * Get course lectures
 * @route POST /api/v1/courses/:courseId/lectures
 */
export const getCourseLectures: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const { courseId } = request.params;

    const course = await Course.findById(courseId).select('lectures');

    if (!course) {
      return sendErrorResponse({
        response,
        message: 'Course not found.'
      });
    }

    const result = await course.populate({
      path: 'lectures'
    });

    sendSuccessResponse({
      response,
      data: result,
      message: 'Course lectures fetched successfully.'
    });
  }
);
