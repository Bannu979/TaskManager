# Task Manager Backend

This is the backend server for the Task Manager application built with Node.js, Express, and MySQL using Sequelize ORM.

## Features

- User authentication with JWT
- Task management (CRUD operations)
- MySQL database with Sequelize ORM
- Protected routes with middleware
- Password hashing with bcrypt

## Prerequisites

- Node.js (v14 or higher)
- MySQL server
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create MySQL database:
```sql
CREATE DATABASE task_manager_db;
```

3. Configure database:
- Update database credentials in `config/database.js` if needed
- Current configuration:
  - Database: task_manager_db
  - Username: root
  - Password: bannu979
  - Host: localhost

4. Start the server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The server will start on port 5000 by default.

## API Endpoints

### Authentication
- POST `/api/signup` - Register a new user
- POST `/api/login` - Login user

### Tasks (Protected Routes)
- GET `/api/tasks` - Get all tasks for logged-in user
- POST `/api/tasks` - Create a new task
- PUT `/api/tasks/:id` - Update task status
- DELETE `/api/tasks/:id` - Delete a task

## Authentication

All task-related routes require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
``` 