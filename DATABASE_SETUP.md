# Database Setup Guide - Make My Memory

## ✅ Current Status

**Database Connection:** ✅ CONFIGURED (but needs real credentials)

The application is now set up to use MongoDB. However, the current `.env.local` file contains a **test connection string** that won't work in production.

## 🚀 How to Set Up Real Database

### Step 1: Create MongoDB Atlas Account (FREE)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Click "Sign Up" and create a free account
3. Verify your email

### Step 2: Create a Cluster

1. After login, click "Create a Deployment"
2. Choose **FREE** tier (M0 Sandbox)
3. Select your region (closest to your users)
4. Click "Create Deployment"
5. Wait 2-3 minutes for cluster to be created

### Step 3: Create Database User

1. In MongoDB Atlas, go to **Database Access**
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Set username: `makemymemory`
5. Set password: `makemymemory2024` (or your own secure password)
6. Click **Add User**

### Step 4: Get Connection String

1. Go to **Databases** → Click **Connect** on your cluster
2. Choose **Connect your application**
3. Select **Node.js** driver
4. Copy the connection string (looks like):
   ```
   mongodb+srv://makemymemory:makemymemory2024@cluster0.mongodb.net/make-my-memory?retryWrites=true&w=majority
   ```

### Step 5: Update .env.local

Replace the MONGODB_URI in your `.env.local`:

```env
MONGODB_URI=mongodb+srv://makemymemory:makemymemory2024@cluster0.mongodb.net/make-my-memory?retryWrites=true&w=majority
```

### Step 6: Restart Server

Stop and restart your development server:
```bash
# Stop current server (Ctrl+C)
# Then run:
npm run dev
```

## ✅ What Works With Database

Once connected, these features will work:

- ✅ **Add Products** - Admin can add new products
- ✅ **Edit Products** - Modify existing products
- ✅ **Delete Products** - Remove products
- ✅ **Upload Images/Videos** - Store media files
- ✅ **Orders** - Save customer orders
- ✅ **Reviews** - Store customer reviews
- ✅ **User Accounts** - Register and login
- ✅ **Data Persistence** - All data saved permanently

## 🌐 Deploying to Production

When you deploy to production (Vercel, Netlify, etc.):

1. **Add environment variable** in your hosting platform:
   - Go to Settings → Environment Variables
   - Add `MONGODB_URI` with your real connection string

2. **Update MongoDB IP Whitelist:**
   - In MongoDB Atlas → Network Access
   - Add your production server's IP (or allow all: 0.0.0.0/0)

3. **Use strong credentials:**
   - Change default password
   - Use a strong, unique password
   - Never commit `.env.local` to git

## 📊 Database Structure

The application automatically creates these collections:

- **products** - All product listings
- **orders** - Customer orders
- **reviews** - Product reviews
- **users** - User accounts (if auth enabled)

## 🔒 Security Notes

- ✅ Never commit `.env.local` to GitHub
- ✅ Use strong passwords for MongoDB
- ✅ Enable IP whitelist in MongoDB Atlas
- ✅ Use environment variables for all secrets
- ✅ Rotate credentials regularly

## 🆘 Troubleshooting

### "MongoDB connection failed"
- Check your connection string is correct
- Verify username/password
- Check IP whitelist in MongoDB Atlas

### "Cannot connect to cluster"
- Wait 5 minutes after creating cluster
- Check internet connection
- Verify firewall isn't blocking MongoDB

### "Authentication failed"
- Double-check username and password
- Make sure user was created in Database Access
- Try resetting the password

## 📝 Current Test Credentials

```
Username: makemymemory
Password: makemymemory2024
Cluster: cluster0
Database: make-my-memory
```

**⚠️ IMPORTANT:** Change these credentials before going live!

## ✨ Next Steps

1. Create your MongoDB Atlas account
2. Get your real connection string
3. Update `.env.local` with real credentials
4. Restart the server
5. Test adding a product in admin panel
6. Deploy to production with environment variables set