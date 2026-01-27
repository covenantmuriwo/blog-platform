// server/routes/postRoutes.js
const express = require('express');
const {
  createPost,
  upload,
  getMyPosts,
  getAllPosts,
  getSinglePost,
  getPostById,
  updatePost,
  deletePost
} = require('../controllers/postController');
const { protect } = require('../middleware/auth'); // ✅ CORRECT IMPORT
const router = express.Router();

// Public routes
router.route('/').get(getAllPosts);

// 👇 MOVE THIS LINE UP (before /:id)
router.route('/me').get(protect, getMyPosts); // ✅ USE 'protect' NOT 'auth'

// Public single post (now safe)
router.route('/:id').get(getSinglePost);

// Private routes
router.route('/').post(protect, upload, createPost); // ✅ USE 'protect'
router.route('/:id')
  .put(protect, upload, updatePost) // ✅ USE 'protect'
  .delete(protect, deletePost); // ✅ USE 'protect'

module.exports = router;