import { Router } from 'express';
import { blogController } from '../controllers/BlogController'
import { validate } from '../middlewares/validate'
import { createBlogSchema, updateBlogSchema } from '../validation/BlogValidation'
import { authMiddleware } from '../middlewares/auth'
import { hasPermission } from '../middlewares/role'

const router = Router();

// Public routes (or could be protected if required)
router.get('/', authMiddleware, blogController.getAllBlogs);
router.get('/:id', authMiddleware, blogController.getBlog);
router.get('/slug/:slug', authMiddleware, blogController.getBlogBySlug);

// Protected routes with permissions
router.post('/', authMiddleware, hasPermission('create:blog'), validate(createBlogSchema), blogController.createBlog);
router.put('/:id', authMiddleware, hasPermission('edit:blog'), validate(updateBlogSchema), blogController.updateBlog);
router.patch('/:id', authMiddleware, hasPermission('edit:blog'), validate(updateBlogSchema), blogController.updateBlog);
router.delete('/:id', authMiddleware, hasPermission('delete:blog'), blogController.deleteBlog);

export default router;

