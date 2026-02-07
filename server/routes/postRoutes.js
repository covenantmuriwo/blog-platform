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

// My posts (private)
router.route('/me').get(protect, getMyPosts);

// Single post routes — SEPARATE METHODS
router.get('/:id', getSinglePost);                    // public
router.put('/:id', protect, upload, updatePost);      // private
router.delete('/:id', protect, deletePost);           // private
router.post('/:id/like', protect, likePost);          // ✅ LIKE ROUTE

module.exports = router;