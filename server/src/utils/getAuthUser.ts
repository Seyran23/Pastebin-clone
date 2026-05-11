import type { Request } from 'express';

import { AppError } from '@/middlewares/error-handler';
import type { AuthUser } from '@/types/express';

export const getAuthUser = (req: Request): AuthUser => {
  if (!req.user) {
    throw new AppError(401, 'Unauthorized');
  }
  return req.user;
};
