const db = require('../config/database');

// Get all groups
const getGroups = async (req, res) => {
  try {
    db.all(
      'SELECT g.*, r.name AS r_name, r.id AS r_id FROM groups g LEFT JOIN group_roles gr ON gr.role_id = g.id LEFT JOIN roles r ON r.id = gr.group_id WHERE g.isDeleted = false; ',
      [],
      (err, groups) => {
        if (err) {
          console.error('Error fetching groups:', err);
          return res.status(500).json({ message: 'Error fetching groups' });
        }
        const transformedData = [];
        const roleMap = new Map();

        // First pass: create a map of roles with empty group arrays
        groups.forEach(item => {
          if (!roleMap.has(item.id)) {
            const role = {
              id: item.id,
              name: item.name,
              description: item.description,
              created_at: item.created_at,
              isDeleted: item.isDeleted,
              roles: [] // Initialize an array for roles (r_name)
            };
            roleMap.set(item.id, role);
            transformedData.push(role);
          }

          // Add the r_name to the role's roles array if it's not already there
          const role = roleMap.get(item.id);
          if (!role.roles.some(r => r.name === item.r_name) && item.r_name) {
            role.roles.push({ name: item.r_name, id: item.r_id });
          }
        });
        res.json({ groups: transformedData });
      }
    );
  } catch (err) {
    console.error('Error in getGroups:', err);
    res.status(500).json({ message: 'Error fetching groups' });
  }
};

// Get group by ID
const getGroupById = async (req, res) => {
  const { id } = req.params;

  try {
    db.get(
      'SELECT * FROM groups WHERE id = ?',
      [id],
      (err, group) => {
        if (err) {
          console.error('Error fetching group:', err);
          return res.status(500).json({ message: 'Error fetching group' });
        }

        if (!group) {
          return res.status(404).json({ message: 'Group not found' });
        }

        res.json({ group });
      }
    );
  } catch (err) {
    console.error('Error in getGroupById:', err);
    res.status(500).json({ message: 'Error fetching group' });
  }
};

// Create new group
const createGroup = async (req, res) => {
  const { name, description } = req.body;
  try {
    // Check if group exists
    db.get(
      'SELECT * FROM groups WHERE name = ?',
      [name],
      (err, existingGroup) => {
        if (err) {
          console.error('Error checking existing group:', err);
          return res.status(500).json({ message: 'Error checking existing group' });
        }

        if (existingGroup) {
          return res.status(400).json({ message: 'Group name already exists' });
        }

        // Insert new group
        db.run(
          'INSERT INTO groups (name, description) VALUES (?, ?)',
          [name, description],
          function(err) {
            if (err) {
              console.error('Error creating group:', err);
              return res.status(500).json({ message: 'Error creating group' });
            }

            res.status(201).json({
              message: 'Group created successfully',
              group: {
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
    console.error('Error in createGroup:', err);
    res.status(500).json({ message: 'Error creating group' });
  }
};

// Update group
const updateGroup = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    // Check if group exists
    db.get(
      'SELECT * FROM groups WHERE id = ?',
      [id],
      (err, group) => {
        if (err) {
          console.error('Error checking group:', err);
          return res.status(500).json({ message: 'Error checking group' });
        }

        if (!group) {
          return res.status(404).json({ message: 'Group not found' });
        }

        // Check if new name is already taken
        if (name !== group.name) {
          db.get(
            'SELECT * FROM groups WHERE name = ? AND id != ?',
            [name, id],
            (err, existingGroup) => {
              if (err) {
                console.error('Error checking existing group:', err);
                return res.status(500).json({ message: 'Error checking existing group' });
              }

              if (existingGroup) {
                return res.status(400).json({ message: 'Group name already exists' });
              }
            }
          );
        }

        // Update group
        db.run(
          'UPDATE groups SET name = ?, description = ?  WHERE id = ?',
          [name, description, id],
          function(err) {
            if (err) {
              console.error('Error updating group:', err);
              return res.status(500).json({ message: 'Error updating group' });
            }

            res.json({
              message: 'Group updated successfully',
              group: {
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
    console.error('Error in updateGroup:', err);
    res.status(500).json({ message: 'Error updating group' });
  }
};

// Delete group
const deleteGroup = async (req, res) => {
  const { id } = req.params;

  try {
    db.run('UPDATE groups SET isDeleted = true WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting group:', err);
        return res.status(500).json({ message: 'Error deleting group' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Group not found' });
      }

      res.json({ message: 'Group deleted successfully' });
    });
  } catch (err) {
    console.error('Error in deleteGroup:', err);
    res.status(500).json({ message: 'Error deleting group' });
  }
};

// Add user to group
const addUserToGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

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

        // Check if user exists
        db.get(
          'SELECT * FROM users WHERE id = ?',
          [userId],
          (err, user) => {
            if (err) {
              console.error('Error checking user:', err);
              return res.status(500).json({ message: 'Error checking user' });
            }

            if (!user) {
              return res.status(404).json({ message: 'User not found' });
            }

            // Check if user is already in group
            db.get(
              'SELECT * FROM user_groups WHERE user_id = ? AND group_id = ?',
              [userId, groupId],
              (err, existingMembership) => {
                if (err) {
                  console.error('Error checking membership:', err);
                  return res.status(500).json({ message: 'Error checking membership' });
                }

                if (existingMembership) {
                  return res.status(400).json({ message: 'User is already in this group' });
                }

                // Add user to group
                db.run(
                  'INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)',
                  [userId, groupId],
                  function(err) {
                    if (err) {
                      console.error('Error adding user to group:', err);
                      return res.status(500).json({ message: 'Error adding user to group' });
                    }

                    res.status(201).json({
                      message: 'User added to group successfully',
                      membership: {
                        userId,
                        groupId
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
    console.error('Error in addUserToGroup:', err);
    res.status(500).json({ message: 'Error adding user to group' });
  }
};

// Remove user from group
const removeUserFromGroup = async (req, res) => {
  const { groupId, userId } = req.params;

  try {
    db.run(
      'DELETE FROM user_groups WHERE user_id = ? AND group_id = ?',
      [userId, groupId],
      function(err) {
        if (err) {
          console.error('Error removing user from group:', err);
          return res.status(500).json({ message: 'Error removing user from group' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: 'User is not in this group' });
        }

        res.json({ message: 'User removed from group successfully' });
      }
    );
  } catch (err) {
    console.error('Error in removeUserFromGroup:', err);
    res.status(500).json({ message: 'Error removing user from group' });
  }
};

module.exports = {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addUserToGroup,
  removeUserFromGroup
}; 