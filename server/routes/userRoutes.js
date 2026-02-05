// server/routes/userRoutes.js
const express = require('express');
const { getUserProfile } = require('../controllers/userController');

const router = express.Router();

router.get('/:id', getUserProfile);

module.exports = router;