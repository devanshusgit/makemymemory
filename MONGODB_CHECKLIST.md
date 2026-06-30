# MongoDB Connection - Interactive Checklist

Complete each section and mark as done. Print or screenshot this for your records.

---

## 📋 SECTION 1: MONGODB CLUSTER STATUS

### Check Cluster is Running
- [ ] Logged into MongoDB Atlas (https://cloud.mongodb.com)
- [ ] Selected correct project
- [ ] Found "cluster0" in Clusters list
- [ ] Cluster shows **GREEN checkmark** (not yellow/red)
- [ ] Cluster size is adequate for usage

**Status:** ✅ PASS / ❌ FAIL / ⚠️ ACTION NEEDED

**If FAIL:** Go to cluster → Click "Start Cluster" button

**Evidence:** Take screenshot of green cluster status

---

## 🔐 SECTION 2: NETWORK ACCESS (IP WHITELIST)

### Verify IP Whitelist Settings
- [ ] Went to Security → Network Access
- [ ] Listed all IPs in whitelist
- [ ] For Vercel: IP list includes `0.0.0.0/0` OR multiple Vercel IPs
- [ ] For Local: IP list includes your machine's IP
- [ ] For Server: IP list includes server IP
- [ ] No "IP not listed" errors in logs

**Which deployment are you using?**
- [ ] Vercel
- [ ] Local machine
- [ ] Self-hosted server
- [ ] Other: _______________

**Your IP/Range:** _______________

**Status:** ✅ PASS / ❌ FAIL / ⚠️ ACTION NEEDED

**If FAIL:** 
- For Vercel: Add `0.0.0.0/0`
- For Local: Click "Add Current IP Address"
- For Server: Add your server IP manually

**Evidence:** Paste exact IP/range from whitelist:
```
_________________________________
```

---

## 🔑 SECTION 3: CONNECTION STRING & CREDENTIALS

### Verify Connection Details
- [ ] Obtained connection string from MongoDB Atlas
- [ ] Connection string format is: `mongodb+srv://username:password@cluster.mongodb.net/?appName=...`
- [ ] Username is correct: `yo_bro_db_user`
- [ ] Password is correct: `dev123`
- [ ] Cluster domain matches: `cluster0.e4avkz4.mongodb.net`
- [ ] Updated .env.production with correct string
- [ ] Committed changes to GitHub
- [ ] Redeployed application

**Your Connection String:**
```
mongodb+srv://yo_bro_db_user:dev123@cluster0.e4avkz4.mongodb.net/?appName=Cluster0
```

**Expected MONGODB_URI in .env.production:**
```
MONGODB_URI=mongodb+srv://yo_bro_db_user:dev123@cluster0.e4avkz4.mongodb.net/?appName=Cluster0
```

**Matches:** ✅ YES / ❌ NO

**Status:** ✅ PASS / ❌ FAIL / ⚠️ ACTION NEEDED

**If FAIL:** Update .env.production and redeploy

---

## 🧪 SECTION 4: CONNECTION TEST (OPTIONAL)

### Test Direct Connection
- [ ] Installed MongoDB Shell (mongosh) - OPTIONAL
- [ ] Ran test command: `mongosh "your-connection-string"`
- [ ] Connection successful (no timeout/auth errors)
- [ ] Exited with `exit` command

**Test Result:**
```
Connection: ✅ PASS / ❌ FAIL / ⏭️ SKIPPED
Error (if any): _________________________________
```

**Note:** If you skip this, that's OK. The app will test it automatically.

---

## 🚀 SECTION 5: APPLICATION RESTART

### Restart Application

**For Local Development:**
- [ ] Stopped previous `npm run dev` with Ctrl+C
- [ ] Ran `npm run dev` to start server
- [ ] Saw no errors in terminal
- [ ] App loaded on http://localhost:3000
- [ ] Logs show: `[connectDB] Successfully connected to MongoDB`

**For Vercel Deployment:**
- [ ] Went to https://vercel.com/dashboard
- [ ] Selected "make-my-memory" project
- [ ] Clicked Deployments tab
- [ ] Found latest deployment
- [ ] Clicked (...) menu → Redeploy
- [ ] Waited for deployment complete (2-3 minutes)
- [ ] Deployment status shows SUCCESS ✅
- [ ] Deployment logs contain: `[connectDB] Successfully connected`

**For Self-Hosted Server:**
- [ ] SSH'd into server: `ssh user@server.com`
- [ ] Restarted app using appropriate method
- [ ] Checked logs show connection success
- [ ] App is accessible at your domain

**Restart Status:** ✅ PASS / ❌ FAIL / ⚠️ ACTION NEEDED

**Deployment URL for testing:** _______________

---

## 📤 SECTION 6: PRODUCT UPLOAD TEST

### Test Creating a Product

**Step 1: Admin Login**
- [ ] Navigated to admin login page
- [ ] Entered password: `admin123456`
- [ ] Logged in successfully
- [ ] Dashboard loaded without errors

**Step 2: Create Test Product**
- [ ] Clicked "Products" in admin menu
- [ ] Clicked "Add Product" button
- [ ] Filled in required fields:
  - Name: `Test Product` ✅
  - Description: `Testing connection` ✅
  - Price: `999` ✅
  - Category: (selected one) ✅
  - Image: (uploaded) ✅
- [ ] Clicked "Create Product" button

**Step 3: Verify Creation**
- [ ] Saw success message (no error)
- [ ] Product appeared in products list
- [ ] Could see test product on shop page

**Product Upload Result:**
```
Status: ✅ SUCCESS / ❌ FAILED
Error (if any): _________________________________
Product ID: _________________________________
Time taken: _____ seconds
```

---

## 🔍 SECTION 7: CHECK LOGS

### Review Application Logs

**For Local Development:**
```
Search terminal output for these messages:
✅ Found "[connectDB] Successfully connected to MongoDB"
✅ Found "[products-api] Product created successfully"
❌ Any errors with "[connectDB]" or "[products-api]"

Errors found (if any):
_________________________________
_________________________________
```

**For Vercel:**
```
Check deployment logs for:
✅ Found "[connectDB] Successfully connected to MongoDB"
✅ No errors with "querySrv ECONNREFUSED"
❌ Any timeout or authentication errors

Errors found (if any):
_________________________________
_________________________________
```

**For Self-Hosted:**
```
Docker logs or console output shows:
✅ "[connectDB] Successfully connected to MongoDB"
❌ No connection errors

Errors found (if any):
_________________________________
_________________________________
```

**Log Check:** ✅ PASS / ❌ FAIL

---

## 💾 SECTION 8: VERIFY IN MONGODB ATLAS

### Check Data in Database

- [ ] Went to MongoDB Atlas → Cluster → Collections
- [ ] Found database "cluster0"
- [ ] Found collection "products"
- [ ] Clicked on products collection
- [ ] Saw "Test Product" document
- [ ] Document contains:
  - name: "Test Product" ✅
  - description: "Testing connection" ✅
  - price: 999 ✅
  - category: (your selection) ✅

**Data Verification:** ✅ PASS / ❌ FAIL

**Document ID:** _________________________________

---

## 🔄 SECTION 9: END-TO-END WORKFLOW

### Complete Full Workflow

**Step 1: Create Real Product**
- [ ] Created product with meaningful name
- [ ] Added quality images
- [ ] Set appropriate price and category
- [ ] Product created successfully

**Step 2: View on Shop**
- [ ] Went to https://your-domain.com/shop
- [ ] Product appears in list
- [ ] Can click on product to view details
- [ ] All information displays correctly

**Step 3: Update Product**
- [ ] Went to admin → Products
- [ ] Found product
- [ ] Edited details (changed price, name, etc.)
- [ ] Update successful

**Step 4: Delete Product**
- [ ] Went to admin → Products
- [ ] Found product
- [ ] Clicked delete
- [ ] Confirmed deletion
- [ ] Product removed from shop

**E2E Workflow:** ✅ PASS / ❌ FAIL

---

## 📊 SECTION 10: MONITORING SETUP (OPTIONAL)

### Set Up Monitoring

- [ ] Created MongoDB Alert for unhealthy cluster
- [ ] Created MongoDB Alert for high storage usage
- [ ] Added email recipient for alerts
- [ ] Bookmarked MongoDB Atlas dashboard
- [ ] Scheduled weekly health check review
- [ ] Documented backup procedure

**Health Check Schedule:** Every __________ week(s)

**Alert Email:** _________________________________

---

## 📋 FINAL SUMMARY

### Overall Status

**Before Fix:**
- Product uploads: ❌ FAILING
- Connection drops: ❌ YES
- Error rate: ❌ HIGH
- Performance: ❌ SLOW

**After Fix:**
- Product uploads: ✅ WORKING
- Connection stable: ✅ YES
- Error rate: ✅ LOW/NONE
- Performance: ✅ FAST

### Completion Score

Count your ✅'s:
- Section 1: __/5 ✅
- Section 2: __/6 ✅
- Section 3: __/8 ✅
- Section 4: __/4 ✅
- Section 5: __/8 ✅
- Section 6: __/13 ✅
- Section 7: __/6 ✅
- Section 8: __/9 ✅
- Section 9: __/9 ✅
- Section 10: __/6 ✅

**Total: ___/74 ✅ (Goal: 70+)**

### Issues Resolved

List any issues that occurred and were fixed:

1. ________________________________
2. ________________________________
3. ________________________________

### Next Steps

- [ ] Product uploads working consistently
- [ ] Monitor logs for errors
- [ ] Check MongoDB Atlas weekly
- [ ] Update team on fixes
- [ ] Schedule regular health checks

---

## 🆘 IF YOU NEED HELP

**Use this troubleshooting guide:**
1. Read `DATABASE_TROUBLESHOOTING.md` - Comprehensive guide
2. Read `MONGODB_QUICK_FIX.md` - Quick reference
3. Check `DETAILED_MONGODB_FIX_STEPS.md` - Step-by-step
4. Review error message against common errors table

**Information to gather before contacting support:**
- [ ] Exact error message
- [ ] Screenshot of MongoDB cluster status
- [ ] Screenshot of IP whitelist
- [ ] Last 20 lines of server logs
- [ ] Deployment environment (Vercel/Local/Other)

---

**Date Completed:** _______________

**Signed:** _______________

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```
