import type { courseSchema } from '@/models/course.model';
import { Document, InferSchemaType, Model, ObjectId } from 'mongoose';

type CourseSchemaFields = InferSchemaType<typeof courseSchema> & {
  _id: ObjectId;
};

export type CourseDocumentType = Document & CourseSchemaFields;

export type CourseModelType = Model<CourseDocumentType>;
