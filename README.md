# Full Stack Task Manager

A modern task management application built with the MERN stack and MySQL. This project demonstrates full-stack development capabilities with a focus on clean code, modern UI/UX, and best practices.

## Features

🔐 **Authentication**
- JWT-based user authentication
- Secure password hashing
- Protected routes

📋 **Task Management**
- Create and manage tasks
- Drag-and-drop task status updates
- Real-time UI updates
- Tasks grouped by status

🎨 **Modern UI/UX**
- Responsive design
- Clean and intuitive interface
- Smooth animations and transitions
- Loading states and error handling

## Tech Stack

### Frontend
- React.js with Vite
- TailwindCSS for styling
- React Router for navigation
- React Beautiful DND for drag-and-drop
- Axios for API requests

### Backend
- Node.js with Express
- MySQL database
- Sequelize ORM
- JWT for authentication
- bcrypt for password hashing

## Project Structure

```
/
├── client/          # React frontend
├── server/          # Node.js backend
└── README.md        # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL server
- npm or yarn

### Setup Database
1. Create MySQL database:
```sql
CREATE DATABASE task_manager_db;
```

2. Configure database credentials in `server/config/database.js`

### Setup Backend
1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm run dev
```

The server will start on port 5000.

### Setup Frontend
1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`.

## API Endpoints

### Authentication
- POST `/api/signup` - Register new user
- POST `/api/login` - Login user

### Tasks (Protected Routes)
- GET `/api/tasks` - Get all tasks
- POST `/api/tasks` - Create new task
- PUT `/api/tasks/:id` - Update task status
- DELETE `/api/tasks/:id` - Delete task

## Screenshots

image.png image.png

## Deployment Instructions

### Frontend (Vercel)
1. Push your `client` folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com/) and sign in with GitHub.
3. Click "New Project" and import your repo.
4. Set the root directory to `client`.
5. Set the build command to `npm run build` and output directory to `dist` (default for Vite).
6. Deploy!
7. In your Vercel dashboard, set an environment variable for the backend API URL if needed (e.g., `VITE_API_URL`).

### Backend (Render)
1. Push your `server` folder to a GitHub repository.
2. Go to [render.com](https://render.com/) and sign in with GitHub.
3. Click "New Web Service" and import your repo.
4. Set the root directory to `server`.
5. Set the build command to `npm install` and start command to `npm run start` or `npm run dev`.
6. Add environment variables for your database credentials and JWT secret.
7. Add a Render PostgreSQL or connect to your MySQL database (make sure it's accessible from Render).
8. Deploy!

**Note:**
- Update your frontend to use the deployed backend API URL (set in Vercel as `VITE_API_URL` or update Axios base URL).
- Make sure CORS is enabled on your backend for your frontend domain.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License. 