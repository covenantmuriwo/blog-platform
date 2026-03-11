// server/routes/postRoutes.js

const express = require('express');
const { likePost } = require('../controllers/likeController');
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
const router = express.Router();

// Public routes
router.route('/').get(getAllPosts).post(protect, upload, createPost);

// My posts
router.route('/me').get(protect, getMyPosts);

// ✅ LIKE ROUTE FIRST
router.post('/:id/like', protect, likePost);

// Single post routes
router.get('/:id', getSinglePost);
router.put('/:id', protect, upload, updatePost);
router.delete('/:id', protect, deletePost);


module.exports = router;