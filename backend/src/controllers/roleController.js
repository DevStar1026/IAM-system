const db = require('../config/database');

// Get all roles
const getRoles = async (req, res) => {
  try {
    db.all(
      'SELECT r.*, g.name AS g_name, g.id AS g_id, p.id AS p_id, p.name AS p_name FROM roles r LEFT JOIN group_roles gr ON gr.role_id = r.id LEFT JOIN groups g ON g.id = gr.group_id LEFT JOIN role_permissions rp ON rp.permission_id = r.id LEFT JOIN permissions p ON p.id = rp.role_id WHERE r.isDeleted = false;',
      [],
      (err, roles) => {
        if (err) {
          console.error('Error fetching roles:', err);
          return res.status(500).json({ message: 'Error fetching roles' });
        }

        const transformedData = [];
        const roleMap = new Map();

        // First pass: create a map of roles with empty group and permission arrays
        roles.forEach(item => {
          if (!roleMap.has(item.id)) {
            const role = {
              id: item.id,
              name: item.name,
              description: item.description,
              created_at: item.created_at,
              isDeleted: item.isDeleted,
              groups: [],
              permissions: []
            };
            roleMap.set(item.id, role);
            transformedData.push(role);
          }

          // Add the group to the role's groups array if it's not already there
          const role = roleMap.get(item.id);
          if (
            item.g_name &&
            item.g_id &&
            !role.groups.some(group => group.id === item.g_id)
          ) {
            role.groups.push({ name: item.g_name, id: item.g_id });
          }

          // Add the permission to the role's permissions array if it's not already there
          if (
            item.p_name &&
            item.p_id &&
            !role.permissions.some(permission => permission.id === item.p_id)
          ) {
            role.permissions.push({ name: item.p_name, id: item.p_id });
          }
        });
        res.json({ roles: transformedData });
      }
    );
  } catch (err) {
    console.error('Error in getRoles:', err);
    res.status(500).json({ message: 'Error fetching roles' });
  }
};

// Get role by ID
const getRoleById = async (req, res) => {
  const { id } = req.params;

  try {
    db.get(
      'SELECT * FROM roles WHERE id = ?',
      [id],
      (err, role) => {
        if (err) {
          console.error('Error fetching role:', err);
          return res.status(500).json({ message: 'Error fetching role' });
        }

        if (!role) {
          return res.status(404).json({ message: 'Role not found' });
        }

        res.json({ role });
      }
    );
  } catch (err) {
    console.error('Error in getRoleById:', err);
    res.status(500).json({ message: 'Error fetching role' });
  }
};

// Create new role
const createRole = async (req, res) => {
  const { name, description } = req.body;

  try {
    // Check if role exists
    db.get(
      'SELECT * FROM roles WHERE name = ?',
      [name],
      (err, existingRole) => {
        if (err) {
          console.error('Error checking existing role:', err);
          return res.status(500).json({ message: 'Error checking existing role' });
        }

        if (existingRole) {
          return res.status(400).json({ message: 'Role name already exists' });
        }

        // Insert new role
        db.run(
          'INSERT INTO roles (name, description) VALUES (?,?)',
          [name, description],
          function(err) {
            if (err) {
              console.error('Error creating role:', err);
              return res.status(500).json({ message: 'Error creating role' });
            }

            res.status(201).json({
              message: 'Role created successfully',
              role: {
                id: this.lastID,
                name,
                description
              }
            });
          }
        );
      }
    );
  } catch (err) {
    console.error('Error in createRole:', err);
    res.status(500).json({ message: 'Error creating role' });
  }
};

// Update role
const updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    // Check if role exists
    db.get(
      'SELECT * FROM roles WHERE id = ?',
      [id],
      (err, role) => {
        if (err) {
          console.error('Error checking role:', err);
          return res.status(500).json({ message: 'Error checking role' });
        }

        if (!role) {
          return res.status(404).json({ message: 'Role not found' });
        }

        // Check if new name is already taken
        if (name !== role.name) {
          db.get(
            'SELECT * FROM roles WHERE name = ? AND id != ?',
            [name, id],
            (err, existingRole) => {
              if (err) {
                console.error('Error checking existing role:', err);
                return res.status(500).json({ message: 'Error checking existing role' });
              }

              if (existingRole) {
                return res.status(400).json({ message: 'Role name already exists' });
              }
            }
          );
        }

        // Update role
        db.run(
          'UPDATE roles SET name = ? , description = ? WHERE id = ?',
          [name, description, id],
          function(err) {
            if (err) {
              console.error('Error updating role:', err);
              return res.status(500).json({ message: 'Error updating role' });
            }

            res.json({
              message: 'Role updated successfully',
              role: {
                id,
                name,
                description
              }
            });
          }
        );
      }
    );
  } catch (err) {
    console.error('Error in updateRole:', err);
    res.status(500).json({ message: 'Error updating role' });
  }
};

// Delete role
const deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    db.run('UPDATE roles SET isDeleted = true WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting role:', err);
        return res.status(500).json({ message: 'Error deleting role' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Role not found' });
      }

      res.json({ message: 'Role deleted successfully' });
    });
  } catch (err) {
    console.error('Error in deleteRole:', err);
    res.status(500).json({ message: 'Error deleting role' });
  }
};

// Add role to group
const addRoleToGroup = async (req, res) => {
  const { groupId } = req.params;
  const { roleId } = req.body;
  try {
    // Check if group exists
    db.get(
      'SELECT * FROM groups WHERE id = ?',
      [groupId],
      (err, group) => {
        if (err) {
          console.error('Error checking group:', err);
          return res.status(500).json({ message: 'Error checking group' });
        }

        if (!group) {
          return res.status(404).json({ message: 'Group not found' });
        }

        // Check if role exists
        db.get(
          'SELECT * FROM roles WHERE id = ?',
          [roleId],
          (err, role) => {
            if (err) {
              console.error('Error checking role:', err);
              return res.status(500).json({ message: 'Error checking role' });
            }

            if (!role) {
              return res.status(404).json({ message: 'Role not found' });
            }

            // Check if role is already assigned to group
            db.get(
              'SELECT * FROM group_roles WHERE group_id = ? AND role_id = ?',
              [groupId, roleId],
              (err, existingAssignment) => {
                if (err) {
                  console.error('Error checking role assignment:', err);
                  return res.status(500).json({ message: 'Error checking role assignment' });
                }

                if (existingAssignment) {
                  return res.status(400).json({ message: 'Role is already assigned to this group' });
                }

                // Add role to group
                db.run(
                  'INSERT INTO group_roles (group_id, role_id) VALUES (?, ?)',
                  [groupId, roleId],
                  function(err) {
                    if (err) {
                      console.error('Error adding role to group:', err);
                      return res.status(500).json({ message: 'Error adding role to group' });
                    }

                    res.status(201).json({
                      message: 'Role added to group successfully',
                      assignment: {
                        groupId,
                        roleId
                      }
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  } catch (err) {
    console.error('Error in addRoleToGroup:', err);
    res.status(500).json({ message: 'Error adding role to group' });
  }
};

// Remove role from group
const removeRoleFromGroup = async (req, res) => {
  const { groupId, roleId } = req.params;
  try {
    db.run(
      'DELETE FROM group_roles WHERE group_id = ? AND role_id = ?',
      [groupId, roleId],
      function(err) {
        if (err) {
          console.error('Error removing role from group:', err);
          return res.status(500).json({ message: 'Error removing role from group' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: 'Role is not assigned to this group' });
        }

        res.json({ message: 'Role removed from group successfully' });
      }
    );
  } catch (err) {
    console.error('Error in removeRoleFromGroup:', err);
    res.status(500).json({ message: 'Error removing role from group' });
  }
};

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  addRoleToGroup,
  removeRoleFromGroup
}; 