import { z } from 'zod';
import { zEmail, zPassword, zName } from '@validations/common';

export const signupSchema = z.object({
  name: zName(),
  email: zEmail(),
  password: zPassword()
});

export type SignupType = z.infer<typeof signupSchema>;

export const signinSchema = z.object({
  email: zEmail(),
  password: zPassword()
});

export type SigninType = z.infer<typeof signinSchema>;

export const deleteAccountSchema = z.object({
  password: zPassword()
});

export type DeleteAccountType = z.infer<typeof deleteAccountSchema>;

export const forgotPasswordSchema = z.object({
  email: zEmail()
});

export type ForgotPasswordType = z.infer<typeof forgotPasswordSchema>;

export const updateUserProfileSchema = z.object({
  name: zName('Name', 1, 50, true),
  bio: zName('Bio', 1, 200, true)
});

export type UpdateUserProfileType = z.infer<typeof updateUserProfileSchema>;

export const passwordChangeSchema = z.object({
  currentPassword: zPassword(),
  newPassword: zPassword()
});

export type PasswordChangeType = z.infer<typeof passwordChangeSchema>;
