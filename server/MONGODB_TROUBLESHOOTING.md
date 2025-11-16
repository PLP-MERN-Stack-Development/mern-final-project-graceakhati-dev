# 🔧 MongoDB Connection Troubleshooting Guide

## ❌ Error: "bad auth : authentication failed" (Code 8000)

This error means MongoDB Atlas rejected your credentials. Here's how to fix it:

### Step 1: Verify Database User Exists

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Navigate to **Database Access** (left sidebar)
3. Check if your database user exists
4. If not, click **"Add New Database User"**

### Step 2: Check Username and Password

**Common Issues:**

1. **Username mismatch**: 
   - Connection string: `mongodb+srv://username:password@...`
   - Make sure `username` matches exactly (case-sensitive)

2. **Password with special characters**:
   - Special characters MUST be URL-encoded in connection strings
   - `@` → `%40`
   - `#` → `%23`
   - `%` → `%25`
   - `&` → `%26`
   - `+` → `%2B`
   - `=` → `%3D`
   - `?` → `%3F`
   - `/` → `%2F`
   - ` ` (space) → `%20`

**Example:**
```
Password: MyP@ss#123
Encoded:  MyP%40ss%23123

Connection string:
mongodb+srv://user:MyP%40ss%23123@cluster.mongodb.net/...
```

### Step 3: Reset Password (If Needed)

1. Go to **Database Access**
2. Click **"Edit"** on your user
3. Click **"Edit Password"**
4. Generate a new password (or create one without special characters)
5. Copy the password
6. Update your `.env` file

### Step 4: Verify IP Whitelist

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
4. Click **"Confirm"**

**Note:** For production, only whitelist specific IPs.

### Step 5: Get Correct Connection String

1. Go to **Clusters** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Select **"Node.js"** and version **"5.5 or later"**
4. Copy the connection string
5. Replace `<password>` with your actual password (URL-encoded if needed)
6. Replace `<dbname>` with `planet-path` (or your preferred database name)

**Example connection string:**
```
mongodb+srv://planetpath:YourPassword123@cluster0.xxxxx.mongodb.net/planet-path?retryWrites=true&w=majority
```

### Step 6: Update .env File

Edit `server/.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/planet-path?retryWrites=true&w=majority
```

**Important:**
- No spaces around `=`
- Password must be URL-encoded if it contains special characters
- Database name comes after the `/` (e.g., `/planet-path`)

### Step 7: Test Connection

Restart your server:
```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
📊 Database: planet-path
```

## 🔍 Quick Test Script

Create a test file `test-connection.js`:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testConnection();
```

Run it:
```bash
node test-connection.js
```

## 🛠️ Alternative: Use Local MongoDB

If Atlas is too complicated, use local MongoDB:

### Install MongoDB Locally

**Windows:**
1. Download from [mongodb.com/download](https://www.mongodb.com/try/download/community)
2. Run installer
3. Start MongoDB service:
   ```powershell
   # As Administrator
   net start MongoDB
   ```

### Update .env

```env
MONGODB_URI=mongodb://localhost:27017/planet-path
```

### Restart Server

```bash
npm run dev
```

## 📋 Checklist

Before asking for help, verify:

- [ ] Database user exists in Atlas
- [ ] Username matches exactly (case-sensitive)
- [ ] Password is correct (URL-encoded if needed)
- [ ] IP address is whitelisted (or "Allow from anywhere")
- [ ] Connection string format is correct
- [ ] `.env` file exists in `server/` directory
- [ ] No extra spaces in `.env` file
- [ ] Server restarted after editing `.env`

## 🆘 Still Having Issues?

1. **Double-check connection string format:**
   ```
   mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority
   ```

2. **Try creating a new database user:**
   - Simple username: `planetpath`
   - Simple password: `PlanetPath123` (no special chars)
   - Update connection string

3. **Test with MongoDB Compass:**
   - Download [MongoDB Compass](https://www.mongodb.com/products/compass)
   - Try connecting with your credentials
   - If it works there, copy the connection string

4. **Check MongoDB Atlas Status:**
   - Visit [status.mongodb.com](https://status.mongodb.com/)
   - Ensure Atlas is operational

---

**Need more help?** Check the [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

