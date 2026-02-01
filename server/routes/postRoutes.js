// server/routes/postRoutes.js
const express = require('express');
const {
  createPost,
  upload,
  getMyPosts,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const commentRoutes = require('./commentRoutes'); // ← ADD THIS IMPORT

const router = express.Router();

// Public routes
router.route('/').get(getAllPosts);
router.route('/me').get(protect, getMyPosts);
router.route('/:id').get(getSinglePost);

// Private routes
router.route('/')
  .post(protect, upload, createPost);
router.route('/:id')
  .put(protect, upload, updatePost)
  .delete(protect, deletePost);

// ✅ Mount comment routes under /api/posts/:postId/comments
router.use('/:postId/comments', commentRoutes);

module.exports = router;