// server/controllers/likeController.js
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { createNotification, generateMessage } = require('../utils/notificationService');

// @desc    Like/Unlike a post
// @route   POST /api/posts/:postId/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user.id;
const wasLiked = post.likes.some(id => id.toString() === userId);

if (wasLiked) {
  // Unlike
  post.likes = post.likes.filter(id => id.toString() !== userId);
} else {
  // Like
  post.likes.push(userId);
}

await post.save();

// Check NEW state after save
// Check NEW state after save
const isLiked = post.likes.some(id => id.toString() === userId);

// Create notification for new likes (not unlikes)
if (!wasLiked && isLiked) {
  // Get sender name
  const user = await User.findById(userId, 'name');
  // Get post with author
  const postWithAuthor = await Post.findById(req.params.postId).populate('author', 'name');
  
  if (user && postWithAuthor && postWithAuthor.author._id.toString() !== userId) {
    const message = generateMessage('like_post', user.name, postWithAuthor.title);
    await createNotification(postWithAuthor.author._id, userId, 'like_post', postWithAuthor._id, null, message);
  }
}

res.json({ 
  success: true, 
  liked: isLiked, 
  likesCount: post.likes.length 
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like/Unlike a comment
// @route   POST /api/comments/:commentId/like
// @access  Private
exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const userId = req.user.id;
const wasLiked = comment.likes.some(id => id.toString() === userId);

if (wasLiked) {
  // Unlike
  comment.likes = comment.likes.filter(id => id.toString() !== userId);
} else {
  // Like
  comment.likes.push(userId);
}

await comment.save();
// 🔔 Create notification for comment author (only on new likes)
if (!wasLiked) {
  const liker = await User.findById(userId, 'name');

// Get the post ID from the comment
const commentDoc = await Comment.findById(comment._id).populate('post');
const postId = commentDoc?.post?._id;

// Don't notify users about their own likes
if (liker && comment.author && comment.author._id.toString() !== userId && postId) {
  const message = `${liker.name} liked your comment`;
  await createNotification(
    comment.author._id, 
    userId, 
    'like_comment', 
    postId, // ← Now includes post ID!
    comment._id, 
    message
  );
}
}

// Check NEW state after save
const isLiked = comment.likes.some(id => id.toString() === userId);

res.json({ 
  success: true, 
  liked: isLiked, 
  likesCount: comment.likes.length 
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};