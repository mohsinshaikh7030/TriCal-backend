import { blogRepository, Blog } from '@/repositories/BlogRepository';

class BlogService {
  async createBlog(blogData: Partial<Blog>): Promise<Blog | null> {
    // Business logic before creating a blog post can go here
    // For example, generating a slug
    if (blogData.title && !blogData.slug) {
      blogData.slug = this.generateSlug(blogData.title);
    }
    return await blogRepository.create(blogData);
  }

  async getBlogById(id: string): Promise<Blog | null> {
    return await blogRepository.findById(id);
  }
  
  async getBlogBySlug(slug: string): Promise<Blog | null> {
    return await blogRepository.findBySlug(slug);
  }

  async getAllBlogs(): Promise<Blog[]> {
    return await blogRepository.findAll();
  }

  async updateBlog(id: string, updates: Partial<Blog>): Promise<Blog | null> {
    // Business logic before updating
    if (updates.title && !updates.slug) {
        updates.slug = this.generateSlug(updates.title);
    }
    return await blogRepository.update(id, updates);
  }

  async deleteBlog(id: string, userId?: string): Promise<void> {
    // We'll use soft delete. The userId can be used for permission checks or logging.
    await blogRepository.softDelete(id, userId);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}

export const blogService = new BlogService();
