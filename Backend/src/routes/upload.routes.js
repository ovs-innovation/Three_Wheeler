const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { protectAdmin } = require('../middleware/auth.middleware');

/**
 * @desc Upload single file (image or brochure PDF)
 * @route POST /api/uploads
 * @access Private (Admin Only)
 */
router.post('/', protectAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Upload failed',
      data: null,
      errors: ['No file uploaded']
    });
  }

  // Construct dynamic fully qualified URL to the file
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      url: fileUrl,
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`
    },
    errors: null
  });
});

module.exports = router;
