const express = require('express');
const { signup, login, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/me').get(protect, getCurrentUser); // ← Add this line

module.exports = router;