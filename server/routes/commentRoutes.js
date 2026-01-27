// server/routes/commentRoutes.js
const express = require('express');
const router = express.Router();

// ✅ CORRECT IMPORT - destructure the protect function
const { protect } = require('../middleware/auth');

// Import controller
const commentController = require('../controllers/commentController');

// Public routes (no auth required)
router.get('/posts/:postId/comments', commentController.getCommentsByPost);
router.get('/:postId', commentController.getComments);

// Protected routes (auth required) - ✅ USE 'protect' NOT 'auth'
router.post('/:postId/comments', protect, commentController.addComment);
router.post('/:commentId/reply', protect, commentController.replyToComment);
router.delete('/:commentId', protect, commentController.deleteComment);

module.exports = router;