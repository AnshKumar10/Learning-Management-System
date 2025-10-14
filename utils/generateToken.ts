import { UserDocumentType } from '@/types/user';
import type { Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@configs/env.config';
import { sendSuccessResponse } from '@/utils/responseHandler';

export const generateToken = (
  response: Response,
  user: UserDocumentType,
  message: string
) => {
  const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, {
    expiresIn: '1d'
  });

  response.cookie('access_token', token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  sendSuccessResponse({
    response,
    message,
    data: {
      name: user.name,
      role: user.role,
      email: user.email
    },
    statusCode: 200
  });
};
