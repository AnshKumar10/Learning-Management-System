import type { Request, RequestHandler, Response } from 'express';
import { catchAsync } from '@middlewares/error.middleware';
import crypto from 'crypto';
import {
  sendErrorResponse,
  sendSuccessResponse
} from '@/utils/responseHandler';
import { User } from '@/models/user.model';
import { generateToken } from '@/utils/generateToken';

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
        statusCode: 409
      });
    }

    const user = await User.create({ name, email, password });
    generateToken(response, user, 'User account created successfully');
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
        statusCode: 404
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return sendErrorResponse({
        response,
        message: 'Invalid credentials',
        statusCode: 401
      });
    }

    await user.updateLastActive();
    generateToken(response, user, 'Logged in successfully');
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
      message: 'Signed out successfully',
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

    const user = await User.findById(userId).select('-password');

    if (!user || !user.isActive) {
      return sendErrorResponse({
        response,
        message: 'User not found',
        statusCode: 404
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
      message: 'User profile fetched successfully',
      data: result
    });
  }
);

/**
 * Update user profile
 * @route PATCH /api/v1/users/profile
 */
export const updateUserProfile: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {}
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
        statusCode: 404
      });
    }

    const { currentPassword, newPassword } = request.body;

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return sendErrorResponse({
        response,
        message: 'Current password is incorrect',
        statusCode: 401
      });
    }

    user.password = newPassword;

    await user.save();

    sendSuccessResponse({
      response,
      message: 'Password changed successfully',
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
    // TODO: Implement forgot password functionality
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
        statusCode: 404
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
        statusCode: 404
      });
    }

    const { password } = request.body;

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    sendSuccessResponse({
      response,
      message: 'Password reset successfully',
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
        statusCode: 404
      });
    }

    const { password } = request.body;

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return sendErrorResponse({
        response,
        message: 'Password is incorrect',
        statusCode: 401
      });
    }

    user.isActive = false;

    await user.save();

    sendSuccessResponse({
      response,
      message: 'User account deleted successfully',
      data: null
    });
  }
);
