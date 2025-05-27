const express = require('express');
const router = express.Router();
const {
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  assignPermissionToRole,
  removePermissionFromRole,
  getRolePermissions
} = require('../controllers/permissionController');
const { verifyToken, checkPermission } = require('../middleware/auth');

// All routes are protected and require appropriate permissions
router.use(verifyToken);

// Permissions CRUD
router.get('/', checkPermission('permissions', 'read'), getPermissions);
router.get('/:id', checkPermission('permissions', 'read'), getPermissionById);
router.post('/', checkPermission('permissions', 'create'), createPermission);
router.put('/:id', checkPermission('permissions', 'update'), updatePermission);
router.delete('/:id', checkPermission('permissions', 'delete'), deletePermission);

// Assign/remove permissions to/from roles
router.post('/roles/:permissionId', checkPermission('roles', 'update'), assignPermissionToRole);
router.delete('/roles/:roleId/:permissionId', checkPermission('roles', 'update'), removePermissionFromRole);
router.get('/roles/:roleId', checkPermission('roles', 'read'), getRolePermissions);

module.exports = router; 