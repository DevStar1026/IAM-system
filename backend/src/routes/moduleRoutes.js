const express = require('express');
const router = express.Router();
const {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
} = require('../controllers/moduleController');
const { verifyToken, checkPermission } = require('../middleware/auth');

// All routes are protected and require appropriate permissions
router.use(verifyToken);

// Get all groups
router.get('/', checkPermission('groups', 'read'), getModules);

// Get group by ID
router.get('/:id', checkPermission('groups', 'read'), getModuleById);

// Create new group
router.post('/', checkPermission('groups', 'create'), createModule);

// Update group
router.put('/:id', checkPermission('groups', 'update'), updateModule);

// Delete group
router.delete('/:id', checkPermission('groups', 'delete'), deleteModule);

// Add user to group
//router.post('/:groupId/users', checkPermission('groups', 'update'), addUserToModule);

// Remove user from group
//router.delete('/:groupId/users/:userId', checkPermission('groups', 'update'), removeUserFromModule);

module.exports = router; 