# Deployment Checklist - Make My Memory

## Before Going Live

### Database Setup ✅
- [ ] Create MongoDB Atlas account (free)
- [ ] Create a cluster
- [ ] Create database user with strong password
- [ ] Get connection string
- [ ] Update `.env.local` with real MongoDB URI
- [ ] Test database connection locally
- [ ] Verify products can be added/edited/deleted

### Environment Variables ✅
- [ ] `MONGODB_URI` - Real MongoDB connection string
- [ ] `NEXT_PUBLIC_APP_URL` - Your production domain
- [ ] `ADMIN_PASSWORD` - Strong admin password (change from default)
- [ ] `ADMIN_EMAIL` - Your admin email
- [ ] `RAZORPAY_KEY_ID` - Get from Razorpay dashboard
- [ ] `RAZORPAY_KEY_SECRET` - Get from Razorpay dashboard
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Public key
- [ ] `RAZORPAY_WEBHOOK_SECRET` - Webhook secret
- [ ] `SMTP_HOST` - Email service (Gmail, SendGrid, etc.)
- [ ] `SMTP_USER` - Email address
- [ ] `SMTP_PASS` - Email password/app password
- [ ] `INTERNAL_API_SECRET` - Generate random secret

### File Upload Setup ✅
- [ ] `/public/uploads/` directory exists
- [ ] Directory is writable by server
- [ ] Configure file size limits (if needed)
- [ ] Set up CDN for media files (optional but recommended)

### Security ✅
- [ ] `.env.local` is in `.gitignore` (never commit secrets)
- [ ] All passwords are strong and unique
- [ ] MongoDB IP whitelist configured
- [ ] HTTPS enabled on production domain
- [ ] Admin panel password changed from default
- [ ] API secrets are random and secure

### Testing ✅
- [ ] Homepage loads correctly
- [ ] Products display with images
- [ ] Admin panel accessible with password
- [ ] Can add new product with image upload
- [ ] Can edit existing product
- [ ] Can delete product
- [ ] Cart functionality works
- [ ] Checkout process works
- [ ] Payment integration works (if enabled)
- [ ] Email notifications send (if configured)

### Performance ✅
- [ ] Images are optimized
- [ ] Build completes without errors
- [ ] No console errors in browser
- [ ] Page load time is acceptable
- [ ] Mobile responsive design works

### Deployment Platform Setup ✅
- [ ] Choose hosting (Vercel, Netlify, AWS, etc.)
- [ ] Connect GitHub repository
- [ ] Set environment variables in platform
- [ ] Configure build command: `npm run build`
- [ ] Configure start command: `npm start`
- [ ] Set Node.js version to 18+
- [ ] Enable automatic deployments

### Domain & DNS ✅
- [ ] Domain registered
- [ ] DNS records configured
- [ ] SSL certificate installed (auto with most platforms)
- [ ] Domain points to hosting platform

### Monitoring ✅
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Enable server logs
- [ ] Set up uptime monitoring
- [ ] Configure alerts for errors

## Current Status

### ✅ Completed
- Database schema created
- API routes configured
- Admin panel built
- File upload system ready
- Product management system ready
- Cart and checkout system ready

### ⚠️ Needs Configuration
- Real MongoDB connection string
- Payment gateway credentials
- Email service credentials
- Admin password (change from default)
- Production domain

### 🚀 Ready to Deploy
- Next.js application
- All components built
- Responsive design
- Image optimization
- Error handling

## Quick Start for Production

1. **Create MongoDB Atlas account** (5 minutes)
   - Go to cloud.mongodb.com
   - Create free cluster
   - Get connection string

2. **Update environment variables** (2 minutes)
   - Update `.env.local` with real MongoDB URI
   - Change admin password
   - Add payment credentials (if needed)

3. **Deploy to Vercel** (5 minutes)
   - Connect GitHub repo
   - Add environment variables
   - Deploy

4. **Test live site** (5 minutes)
   - Verify all features work
   - Test admin panel
   - Test product management

**Total time to production: ~20 minutes**

## Support Resources

- MongoDB Atlas: https://cloud.mongodb.com
- Vercel Deployment: https://vercel.com
- Next.js Docs: https://nextjs.org/docs
- Razorpay Integration: https://razorpay.com/docs
- Email Setup: https://support.google.com/accounts/answer/185833

## Important Notes

⚠️ **NEVER commit `.env.local` to GitHub**
- It contains sensitive credentials
- Use environment variables in production
- Each deployment platform has its own way to set these

✅ **Database will work immediately after setup**
- No additional configuration needed
- Products added in admin will be saved
- All data persists in MongoDB

🔒 **Security is critical**
- Change all default passwords
- Use strong, unique credentials
- Enable HTTPS on production
- Keep dependencies updated