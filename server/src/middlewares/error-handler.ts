import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { NODE_ENV } from '../utils/env';

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  errors: unknown[];

  constructor(statusCode: number, message: string, errors: unknown[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler: ErrorRequestHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  if (NODE_ENV === 'development') {
    console.error('Error:', err.stack);
  }

  res.status(statusCode).json({
    status,
    message: err.message,
    errors: err.errors ?? [],
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
};
