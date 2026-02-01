// server/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const commentController = require('../controllers/commentController');

// These routes are mounted under /api/posts/:postId/comments
router.get('/', commentController.getCommentsByPost);     // GET /api/posts/:id/comments
router.post('/', protect, commentController.addComment); // POST /api/posts/:id/comments

// Reply and delete use top-level comment routes
router.post('/reply', protect, commentController.replyToComment); // POST /api/comments/reply
router.delete('/:commentId', protect, commentController.deleteComment); // DELETE /api/comments/:id

module.exports = router;