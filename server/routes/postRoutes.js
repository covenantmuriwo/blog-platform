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

// Single post routes — COMBINE ALL METHODS
router.route('/:id')
  .get(getSinglePost)                    // public
  .put(protect, upload, updatePost)      // private
  .delete(protect, deletePost) 
  .post('/like', protect, likePost);        // private

module.exports = router;