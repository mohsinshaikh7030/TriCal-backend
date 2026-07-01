import { Router } from 'express';
import { blogController } from '@/controllers/BlogController';
import { validate } from '@/middlewares/validate';
import { createBlogSchema, updateBlogSchema } from '@/validation/BlogValidation';
import { authMiddleware } from '@/middlewares/auth';

const router = Router();

// Public routes
router.get('/:id', blogController.getBlog);
router.get('/slug/:slug', blogController.getBlogBySlug);

// Protected routes (require authentication)
router.post('/', authMiddleware, validate(createBlogSchema), blogController.createBlog);
router.put('/:id', authMiddleware, validate(updateBlogSchema), blogController.updateBlog);
router.patch('/:id', authMiddleware, validate(updateBlogSchema), blogController.updateBlog);
router.delete('/:id', authMiddleware, blogController.deleteBlog);

export default router;
