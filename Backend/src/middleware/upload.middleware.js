const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure disk storage details
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname).toLowerCase()
    );
  }
});

// Enforce image and brochure PDF types
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|gif|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  const isExtensionValid = allowedExtensions.test(ext);

  const isMimeValid = file.mimetype === 'application/pdf' || /image\/(jpeg|jpg|png|webp|gif)/.test(file.mimetype);

  if (isExtensionValid && isMimeValid) {
    cb(null, true);
  } else {
    cb(new Error('Access denied: upload must be a valid image file (jpeg, jpg, png, webp, gif) or PDF document'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
