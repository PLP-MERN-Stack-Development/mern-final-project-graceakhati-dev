# 🚀 Quick Start Guide

## ✅ Step 1: Environment Setup (DONE)

The `.env` file has been created! Now you need to configure it.

## 📝 Step 2: Configure MongoDB

### Option A: Use MongoDB Atlas (Recommended - Free)

1. **Sign up**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. **Create cluster**: Choose FREE tier (M0)
3. **Create database user**:
   - Database Access → Add New Database User
   - Username: `planetpath` (or your choice)
   - Password: Generate secure password
4. **Whitelist IP**:
   - Network Access → Add IP Address
   - Click "Allow Access from Anywhere" (for development)
5. **Get connection string**:
   - Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `planet-path`

**Example connection string:**
```
mongodb+srv://planetpath:YourPassword123@cluster0.xxxxx.mongodb.net/planet-path?retryWrites=true&w=majority
```

6. **Update `.env` file**:
   ```env
   MONGODB_URI=mongodb+srv://planetpath:YourPassword123@cluster0.xxxxx.mongodb.net/planet-path?retryWrites=true&w=majority
   ```

### Option B: Use Local MongoDB

1. **Install MongoDB**: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
2. **Start MongoDB service**:
   ```bash
   # Windows (as Administrator)
   net start MongoDB
   ```
3. **Update `.env` file**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/planet-path
   ```

## 🔐 Step 3: Set JWT Secret

Generate a secure random string:

**Windows PowerShell:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Or use a simple one for development:**
```env
JWT_SECRET=planet-path-development-secret-key-min-32-characters-long
```

Update `JWT_SECRET` in your `.env` file.

## ✅ Step 4: Verify Configuration

Your `.env` file should have:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string-here
JWT_SECRET=your-secret-key-here-min-32-characters
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

## 🎯 Step 5: Start the Server

```bash
cd server
npm run dev
```

You should see:
```
✅ MongoDB Connected: ...
📊 Database: planet-path
🚀 Server running in development mode on port 5000
```

## 🧪 Step 6: Test the API

### Health Check
```bash
# PowerShell
Invoke-WebRequest -Uri http://localhost:5000/health -Method GET
```

Or open in browser: http://localhost:5000/health

### Register a User
```bash
# PowerShell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    role = "student"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/register -Method POST -Body $body -ContentType "application/json"
```

## 🐛 Troubleshooting

### Server won't start - "MONGODB_URI is not defined"
- ✅ Check `.env` file exists in `server/` directory
- ✅ Verify `MONGODB_URI` line is not commented out
- ✅ Restart the server after editing `.env`

### MongoDB connection fails
- ✅ Check MongoDB URI is correct
- ✅ For Atlas: Verify IP is whitelisted
- ✅ For Atlas: Check username/password
- ✅ For local: Ensure MongoDB service is running

### Port already in use
- ✅ Change `PORT` in `.env` to another port (e.g., 5001)
- ✅ Or stop the process using port 5000

## 📚 Next Steps

- ✅ Test all API endpoints
- ✅ Connect frontend to backend
- ✅ Set up production environment variables
- ✅ Deploy to production

---

**Need help?** Check `SETUP_ENV.md` for detailed environment setup instructions.


