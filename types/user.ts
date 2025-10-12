import type { userSchema } from '@/models/user.model';
import { Document, InferSchemaType, Model, ObjectId } from 'mongoose';

type UserSchemaFields = InferSchemaType<typeof userSchema> & {
  _id: ObjectId;
};

type UserMethods = {
  comparePassword(password: string): Promise<boolean>;
  getResetPasswordToken(): string;
  updateLastActive(): Promise<UserDocumentType>;
};

export type UserDocumentType = Document & UserSchemaFields & UserMethods;

export type UserModelType = Model<UserDocumentType>;
