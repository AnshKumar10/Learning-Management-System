import * as z from 'zod';
import {
  zEnumFromEnv,
  zName,
  zPrice,
  zRequiredString
} from '@validations/common';

export const createCourseSchema = z.object({
  title: zName('Title', 1, 100),
  subtitle: zName('Sub Title', 1, 200),
  description: zName('Description', 1, 500),
  category: zRequiredString('Category'),
  level: zEnumFromEnv(['beginner', 'intermediate', 'advanced']),
  price: zPrice()
});

export type CreateCourseType = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = createCourseSchema.partial();

export type UpdateCourseType = z.infer<typeof updateCourseSchema>;
