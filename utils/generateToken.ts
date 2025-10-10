import type { UserInterface } from '@/types/core';
import type { Response } from 'express';
import jwt from 'jsonwebtoken';

export const generateToken = (
  response: Response,
  user: UserInterface,
  message: string,
) => {
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });

  return response
    .status(200)
    .cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
    .json({
      success: true,
      message,
      user,
    });
};
