# IAM Access Control System

A full-stack Identity and Access Management (IAM) system with user authentication, role-based access control, and permission management.

## Features

- User authentication with JWT
- Role-based access control
- Group management
- Permission management
- Module-based access control
- Secure API endpoints
- Modern React frontend with Tailwind CSS

## Tech Stack

### Backend
- Node.js
- Express.js
- SQLite (in-memory)
- JWT Authentication
- bcrypt for password hashing

### Frontend
- React.js
- Redux Toolkit
- Tailwind CSS
- React Router
- Axios

## Setup Instructions

### Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Create a .env file in the root directory with the following variables:
```
JWT_SECRET=your_jwt_secret_key
PORT=3001
```

3. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### To Test

1. Install dependencies:
```bash
npm install save-dev jest
```
### Backend Setup

2. Start test:
```bash
npm test
```

## API Documentation

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Users
- GET /api/users - Get all users
- POST /api/users - Create a new user
- GET /api/users/:id - Get user by ID
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user

### Groups
- GET /api/groups - Get all groups
- POST /api/groups - Create a new group
- GET /api/groups/:id - Get group by ID
- PUT /api/groups/:id - Update group
- DELETE /api/groups/:id - Delete group

### Roles
- GET /api/roles - Get all roles
- POST /api/roles - Create a new role
- GET /api/roles/:id - Get role by ID
- PUT /api/roles/:id - Update role
- DELETE /api/roles/:id - Delete role

### Permissions
- GET /api/permissions - Get all permissions
- POST /api/permissions - Create a new permission
- GET /api/permissions/:id - Get permission by ID
- PUT /api/permissions/:id - Update permission
- DELETE /api/permissions/:id - Delete permission

## Security

- All passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Input validation on all endpoints
- Role-based access control
- Permission-based authorization

## License

MIT 