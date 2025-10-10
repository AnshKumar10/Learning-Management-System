import type { NextFunction, Request, Response } from 'express';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;
  public data: null;
  public success: boolean;
  public errors: any[];

  constructor(
    message: string = 'Something went wrong',
    statusCode: number,
    errors: any[] = [],
    stack: string = '',
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.message = message;
    this.data = null;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Error handler for async functions
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

// Global error handling middleware
export const errorHandler = (
  error: AppError,
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    response.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    });
  } else {
    if (error.isOperational) {
      response.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    } else {
      console.error('ERROR 💥', error);
      response.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
      });
    }
  }
};

interface MongoError extends Error {
  code?: number;
  path?: string;
  value?: any;
  errors?: { [key: string]: { message: string } };
  errmsg?: string;
}

// Handle specific MongoDB errors
export const handleMongoError = (error: MongoError): AppError | MongoError => {
  if (error.name === 'CastError') {
    return new AppError(`Invalid ${error.path}: ${error.value}`, 400);
  }
  if (error.code === 11000 && error.errmsg) {
    const value = error.errmsg.match(/(["'])(\\?.)*?\1/)?.[0] || '';
    return new AppError(
      `Duplicate field value: ${value}. Please use another value!`,
      400,
    );
  }
  if (error.name === 'ValidationError' && error.errors) {
    const errors = Object.values(error.errors).map((el) => el.message);
    return new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
  }
  return error;
};

// Handle JWT errors
export const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again!', 401);

export const handleJWTExpiredError = (): AppError =>
  new AppError('Your token has expired! Please log in again.', 401);
