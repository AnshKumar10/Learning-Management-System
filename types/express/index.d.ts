import { UserDocumentType } from '@/types/user';

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: UserDocumentType;
    }
  }
}

export {};
