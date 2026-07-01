
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/types/express';

export const hasPermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { permissions } = req.user;
    if (!permissions || !permissions.includes(permission)) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required permission.' });
    }

    next();
  };
};

export const hasRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { role: userRole } = req.user;
    if (userRole !== role) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required role.' });
    }

    next();
  };
};

