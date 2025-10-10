import { commonSchemas } from '@validations/common.js';
import z from 'zod';

export const signupSchema = z.object({
  name: commonSchemas.name,
  email: commonSchemas.email,
  password: commonSchemas.password,
});

export const signinSchema = z.object({
  email: commonSchemas.email,
  password: z.string().min(1, { message: 'Password is required' }),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: 'Current password is required' }),
    newPassword: z
      .string()
      .min(1, { message: 'New password is required' })
      .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/, {
        message:
          'Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character',
      }),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });
