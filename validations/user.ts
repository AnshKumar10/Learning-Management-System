import { z } from 'zod';
import { zEmail, zPassword, zName } from '@validations/common';

export const signupSchema = z.object({
  name: zName,
  email: zEmail,
  password: zPassword,
});

export const signinSchema = z.object({
  email: zEmail,
  password: zPassword,
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: 'Current password is required' }),
    newPassword: zPassword,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });
