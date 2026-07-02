
import { Router } from 'express';
import { authController } from '../controllers/AuthController'
import { validate } from '../middlewares/validate'
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validation/AuthValidation'
import { authMiddleware } from '../middlewares/auth'
import { authLimiter } from '../middlewares/rateLimiter'

const router = Router();

// Public routes with rate limiting
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/verify-email', authLimiter, authController.verifyEmail);

import supabase from '../config/supabaseClient';

// Protected routes
router.post('/logout', authMiddleware, authController.logout);
router.get('/session', authMiddleware, authController.getSession);
router.post('/reset-password', authMiddleware, validate(resetPasswordSchema), authController.resetPassword);

router.get('/roles', authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('roles').select('id, name');
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
