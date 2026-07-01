import { Router } from 'express';
import { mediaController } from './media.controller';
import { isAuthenticated } from '../../middleware/auth'; // Placeholder for auth middleware
import { hasRole } from '../../middleware/rbac'; // Placeholder for RBAC middleware
import { upload } from '../../middleware/multer'; // Placeholder for multer setup

const router = Router();

// All media routes require authentication
router.use(isAuthenticated);

// GET /api/media - Get all media files (with filters)
router.get('/', mediaController.getAll);

// POST /api/media/upload - Upload one or more files
router.post(
  '/upload',
  hasRole(['Admin', 'Editor']),
  upload.array('files'), // Handle multiple files under the 'files' field
  mediaController.upload,
);

// PATCH /api/media/:id/rename - Rename a file
router.patch('/rename/:id', hasRole(['Admin', 'Editor']), mediaController.rename);

// DELETE /api/media/:id - Delete a single file
router.delete('/:id', hasRole(['Admin']), mediaController.delete);

// POST /api/media/bulk-delete - Delete multiple files
router.post('/bulk-delete', hasRole(['Admin']), mediaController.bulkDelete);

export default router;