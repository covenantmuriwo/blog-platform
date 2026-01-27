// server/routes/likeRoutes.js
const express = require('express');
const { likePost, likeComment } = require('../controllers/likeController');
const { protect } = require('../middleware/auth'); // ✅ CORRECT IMPORT
const router = express.Router();

router.post('/posts/:postId/like', protect, likePost); // ✅ USE 'protect'
router.post('/comments/:commentId/like', protect, likeComment); // ✅ USE 'protect'

module.exports = router;