const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/userController');
const { verifyToken, checkPermission } = require('../middleware/auth');

// All routes are protected and require appropriate permissions
router.use(verifyToken);

// Get all users
router.get('/', checkPermission('users', 'read'), getUsers);

// Get user by ID
router.get('/:id', checkPermission('users', 'read'), getUserById);

// Create new user
router.post('/', checkPermission('users', 'create'), createUser);

// Update user
router.put('/:id', checkPermission('users', 'update'), updateUser);

// Delete user
router.delete('/:id', checkPermission('users', 'delete'), deleteUser);

module.exports = router; 