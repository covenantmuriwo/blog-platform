// server/controllers/commentController.js
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const { createNotification, generateMessage } = require('../utils/notificationService');
const Notification = require('../models/Notification');

// @desc    Add comment to post
// @route   POST /api/posts/:postId/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;

    // Validate post exists and get author info in one query
    const post = await Post.findById(postId).populate('author', 'name');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      content,
      author: req.user.id,
      post: postId
    });

    await comment.save();

    // Create notification for post author
    const commenter = await User.findById(req.user.id, 'name');

    if (post && post.author && commenter && post.author._id.toString() !== req.user.id) {
      const message = generateMessage('comment', commenter.name, post.title);
      await createNotification(post.author._id, req.user.id, 'comment', post._id, comment._id, message);
    }

    // Populate author info
    await comment.populate('author', 'name');

    res.status(201).json({ success: true, comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name profilePicture')
      .sort({ createdAt: -1 });

    // Convert likes to strings
    const commentsWithLikes = comments.map(comment => {
      const commentObj = comment.toObject();
      commentObj.likes = comment.likes.map(id => id.toString());
      return commentObj;
    });

    res.json({ success: true, comments: commentsWithLikes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// @desc    Reply to a comment
// @route   POST /api/comments/:commentId/reply
// @access  Private
exports.replyToComment = async (req, res) => {
  try {
    const { content } = req.body;
    const parentCommentId = req.params.commentId;
    
    // Validate parent comment exists
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      return res.status(404).json({ message: 'Parent comment not found' });
    }

    // Create reply
    const reply = new Comment({
      content,
      author: req.user.id,
      post: parentComment.post,
      parentComment: parentCommentId
    });

    await reply.save();

    // Populate author for response
    await reply.populate('author', 'name profilePicture');

    // Create notification for parent comment author
    if (parentComment.author.toString() !== req.user.id) {
      const notification = new Notification({
        recipient: parentComment.author,
        sender: req.user.id,
        postId: parentComment.post,
        commentId: reply._id,
        message: `replied to your comment`,
        type: 'comment_reply'
      });
      await notification.save();
    }

    res.status(201).json({ success: true, comment: reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// @desc    Get all comments for a post (including nested replies)
// @route   GET /api/posts/:postId/comments  
// @access  Public
exports.getCommentsByPost = async (req, res) => {
  try {
    console.log('🔍 DEBUG: Fetching comments for post:', req.params.postId);
    console.log('🔍 DEBUG: Request user:', req.user?.id);
    // Get ALL comments for the post
    const allComments = await Comment.find({ 
      post: req.params.postId
    }).populate('author', 'name profilePicture');

    console.log('🔍 DEBUG: Total comments found:', allComments.length);
    allComments.forEach((comment, index) => {
      console.log(`🔍 DEBUG: Comment ${index}:`, {
        id: comment._id,
        author: comment.author?._id,
        content: comment.content.substring(0, 20) + '...',
        parentComment: comment.parentComment
      });
    });

    // Convert to plain objects
    const allCommentsPlain = allComments.map(comment => comment.toObject());

    // Build nested structure recursively
// Build nested structure recursively - IMPROVED VERSION
const buildCommentTree = (comments) => {
  // Create a map for O(1) lookup
  const commentMap = new Map();
  
  // Initialize all comments with empty replies array
  comments.forEach(comment => {
    commentMap.set(comment._id.toString(), {
      ...comment,
      replies: []
    });
  });

  // Separate root comments and build reply hierarchy
  const rootComments = [];
  
  comments.forEach(comment => {
    if (comment.parentComment === null) {
      // This is a root comment
      rootComments.push(commentMap.get(comment._id.toString()));
    } else {
      // This is a reply - add it to its parent
      const parentId = comment.parentComment.toString();
      const parent = commentMap.get(parentId);
      if (parent) {
        parent.replies.push(commentMap.get(comment._id.toString()));
      }
    }
  });

  return rootComments;
};

const commentsWithReplies = buildCommentTree(allCommentsPlain);

    res.json({ success: true, comments: commentsWithReplies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete the comment and all its replies recursively
    const deleteReplies = async (commentId) => {
      const replies = await Comment.find({ parentComment: commentId });
      for (const reply of replies) {
        await deleteReplies(reply._id); // Recursively delete nested replies
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