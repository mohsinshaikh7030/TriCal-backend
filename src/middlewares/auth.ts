import { Request, Response, NextFunction } from 'express';
import supabase from '@/config/supabaseClient';

export interface AuthenticatedRequest extends Request {
  user?: any; // You can define a more specific user type
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required.' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({ message: 'Invalid token.', error: error.message });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
