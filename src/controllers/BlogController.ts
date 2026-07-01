import { Response, NextFunction } from 'express';
import { blogService } from '@/services/BlogService';
import { AuthenticatedRequest } from '@/types/express';
import { Request } from 'express';

class BlogController {
  async createBlog(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Add created_by from authenticated user
      const blogData = { ...req.body, created_by: req.user?.id };
      const blog = await blogService.createBlog(blogData);
      res.status(201).json(blog);
    } catch (error) {
      next(error);
    }
  }

  async getBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid blog ID.' });
      }
      const blog = await blogService.getBlogById(id);
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      res.status(200).json(blog);
    } catch (error) {
      next(error);
    }
  }
  
  async getBlogBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      if (typeof slug !== 'string') {
        return res.status(400).json({ message: 'Invalid blog slug.' });
      }
      const blog = await blogService.getBlogBySlug(slug);
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      res.status(200).json(blog);
    } catch (error) {
      next(error);
    }
  }

  async getAllBlogs(req: Request, res: Response, next: NextFunction) {
    try {
      const blogs = await blogService.getAllBlogs();
      res.status(200).json(blogs);
    } catch (error) {
      next(error);
    }
  }

  async updateBlog(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid blog ID.' });
      }
      // Add updated_by from authenticated user
      const blogData = { ...req.body, updated_by: req.user?.id };
      const blog = await blogService.updateBlog(id, blogData);
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      res.status(200).json(blog);
    } catch (error) {
      next(error);
    }
  }

  async deleteBlog(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid blog ID.' });
      }
      // Pass user id for permission checks if necessary in the service/repository layer
      await blogService.deleteBlog(id, req.user?.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const blogController = new BlogController();

