# Database Seed Script

This script populates the database with sample data for development and testing.

## Usage

### Basic Usage

```bash
cd server
ts-node src/tools/seed.ts
```

### Clear Existing Data

To clear existing data before seeding (useful for resetting the database):

```bash
# Set CLEAR_DB=true in .env file, or:
CLEAR_DB=true ts-node src/tools/seed.ts
```

## What Gets Created

### Users (2)
- **Admin User**
  - Email: `admin@planetpath.com`
  - Password: `password123`
  - Role: `admin`
  - XP: 500
  - Badges: `admin-badge`, `founder`

- **Instructor User**
  - Email: `instructor@planetpath.com`
  - Password: `password123`
  - Role: `instructor`
  - XP: 1000
  - Badges: `expert-instructor`, `climate-champion`

### Courses (3)

1. **Climate Change Basics**
   - Modules: 2
   - Lessons: 3
   - Tags: climate, environment, basics, sustainability
   - Impact Type: climate
   - Status: published

2. **Waste Management Solutions**
   - Modules: 1
   - Lessons: 1
   - Tags: waste, recycling, sustainability, zero-waste
   - Impact Type: waste
   - Status: published

3. **Renewable Energy Fundamentals**
   - Modules: 1
   - Lessons: 1
   - Tags: energy, renewable, solar, wind, sustainability
   - Impact Type: energy
   - Status: published

### Assignments (2)

1. **Climate Action Project**
   - Course: Climate Change Basics
   - Due Date: 30 days from seed date
   - Max Score: 100

2. **Waste Audit Report**
   - Course: Waste Management Solutions
   - Due Date: 14 days from seed date
   - Max Score: 100

## Features

- **Idempotent**: Running the script multiple times won't create duplicates
- **Safe**: Only clears data if `CLEAR_DB=true` is set
- **Comprehensive**: Creates complete course structure (courses → modules → lessons)
- **Realistic**: Uses meaningful sample data

## Environment Variables

Make sure your `.env` file includes:

```env
MONGODB_URI=mongodb://localhost:27017/planet-path
# or
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/planet-path

# Optional: Set to true to clear existing data before seeding
CLEAR_DB=false
```

## Troubleshooting

### "MONGODB_URI is not defined"
- Create a `.env` file in the `server` directory
- Add `MONGODB_URI` with your MongoDB connection string
- See `ENV_EXAMPLE.txt` for reference

### "Users already exist"
- This is normal if you've run the script before
- The script skips creating duplicates
- Set `CLEAR_DB=true` to reset and recreate everything

### Connection Errors
- Ensure MongoDB is running (local) or accessible (Atlas)
- Check your connection string format
- Verify network access/IP whitelisting (for Atlas)

## Example Output

```
🌱 Starting database seed...

✅ Connected to database

⚠️  CLEAR_DB not set to "true" - skipping database clear
   Set CLEAR_DB=true in .env to clear existing data

👤 Creating users...
✅ Created admin: admin@planetpath.com
✅ Created instructor: instructor@planetpath.com

📚 Creating courses with modules and lessons...
✅ Created course: Climate Change Basics
✅ Created course: Waste Management Solutions
✅ Created course: Renewable Energy Fundamentals
✅ Created 3 courses with modules and lessons

📝 Creating assignments...
✅ Created assignment: Climate Action Project
✅ Created assignment: Waste Audit Report
✅ Created assignments

🎉 Seed completed successfully!

📋 Summary:
   - Users: 2 (1 admin, 1 instructor)
   - Courses: 3
   - Assignments: 2

🔑 Login credentials:
   Admin: admin@planetpath.com / password123
   Instructor: instructor@planetpath.com / password123

✅ MongoDB Disconnected
```

