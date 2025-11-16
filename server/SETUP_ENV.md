# 🔧 Environment Variables Setup Guide

## Quick Setup

The server needs a `.env` file to run. Follow these steps:

### Step 1: Create `.env` file

In the `server/` directory, create a file named `.env` (no extension).

### Step 2: Copy the template

Copy the contents from `ENV_EXAMPLE.txt` into your `.env` file:

```bash
# Windows PowerShell
Copy-Item ENV_EXAMPLE.txt .env

# Or manually create .env and copy the content
```

### Step 3: Configure MongoDB URI

You have two options:

#### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Replace the `MONGODB_URI` in `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/planet-path?retryWrites=true&w=majority
   ```

#### Option B: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use this URI in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/planet-path
   ```

### Step 4: Set JWT Secret

Generate a secure random string (minimum 32 characters):

```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Use online generator
# Visit: https://randomkeygen.com/
```

Update `JWT_SECRET` in `.env`:
```
JWT_SECRET=your-generated-secret-key-here-min-32-characters
```

### Step 5: Verify `.env` file

Your `.env` file should look like this:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/planet-path
# OR for Atlas: mongodb+srv://username:password@cluster.mongodb.net/planet-path?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters
JWT_EXPIRE=7d

# CORS Configuration
CLIENT_URL=http://localhost:5173

# Application Configuration
APP_NAME=Planet Path
APP_VERSION=1.0.0
```

### Step 6: Restart the server

After creating `.env`, restart your development server:

```bash
npm run dev
```

## Troubleshooting

### Error: "MONGODB_URI is not defined"
- ✅ Make sure `.env` file exists in the `server/` directory
- ✅ Check that `MONGODB_URI` is spelled correctly (case-sensitive)
- ✅ Ensure there are no spaces around the `=` sign
- ✅ Restart the server after creating/editing `.env`

### Error: "MongoDB connection error"
- ✅ Check your MongoDB URI is correct
- ✅ For Atlas: Make sure your IP is whitelisted
- ✅ For Atlas: Verify username/password are correct
- ✅ For local: Make sure MongoDB service is running

### Quick Test MongoDB Connection

Test your MongoDB URI with this command:

```bash
# Windows PowerShell
$env:MONGODB_URI="your-connection-string-here"
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); })"
```

## Security Notes

⚠️ **Never commit `.env` to git!**
- `.env` is already in `.gitignore`
- Keep your `JWT_SECRET` secret
- Don't share your MongoDB credentials

## Next Steps

Once `.env` is configured:
1. ✅ Start server: `npm run dev`
2. ✅ Test health endpoint: `GET http://localhost:5000/health`
3. ✅ Test registration: `POST http://localhost:5000/api/auth/register`


