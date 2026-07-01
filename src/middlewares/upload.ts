import multer from 'multer';
import path from 'path';
import { ApiError } from '@/utils/ApiError';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
const allowedDocumentTypes = ['application/pdf'];
const allowedMimeTypes = [...allowedImageTypes, ...allowedDocumentTypes];

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only images (JPEG, PNG, WEBP, SVG) and PDFs are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});
