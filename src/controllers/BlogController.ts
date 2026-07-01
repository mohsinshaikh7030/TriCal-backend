import { Request, Response, NextFunction } from 'express';
import { blogService } from '@/services/BlogService';

class BlogController {
  async createBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const blog = await blogService.createBlog(req.body);
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

  async updateBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid blog ID.' });
      }
      const blog = await blogService.updateBlog(id, req.body);
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      res.status(200).json(blog);
    } catch (error) {
      next(error);
    }
  }

  async deleteBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid blog ID.' });
      }
      await blogService.deleteBlog(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const blogController = new BlogController();
