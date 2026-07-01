import { BaseRepository } from './BaseRepository';

class MediaRepository extends BaseRepository {
  constructor() {
    super('media'); // 'media' is a placeholder, it can be changed later
  }

  // Add media-specific database methods here if needed
}

export default new MediaRepository();
