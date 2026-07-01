import SupabaseStorageService from './supabaseStorage';
import { ApiError } from '../utils/ApiError';
import supabase from '../config/supabaseClient';

interface MediaQueryOptions {
  search?: string;
  type?: 'all' | 'image' | 'document';
  sortBy?: 'newest' | 'oldest' | 'largest' | 'smallest';
}

class MediaService {
  async uploadFiles(bucket: string, files: Express.Multer.File[], userId: string) {
    if (!files?.length) {
      throw new ApiError(400, 'No files provided');
    }

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const safeName = file.originalname.replace(/\s+/g, '-');
        const filePath = `${userId}/${Date.now()}_${safeName}`;
        const data = await SupabaseStorageService.uploadFile(bucket, filePath, file);
        return {
          ...data,
          path: filePath,
          name: safeName,
          mimeType: file.mimetype,
          type: this.getAssetType(file.mimetype),
          size: file.size,
          createdAt: new Date().toISOString(),
          uploadedBy: userId,
          publicUrl: SupabaseStorageService.getPublicUrl(bucket, filePath).data.publicUrl,
        };
      })
    );

    return uploadedFiles;
  }

  async deleteFile(bucket: string, filePath: string) {
    if (!filePath) {
      throw new ApiError(400, 'No file path provided');
    }
    return SupabaseStorageService.deleteFile(bucket, filePath);
  }

  async bulkDeleteFiles(bucket: string, filePaths: string[]) {
    if (!filePaths.length) {
      throw new ApiError(400, 'No files provided for deletion');
    }
    return Promise.all(filePaths.map((filePath) => this.deleteFile(bucket, filePath)));
  }

  async listMediaAssets(bucket: string, options: MediaQueryOptions = {}) {
    const files = await SupabaseStorageService.listFiles(bucket);
    const assets = (files ?? []).map((file) => {
      const filePath = file.name;
      const publicUrl = SupabaseStorageService.getPublicUrl(bucket, filePath).data.publicUrl;
      const mimeType = file.metadata?.mimetype ?? 'application/octet-stream';
      return {
        path: filePath,
        name: file.name,
        publicUrl,
        mimeType,
        type: this.getAssetType(mimeType),
        size: file.metadata?.size ?? 0,
        createdAt: file.created_at ?? new Date().toISOString(),
        uploadedBy: file.metadata?.uploadedBy ?? 'Unknown',
      };
    });

    const filtered = assets.filter((asset) => {
      const matchesSearch = !options.search || asset.name.toLowerCase().includes(options.search.toLowerCase());
      const matchesType = options.type === 'all' || asset.type === options.type;
      return matchesSearch && matchesType;
    });

    return filtered.sort((a, b) => {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      switch (options.sortBy) {
        case 'oldest':
          return aDate - bDate;
        case 'largest':
          return b.size - a.size;
        case 'smallest':
          return a.size - b.size;
        case 'newest':
        default:
          return bDate - aDate;
      }
    });
  }

  async replaceFile(bucket: string, filePath: string, file: Express.Multer.File) {
    if (!file) {
      throw new ApiError(400, 'No file provided');
    }
    return SupabaseStorageService.replaceFile(bucket, filePath, file);
  }

  async renameFile(bucket: string, oldFilePath: string, newFilePath: string) {
    const { data, error } = await supabase.storage.from(bucket).copy(oldFilePath, newFilePath);

    if (error) {
      throw new ApiError(500, `Failed to copy file: ${error.message}`);
    }

    await this.deleteFile(bucket, oldFilePath);

    return data;
  }

  private getAssetType(mimeType: string) {
    return mimeType.startsWith('image/') ? 'image' : 'document';
  }
}

export default new MediaService();
