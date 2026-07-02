import { Request } from 'express';
import { UserWithRoleAndPermissions } from '../../repositories/AuthRepository';

declare global {
  namespace Express {
    interface Request {
      user?: UserWithRoleAndPermissions;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: UserWithRoleAndPermissions;
}
