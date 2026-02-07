// server/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const commentController = require('../controllers/commentController');
const { likeComment } = require('../controllers/likeController');

// Public: Get comments for a post
router.get('/:postId/comments', commentController.getCommentsByPost);

// Protected: Create comment
router.post('/:postId/comments', protect, commentController.addComment);

// Protected: Reply to a comment
router.post('/comments/:commentId/reply', protect, commentController.replyToComment);

// Protected: Delete a comment
router.delete('/comments/:commentId', protect, commentController.deleteComment);

// Protected: Like a comment
router.post('/comments/:commentId/like', protect, likeComment);

module.exports = router;