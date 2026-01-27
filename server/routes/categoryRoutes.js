// server/routes/categoryRoutes.js
const express = require('express');
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth'); // ✅ CORRECT IMPORT
const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, createCategory); // ✅ USE 'protect' NOT 'auth'

module.exports = router;