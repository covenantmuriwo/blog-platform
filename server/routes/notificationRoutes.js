// server/routes/notificationRoutes.js
const express = require('express');
const { 
  getNotifications, 
  markAsRead, 
  markAllAsRead 
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth'); // ✅ CORRECT IMPORT
const router = express.Router();

router.route('/')
  .get(protect, getNotifications); // ✅ USE 'protect' NOT 'auth'

router.route('/:id/read')
  .put(protect, markAsRead); // ✅ USE 'protect'

router.route('/read-all')
  .put(protect, markAllAsRead); // ✅ USE 'protect'

module.exports = router;