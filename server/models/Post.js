// server/models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
    trim: true
  },
  images: [{
    type: String // Cloudinary URLs or local paths
  }],

  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  
},  
 category: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Category'
},
likes: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  select: true
}]
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', PostSchema);