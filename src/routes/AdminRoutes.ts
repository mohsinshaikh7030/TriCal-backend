
import { Router } from 'express';
import { userManagementController } from '@/controllers/UserManagementController';
import { dashboardController } from '@/controllers/DashboardController';
import { settingsController } from '@/controllers/SettingsController';
import { mediaController } from '@/controllers/MediaController';
import { authMiddleware } from '@/middlewares/auth';
import { hasRole } from '@/middlewares/role';

const router = Router();

// All routes in this file are protected and require at least an Editor role
// More specific permissions will be handled per route.
router.use(authMiddleware);

// Dashboard Routes (accessible to all admin/editor roles)
router.get('/dashboard/stats', dashboardController.getStats);

// Media Routes (Editor and above)
const mediaRouter = Router();
mediaRouter.use(hasRole('Editor'));
mediaRouter.get('/media', mediaController.listMedia);
mediaRouter.post('/media/signed-url', mediaController.getSignedUrl);
mediaRouter.post('/media', mediaController.createMediaRecord);
mediaRouter.delete('/media/:id', mediaController.deleteMedia);
router.use(mediaRouter);

// Settings Routes (Admin and Super Admin)
const settingsRouter = Router();
settingsRouter.use(hasRole('Admin')); // Assuming Admins can change settings
settingsRouter.get('/settings', settingsController.getSettings);
settingsRouter.put('/settings', settingsController.updateSettings);
router.use(settingsRouter);

// User Management Routes (Super Admin only)
const userManagementRouter = Router();
userManagementRouter.use(hasRole('Super Admin'));
userManagementRouter.get('/users', userManagementController.getAllUsers);
userManagementRouter.post('/users', userManagementController.createUser);
userManagementRouter.put('/users/role', userManagementController.updateUserRole);
userManagementRouter.put('/users/status', userManagementController.toggleUserStatus);
userManagementRouter.delete('/users/:userId', userManagementController.deleteUser);
userManagementRouter.post('/users/resend-verification', userManagementController.resendVerificationEmail);

router.use(userManagementRouter);

export default router;

