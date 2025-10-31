import { Course } from '@/models/course.model';
import { CourseProgress } from '@/models/courseProgress';
import {
  sendErrorResponse,
  sendSuccessResponse
} from '@/utils/responseHandler';
import { catchAsync } from '@middlewares/error.middleware';
import type { Request, RequestHandler, Response } from 'express';

/**
 * Get user's progress for a specific course
 * @route GET /api/v1/progress/:courseId
 */
export const getCourseProgress: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const { courseId } = request.params;

    const courseDetails = await Course.findById(courseId)
      .select('courseTitle courseThumbnail lectures')
      .populate('lectures');

    if (!courseDetails) {
      return sendErrorResponse({
        response,
        message: 'Course not found.'
      });
    }

    const courseProgress = await CourseProgress.findOne({
      course: courseId,
      user: request.user
    }).populate('course');

    if (!courseProgress) {
      return sendSuccessResponse({
        response,
        message: 'Course progress fetched successfully.',
        data: {
          courseDetails,
          progress: [],
          isCompleted: false,
          completionPercentage: 0
        }
      });
    }

    const totalLectures = courseDetails.lectures.length;

    const completedLectures = courseProgress.lectureProgress.filter(
      (progress) => progress.isCompleted
    ).length;

    const completionPercentage = Math.round(
      (completedLectures / totalLectures) * 100
    );

    sendSuccessResponse({
      response,
      message: 'Course progress fetched successfully.',
      data: {
        courseDetails,
        progress: courseProgress.lectureProgress,
        isCompleted: courseProgress.isCompleted,
        completionPercentage
      }
    });
  }
);

/**
 * Update progress for a specific lecture
 * @route PATCH /api/v1/progress/:courseId/lectures/:lectureId
 */
export const updateLectureProgress: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    // TODO: Implement update lecture progress functionality
  }
);

/**
 * Mark entire course as completed
 * @route PATCH /api/v1/progress/:courseId/complete
 */
export const markCourseAsCompleted: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    // TODO: Implement mark course as completed functionality
  }
);

/**
 * Reset course progress
 * @route PATCH /api/v1/progress/:courseId/reset
 */
export const resetCourseProgress: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    // TODO: Implement reset course progress functionality
  }
);
