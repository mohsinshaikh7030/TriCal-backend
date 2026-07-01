
import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/AuthService';
import { AuthenticatedRequest } from '@/types/express';

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, full_name } = req.body;
      const { user, session } = await authService.register({ email, password, full_name });
      res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.', user, session });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { user, session } = await authService.login({ email, password });
      res.status(200).json({ user, session });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        // The token is extracted by the authMiddleware and passed to the service.
        const token = req.headers.authorization?.split(' ')[1];
        if(!token) {
            return res.status(400).json({ message: 'Token not provided.' });
        }
        await authService.logout(token);
        res.status(200).json({ message: 'Successfully logged out' });
    } catch (error) {
        next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      res.status(200).json({ message: 'If a user with this email exists, a password reset link has been sent.' });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        // This controller assumes a middleware has already verified the reset token 
        // and attached user information to the request.
        // However, Supabase handles this via a link, so we just need the new password
        // and the session's access token to perform the update.
        const { password } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        if(!token) {
            return res.status(401).json({ message: 'Access token is required.' });
        }
        
        await authService.resetPassword(token, password);
        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ message: 'Verification token is required.' });
      }
      await authService.verifyEmail(token);
      res.status(200).json({ message: 'Email verified successfully.' });
    } catch (error) {
      next(error);
    }
  }

    async getSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        // The user profile is already attached to the request by the authMiddleware
        res.status(200).json({ user: req.user });
    } catch (error) {
        next(error);
    }
  }
}

export const authController = new AuthController();
