# Planet Path Backend API

Backend server for Planet Path - Climate Action E-Learning Platform

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── db.ts              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.ts  # Authentication logic
│   │   └── courseController.ts # Course CRUD logic
│   ├── middleware/
│   │   └── auth.ts            # JWT authentication middleware
│   ├── models/
│   │   ├── User.ts            # User model
│   │   └── Course.ts           # Course model
│   ├── routes/
│   │   ├── authRoutes.ts      # Authentication routes
│   │   └── courseRoutes.ts    # Course routes
│   ├── app.ts                 # Express app configuration
│   └── server.ts              # Server entry point
├── .env.example               # Environment variables template
├── .gitignore
├── nodemon.json               # Nodemon configuration
├── package.json
├── tsconfig.json              # TypeScript configuration
└── README.md
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   - `MONGODB_URI` - MongoDB connection string
   - `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)
   - `CLIENT_URL` - Frontend URL for CORS
   - `PORT` - Server port (default: 5000)

## Scripts

- **`npm run dev`** - Start development server with hot reload
- **`npm run build`** - Build TypeScript to JavaScript
- **`npm start`** - Start production server (requires build first)
- **`npm run lint`** - Run ESLint
- **`npm run format`** - Format code with Prettier

## API Endpoints

### Authentication Routes (`/api/auth`)

- **POST** `/register` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student" // optional: student | instructor | admin
  }
  ```

- **POST** `/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- **GET** `/me` - Get current user profile (Protected)

### Course Routes (`/api/courses`)

- **GET** `/` - Get all courses (with query params: status, impact_type, tags, page, limit, sort)
- **GET** `/:id` - Get single course by ID or slug
- **POST** `/` - Create a new course (Protected: instructor/admin only)
- **PUT** `/:id` - Update a course (Protected: author/instructor/admin)
- **DELETE** `/:id` - Delete a course (Protected: author/instructor/admin)

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Environment Variables

See `.env.example` for all required environment variables.

## Database Models

### User Model
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `role` (String: 'student' | 'instructor' | 'admin')
- `xp` (Number, default: 0)
- `badges` (Array of Strings)

### Course Model
- `title` (String, required)
- `slug` (String, required, unique)
- `description` (String, required)
- `authorId` (ObjectId, ref: User)
- `modules` (Array of Module objects)
- `tags` (Array of Strings)
- `price` (Number, default: 0)
- `impact_type` (String: 'climate' | 'waste' | 'energy' | 'water' | 'community' | 'other')
- `status` (String: 'draft' | 'published' | 'archived')

## Development

1. Start MongoDB (local or use MongoDB Atlas)
2. Copy `.env.example` to `.env` and configure
3. Run `npm run dev`
4. Server will start on `http://localhost:5000`

## Production

1. Build TypeScript: `npm run build`
2. Set `NODE_ENV=production` in `.env`
3. Start server: `npm start`

## License

MIT

