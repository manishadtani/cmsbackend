import express from 'express';
import multer from 'multer';
import {
  uploadImage,
  uploadSectionImage,
  uploadMultipleImages,
  deleteImage,
} from '../controllers/uploadController.js';

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5000000, // 1MB max
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

/**
 * POST /api/upload
 * Simple image upload (returns URL only)
 */
router.post('/', upload.single('image'), uploadImage);

/**
 * POST /api/upload/section
 * Upload image and update section in database
 */
router.post('/section', upload.single('image'), uploadSectionImage);

/**
 * POST /api/upload/multiple
 * Upload multiple images for cards, sliders, etc.
 */
router.post('/multiple', upload.array('images', 10), uploadMultipleImages);

/**
 * DELETE /api/upload/:publicId
 * Delete image from Cloudinary
 */
router.delete('/:publicId', deleteImage);

export default router;
