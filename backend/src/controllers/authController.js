const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if user already exists
    db.get('SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email],
      async (err, user) => {
        if (err) {
          console.error('Error checking existing user:', err);
          return res.status(500).json({ message: 'Error checking existing user' });
        }

        if (user) {
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

            // Create token
            const token = jwt.sign(
              { id: this.lastID, username },
              process.env.JWT_SECRET,
              { expiresIn: '24h' }
            );

            res.status(201).json({
              message: 'User registered successfully',
              token,
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
    console.error('Error in registration:', err);
    res.status(500).json({ message: 'Error in registration process' });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Find user
    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      async (err, user) => {
        if (err) {
          console.error('Error finding user:', err);
          return res.status(500).json({ message: 'Error finding user' });
        }
        if (!user) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
          { id: user.id, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        });
      }
    );
  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ message: 'Error in login process' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user details
    db.get(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [userId],
      (err, user) => {
        if (err) {
          console.error('Error fetching user:', err);
          return res.status(500).json({ message: 'Error fetching user details' });
        }

        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
      }
    );
  } catch (err) {
    console.error('Error in getCurrentUser:', err);
    res.status(500).json({ message: 'Error fetching user details' });
  }
};

const getCurrentUserPermissions = async (req, res) => {
  const userId = req.user.id;
  try {
    db.all(
      `SELECT DISTINCT p.*, m.name as module_name
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN roles r ON rp.role_id = r.id
       JOIN group_roles gr ON r.id = gr.role_id
       JOIN groups g ON gr.group_id = g.id
       JOIN user_groups ug ON g.id = ug.group_id
       JOIN modules m ON p.module_id = m.id
       WHERE ug.user_id = ?`,
      [userId],
      (err, permissions) => {
        if (err) {
          console.error('Error fetching user permissions:', err);
          return res.status(500).json({ message: 'Error fetching user permissions' });
        }
        res.json({ permissions });
      }
    );
  } catch (err) {
    console.error('Error in getCurrentUserPermissions:', err);
    res.status(500).json({ message: 'Error fetching user permissions' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  getCurrentUserPermissions
}; 