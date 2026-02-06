// server/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const commentController = require('../controllers/commentController');
const { likeComment } = require('../controllers/likeController'); // ← ADD THIS

// Public
router.get('/:postId/comments', commentController.getCommentsByPost);

// Protected
router.post('/:postId/comments', protect, commentController.addComment);
router.post('/reply/:commentId', protect, commentController.replyToComment);
router.delete('/:commentId', protect, commentController.deleteComment);
router.post('/:commentId/like', protect, likeComment); // ← ADD THIS

module.exports = router;