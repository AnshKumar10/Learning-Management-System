declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: UserDocument;
    }
  }
}

export {};
