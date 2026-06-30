# Database Connection Troubleshooting Guide

## Why MongoDB Connection Drops

### Common Causes

1. **Network Issues**
   - Firewall blocking connection
   - ISP throttling connections
   - Temporary network instability
   - Serverless function cold starts (on Vercel, AWS Lambda, etc.)

2. **MongoDB Atlas Issues**
   - Cluster maintenance
   - IP whitelist restrictions (wrong IP connecting)
   - Connection pool exhaustion
   - Authentication failures

3. **Code Issues**
   - Not reusing connections (creating new ones each request)
   - Long-running operations timing out
   - Improper error handling

## What We Fixed

### 1. **Improved Connection Caching** (`lib/db/connect.ts`)
- Now checks if connection is actually active (`readyState === 1`)
- Resets connection if it drops unexpectedly
- Increased retry timeouts and pool sizes
- Added `retryWrites` and `retryReads` for automatic retries

### 2. **Non-Blocking Sync Operations** (`app/api/admin/products/route.ts`)
- Category sync no longer blocks product creation
- Errors don't cascade and fail the whole request
- Sync happens in background, product upload still succeeds

### 3. **Graceful Fallbacks** (`app/api/admin/login/route.ts`)
- Login works even if database is temporarily unavailable
- Falls back to environment variable password
- Prevents cascading failures

## How to Verify Connection

### 1. Check MongoDB Atlas Dashboard
- Go to https://cloud.mongodb.com
- Select your cluster
- Check "Monitoring" tab for connection status
- Verify IP whitelist includes your server's IP

### 2. Check Environment Variables
```bash
# Verify in .env.production that MONGODB_URI is correct
echo $MONGODB_URI
```

### 3. Test Connection Directly
```bash
# Add this endpoint temporarily to test connection
curl https://your-domain.com/api/health
```

## MongoDB Atlas Settings to Check

1. **Network Access (IP Whitelist)**
   - Allow your server IP (or 0.0.0.0 for development)
   - Vercel: Allow all IPs (0.0.0.0/0) since IPs change

2. **Connection String**
   - Must include username and password
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/?appName=YourApp`

3. **Database Limits**
   - Check connection limit (default: 500)
   - Check storage limit
   - Verify tier supports your usage

## Monitoring Checklist

- [ ] MongoDB Atlas cluster status is green
- [ ] Your IP is in the IP whitelist
- [ ] Connection string has correct credentials
- [ ] No database disk quota exceeded
- [ ] Server has stable internet connection
- [ ] API response times are normal (<500ms)

## Production Best Practices

### Connection Pooling
✅ We use a 10-connection pool with minimum 2 connections
✅ Connections are reused across requests
✅ Old connections are automatically recycled

### Timeout Configuration
```
serverSelectionTimeoutMS: 10_000   // 10 seconds to find server
socketTimeoutMS:          45_000   // 45 seconds for operations
connectTimeoutMS:         10_000   // 10 seconds to establish connection
```

### Retry Logic
✅ Automatic retries enabled for writes and reads
✅ Connection cache resets on failures
✅ Exponential backoff on retries

## What Happens If Database Goes Down

1. **First Request After Outage**
   - Connection attempt will fail after 10 seconds
   - Returns 500 error to client

2. **Graceful Fallbacks**
   - Login: Falls back to env password ✓
   - Product upload: Still succeeds, sync fails silently ✓
   - Admin operations: Still fail (requires database)

3. **Automatic Recovery**
   - Next request after recovery automatically reconnects
   - No manual intervention needed
   - Connection reestablished within 10 seconds

## If Products Still Fail to Upload

1. **Check Admin Login**
   - Is admin logged in? (Check browser cookies)
   - Admin session should be set

2. **Check Network Tab**
   - Open DevTools → Network
   - Look for POST to `/api/admin/products`
   - Check response status and error message

3. **Check MongoDB Atlas**
   - Cluster running?
   - Storage limit exceeded?
   - Authentication working?

4. **Check Server Logs**
   - Vercel: Dashboard → Logs
   - Self-hosted: `docker logs app-container`
   - Look for `[products-api]` or `[connectDB]` errors

## MongoDB Connection States

```
0 = DISCONNECTED  (not connected)
1 = CONNECTED     (ready to use) ✓
2 = CONNECTING    (in progress)
3 = DISCONNECTING (in progress)
```

If state is not 1, connection is not ready.

## Emergency Recovery

If database connection is truly broken and not recovering:

1. **Clear Connection Cache** (local dev only)
   ```bash
   npm run dev  # Restart dev server
   ```

2. **Check MongoDB Atlas Status**
   - Navigate to https://cloud.mongodb.com
   - Verify cluster is running
   - Check for maintenance windows

3. **Verify Network Connection**
   ```bash
   ping cluster0.e4avkz4.mongodb.net
   ```

4. **Test from Different Network**
   - Try with VPN or different internet
   - Confirms if it's a network issue

## Key Improvements Made

| Issue | Solution |
|-------|----------|
| Connection drop mid-request | Connection state check before reuse |
| Sync failures blocking uploads | Non-blocking sync with try-catch |
| DB down → app fails | Graceful fallback to env variables |
| Pool exhaustion | Increased pool size and reuse |
| Timeout too short | Increased from 5s to 10s timeout |
| No retry logic | Added retryWrites and retryReads |

## Need Help?

1. Check server logs for `[connectDB]` or `[products-api]` errors
2. Verify MongoDB URI is correct in .env.production
3. Test connection: Navigate to MongoDB Atlas and check cluster
4. Restart server: Often fixes temporary connection issues
