import { z } from 'zod';
import { zEmail, zPassword, zName, zRequiredString } from '@validations/common';

export const signupSchema = z.object({
  name: zName,
  email: zEmail,
  password: zPassword
});

export const signinSchema = z.object({
  email: zEmail,
  password: zPassword
});

export const deleteAccountSchema = z.object({
  password: zRequiredString('Password is required')
});

export const passwordChangeSchema = z.object({
  currentPassword: zRequiredString('Current password is required'),
  newPassword: zRequiredString('New password is required')
});
