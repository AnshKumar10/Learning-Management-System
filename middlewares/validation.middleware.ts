import { ZodError, type ZodSchema } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@middlewares/error.middleware.js';

export function validateRequestPayload<T>(schema: ZodSchema<T>) {
  return (requset: Request, response: Response, next: NextFunction): void => {
    try {
      schema.parse(requset.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));

        return next(new AppError('Validation failed', 400, formattedErrors));
      }

      return next(new AppError('Internal Server Error', 500));
    }
  };
}
