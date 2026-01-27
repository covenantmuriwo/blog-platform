// server/models/Comment.js
const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  likes: [{ // ← Add this
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    select: true
  }]
}, {
  timestamps: true
});
// At the very bottom
module.exports = mongoose.model('Comment', commentSchema);