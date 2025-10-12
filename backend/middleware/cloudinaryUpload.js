const { uploadToCloudinary } = require('../utils/cloudinary');

/**
 * Middleware to upload file to Cloudinary
 * Expects req.file from multer middleware
 * Adds upload result to req.uploadResult
 */
const cloudinaryUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(
      req.file,
      'SIH/Evidence',
      req.file.originalname
    );

    // Add upload result to request object
    req.uploadResult = uploadResult;
    next();
  } catch (error) {
    console.error('❌ Cloudinary upload middleware error:', error);
    return res.status(500).json({ 
      message: 'Failed to upload file to cloud storage',
      error: error.message 
    });
  }
};

module.exports = cloudinaryUpload;
