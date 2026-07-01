
import { Request, Response, NextFunction } from 'express';
import { settingsService } from '@/services/SettingsService';

class SettingsController {
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getSettings();
      res.status(200).json(settings);
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.updateSettings(req.body);
      res.status(200).json(settings);
    } catch (error) {
      next(error);
    }
  }
}

export const settingsController = new SettingsController();
