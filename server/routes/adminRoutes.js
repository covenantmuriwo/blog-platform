// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();

// ✅ CORRECT IMPORTS - from separate files
const { protect } = require('../middleware/auth');        // ← from auth.js
const { admin } = require('../middleware/admin');         // ← from admin.js

const adminController = require('../controllers/adminController');

console.log('protect:', typeof protect);
console.log('admin:', typeof admin);

// All admin routes are protected
router.use(protect, admin);

// Admin dashboard
router.get('/dashboard', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getAllUsers);
router.delete('/users/:userId', adminController.deleteUser);
router.patch('/users/:userId/block', adminController.toggleUserBlock);

// Post management  
router.get('/posts', adminController.getAllPosts);
router.delete('/posts/:postId', adminController.deletePost);

// Comment management
router.get('/comments', adminController.getAllComments);
router.delete('/comments/:commentId', adminController.deleteComment);

module.exports = router;