const express = require('express');
const router = express.Router();
const {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  addRoleToGroup,
  removeRoleFromGroup
} = require('../controllers/roleController');
const { verifyToken, checkPermission } = require('../middleware/auth');

// All routes are protected and require appropriate permissions
router.use(verifyToken);

// Get all roles
router.get('/', checkPermission('roles', 'read'), getRoles);

// Get role by ID
router.get('/:id', checkPermission('roles', 'read'), getRoleById);

// Create new role
router.post('/', checkPermission('roles', 'create'), createRole);

// Update role
router.put('/:id', checkPermission('roles', 'update'), updateRole);

// Delete role
router.delete('/:id', checkPermission('roles', 'delete'), deleteRole);

// Add role to group
router.post('/groups/:groupId', checkPermission('roles', 'update'), addRoleToGroup);

// Remove role from group
router.delete('/groups/:groupId/:roleId', checkPermission('roles', 'update'), removeRoleFromGroup);

module.exports = router; 