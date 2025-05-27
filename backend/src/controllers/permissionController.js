const db = require('../config/database');

// Get all permissions
const getPermissions = async (req, res) => {
  try {
    db.all(
      `SELECT p.*, m.name as module_name FROM permissions p JOIN modules m ON p.module_id = m.id`,
      [],
      (err, permissions) => {
        if (err) {
          console.error('Error fetching permissions:', err);
          return res.status(500).json({ message: 'Error fetching permissions' });
        }
        res.json({ permissions:permissions });
      }
    );
  } catch (err) {
    console.error('Error in getPermissions:', err);
    res.status(500).json({ message: 'Error fetching permissions' });
  }
};

// Get permission by ID
const getPermissionById = async (req, res) => {
  const { id } = req.params;
  try {
    db.get(
      `SELECT p.*, m.name as module_name FROM permissions p JOIN modules m ON p.module_id = m.id WHERE p.id = ?`,
      [id],
      (err, permission) => {
        if (err) {
          console.error('Error fetching permission:', err);
          return res.status(500).json({ message: 'Error fetching permission' });
        }
        if (!permission) {
          return res.status(404).json({ message: 'Permission not found' });
        }
        res.json({ permission });
      }
    );
  } catch (err) {
    console.error('Error in getPermissionById:', err);
    res.status(500).json({ message: 'Error fetching permission' });
  }
};

// Create new permission
const createPermission = async (req, res) => {
  const { moduleId, action, description, name } = req.body;
  try {
    // Check if permission exists
    db.get(
      'SELECT * FROM permissions WHERE module_id = ? AND action = ?',
      [moduleId, action],
      (err, existingPermission) => {
        if (err) {
          console.error('Error checking existing permission:', err);
          return res.status(500).json({ message: 'Error checking existing permission' });
        }
        if (existingPermission) {
          return res.status(400).json({ message: 'Permission already exists for this module and action' });
        }
        // Insert new permission
        db.run(
          'INSERT INTO permissions (name, module_id, action, description) VALUES (?, ?, ?, ?)',
          [name, moduleId, action, description],
          function(err) {
            if (err) {
              console.error('Error creating permission:', err);
              return res.status(500).json({ message: 'Error creating permission' });
            }
            res.status(201).json({
              message: 'Permission created successfully',
              permission: {
                id: this.lastID,
                moduleId,
                action
              }
            });
          }
        );
      }
    );
  } catch (err) {
    console.error('Error in createPermission:', err);
    res.status(500).json({ message: 'Error creating permission' });
  }
};

// Update permission
const updatePermission = async (req, res) => {
  const { id } = req.params;
  const { moduleId, action, description } = req.body;
  try {
    db.get(
      'SELECT * FROM permissions WHERE id = ?',
      [id],
      (err, permission) => {
        if (err) {
          console.error('Error checking permission:', err);
          return res.status(500).json({ message: 'Error checking permission' });
        }
        if (!permission) {
          return res.status(404).json({ message: 'Permission not found' });
        }
        // Update permission
        db.run(
          'UPDATE permissions SET name = ?, module_id = ?, action = ? , description = ? WHERE id = ?',
          [name, moduleId, action, description, id],
          function(err) {
            if (err) {
              console.error('Error updating permission:', err);
              return res.status(500).json({ message: 'Error updating permission' });
            }
            res.json({
              message: 'Permission updated successfully',
              permission: {
                id,
                moduleId,
                action
              }
            });
          }
        );
      }
    );
  } catch (err) {
    console.error('Error in updatePermission:', err);
    res.status(500).json({ message: 'Error updating permission' });
  }
};

// Delete permission
const deletePermission = async (req, res) => {
  const { id } = req.params;
  try {
    db.run('DELETE FROM permissions WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting permission:', err);
        return res.status(500).json({ message: 'Error deleting permission' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Permission not found' });
      }
      res.json({ message: 'Permission deleted successfully' });
    });
  } catch (err) {
    console.error('Error in deletePermission:', err);
    res.status(500).json({ message: 'Error deleting permission' });
  }
};

// Assign permission to role
const assignPermissionToRole = async (req, res) => {
  const { permissionId } = req.params;
  const { roleIds } = req.body;

  roleIds.map((roleId)=> {
    try {
      // Check if role and permission exist
      db.get('SELECT * FROM roles WHERE id = ?', [roleId], (err, role) => {
        if (err || !role) {
          return res.status(404).json({ message: 'Role not found' });
        }
        db.get('SELECT * FROM permissions WHERE id = ?', [permissionId], (err, permission) => {
          if (err || !permission) {
            return res.status(404).json({ message: 'Permission not found' });
          }
          // Check if already assigned
          db.get('SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ?', [roleId, permissionId], (err, existing) => {
            if (existing) {
              return res.status(400).json({ message: 'Permission already assigned to role' });
            }
            // Assign
            db.run('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [roleId, permissionId], function (err) {
              if (err) {
                return res.status(500).json({ message: 'Error assigning permission to role' });
              }
              res.status(201).json({ message: 'Permission assigned to role successfully' });
            });
          });
        });
      });
    } catch (err) {
      res.status(500).json({ message: 'Error assigning permission to role' });
    }
  });
  
};

// Remove permission from role
const removePermissionFromRole = async (req, res) => {
  const { roleId, permissionId } = req.params;
  try {
    db.run('DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?', [roleId, permissionId], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error removing permission from role' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Permission not assigned to role' });
      }
      res.json({ message: 'Permission removed from role successfully' });
    });
  } catch (err) {
    res.status(500).json({ message: 'Error removing permission from role' });
  }
};

// Get all permissions for a role
const getRolePermissions = async (req, res) => {
  const { roleId } = req.params;
  try {
    db.all(
      `SELECT p.*, m.name as module_name FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN modules m ON p.module_id = m.id
       WHERE rp.role_id = ?`,
      [roleId],
      (err, permissions) => {
        if (err) {
          return res.status(500).json({ message: 'Error fetching role permissions' });
        }
        res.json({ permissions });
      }
    );
  } catch (err) {
    res.status(500).json({ message: 'Error fetching role permissions' });
  }
};

module.exports = {
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  assignPermissionToRole,
  removePermissionFromRole,
  getRolePermissions
}; 