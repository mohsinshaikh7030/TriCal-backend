import { Router } from 'express';
import { mediaController } from '../controllers/MediaController'
import { authMiddleware } from '../middlewares/auth'
import { hasPermission } from '../middlewares/role'
import { upload } from '../middlewares/upload'

const router = Router();

router.get('/', authMiddleware, hasPermission('view:media'), mediaController.listMedia);
router.post('/upload', authMiddleware, hasPermission('create:media'), upload.array('files', 10), mediaController.uploadMedia);
router.put('/replace', authMiddleware, hasPermission('edit:media'), upload.single('file'), mediaController.replaceMedia);
router.post('/rename', authMiddleware, hasPermission('edit:media'), mediaController.renameMedia);
router.delete('/delete', authMiddleware, hasPermission('delete:media'), mediaController.deleteMedia);
router.delete('/bulk-delete', authMiddleware, hasPermission('delete:media'), mediaController.bulkDeleteMedia);

export default router;
