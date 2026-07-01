import { z } from 'zod';

export const mediaBuckets = [
  'blog-images',
  'festival-images',
  'holiday-images',
  'calendar-images',
  'user-avatars',
  'website-assets',
  'documents',
] as const;

export const mediaBucketSchema = z.enum(mediaBuckets);

export const listMediaSchema = z.object({
  bucket: mediaBucketSchema,
  search: z.string().optional(),
  type: z.enum(['all', 'image', 'document']).optional().default('all'),
  sortBy: z.enum(['newest', 'oldest', 'largest', 'smallest']).optional().default('newest'),
});

export const uploadMediaSchema = z.object({
  bucket: mediaBucketSchema,
  files: z.array(z.any()).optional(),
});

export const replaceMediaSchema = z.object({
  bucket: mediaBucketSchema,
  filePath: z.string().min(1),
});

export const renameMediaSchema = z.object({
  bucket: mediaBucketSchema,
  oldFilePath: z.string().min(1),
  newFilePath: z.string().min(1),
});

export const deleteMediaSchema = z.object({
  bucket: mediaBucketSchema,
  filePath: z.string().min(1),
});

export const bulkDeleteMediaSchema = z.object({
  bucket: mediaBucketSchema,
  filePaths: z.array(z.string().min(1)),
});
