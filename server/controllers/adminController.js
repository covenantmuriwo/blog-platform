// server/controllers/adminController.js
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalComments = await Comment.countDocuments();
    
    res.json({ 
      success: true, 
      stats: { totalUsers, totalPosts, totalComments }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users  
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:userId
// @access  Private/Admin  
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user's posts, comments, etc.
    await Post.deleteMany({ author: req.params.userId });
    await Comment.deleteMany({ author: req.params.userId });
    await User.findByIdAndDelete(req.params.userId);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle user block status
// @route   PATCH /api/admin/users/:userId/block
// @access  Private/Admin
exports.toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isBlocked = !user.isBlocked;
    await user.save();
    
    res.json({ 
      success: true, 
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      isBlocked: user.isBlocked
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// @desc    Get all posts
// @route   GET /api/admin/posts
// @access  Private/Admin
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete post
// @route   DELETE /api/admin/posts/:postId  
// @access  Private/Admin
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Delete post and associated comments
    await Comment.deleteMany({ post: req.params.postId });
    await Post.findByIdAndDelete(req.params.postId);
    
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// @desc    Get all comments
// @route   GET /api/admin/comments
// @access  Private/Admin  
exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('author', 'name email')
      .populate('post', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete comment (and all replies)
// @route   DELETE /api/admin/comments/:commentId
// @access  Private/Admin
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Reuse your existing deleteReplies function
    const deleteReplies = async (commentId) => {
      const replies = await Comment.find({ parentComment: commentId });
      for (const reply of replies) {
        await deleteReplies(reply._id);
        await Comment.findByIdAndDelete(reply._id);
      }
    };

    // Delete all replies first
    await deleteReplies(comment._id);
    
    // Delete the main comment
    await Comment.findByIdAndDelete(req.params.commentId);

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};