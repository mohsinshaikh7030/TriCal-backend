import type { Response, NextFunction } from 'express';
import supabase from '../config/supabaseClient'
import { authRepository } from '../repositories/AuthRepository'
import type { AuthenticatedRequest } from '../types/express/index' // Assuming the type is defined here

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required.' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid or expired token.', error: error?.message });
    }

    // Fetch user profile with role and permissions
    const userProfile = await authRepository.findUserWithRoleAndPermissions(user.id);
    
    if (!userProfile) {
        // This case can happen if a user is deleted from auth.users but the token is not yet expired
        return res.status(401).json({ message: 'User not found.' });
    }

    req.user = {
      ...user,
      ...userProfile
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

