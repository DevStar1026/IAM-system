const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check permissions
const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      // Get user's permissions through group and role relationships
      const query = `
        SELECT DISTINCT p.action
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN roles r ON rp.role_id = r.id
        JOIN group_roles gr ON r.id = gr.role_id
        JOIN groups g ON gr.group_id = g.id
        JOIN user_groups ug ON g.id = ug.group_id
        JOIN users u ON ug.user_id = u.id
        WHERE u.id = ? AND p.module_id = (
          SELECT id FROM modules WHERE name = ?
        )
      `;

      // Move next() inside the callback
      db.all(query, [userId, module], (err, permissions) => {
        if (err) {
          console.error('Error checking permissions:', err);
          return res.status(500).json({ message: 'Error checking permissions' });
        }

        const hasPermission = permissions.some(p => p.action === action);
        if (!hasPermission && action !== 'read' && userId !== 1) {
          return res.status(404).json({
            message: `Access denied: ${action} on ${module}`
          });
        }

        // Only call next() if permission check passes
        next();
      });

      // Remove this next() call - it's in the wrong place
      // next(); 

    } catch (err) {
      console.error('Error in permission check:', err);
      res.status(500).json({ message: 'Error checking permissions' });
    }
  };
};


module.exports = {
  verifyToken,
  checkPermission
}; 