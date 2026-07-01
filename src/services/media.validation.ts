import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

export const uploadSchema = z.object({
  file: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
    .refine(
      (file) => ALLOWED_TYPES.includes(file?.mimetype),
      'Only .jpg, .jpeg, .png, .webp, .svg and .pdf formats are supported.',
    ),
});

export const renameSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name cannot be empty.'),
  }),
  params: z.object({
    id: z.string(), // Assuming media metadata ID
  }),
});

export const bulkDeleteSchema = z.object({
  body: z.object({
    ids: z.array(z.string()).min(1, 'At least one ID is required for bulk delete.'),
  }),
});