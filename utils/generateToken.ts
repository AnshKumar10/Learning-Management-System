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
  const accessToken = jwt.sign({ userId: user._id }, env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1d'
  });

  const refreshToken = jwt.sign(
    { userId: user._id },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  response.cookie('access_token', accessToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  response.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  sendSuccessResponse({
    response,
    message,
    data: {
      name: user.name,
      role: user.role,
      email: user.email
    }
  });
};
