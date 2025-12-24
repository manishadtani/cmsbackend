import express from "express";
import { getPageBySlug, getAllPages, updateSection } from "../controllers/pageController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = express.Router();

// Multer configuration for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only images
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, png, webp, gif)'));
    }
  },
});

// Get page by slug (with all sections) - PUBLIC
router.get("/:slug", getPageBySlug);

// Get all pages - PUBLIC
router.get("/", getAllPages);

// PATCH: Update section content with optional image upload - ADMIN ONLY
router.patch(
  "/sections/:pageSlug/:sectionKey",
  upload.single('imageFile'),
  updateSection
);

export default router;
