
import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/express/index'

export const hasPermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { role, permissions } = req.user;
    if (role === 'Super Admin') {
      return next();
    }

    if (!permissions || !permissions.includes(permission)) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required permission.' });
    }

    next();
  };
};

const roleHierarchy: Record<string, number> = {
  'Super Admin': 4,
  'Admin': 3,
  'Editor': 2,
  'User': 1,
  'Viewer': 0,
};

export const hasRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { role: userRole } = req.user;
    const userRoleValue = roleHierarchy[userRole || 'Viewer'] || 0;
    const requiredRoleValue = roleHierarchy[role] || 0;

    if (userRoleValue < requiredRoleValue) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required role.' });
    }

    next();
  };
};

