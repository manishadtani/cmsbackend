import Page from "../models/pageModel.js";
import Section from "../models/sectionModel.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

// Update section content with optional image upload
export const updateSection = async (req, res) => {
  try {
    const { pageSlug, sectionKey } = req.params;
    const imageFile = req.file; // From multer
    const { imageFieldPath, ...contentData } = req.body;

    // Validate required params
    if (!pageSlug || !sectionKey) {
      return res.status(400).json({
        message: "Page slug and section key are required",
      });
    }

    // Validate content
    if ((!contentData || Object.keys(contentData).length === 0) && !imageFile) {
      return res.status(400).json({
        message: "Content to update or image file is required",
      });
    }

    // Prepare update object
    let updateData = { ...contentData };

    // Handle image upload if file provided
    if (imageFile) {
      // Determine folder based on pageSlug
      const folderMap = {
        home: 'varallo/varallohome',
        about: 'varallo/varalloabout',
        contact: 'varallo/varallocontact',
        services: 'varallo/varalloservices',
        blog: 'varallo/varalloblog',
      };

      const folder = folderMap[pageSlug] || `varallo/${pageSlug}`;

      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(
        imageFile,
        folder,
        `${sectionKey}-${Date.now()}`
      );

      if (!uploadResult.success) {
        return res.status(500).json({
          message: "Failed to upload image",
          error: uploadResult.error,
        });
      }

      // Determine where to save image URL in content
      // If imageFieldPath provided: use it (e.g., "content.image.url")
      // Otherwise: default to "image.url"
      if (imageFieldPath) {
        // Parse the field path and set nested value
        const paths = imageFieldPath.split('.');
        let current = updateData;
        for (let i = 0; i < paths.length - 1; i++) {
          if (!current[paths[i]]) {
            current[paths[i]] = {};
          }
          current = current[paths[i]];
        }
        current[paths[paths.length - 1]] = uploadResult.url;
      } else {
        // Default: save to image.url
        if (!updateData.image) {
          updateData.image = {};
        }
        updateData.image.url = uploadResult.url;
      }

      console.log(`✅ Image uploaded successfully: ${uploadResult.url}`);
    }

    // Input validation - check for suspicious data
    // Max size check (prevent extremely large updates)
    const dataSize = JSON.stringify(updateData).length;
    const maxDataSize = 5 * 1024 * 1024; // 5MB max
    if (dataSize > maxDataSize) {
      return res.status(400).json({
        message: `Content size exceeds limit. Max: 5MB, Received: ${(dataSize / (1024 * 1024)).toFixed(2)}MB`,
      });
    }

    // Find and update section
    const section = await Section.findOneAndUpdate(
      { pageSlug, sectionKey },
      { $set: { content: updateData } },
      { new: true, runValidators: true }
    );

    if (!section) {
      return res.status(404).json({
        message: `Section not found: ${sectionKey} in page ${pageSlug}`,
      });
    }

    return res.status(200).json({
      message: "Section updated successfully",
      data: section,
    });
  } catch (error) {
    console.error("Update Section Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};





// Get single page with all sections
export const getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Validate input
    if (!slug) {
      return res.status(400).json({
        message: "Page slug is required",
      });
    }

    // Find page
    const page = await Page.findOne({ slug }).lean();

    if (!page) {
      return res.status(404).json({
        message: "Page not found",
      });
    }

    // Get all sections for this page, sorted by order
    const sections = await Section.find({ pageSlug: slug })
      .sort({ order: 1 })
      .lean();

    // Combine page + sections
    const pageWithSections = {
      ...page,
      sections,
    };

    return res.status(200).json({
      message: "Page fetched successfully",
      data: pageWithSections,
    });
  } catch (error) {
    console.error("Get Page Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get all pages
export const getAllPages = async (req, res) => {
  try {
    const pages = await Page.find({ isActive: true }).lean();

    return res.status(200).json({
      message: "Pages fetched successfully",
      data: pages,
    });
  } catch (error) {
    console.error("Get All Pages Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
