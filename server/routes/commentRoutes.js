// server/routes/commentRoutes.js
const express = require('express');
const { protect } = require('../middleware/auth');
const commentController = require('../controllers/commentController');
const { likeComment } = require('../controllers/likeController');

// 👇 Router for routes under /api/posts (fetching & creating comments)
const postCommentRouter = express.Router();
postCommentRouter.get('/:postId/comments', commentController.getCommentsByPost);
postCommentRouter.post('/:postId/comments', protect, commentController.addComment);

// 👇 Router for routes under /api/comments (actions on individual comments)
const commentActionRouter = express.Router();
commentActionRouter.post('/comments/:commentId/reply', protect, commentController.replyToComment);
commentActionRouter.delete('/comments/:commentId', protect, commentController.deleteComment);
commentActionRouter.post('/comments/:commentId/like', protect, likeComment);

// Export both
module.exports = {
  postCommentRouter,
  commentActionRouter
};