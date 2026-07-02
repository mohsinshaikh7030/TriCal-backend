import { z } from 'zod';

export const createBlogSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  content: z.string().min(10, 'Content must be at least 10 characters long'),
  category_id: z.string().uuid('Invalid category ID').optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export const updateBlogSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters long').optional(),
    content: z.string().min(10, 'Content must be at least 10 characters long').optional(),
    category_id: z.string().uuid('Invalid category ID').optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  });
