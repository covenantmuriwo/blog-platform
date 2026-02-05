// server/routes/profileRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth'); // ✅ CORRECT IMPORT
const { getProfile, updateProfile, changePassword, removeProfilePicture } = require('../controllers/profileController');

const router = express.Router();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use forward slashes in the stored path
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Make sure uploads directory exists
const fs = require('fs');
const uploadDir = './uploads/profile-pictures';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Routes - ✅ USE 'protect' NOT 'auth'
router.get('/', protect, getProfile);
router.put('/', protect, upload.single('profilePicture'), updateProfile);
router.post('/change-password', protect, changePassword);
router.delete('/remove-picture', protect, removeProfilePicture);

module.exports = router;