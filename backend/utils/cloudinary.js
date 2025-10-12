const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} folder - Cloudinary folder path
 * @param {string} fileName - Original file name
 * @returns {Promise<Object>} Upload result with url and public_id
 */
const uploadToCloudinary = async (fileBuffer, folder = 'SIH/Evidence', fileName) => {
  try {
    const result = await cloudinary.uploader.upload(
      `data:${fileBuffer.mimetype};base64,${fileBuffer.buffer.toString('base64')}`,
      {
        folder: folder,
        public_id: `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}`,
        resource_type: 'auto', // Automatically detect file type
        quality: 'auto', // Optimize quality
        fetch_format: 'auto' // Optimize format
      }
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
      originalName: fileName,
      size: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to cloud storage');
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw new Error('Failed to delete file from cloud storage');
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  cloudinary
};
