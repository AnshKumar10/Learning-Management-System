import type { Response } from 'express';

class AppResponse<T = any> extends Response {
  public statusCode: number;
  public data: T | null | undefined;
  public message: string;
  public success: boolean;

  constructor(message: string, statusCode: number, data?: T) {
    super();
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export default AppResponse;
