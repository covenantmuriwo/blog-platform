// server/utils/notificationService.js
const Notification = require('../models/Notification');

// Create notification
const createNotification = async (recipientId, senderId, type, postId, commentId, message) => {
  // Don't notify users about their own actions
  if (recipientId.toString() === senderId.toString()) {
    return;
  }

  // Check if similar notification already exists (for grouping)
  const existing = await Notification.findOne({
    recipient: recipientId,
    sender: senderId,
    type,
    postId,
    commentId,
    read: false
  });

  if (existing) {
    // Update timestamp instead of creating duplicate
    existing.createdAt = new Date();
    await existing.save();
    return;
  }

  const notification = new Notification({
    recipient: recipientId,
    sender: senderId,
    type,
    postId,
    commentId,
    message
  });

  await notification.save();
};

// Generate message based on type
const generateMessage = (type, senderName, postTitle) => {
  switch (type) {
    case 'like_post':
      return `${senderName} liked your post "${postTitle}"`;
    case 'like_comment':
      return `${senderName} liked your comment`;
    case 'comment':
      return `${senderName} commented on your post "${postTitle}"`;
    default:
      return 'You have a new notification';
  }
};

module.exports = { createNotification, generateMessage };