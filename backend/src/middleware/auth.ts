import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication failed. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Authentication failed. Empty token.', 401);
    }

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (err) {
      throw new AppError('Authentication failed. Invalid or expired token.', 401);
    }
  } catch (error) {
    next(error);
  }
};
