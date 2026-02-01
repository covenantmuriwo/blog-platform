// server/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const commentController = require('../controllers/commentController');

// These routes are mounted under /api/posts/:postId/comments
// So: GET / → GET /api/posts/:postId/comments
router.get('/', commentController.getCommentsByPost);
router.post('/', protect, commentController.addComment);

// Top-level comment routes (not nested under posts)
router.post('/reply', protect, commentController.replyToComment);
router.delete('/:commentId', protect, commentController.deleteComment);

module.exports = router;