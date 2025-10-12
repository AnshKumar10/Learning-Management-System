import { z } from 'zod';
import { zEmail, zPassword, zName } from '@validations/common';

export const signupSchema = z.object({
  name: zName(),
  email: zEmail(),
  password: zPassword()
});

export const signinSchema = z.object({
  email: zEmail(),
  password: zPassword()
});

export const deleteAccountSchema = z.object({
  password: zPassword()
});

export const forgotPasswordSchema = z.object({
  email: zEmail()
});

export const updateUserProfileSchema = z.object({
  name: zName('Name', 1, 50, true),
  bio: zName('Bio', 1, 200, true)
});

export const passwordChangeSchema = z.object({
  currentPassword: zPassword(),
  newPassword: zPassword()
});
