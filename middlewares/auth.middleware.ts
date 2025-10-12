import { User } from '@models/user.model';
import type { JwtPayloadInterface } from '@/types/core';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@configs/env.config';
import { catchAsync } from '@middlewares/error.middleware';
import { ApiError } from '@/types/response';

export const isAuthenticated = catchAsync(
  async (request: Request, _: Response, next: NextFunction) => {
    const token = request.cookies.access_token;

    if (!token) {
      return next({
        statusCode: 401,
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayloadInterface;

      request.id = decoded.userId;
      const user = await User.findById(request.id);

      if (!user) {
        return next({
          statusCode: 404,
          message: 'User not found'
        });
      }

      request.user = user;
      next();
    } catch (err: unknown) {
      const error = err as ApiError;
      if (error.name === 'JsonWebTokenError') {
        return next({
          statusCode: 401,
          message: 'Invalid token. Please log in again.'
        });
      }

      if (error.name === 'TokenExpiredError') {
        return next({
          statusCode: 401,
          message: 'Your token has expired. Please log in again.'
        });
      }

      return next({
        statusCode: 500,
        message: 'Authentication error'
      });
    }
  }
);

export const restrictTo = (...roles: string[]) => {
  return catchAsync(
    async (request: Request, _: Response, next: NextFunction) => {
      if (request.user?.role && !roles.includes(request.user.role)) {
        return next({
          statusCode: 403,
          message: 'You do not have permission to perform this action'
        });
      }

      next();
    }
  );
};

export const optionalAuth = catchAsync(
  async (request: Request, _: Response, next: NextFunction) => {
    try {
      const token = request.cookies.token;
      if (token) {
        const decoded = jwt.verify(
          token,
          env.JWT_SECRET!
        ) as JwtPayloadInterface;
        request.id = decoded.userId;
      }
      next();
    } catch {
      next();
    }
  }
);
