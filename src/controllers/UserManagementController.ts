
import { Request, Response, NextFunction } from 'express';
import { userManagementService } from '@/services/UserManagementService';

class UserManagementController {
    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await userManagementService.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userData = req.body;
            const user = await userManagementService.createUser(userData);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }

    async updateUserRole(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, roleId } = req.body;
            const profile = await userManagementService.updateUserRole(userId, roleId);
            res.status(200).json(profile);
        } catch (error) {
            next(error);
        }
    }

    async toggleUserStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, status } = req.body;
            const profile = await userManagementService.toggleUserStatus(userId, status);
            res.status(200).json(profile);
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            await userManagementService.deleteUser(userId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
    
    async resendVerificationEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            await userManagementService.resendVerificationEmail(email);
            res.status(200).json({ message: 'Verification email sent.' });
        } catch(error) {
            next(error);
        }
    }
}

export const userManagementController = new UserManagementController();
