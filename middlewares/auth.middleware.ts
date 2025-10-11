import { AppError, catchAsync } from '@middlewares/error.middleware';
import { User } from '@models/user.model';
import type { JwtPayloadInterface } from '@/types/core';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@configs/env.config';

export const isAuthenticated = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    // Check if token exists in cookies
    const token = request.cookies.token;
    if (!token) {
      throw new AppError(
        'You are not logged in. Please log in to get access.',
        401,
      );
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, env.JWT_SECRET!) as JwtPayloadInterface;

      // Add user ID to request
      request.id = decoded.userId;
      const user = await User.findById(request.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      request.user = user;

      next();
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid token. Please log in again.', 401);
      }
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Your token has expired. Please log in again.', 401);
      }
      throw error;
    }
  },
);

// Middleware for role-based access control
export const restrictTo = (...roles: string[]) => {
  return catchAsync(
    async (request: Request, response: Response, next: NextFunction) => {
      // roles is an array ['admin', 'instructor']
      if (!roles.includes(request.user.role)) {
        throw new AppError(
          'You do not have permission to perform this action',
          403,
        );
      }
      next();
    },
  );
};

// Optional authentication middleware
export const optionalAuth = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const token = request.cookies.token;
      if (token) {
        const decoded = jwt.verify(
          token,
          env.JWT_SECRET!,
        ) as JwtPayloadInterface;
        request.id = decoded.userId;
      }
      next();
    } catch (error) {
      // If token is invalid, just continue without authentication
      next();
    }
  },
);
