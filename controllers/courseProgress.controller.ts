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
      .select('lectures')
      .populate('lectures');

    if (!courseDetails) {
      return sendErrorResponse({
        response,
        message: 'Course not found.'
      });
    }

    const courseProgress = await CourseProgress.findOne({
      course: courseId,
      user: request?.user?.id
    })
      .populate('course')
      .populate({
        path: 'lectureProgress',
        populate: {
          path: 'lecture',
          model: 'Lecture'
        }
      });

    if (!courseProgress) {
      return sendSuccessResponse({
        response,
        message: 'Course progress fetched successfully.',
        data: {
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
    const { courseId, lectureId } = request.params;

    const userId = request?.user?.id;

    let courseProgress = await CourseProgress.findOne({
      course: courseId,
      user: userId
    });

    if (!courseProgress) {
      courseProgress = await CourseProgress.create({
        user: userId,
        course: courseId,
        isCompleted: false,
        lectureProgress: []
      });
    }

    const lectureIndex = courseProgress.lectureProgress.findIndex(
      (lecture) => String(lecture.lecture) === lectureId
    );

    if (lectureIndex !== -1 && courseProgress.lectureProgress[lectureIndex]) {
      courseProgress.lectureProgress[lectureIndex].isCompleted = true;
    } else {
      courseProgress.lectureProgress.push({
        lecture: lectureId,
        isCompleted: true
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return sendErrorResponse({
        response,
        message: 'Course not found.'
      });
    }

    const completedLectures = courseProgress.lectureProgress.filter(
      (progress) => progress.isCompleted
    ).length;

    courseProgress.isCompleted = course.lectures.length === completedLectures;

    await courseProgress.save();

    sendSuccessResponse({
      response,
      message: 'Course progress updated successfully.',
      data: {
        lectureProgress: courseProgress.lectureProgress,
        isCompleted: courseProgress.isCompleted
      }
    });
  }
);

/**
 * Mark entire course as completed
 * @route PATCH /api/v1/progress/:courseId/complete
 */
export const markCourseAsCompleted: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const { courseId } = request.params;

    const courseProgress = await CourseProgress.findOne({
      course: courseId,
      user: request.id
    });

    if (!courseProgress) {
      return sendErrorResponse({
        response,
        message: 'Course progress not found.'
      });
    }

    courseProgress.lectureProgress.forEach((progress) => {
      progress.isCompleted = true;
      progress.watchTime = 100;
    });

    courseProgress.isCompleted = true;

    await courseProgress.save();

    sendSuccessResponse({
      response,
      message: 'Course marked as completed.',
      data: courseProgress
    });
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
