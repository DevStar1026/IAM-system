const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// const dirPath = path.join(__dirname, 'database'); // your folder
// const dbFilePath = path.join(dirPath, 'mydatabase.sqlite'); // your file

// Check if directory exists, if not, create it
// if (!fs.existsSync(dirPath)) {
//   fs.mkdirSync(dirPath, { recursive: true });
// }

// Create or open database
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(async () => {
    // 1. Create tables
    await db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      isDeleted BOOL DEFAULT FALSE
    )`).run(`CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      isDeleted BOOL DEFAULT FALSE
    )`).run(`CREATE TABLE IF NOT EXISTS user_groups (
      user_id INTEGER,
      group_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, group_id)
    )`).run(`CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      isDeleted BOOL DEFAULT FALSE
    )`).run(`CREATE TABLE IF NOT EXISTS group_roles (
      group_id INTEGER,
      role_id INTEGER,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      PRIMARY KEY (group_id, role_id)
    )`).run(`CREATE TABLE IF NOT EXISTS modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      isDeleted BOOL DEFAULT FALSE
    )`).run(`CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      module_id INTEGER,
      description TEXT,
      action TEXT NOT NULL,
      FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
      UNIQUE(module_id, action)
    )`).run(`CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INTEGER,
      permission_id INTEGER,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, permission_id)
    )`).run(`INSERT OR IGNORE INTO modules (name) VALUES ('users')`)
      .run(`INSERT OR IGNORE INTO modules (name) VALUES ('groups')`)
      .run(`INSERT OR IGNORE INTO modules (name) VALUES ('roles')`)
      .run(`INSERT OR IGNORE INTO modules (name) VALUES ('permissions')`);
    /**
     * Admin default add
     */
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123@', salt); // Replace 'admin' with your desired password
    db.run(`INSERT OR IGNORE INTO users (username, email, password_hash) VALUES (?, ?, ?)`,
      ['admin', 'admin@example.com', adminPasswordHash], function (err) {
        if (err) {
          console.error('Error inserting admin user:', err);
          return;
        }
      });
  });
}

module.exports = db;
