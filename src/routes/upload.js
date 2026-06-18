const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

router.post('/', protect, (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      console.error('Upload Error:', err);
      return res.status(500).json({ message: 'Multer error', error: err.message || err.toString() });
    }
    
    console.log('UPLOAD SUCCESS - req.file:', req.file);

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      message: 'Image uploaded successfully',
      url: req.file.path || req.file.secure_url || req.file.url,
      public_id: req.file.filename // Send back the public_id so frontend has it immediately
    });
  });
});

// Get all uploaded images from Cloudinary (exanor-blog folder)
router.get('/', protect, async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:exanor-blog')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();
      
    res.json(result.resources);
  } catch (error) {
    console.error('Cloudinary fetch error:', error);
    // Fallback to basic resources fetch if Search API is not available on the free tier sometimes
    try {
      const basicResult = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'exanor-blog/',
        max_results: 100
      });
      res.json(basicResult.resources.reverse()); // Reverse to get newest first since api.resources doesn't sort by desc out of the box nicely
    } catch (fallbackError) {
      res.status(500).json({ message: 'Failed to fetch media', error: fallbackError.message });
    }
  }
});

// Delete an image from Cloudinary
router.delete('/', protect, async (req, res) => {
  try {
    const public_id = req.query.public_id;
    if (!public_id) {
      return res.status(400).json({ message: 'public_id is required' });
    }
    await cloudinary.uploader.destroy(public_id);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({ message: 'Failed to delete media', error: error.message });
  }
});

module.exports = router;
