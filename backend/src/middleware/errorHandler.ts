import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export class AppError extends Error {
  public statusCode: number;
  public errors?: any;

  constructor(message: string, statusCode: number, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`💥 [Error] ${message}`, {
    stack: err.stack,
    errors: err.errors,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(statusCode).json({
    status: 'error',
    message,
    errors: err.errors || undefined,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
