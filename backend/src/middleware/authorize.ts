import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AppError } from './errorHandler';
import { AuthRequest } from './auth';

export const authorize = (allowedRoles: ('student' | 'admin')[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return next(new AppError('Authentication required.', 401));
      }

      const user = await User.findById(userId);
      if (!user) {
        return next(new AppError('User not found.', 404));
      }

      if (!allowedRoles.includes(user.role)) {
        return next(new AppError('Access forbidden. Insufficient permissions.', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
