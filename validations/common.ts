import { z } from 'zod';

export const zNumberFromString = (errorMessage = 'Must be a valid number') =>
  z.string().regex(/^\d+$/, { message: errorMessage }).transform(Number);

export const zEnumFromEnv = <T extends [string, ...string[]]>(values: T) =>
  z.enum(values);

export const zPagination = z.object({
  page: z
    .string()
    .optional()
    .refine((val) => !val || /^[1-9]\d*$/.test(val), {
      message: 'Page must be a positive integer'
    }),
  limit: z
    .string()
    .optional()
    .refine((val) => !val || (/^\d+$/.test(val) && +val >= 1 && +val <= 100), {
      message: 'Limit must be between 1 and 100'
    })
});

export const zEmail = z
  .string()
  .email({ message: 'Please provide a valid email' })
  .transform((val) => val.toLowerCase().trim());

export const zPassword = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/, {
    message:
      'Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character'
  });

export const zName = z
  .string()
  .trim()
  .min(2, { message: 'Name must be between 2 and 50 characters' })
  .max(50, { message: 'Name must be between 2 and 50 characters' });

export const zPrice = z
  .number({ error: () => ({ message: 'Price must be a number' }) })
  .nonnegative({ message: 'Price must be a positive number' });

export const zURL = z.string().url({ message: 'Please provide a valid URL' });

export const zRequiredString = (message: string) =>
  z.string().trim().min(1, { message });

export const commonSchemas = {
  zPagination,
  zEmail,
  zPassword,
  zName,
  zPrice,
  zURL,
  zNumberFromString,
  zEnumFromEnv
};
