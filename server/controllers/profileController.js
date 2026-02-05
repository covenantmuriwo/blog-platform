// server/controllers/profileController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Helper to generate full image URL with proper path separators
const getFullImageUrl = (relativePath) => {
  if (!relativePath) return '';
  if (relativePath.startsWith('http')) return relativePath;
  
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  
  // Convert backslashes to forward slashes for URLs
  const normalizedPath = relativePath.replace(/\\/g, '/');
  
  return `${baseUrl}/${normalizedPath}`;
};

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    // Normalize Windows paths to forward slashes
    if (user && user.profilePicture) {
      user.profilePicture = user.profilePicture.replace(/\\/g, '/');
    }
    
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, about } = req.body;
    const updateData = { name, about };
    
    // Handle profile picture if provided
    if (req.file) {
      // Normalize path to forward slashes
      updateData.profilePicture = req.file.path.replace(/\\/g, '/');
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    // Ensure profile picture uses forward slashes
    if (user.profilePicture) {
      user.profilePicture = user.profilePicture.replace(/\\/g, '/');
    }
    
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change password
// @route   POST /api/profile/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Just assign the plain password - the pre-save hook will hash it
user.password = newPassword;
await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// @desc    Remove profile picture
// @route   DELETE /api/profile/remove-picture
// @access  Private
exports.removeProfilePicture = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { profilePicture: '' });
    res.json({ success: true, message: 'Profile picture removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};