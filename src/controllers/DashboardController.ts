
import type { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/DashboardService'

class DashboardController {
    async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await dashboardService.getStats();
            res.status(200).json(stats);
        } catch (error) {
            next(error);
        }
    }
}

export const dashboardController = new DashboardController();
