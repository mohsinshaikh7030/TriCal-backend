import { BaseRepository } from './BaseRepository';

export interface Media {
    id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    bucket_id: string;
    alt_text?: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by?: string;
    deleted_at?: string;
    status: string;
}

class MediaRepository extends BaseRepository<Media> {
  constructor() {
    super('media');
  }

  // Add media-specific database methods here if needed
}

export const mediaRepository = new MediaRepository();
export default mediaRepository;
