import { Course } from '@/models/course.model';
import { Lecture } from '@/models/lecture.model';
import { User } from '@/models/user.model';
import { CourseModelType } from '@/types/course';
import { uploadMedia } from '@/utils/cloudinary';
import {
  sendErrorResponse,
  sendSuccessResponse
} from '@/utils/responseHandler';
import { CreateCourseType, UpdateCourseType } from '@/validations/course';
import { CreateLectureType } from '@/validations/lecture';
import { catchAsync } from '@middlewares/error.middleware';
import type { Request, RequestHandler, Response } from 'express';
import { FilterQuery, SortOrder } from 'mongoose';

/**
 * Create a new course
 * @route POST /api/v1/courses
 */
export const createNewCourse: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const {
      title = '',
      subtitle = '',
      description = '',
      category = '',
      level = '',
      price = 0
    } = request.body as CreateCourseType;

    const instructorId = request.id;

    const thumbnail = await uploadMedia(request);

    if (!thumbnail) {
      return sendErrorResponse({
        response,
        message: 'Failed to upload thumbnail'
      });
    }

    const course = await Course.create({
      title,
      subtitle,
      description,
      category,
      level,
      price,
      thumbnail: thumbnail.public_id,
      instructor: instructorId
    });

    await User.findByIdAndUpdate(instructorId, {
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
 * @route GET /api/v1/course/search
 */
export const searchCourses: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const {
      query = '',
      categories = [],
      level = '',
      priceRange = '',
      sortBy = 'newest'
    } = request.query;

    const categoryArray = Array.isArray(categories)
      ? categories
      : categories?.length
        ? [categories]
        : [];

    const searchCriteria: FilterQuery<CourseModelType> = {
      isPublished: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { subtitle: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    };

    if (categoryArray.length) searchCriteria.category = { $in: categoryArray };

    if (level) searchCriteria.level = level;

    if (priceRange) {
      const [minStr, maxStr] = (priceRange as string).split('-');
      const min = parseFloat(minStr || '0') || 0;
      const max = parseFloat(maxStr || '') || Infinity;

      searchCriteria.price = { $gte: min, $lte: max };
    }

    const sortOptions: Record<string, SortOrder> = {};
    switch (sortBy) {
      case 'price-low':
        sortOptions.price = 1;
        break;
      case 'price-high':
        sortOptions.price = -1;
        break;
      case 'oldest':
        sortOptions.createdAt = 1;
        break;
      default:
        sortOptions.createdAt = -1;
        break;
    }

    const courses = await Course.find(searchCriteria)
      .populate([
        { path: 'instructor', select: 'name avatar' },
        { path: 'lectures', select: 'title description' }
      ])
      .sort(sortOptions);

    sendSuccessResponse({
      response,
      message: 'Courses fetched successfully.',
      data: courses
    });
  }
);

/**
 * Get all published courses
 * @route GET /api/v1/courses/published
 */
export const getPublishedCourses: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const page = parseInt((request.query.page as string) || '1', 10);
    const limit = parseInt((request.query.limit as string) || '10', 10);

    const courses = await Course.aggregate([
      { $match: { isPublished: true } },
      {
        $lookup: {
          from: 'lectures',
          localField: 'lectures',
          foreignField: '_id',
          as: 'lectures'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'instructor',
          foreignField: '_id',
          as: 'instructor'
        }
      },
      {
        $addFields: {
          lectures: {
            $map: {
              input: '$lectures',
              as: 'lecture',
              in: {
                title: '$$lecture.title',
                description: '$$lecture.description'
              }
            }
          },
          instructors: {
            $map: {
              input: '$instructor',
              as: 'instructor',
              in: {
                name: '$$instructor.name',
                email: '$$instructor.email'
              }
            }
          }
        }
      },
      {
        $facet: {
          metadata: [{ $count: 'totalCount' }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }]
        }
      }
    ]);

    sendSuccessResponse({
      response,
      message: 'All published courses fetched successfully.',
      data: {
        metadata: {
          totalCount: courses?.[0].metadata[0].totalCount,
          page,
          limit
        },
        data: courses?.[0]?.data
      }
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

    const courses = await Course.find({ instructor: instructorId }).populate([
      { path: 'enrolledStudents', select: 'name avatar' },
      { path: 'lectures', select: 'title description' }
    ]);

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
    const { courseId = '' } = request.params;

    const payload = request.body as UpdateCourseType;

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
    const { courseId = '' } = request.params;

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
    const { courseId = '' } = request.params;

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

    const video = await uploadMedia(request);

    if (!video) {
      return sendErrorResponse({
        response,
        message: 'Failed to upload video'
      });
    }

    const {
      title = '',
      description = '',
      isPreview = false
    } = request.body as CreateLectureType;

    const lecture = await Lecture.create({
      title,
      description,
      isPreview,
      order: course.lectures.length + 1,
      videoUrl: video.secure_url,
      publicId: video.public_id,
      duration: video.duration || 0
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
    const { courseId = '' } = request.params;

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
