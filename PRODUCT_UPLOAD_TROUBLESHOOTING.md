# Product Upload Troubleshooting Guide

## Issue: Can't Upload Photos or Add Products

### Quick Fixes (Try These First)

#### 1. **Restart Development Server**
The most common issue is that environment variables aren't loaded.

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

#### 2. **Clear Browser Cache**
```bash
# Hard refresh in browser:
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

#### 3. **Check Admin Login**
- Make sure you're logged in as admin
- Go to `/admin/login`
- Username: `admin`
- Password: `admin123456` (from .env.local)

#### 4. **Check Browser Console**
- Open DevTools (F12)
- Go to Console tab
- Look for error messages
- Screenshot and share the error

---

## Detailed Troubleshooting

### Step 1: Verify Environment Variables

Check that Cloudinary is configured in `.env.local`:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dwhj8vjqr
CLOUDINARY_API_KEY=624865681549231
CLOUDINARY_API_SECRET=VkftQL4V8Nu9jcmuzfarU7KO5CI
```

If missing, add them to `.env.local` and restart the server.

### Step 2: Check Admin Authentication

The upload endpoint requires admin authentication. Make sure:

1. You're logged in as admin
2. Admin session cookie is set
3. Password is correct: `admin123456`

To verify:
- Open DevTools → Application → Cookies
- Look for `admin_session` cookie
- It should have a value

### Step 3: Test Upload Endpoint

Open browser console and run:

```javascript
// Test if upload endpoint is working
fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.error(e))
```

Expected response:
- If not authenticated: `{ error: "Unauthorized" }`
- If no files: `{ error: "No files provided" }`

### Step 4: Check Cloudinary Configuration

Verify Cloudinary credentials are correct:

```javascript
// In browser console:
console.log('Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
```

Should show: `dwhj8vjqr`

### Step 5: Check Network Requests

1. Open DevTools → Network tab
2. Try to upload a photo
3. Look for `/api/upload` request
4. Check:
   - Status code (should be 200)
   - Response (should have `files` array)
   - Headers (should have auth cookie)

---

## Common Errors & Solutions

### Error: "Unauthorized"
**Cause**: Not logged in as admin

**Solution**:
1. Go to `/admin/login`
2. Enter password: `admin123456`
3. Try upload again

### Error: "Upload service not configured"
**Cause**: Cloudinary environment variables not set

**Solution**:
1. Check `.env.local` has Cloudinary variables
2. Restart dev server
3. Try again

### Error: "Failed to upload files"
**Cause**: Cloudinary API error or network issue

**Solution**:
1. Check internet connection
2. Verify Cloudinary credentials are correct
3. Check Cloudinary account status
4. Try uploading smaller file

### Error: "No files provided"
**Cause**: File not selected or form data not sent correctly

**Solution**:
1. Make sure file is selected
2. Check file size (max 20MB)
3. Try different file format

### Error: "Network error" or timeout
**Cause**: Server not responding or slow connection

**Solution**:
1. Check if dev server is running
2. Check internet connection
3. Try uploading smaller file
4. Restart dev server

---

## Step-by-Step: Adding a Product with Photo

### 1. Login as Admin
- Go to `/admin/login`
- Enter password: `admin123456`
- Click Login

### 2. Go to Products
- Click "Products" in sidebar
- Or go to `/admin/products`

### 3. Click "Add Product"
- Click the "+ Add Product" button
- Form will open

### 4. Fill in Product Details
- **Name**: Product name (required)
- **Description**: Product description (required)
- **Price**: Product price (required)
- **Category**: Select category (required)
- **Badge**: Optional (Best Seller, Popular, etc.)
- **In Stock**: Toggle on/off

### 5. Upload Photos
- Click "Photos / Videos" section
- Click the upload area or drag & drop
- Select image file (JPG, PNG, HEIC)
- Wait for upload to complete
- Image preview will appear

### 6. Save Product
- Click "Save Product" button
- Wait for save to complete
- Product will appear in list

---

## File Upload Requirements

### Supported Formats
- **Images**: JPG, PNG, HEIC, WebP
- **Videos**: MP4, MOV, WebM

### Size Limits
- **Max per file**: 20 MB
- **Max total**: 5 files per product

### Recommended Sizes
- **Images**: 1200x1200px or larger
- **Aspect ratio**: Square (1:1) works best

---

## Testing Upload Locally

### Test 1: Simple Upload
1. Go to `/admin/products`
2. Click "Add Product"
3. Fill in required fields
4. Upload a small test image (< 1MB)
5. Click Save

### Test 2: Multiple Files
1. Upload 2-3 images
2. Verify all appear in preview
3. Save product
4. Check product page shows carousel

### Test 3: Different Formats
1. Try JPG image
2. Try PNG image
3. Try HEIC image
4. Verify all upload successfully

---

## Debug Mode

### Enable Detailed Logging

Add this to browser console:

```javascript
// Enable detailed logging
localStorage.setItem('DEBUG_UPLOAD', 'true')

// Then try upload again
// Check console for detailed logs
```

### Check Server Logs

If using terminal, check for upload logs:

```
[upload] File uploaded: ...
```

---

## Still Having Issues?

### Collect Information
1. Screenshot of error message
2. Browser console errors (F12 → Console)
3. Network tab request/response (F12 → Network)
4. `.env.local` file (without passwords)
5. Dev server logs

### Check These Files
- `app/api/upload/route.ts` - Upload endpoint
- `app/admin/products/page.tsx` - Admin form
- `.env.local` - Environment variables

### Restart Everything
```bash
# Stop dev server (Ctrl+C)
# Clear cache
rm -rf .next
# Restart
npm run dev
```

---

## Quick Checklist

- [ ] Dev server is running
- [ ] Logged in as admin
- [ ] Cloudinary credentials in `.env.local`
- [ ] Browser cache cleared
- [ ] File is under 20MB
- [ ] File format is supported
- [ ] Internet connection is working
- [ ] No firewall blocking uploads

---

## Environment Variables Needed

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dwhj8vjqr
CLOUDINARY_API_KEY=624865681549231
CLOUDINARY_API_SECRET=VkftQL4V8Nu9jcmuzfarU7KO5CI
ADMIN_PASSWORD=admin123456
```

All of these should be in `.env.local` for local development.

---

## Support

If you're still having issues:
1. Check the error message carefully
2. Follow the troubleshooting steps above
3. Restart dev server
4. Clear browser cache
5. Try a different browser
6. Try a different file

Most issues are resolved by restarting the dev server!
