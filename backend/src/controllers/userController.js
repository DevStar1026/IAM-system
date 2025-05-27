const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Get all users
const getUsers = async (req, res) => {
  try {
    db.all(
      'SELECT u.id, u.username, u.email, g.name AS g_name FROM users u LEFT JOIN user_groups ug ON u.id = ug.user_id LEFT JOIN groups g ON g.id = ug.group_id WHERE u.isDeleted = false',
      [],
      (err, data) => {
        if (err) {
          console.error('Error fetching users:', err);
          return res.status(500).json({ message: 'Error fetching users' });
        }
        const transformedData = [];
        const userMap = new Map();

        // First pass: create a map of users with empty group arrays
        data.forEach(item => {
          if (!userMap.has(item.id)) {
            const user = {
              id: item.id,
              username: item.username,
              email: item.email,
              groups: []
            };
            userMap.set(item.id, user);
            transformedData.push(user);
          }

          // Add the group name to the user's groups array if it's not null
          if (item.g_name !== null) {
            userMap.get(item.id).groups.push(item.g_name);
          }
        });
        res.json({ users: transformedData });
      }
    );
  } catch (err) {
    console.error('Error in getUsers:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    db.get(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [id],
      (err, user) => {
        if (err) {
          console.error('Error fetching user:', err);
          return res.status(500).json({ message: 'Error fetching user' });
        }

        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
      }
    );
  } catch (err) {
    console.error('Error in getUserById:', err);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// Create new user
const createUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user exists
    db.get(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email],
      async (err, existingUser) => {
        if (err) {
          console.error('Error checking existing user:', err);
          return res.status(500).json({ message: 'Error checking existing user' });
        }

        if (existingUser) {
          return res.status(400).json({
            message: 'Username or email already exists'
          });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert new user
        db.run(
          'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
          [username, email, passwordHash],
          function (err) {
            if (err) {
              console.error('Error creating user:', err);
              return res.status(500).json({ message: 'Error creating user' });
            }

            res.status(201).json({
              message: 'User created successfully',
              user: {
                id: this.lastID,
                username,
                email
              }
            });
          }
        );
      }
    );
  } catch (err) {
    console.error('Error in createUser:', err);
    res.status(500).json({ message: 'Error creating user' });
  }
};

// Update user
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  try {
    // Check if user exists
    db.get(
      'SELECT * FROM users WHERE id = ?',
      [id],
      async (err, user) => {
        if (err) {
          console.error('Error checking user:', err);
          return res.status(500).json({ message: 'Error checking user' });
        }

        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Check if new username/email is already taken
        if (username !== user.username || email !== user.email) {
          db.get(
            'SELECT * FROM users WHERE (username = ? OR email = ?) AND id != ?',
            [username, email, id],
            (err, existingUser) => {
              if (err) {
                console.error('Error checking existing user:', err);
                return res.status(500).json({ message: 'Error checking existing user' });
              }

              if (existingUser) {
                return res.status(400).json({
                  message: 'Username or email already exists'
                });
              }
            }
          );
        }

        // Update user
        const updates = [];
        const params = [];

        if (username) {
          updates.push('username = ?');
          params.push(username);
        }

        if (email) {
          updates.push('email = ?');
          params.push(email);
        }

        if (password) {
          const salt = await bcrypt.genSalt(10);
          const passwordHash = await bcrypt.hash(password, salt);
          updates.push('password_hash = ?');
          params.push(passwordHash);
        }

        if (updates.length === 0) {
          return res.status(400).json({ message: 'No updates provided' });
        }

        params.push(id);
        db.run(
          `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
          params,
          function (err) {
            if (err) {
              console.error('Error updating user:', err);
              return res.status(500).json({ message: 'Error updating user' });
            }

            res.json({
              message: 'User updated successfully',
              user: {
                id,
                username,
                email
              }
            });
          }
        );
      }
    );
  } catch (err) {
    console.error('Error in updateUser:', err);
    res.status(500).json({ message: 'Error updating user' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    db.run('UPDATE users SET isDeleted = true WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ message: 'Error deleting user' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    });
  } catch (err) {
    console.error('Error in deleteUser:', err);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
}; 