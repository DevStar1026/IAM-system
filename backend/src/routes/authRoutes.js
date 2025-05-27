const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, getCurrentUserPermissions } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);
router.get('/me/permissions', verifyToken, getCurrentUserPermissions);

module.exports = router; 