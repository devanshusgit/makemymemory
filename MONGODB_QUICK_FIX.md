# MongoDB Connection Issues - Quick Fix

## If Products Won't Upload

### Step 1: Check if MongoDB is Running
Go to https://cloud.mongodb.com → Your Cluster
- Is it green and running? ✓ or ✗

### Step 2: Check Your IP is Whitelisted
https://cloud.mongodb.com → Network Access → IP Whitelist
- Is your server IP listed?
- For Vercel: Use `0.0.0.0/0` (allows all IPs)

### Step 3: Verify Connection String
Check `.env.production` for MONGODB_URI:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?appName=Cluster0
```
- ✓ Format is correct
- ✓ Username and password are correct
- ✓ Database name is included

### Step 4: Try Again
1. **Local:** Restart server `npm run dev`
2. **Vercel:** Redeploy from dashboard
3. Wait 30 seconds for connection to establish
4. Try uploading product again

## If Still Failing

### Check Server Logs
**Vercel:**
- Go to Project Settings → Logs → Function
- Look for errors starting with `[connectDB]` or `[products-api]`

**Local:**
- Check terminal where you ran `npm run dev`
- Look for red error messages

### Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| `ECONNREFUSED` | Can't reach MongoDB | Check IP whitelist |
| `Authentication failed` | Wrong password | Verify credentials |
| `querySrv ECONNREFUSED` | Network blocked | Allow firewall port 27017 |
| `Timeout after 10000ms` | MongoDB too slow | Check cluster status |

### Nuclear Option: Restart Everything
1. Stop local server (Ctrl+C)
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules: `rm -rf node_modules`
4. Reinstall: `npm install`
5. Restart: `npm run dev`

## What We Fixed

✅ **Non-blocking uploads** - Even if sync fails, product still uploads
✅ **Better retry logic** - Automatic retries on failure
✅ **Graceful fallbacks** - Login works even if DB is down
✅ **Connection pooling** - Reuses connections instead of creating new ones
✅ **Longer timeouts** - Gives MongoDB time to respond

## Prevention

- ✓ Monitor MongoDB cluster regularly
- ✓ Set disk space alerts
- ✓ Review connection statistics weekly
- ✓ Keep credentials secure
- ✓ Test product upload quarterly

## Still Stuck?

Check full troubleshooting guide: `DATABASE_TROUBLESHOOTING.md`
