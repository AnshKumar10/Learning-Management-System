import type { Request, Response, NextFunction } from 'express';
import { env } from '@configs/env.config';
import { sendErrorResponse } from '@/utils/responseHandler';
import { ApiError } from '@/types/response';

export const errorHandler = (
  error: ApiError,
  _: Request,
  response: Response,
): void => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Something went wrong';
  const errors = error.errors || undefined;
  const stack = env.NODE_ENV === 'development' ? error.stack : undefined;

  sendErrorResponse({ response, message, statusCode, errors, stack });
};

export const catchAsync = (
  fn: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<any>,
) => {
  return (request: Request, response: Response, next: NextFunction): void => {
    fn(request, response, next).catch(next);
  };
};
