import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middlewares/error-handler';
import { validateAccessToken } from '../../services/token.service';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new AppError(401, 'Unauthorized: No token provided');

    const token = authHeader.split(' ')[1];
    if (!token) throw new AppError(401, 'Unauthorized: No token provided');

    const userData = validateAccessToken(token);
    if (!userData) throw new AppError(401, 'Unauthorized: Invalid token');

    req.user = userData;
    next();
  } catch (err) {
    next(err);
  }
};

export const isAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    if (req.user?.role === 'admin') return next();
    throw new AppError(403, 'Access denied. You do not have the required permissions.');
  } catch (err) {
    next(err);
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();
  try {
    const userData = validateAccessToken(token);
    if (userData) req.user = userData;
    next();
  } catch {
    next();
  }
};
