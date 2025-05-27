const db = require('../config/database');

// Get all modules
const getModules = async (req, res) => {
  try {
    db.all(
      'SELECT * FROM modules where isDeleted = false',
      [],
      (err, modules) => {
        if (err) {
          console.error('Error fetching modules:', err);
          return res.status(500).json({ message: 'Error fetching modules' });
        }
        res.json({ modules:modules });
      }
    );
  } catch (err) {
    console.error('Error in getModules:', err);
    res.status(500).json({ message: 'Error fetching modules' });
  }
};

// Get module by ID
const getModuleById = async (req, res) => {
  const { id } = req.params;

  try {
    db.get(
      'SELECT * FROM modules WHERE id = ?',
      [id],
      (err, module) => {
        if (err) {
          console.error('Error fetching module:', err);
          return res.status(500).json({ message: 'Error fetching module' });
        }

        if (!module) {
          return res.status(404).json({ message: 'Module not found' });
        }

        res.json({ module });
      }
    );
  } catch (err) {
    console.error('Error in getModuleById:', err);
    res.status(500).json({ message: 'Error fetching module' });
  }
};

// Create new module
const createModule = async (req, res) => {
  const { name, description } = req.body;
  try {
    // Check if module exists
    db.get(
      'SELECT * FROM modules WHERE name = ?',
      [name],
      (err, existingModule) => {
        if (err) {
          console.error('Error checking existing module:', err);
          return res.status(500).json({ message: 'Error checking existing module' });
        }

        if (existingModule) {
          return res.status(400).json({ message: 'Module name already exists' });
        }

        // Insert new module
        db.run(
          'INSERT INTO modules (name, description) VALUES (?, ?)',
          [name, description],
          function(err) {
            if (err) {
              console.error('Error creating module:', err);
              return res.status(500).json({ message: 'Error creating module' });
            }

            res.status(201).json({
              message: 'Module created successfully',
              module: {
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
    console.error('Error in createModule:', err);
    res.status(500).json({ message: 'Error creating module' });
  }
};

// Update module
const updateModule = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    // Check if module exists
    db.get(
      'SELECT * FROM modules WHERE id = ?',
      [id],
      (err, module) => {
        if (err) {
          console.error('Error checking module:', err);
          return res.status(500).json({ message: 'Error checking module' });
        }

        if (!module) {
          return res.status(404).json({ message: 'Module not found' });
        }

        // Check if new name is already taken
        if (name !== module.name) {
          db.get(
            'SELECT * FROM modules WHERE name = ? AND id != ?',
            [name, id],
            (err, existingModule) => {
              if (err) {
                console.error('Error checking existing module:', err);
                return res.status(500).json({ message: 'Error checking existing module' });
              }

              if (existingModule) {
                return res.status(400).json({ message: 'Module name already exists' });
              }
            }
          );
        }

        // Update module
        db.run(
          'UPDATE modules SET name = ?, description = ? WHERE id = ?',
          [name, description, id],
          function(err) {
            if (err) {
              console.error('Error updating module:', err);
              return res.status(500).json({ message: 'Error updating module' });
            }

            res.json({
              message: 'Module updated successfully',
              module: {
                id,
                name
              }
            });
          }
        );
      }
    );
  } catch (err) {
    console.error('Error in updateModule:', err);
    res.status(500).json({ message: 'Error updating module' });
  }
};

// Delete module
const deleteModule = async (req, res) => {
  const { id } = req.params;

  try {
    db.run('UPDATE modules SET isDeleted = true WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting module:', err);
        return res.status(500).json({ message: 'Error deleting module' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Module not found' });
      }

      res.json({ message: 'Module deleted successfully' });
    });
  } catch (err) {
    console.error('Error in deleteModule:', err);
    res.status(500).json({ message: 'Error deleting module' });
  }
};

module.exports = {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule
}; 