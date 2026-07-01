import { NextFunction, Request, Response } from 'express';
import MediaService from '@/services/MediaService';
import { AuthenticatedRequest } from '@/types/express';
import { ApiError } from '@/utils/ApiError';

class MediaController {
  async listMedia(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const bucket = typeof req.query.bucket === 'string' ? req.query.bucket : 'documents';
      const search = typeof req.query.search === 'string' ? req.query.search : '';
      const type = typeof req.query.type === 'string' ? req.query.type : 'all';
      const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'newest';

      const assets = await MediaService.listMediaAssets(bucket, { search, type, sortBy });
      res.status(200).json(assets);
    } catch (error) {
      next(error);
    }
  }

  async uploadMedia(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new ApiError(400, 'No files provided');
      }

      const bucket = typeof req.body.bucket === 'string' ? req.body.bucket : 'documents';
      const userId = req.user?.id ?? 'unknown-user';
      const uploadedFiles = await MediaService.uploadFiles(bucket, req.files as Express.Multer.File[], userId);
      res.status(201).json(uploadedFiles);
    } catch (error) {
      next(error);
    }
  }

  async replaceMedia(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) {
        throw new ApiError(400, 'No replacement file provided');
      }

      const bucket = typeof req.body.bucket === 'string' ? req.body.bucket : 'documents';
      const filePath = typeof req.body.filePath === 'string' ? req.body.filePath : '';
      const result = await MediaService.replaceFile(bucket, filePath, file);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async renameMedia(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const bucket = typeof req.body.bucket === 'string' ? req.body.bucket : 'documents';
      const oldFilePath = typeof req.body.oldFilePath === 'string' ? req.body.oldFilePath : '';
      const newFilePath = typeof req.body.newFilePath === 'string' ? req.body.newFilePath : '';
      const result = await MediaService.renameFile(bucket, oldFilePath, newFilePath);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteMedia(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const bucket = typeof req.query.bucket === 'string' ? req.query.bucket : 'documents';
      const filePath = typeof req.query.filePath === 'string' ? req.query.filePath : '';
      await MediaService.deleteFile(bucket, filePath);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async bulkDeleteMedia(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const bucket = typeof req.body.bucket === 'string' ? req.body.bucket : 'documents';
      const filePaths = Array.isArray(req.body.filePaths) ? req.body.filePaths : [];
      await MediaService.bulkDeleteFiles(bucket, filePaths);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const mediaController = new MediaController();
