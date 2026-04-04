import express from 'express';
import { upload } from '../config/cloudinary.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Allow up to 10 images at once
router.post('/', protect, admin, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No images provided for upload' });
  }

  const uploadedUrls = req.files.map((file) => file.path); // Cloudinary assigns the final URL to `file.path`

  res.status(200).json({
    message: 'Images uploaded successfully',
    urls: uploadedUrls,
  });
});

export default router;
