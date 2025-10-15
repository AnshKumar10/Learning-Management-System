import { catchAsync } from '@/middlewares/error.middleware';
import { uploadMedia } from '@/utils/cloudinary';
import {
  sendErrorResponse,
  sendSuccessResponse
} from '@/utils/responseHandler';
import { RequestHandler } from 'express';

/**
 * Upload a video
 * @route POST /api/v1/media/upload-video
 */
export const uploadVideo: RequestHandler = catchAsync(
  async (request, response) => {
    const result = await uploadMedia(request);

    if (!result) {
      return sendErrorResponse({
        response,
        message: 'Failed to upload video'
      });
    }

    sendSuccessResponse({
      response,
      message: 'Video uploaded successfully',
      data: result
    });
  }
);
