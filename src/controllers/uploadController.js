import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js';
import Page from '../models/pageModel.js';
import Section from '../models/sectionModel.js';

/**
 * Upload image and get CDN URL
 * POST /api/upload
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    const { sectionKey, pageSlug = 'home', folder } = req.body;
    const customFolder = folder || `varallo-images/${pageSlug}/${sectionKey || 'general'}`;

    console.log('📸 Upload Request:', {
      file: req.file.originalname,
      size: req.file.size,
      folder: customFolder,
    });

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(
      req.file,
      customFolder,
      req.file.originalname.split('.')[0]
    );

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Upload failed',
        error: uploadResult.error,
      });
    }

    console.log('✅ Upload Successful:', uploadResult.url);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      sectionKey,
      pageSlug,
    });
  } catch (error) {
    console.error('❌ Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    });
  }
};

/**
 * Upload and Update Section Image
 * POST /api/upload/section
 */
export const uploadSectionImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    const { sectionKey, pageSlug = 'home' } = req.body;

    if (!sectionKey) {
      return res.status(400).json({
        success: false,
        message: 'sectionKey is required',
      });
    }

    console.log('🖼️ Uploading Section Image:', {
      file: req.file.originalname,
      sectionKey,
      pageSlug,
    });

    // Upload to Cloudinary
    const customFolder = `varallo-images/${pageSlug}/${sectionKey}`;
    const uploadResult = await uploadToCloudinary(
      req.file,
      customFolder,
      `${sectionKey}-${Date.now()}`
    );

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Upload failed',
        error: uploadResult.error,
      });
    }

    // Update Database - Find section and update image URL
    const section = await Section.findOne({
      pageSlug,
      sectionKey,
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      });
    }

    // Update section content with new image URL
    if (!section.content.image) {
      section.content.image = {};
    }
    section.content.image.url = uploadResult.url;
    section.content.image.publicId = uploadResult.publicId;

    await section.save();

    console.log('✅ Section Image Updated in Database');

    res.json({
      success: true,
      message: 'Section image uploaded and updated successfully',
      url: uploadResult.url,
      sectionKey,
      pageSlug,
    });
  } catch (error) {
    console.error('❌ Section Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    });
  }
};

/**
 * Upload multiple images for cards/arrays
 * POST /api/upload/multiple
 */
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided',
      });
    }

    const { sectionKey, pageSlug = 'home' } = req.body;

    console.log(`📤 Uploading ${req.files.length} files`);

    const customFolder = `varallo-images/${pageSlug}/${sectionKey}`;
    const uploadedImages = [];

    for (const file of req.files) {
      const uploadResult = await uploadToCloudinary(
        file,
        customFolder,
        file.originalname.split('.')[0]
      );

      if (uploadResult.success) {
        uploadedImages.push({
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          originalName: file.originalname,
        });
      }
    }

    res.json({
      success: true,
      message: `${uploadedImages.length} images uploaded`,
      images: uploadedImages,
      sectionKey,
      pageSlug,
    });
  } catch (error) {
    console.error('❌ Multiple Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    });
  }
};

/**
 * Delete image from Cloudinary
 * DELETE /api/upload/:publicId
 */
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'publicId is required',
      });
    }

    const result = await deleteFromCloudinary(publicId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Delete failed',
        error: result.error,
      });
    }

    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete Error:', error);
    res.status(500).json({
      success: false,
      message: 'Delete failed',
      error: error.message,
    });
  }
};
