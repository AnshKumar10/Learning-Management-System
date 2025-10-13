import { getDBStatus } from '@/configs/database.config';
import { HEALTH_STATUS, STATUS_CODES } from '@/constants';
import { catchAsync } from '@/middlewares/error.middleware';
import {
  sendErrorResponse,
  sendSuccessResponse
} from '@/utils/responseHandler';
import type { Request, RequestHandler, Response } from 'express';

const formatMB = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

export const checkHealth: RequestHandler = catchAsync(
  async (_: Request, response: Response) => {
    const errors: { path: string; message: string }[] = [];

    const dbStatus = getDBStatus();
    const isDatabaseHealthy = dbStatus?.isConnected ?? false;

    if (!isDatabaseHealthy) {
      errors.push({
        path: 'database',
        message: 'Database connection is not established'
      });
    }

    const allServicesHealthy = isDatabaseHealthy; // Later check for other services here

    const overallStatus = allServicesHealthy
      ? HEALTH_STATUS.HEALTHY
      : HEALTH_STATUS.UNHEALTHY;

    const healthStatus = {
      status: overallStatus
        ? STATUS_CODES.OK
        : STATUS_CODES.SERVICE_UNAVAILABLE,
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: isDatabaseHealthy
            ? HEALTH_STATUS.HEALTHY
            : HEALTH_STATUS.UNHEALTHY
        },
        system: {
          status: HEALTH_STATUS.HEALTHY,
          uptime: process.uptime(),
          memoryUsage: {
            rss: formatMB(process.memoryUsage().rss),
            heapUsed: formatMB(process.memoryUsage().heapUsed)
          }
        }
      }
    };

    return allServicesHealthy
      ? sendSuccessResponse({
          response,
          message: 'Service is healthy',
          data: healthStatus
        })
      : sendErrorResponse({
          response,
          message: 'Service is unhealthy',
          errors,
          statusCode: STATUS_CODES.SERVICE_UNAVAILABLE
        });
  }
);
