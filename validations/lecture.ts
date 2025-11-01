import { z } from 'zod';
import { zBoolean, zName } from '@validations/common';

export const createLectureSchema = z.object({
  title: zName('Title', 1, 100),
  description: zName('Description', 1, 500),
  isPreview: zBoolean(true)
});

export type CreateLectureType = z.infer<typeof createLectureSchema>;
