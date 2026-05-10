import type { Request } from 'express';

import { AppError } from '../middlewares/error-handler';
import type { AuthUser } from '../types/express';

/**
 * Returns the authenticated user from the request.
 * Use this in controllers behind `authMiddleware` to avoid non-null assertions.
 */
export const getAuthUser = (req: Request): AuthUser => {
  if (!req.user) {
    throw new AppError(401, 'Unauthorized');
  }
  return req.user;
};
