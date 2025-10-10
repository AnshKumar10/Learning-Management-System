import { z } from 'zod';

// Common reusable schemas
export const commonSchemas = {
  pagination: z.object({
    page: z
      .string()
      .optional()
      .refine((val) => !val || /^[1-9]\d*$/.test(val), {
        message: 'Page must be a positive integer',
      }),
    limit: z
      .string()
      .optional()
      .refine(
        (val) => !val || (/^\d+$/.test(val) && +val >= 1 && +val <= 100),
        {
          message: 'Limit must be between 1 and 100',
        },
      ),
  }),

  email: z
    .string()
    .email({ message: 'Please provide a valid email' })
    .transform((val) => val.toLowerCase().trim()),

  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/, {
      message:
        'Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character',
    }),

  name: z
    .string()
    .min(2, { message: 'Name must be between 2 and 50 characters' })
    .max(50, { message: 'Name must be between 2 and 50 characters' })
    .regex(/^[a-zA-Z\s]*$/, {
      message: 'Name can only contain letters and spaces',
    })
    .transform((val) => val.trim()),

  price: z
    .number({ error: 'Price must be a positive number' })
    .nonnegative({ message: 'Price must be a positive number' }),

  url: z.string().url({ message: 'Please provide a valid URL' }),
};
