import { blogRepository } from '../repositories/BlogRepository'
import type { Blog } from '../repositories/BlogRepository'

class BlogService {
  async createBlog(blogData: Partial<Blog>): Promise<Blog | null> {
    // Business logic before creating a blog post can go here
    // For example, generating a slug
    if (blogData.title && !blogData.slug) {
      blogData.slug = this.generateSlug(blogData.title);
    }
    const dbData = this.mapToDb(blogData);
    const result = await blogRepository.create(dbData);
    return this.mapFromDb(result);
  }

  async getBlogById(id: string): Promise<Blog | null> {
    const result = await blogRepository.findById(id);
    return this.mapFromDb(result);
  }
  
  async getBlogBySlug(slug: string): Promise<Blog | null> {
    const result = await blogRepository.findBySlug(slug);
    return this.mapFromDb(result);
  }

  async getAllBlogs(): Promise<Blog[]> {
    const results = await blogRepository.findAll();
    return results.map(b => this.mapFromDb(b));
  }

  async updateBlog(id: string, updates: Partial<Blog>): Promise<Blog | null> {
    // Business logic before updating
    if (updates.title && !updates.slug) {
        updates.slug = this.generateSlug(updates.title);
    }
    const dbData = this.mapToDb(updates);
    const result = await blogRepository.update(id, dbData);
    return this.mapFromDb(result);
  }

  async deleteBlog(id: string, userId?: string): Promise<void> {
    // We'll use soft delete. The userId can be used for permission checks or logging.
    await blogRepository.softDelete(id, userId);
  }

  private mapToDb(data: any): any {
    const dbData = { ...data };
    if ('cover_image' in dbData) {
      dbData.featured_image_url = dbData.cover_image;
      delete dbData.cover_image;
    }
    return dbData;
  }

  private mapFromDb(blog: any): any {
    if (!blog) return null;
    const clientData = { ...blog };
    if ('featured_image_url' in clientData) {
      clientData.cover_image = clientData.featured_image_url;
    }
    return clientData;
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
