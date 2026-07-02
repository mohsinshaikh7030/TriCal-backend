import supabase from '../config/supabaseClient';
import { ApiError } from '../utils/ApiError';

class SupabaseStorageService {
  async uploadFile(bucket: string, filePath: string, file: Express.Multer.File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new ApiError(500, `Failed to upload file: ${error.message}`);
    }

    return data;
  }

  async deleteFile(bucket: string, filePath: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw new ApiError(500, `Failed to delete file: ${error.message}`);
    }

    return data;
  }

  getPublicUrl(bucket: string, filePath: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data;
  }

  async createSignedUploadUrl(bucket: string, filePath: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(filePath);

    if (error) {
      throw new ApiError(500, `Failed to create signed upload URL: ${error.message}`);
    }

    return data;
  }

  async listFiles(bucket: string, directoryPath?: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(directoryPath, {
        limit: 100, // The number of files to return.
        offset: 0, // The starting position.
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      throw new ApiError(500, `Failed to list files: ${error.message}`);
    }

    return data;
  }

  async replaceFile(bucket: string, filePath: string, file: Express.Multer.File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .update(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new ApiError(500, `Failed to replace file: ${error.message}`);
    }

    return data;
  }
}

export default new SupabaseStorageService();
