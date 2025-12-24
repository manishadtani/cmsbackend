import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {File or Buffer} file - File to upload (from multer)
 * @param {String} folder - Cloudinary folder path (e.g., 'varallo/varallohome')
 * @param {String} fileName - Custom file name (optional)
 * @returns {Promise<Object>} - { success, url, publicId } or { success, error }
 */
export const uploadToCloudinary = async (file, folder = 'varallo/varallohome', fileName = null) => {
  try {
    console.log(`📤 Uploading to Cloudinary - Folder: ${folder}, Size: ${file.size} bytes`);

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File size exceeds 2MB limit. Received: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      };
    }

    // If file is buffer (from multer)
    if (file.buffer) {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          {
            folder: folder,
            public_id: fileName || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            resource_type: 'auto',
            quality: 'auto',
            fetch_format: 'auto',
          },
          (error, result) => {
            if (error) {
              console.error('❌ Cloudinary Upload Error:', error);
              reject({
                success: false,
                error: error.message,
              });
            } else {
              console.log('✅ Cloudinary Upload Success:', result.secure_url);
              resolve({
                success: true,
                url: result.secure_url,
                publicId: result.public_id,
              });
            }
          }
        );
        stream.end(file.buffer);
      });
    }

    throw new Error('Invalid file format - buffer required');
  } catch (error) {
    console.error('❌ Cloudinary Upload Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise<Object>}
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    console.log(`🗑️ Deleting from Cloudinary: ${publicId}`);
    const result = await cloudinary.v2.uploader.destroy(publicId);
    console.log('✅ Cloudinary Delete Success');
    return { success: true };
  } catch (error) {
    console.error('❌ Cloudinary Delete Error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
};
