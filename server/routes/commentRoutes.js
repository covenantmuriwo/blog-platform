// server/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const commentController = require('../controllers/commentController');

// Public: GET /api/posts/:postId/comments
router.get('/:postId/comments', commentController.getCommentsByPost);

// Protected: POST /api/posts/:postId/comments
router.post('/:postId/comments', protect, commentController.addComment);

// Other routes
router.post('/reply/:commentId', protect, commentController.replyToComment);
router.delete('/:commentId', protect, commentController.deleteComment);

module.exports = router;