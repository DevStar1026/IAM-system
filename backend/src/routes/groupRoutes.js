const express = require('express');
const router = express.Router();
const {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addUserToGroup,
  removeUserFromGroup
} = require('../controllers/groupController');
const { verifyToken, checkPermission } = require('../middleware/auth');

// All routes are protected and require appropriate permissions
router.use(verifyToken);

// Get all groups
router.get('/', checkPermission('groups', 'read'), getGroups);

// Get group by ID
router.get('/:id', checkPermission('groups', 'read'), getGroupById);

// Create new group
router.post('/', checkPermission('groups', 'create'), createGroup);

// Update group
router.put('/:id', checkPermission('groups', 'update'), updateGroup);

// Delete group
router.delete('/:id', checkPermission('groups', 'delete'), deleteGroup);

// Add user to group
router.post('/:groupId/users', checkPermission('groups', 'update'), addUserToGroup);

// Remove user from group
router.delete('/:groupId/users/:userId', checkPermission('groups', 'update'), removeUserFromGroup);

module.exports = router; 