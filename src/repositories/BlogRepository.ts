import { BaseRepository } from './BaseRepository';

// This is a placeholder type. In a real app, this might come from a shared types package or be generated from the database schema.
export interface Blog {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featured_image_url?: string;
    category_id: string;
    published_at?: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by?: string;
    deleted_at?: string;
    status: 'draft' | 'published' | 'archived';
}

class BlogRepository extends BaseRepository<Blog> {
  constructor() {
    super('blogs');
  }

  // Add any blog-specific database methods here if needed
  // For example:
  async findBySlug(slug: string): Promise<Blog | null> {
    const results = await this.find({ slug } as Partial<Blog>);
    return results.length > 0 ? results[0] : null;
  }
}

export const blogRepository = new BlogRepository();
