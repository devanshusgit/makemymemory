# Make My Memory - Setup Guide

## Quick Fix for "getaddrinfo ENOTFOUND placeholder" Error

The error you're seeing occurs because the MongoDB URI in your `.env.local` file contains placeholder values. Here's how to fix it:

### Option 1: Use MongoDB Atlas (Recommended)

1. **Create a free MongoDB Atlas account:**
   - Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
   - Sign up for a free account
   - Create a new cluster (free tier is sufficient)

2. **Get your connection string:**
   - In your Atlas dashboard, click "Connect"
   - Choose "Connect your application"
   - Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/database`)

3. **Update your `.env.local` file:**
   ```env
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/make-my-memory?retryWrites=true&w=majority
   ```

### Option 2: Use Local MongoDB

If you have MongoDB installed locally:

```env
MONGODB_URI=mongodb://localhost:27017/make-my-memory
```

### Option 3: Disable Database Features (Development Only)

If you just want to test the frontend without database functionality, the app will gracefully fall back to static data when the database connection fails.

## Other Environment Variables

For full functionality, you'll also need to configure:

### Payment Processing (Razorpay)
```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### Email Configuration (SMTP)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
```

### Admin Access
```env
ADMIN_PASSWORD=your_secure_admin_password
ADMIN_EMAIL=admin@yourdomain.com
```

## File Upload Setup

The application now supports file uploads for product images and videos:

1. **Uploads Directory:** Files are stored in `/public/uploads/`
2. **Supported Formats:** Images (jpg, png, gif, webp) and Videos (mp4, webm, mov)
3. **File Size Limits:** Configure in your deployment platform (default: 10MB)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Features Now Available

✅ **File Upload System** - Upload product images and videos  
✅ **Admin Dashboard** - Manage products with media uploads  
✅ **Responsive Design** - Works on all devices  
✅ **Payment Integration** - Razorpay and PayPal support  
✅ **Order Management** - Track and manage orders  
✅ **Email Notifications** - Automated order confirmations  

## Troubleshooting

- **ENOTFOUND errors:** Check your MongoDB URI doesn't contain "placeholder"
- **File upload issues:** Ensure `/public/uploads/` directory exists and is writable
- **Payment errors:** Verify your Razorpay/PayPal credentials
- **Email issues:** Check SMTP configuration and app passwords

For more help, check the individual API route files in `/app/api/` for specific configuration requirements.