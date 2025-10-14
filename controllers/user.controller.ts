import type { Request, RequestHandler, Response } from 'express';
import { catchAsync } from '@middlewares/error.middleware';
import crypto from 'crypto';
import {
  sendErrorResponse,
  sendSuccessResponse
} from '@/utils/responseHandler';
import { User } from '@/models/user.model';
import { generateToken } from '@/utils/generateToken';
import { STATUS_CODES } from '@/constants';
import { deleteMedia, uploadMedia } from '@/utils/cloudinary';

/**
 * Create a new user account
 * @route POST /api/v1/users/signup
 */
export const createUserAccount: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const { name, email, password } = request.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return sendErrorResponse({
        response,
        message: 'Email already in use',
        statusCode: STATUS_CODES.CONFLICT
      });
    }

    let avatarPublicId = await uploadMedia(request);

    const user = await User.create({
      name,
      email,
      password,
      avatar: avatarPublicId
    });

    generateToken(
      response,
      user,
      `Account created successfully. Welcome, ${name} !`
    );
  }
);

/**
 * Authenticate user and get token
 * @route POST /api/v1/users/signin
 */
export const signInUser: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const { email, password } = request.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      return sendErrorResponse({
        response,
        message: 'User not found',
        statusCode: STATUS_CODES.NOT_FOUND
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return sendErrorResponse({
        response,
        message: 'Invalid credentials',
        statusCode: STATUS_CODES.UNAUTHORIZED
      });
    }

    await user.updateLastActive();
    generateToken(
      response,
      user,
      `Login successful. Welcome back, ${user.name} !`
    );
  }
);

/**
 * Sign out user and clear cookie
 * @route POST /api/v1/users/signout
 */
export const signOutUser: RequestHandler = catchAsync(
  async (_: Request, response: Response) => {
    response.cookie('access_token', '', { maxAge: 0 });
    sendSuccessResponse({
      response,
      message: 'Signout successful.',
      data: null
    });
  }
);

/**
 * Get current user profile
 * @route GET /api/v1/users/profile
 */
export const getCurrentUserProfile: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const userId = request.id;

    const user = await User.findById(userId).select(
      'name email role avatar isActive bio enrolledCourses'
    );

    if (!user || !user.isActive) {
      return sendErrorResponse({
        response,
        message: 'User not found',
        statusCode: STATUS_CODES.NOT_FOUND
      });
    }

    const result = await user.populate([
      {
        path: 'enrolledCourses',
        select: 'title description thumbnail'
      }
    ]);

    sendSuccessResponse({
      response,
      message: 'User profile retrieved successfully.',
      data: result
    });
  }
);

/**
 * Update user profile
 * @route PATCH /api/v1/users/profile
 */
export const updateUserProfile: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const userId = request.id;

    const user = await User.findById(userId).select('isActive avatar name bio');

    if (!user || !user.isActive) {
      return sendErrorResponse({
        response,
        message: 'User not found',
        statusCode: STATUS_CODES.NOT_FOUND
      });
    }

    const { name, bio } = request.body;

    if (name) user.name = name;
    if (bio) user.bio = bio;

    let avatarPublicId = user?.avatar;

    user.avatar = (await uploadMedia(request)) ?? '';

    if (user.avatar && avatarPublicId !== "default-avatar.png'") {
      await deleteMedia(avatarPublicId);
    }

    await user.save();

    sendSuccessResponse({
      response,
      message: 'Profile updated successfully.',
      data: { name, bio, avatar: user.avatar }
    });
  }
);

/**
 * Change user password
 * @route PATCH /api/v1/users/password
 */
export const changeUserPassword: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const userId = request.id;

    const user = await User.findById(userId).select('+password');

    if (!user) {
      return sendErrorResponse({
        response,
        message: 'User not found',
        statusCode: STATUS_CODES.NOT_FOUND
      });
    }

    const { currentPassword, newPassword } = request.body;

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return sendErrorResponse({
        response,
        message: 'The current password you entered is incorrect.',
        statusCode: STATUS_CODES.UNAUTHORIZED
      });
    }

    user.password = newPassword;

    await user.save();

    sendSuccessResponse({
      response,
      message: 'Password updated successfully.',
      data: null
    });
  }
);

/**
 * Request password reset
 * @route POST /api/v1/users/forgot-password
 */
export const forgotPassword: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const { email } = request.body;

    const user = await User.findOne({ email });

    if (!user) {
      return sendErrorResponse({
        response,
        message: 'User not found',
        statusCode: STATUS_CODES.NOT_FOUND
      });
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    sendSuccessResponse({
      response,
      message: 'Password reset instructions have been sent to your email.',
      data: { resetToken }
    });
  }
);

/**
 * Reset password
 * @route POST /api/v1/users/reset-password/:token
 */
export const resetPassword: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const { token } = request.params;

    if (!token) {
      return sendErrorResponse({
        response,
        message: 'Token is required',
        statusCode: STATUS_CODES.NOT_FOUND
      });
    }

    const user = await User.findOne({
      resetPasswordToken: crypto
        .createHash('sha256')
        .update(token)
        .digest('hex'),
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return sendErrorResponse({
        response,
        message: 'Invalid or expired token',
        statusCode: STATUS_CODES.NOT_FOUND
      });
    }

    const { password } = request.body;

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    sendSuccessResponse({
      response,
      message: 'Your password has been reset successfully.',
      data: null
    });
  }
);

/**
 * Delete user account
 * @route DELETE /api/v1/users/account
 */
export const deleteUserAccount: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const userId = request.id;

    const user = await User.findById(userId).select('+password');

    if (!user) {
      return sendErrorResponse({
        response,
        message: 'User not found',
        statusCode: STATUS_CODES.NOT_FOUND
      });
    }

    const { password } = request.body;

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return sendErrorResponse({
        response,
        message: 'Password is incorrect',
        statusCode: STATUS_CODES.UNAUTHORIZED
      });
    }

    user.isActive = false;

    await user.save();

    sendSuccessResponse({
      response,
      message: "Your account has been deleted. We're sorry to see you go.",
      data: null
    });
  }
);
