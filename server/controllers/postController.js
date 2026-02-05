// server/controllers/postController.js
const Post = require('../models/Post');
const cloudinary = require('../utils/cloudinary');
const multer = require('multer');

// Use memory storage (files as buffers)
const upload = multer({ storage: multer.memoryStorage() });

// Helper: Upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder = 'blog_posts') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    const sanitizeHtml = require('sanitize-html');
    const cleanContent = sanitizeHtml(content, {
      allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span', 'img'],
      allowedAttributes: {
        a: ['href', 'name', 'target'],
        img: ['src', 'alt'],
        '*': ['class']
      },
      allowedSchemes: ['http', 'https']
    });

    const author = req.user.id;

    let images = [];
    if (req.files && req.files.length > 0) {
      // Upload all files to Cloudinary
      const uploadPromises = req.files.map(file =>
        uploadToCloudinary(file.buffer)
      );
      images = await Promise.all(uploadPromises);
    }

    const post = await Post.create({
      title,
      content: cleanContent, // ✅ FIXED: Use cleanContent instead of content
      images,
      author,
      category: category || undefined // Optional category
    });

    res.status(201).json({
      success: true,
      post
    });
  } catch (err) {
    console.error('Post creation error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to handle file uploads (in memory)
exports.upload = multer({ storage: multer.memoryStorage() }).array('images', 5);
// @desc    Get all posts by logged-in user
// @route   GET /api/posts/me
// @access  Private
exports.getMyPosts = async (req, res) => {
  try {
    console.log('User from token:', req.user); // 🔍 Debug log

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: No user ID' });
    }

    const posts = await Post.find({ author: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err) {
    console.error('getMyPosts error:', err); // 🔥 Full error
    res.status(500).json({ message: 'Server error' });
  }
};
// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Private
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    // Only allow author or admin to view
    if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json({ success: true, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content, category } = req.body;

    // ✅ ADD SANITIZATION HERE
    const sanitizeHtml = require('sanitize-html');
    const cleanContent = sanitizeHtml(content, {
      allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span', 'img'],
      allowedAttributes: {
        a: ['href', 'name', 'target'],
        img: ['src', 'alt'],
        '*': ['class']
      },
      allowedSchemes: ['http', 'https']
    });

    let images = post.images; // Default: keep existing images

    // If new files uploaded, replace images with Cloudinary URLs
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file =>
        new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'blog_posts', resource_type: 'auto' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          uploadStream.end(file.buffer);
        })
      );
      images = await Promise.all(uploadPromises);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content: cleanContent, images, category: category || undefined }, // ✅ Use cleanContent
      { new: true, runValidators: true }
    );

    res.json({ success: true, post: updatedPost });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// @desc    Get all public posts (for homepage)
// @route   GET /api/posts
// @access  Public
exports.getAllPosts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    
    // Category filter
    if (category) {
      query.category = category;
    }

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive
      query.$or = [
        { title: searchRegex },
        { content: searchRegex }
      ];
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate('author', 'name profilePicture createdAt')
      .populate('category', 'name');
    
    res.json({ success: true, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single post by ID (public)
// @route   GET /api/posts/:id
// @access  Public
// In getSinglePost
exports.getSinglePost = async (req, res) => {
  try {
   const post = await Post.findById(req.params.id)
  .populate('author', 'name profilePicture') // ← Added profilePicture
  .populate('category', 'name');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Convert likes to strings
    const postObj = post.toObject();
    postObj.likes = post.likes.map(id => id.toString());

    res.json({ success: true, post: postObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};