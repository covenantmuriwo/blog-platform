// server/controllers/userController.js
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get public user profile
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(req.params.id).select('-password -isBlocked');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // 🔥 FORCE RELATIVE PATH — strip ANY full URL and normalize
    if (user.profilePicture) {
      // Remove any protocol + domain (http://localhost:5000, https://example.com, etc.)
      user.profilePicture = user.profilePicture.replace(/^https?:\/\/[^\/]+\/?/, '');
      // Ensure it starts with "uploads/"
      if (!user.profilePicture.startsWith('uploads/')) {
        user.profilePicture = 'uploads/' + user.profilePicture.replace(/^uploads\/?/, '');
      }
      // Final safety: no backslashes
      user.profilePicture = user.profilePicture.replace(/\\/g, '/');
    }
    
    res.json({ success: true, user });
  } catch (err) {
    console.error('Public profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};