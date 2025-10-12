import type { Request, RequestHandler, Response } from 'express';
import { catchAsync } from '@middlewares/error.middleware';
import {
  sendErrorResponse,
  sendSuccessResponse,
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
        statusCode: 409,
      });
    }

    const user = await User.create({ name, email, password });
    generateToken(response, user, 'User account created successfully');
  },
);

/**
 * Authenticate user and get token
 * @route POST /api/v1/users/signin
 */
export const authenticateUser: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    const { email, password } = request.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return sendErrorResponse({
        response,
        message: 'User not found',
        statusCode: 404,
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return sendErrorResponse({
        response,
        message: 'Invalid credentials',
        statusCode: 401,
      });
    }

    await user.updateLastActive();
    generateToken(response, user, 'Logged in successfully');
  },
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
      data: null,
    });
  },
);

/**
 * Get current user profile
 * @route GET /api/v1/users/profile
 */
export const getCurrentUserProfile: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    // TODO: Implement get current user profile functionality
  },
);

/**
 * Update user profile
 * @route PATCH /api/v1/users/profile
 */
export const updateUserProfile: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {},
);

/**
 * Change user password
 * @route PATCH /api/v1/users/password
 */
export const changeUserPassword: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    // TODO: Implement change user password functionality
  },
);

/**
 * Request password reset
 * @route POST /api/v1/users/forgot-password
 */
export const forgotPassword: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    // TODO: Implement forgot password functionality
  },
);

/**
 * Reset password
 * @route POST /api/v1/users/reset-password/:token
 */
export const resetPassword: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    // TODO: Implement reset password functionality
  },
);

/**
 * Delete user account
 * @route DELETE /api/v1/users/account
 */
export const deleteUserAccount: RequestHandler = catchAsync(
  async (request: Request, response: Response) => {
    // TODO: Implement delete user account functionality
  },
);
