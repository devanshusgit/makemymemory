# Admin Settings Guide - Complete Implementation

## Overview
The admin settings system now fully persists all changes to the MongoDB database. Any settings changed in the admin panel are automatically saved and reflected on the main website in real-time.

## What's Fixed

### ✅ Settings Persistence
- **Before**: Settings were only stored in memory and lost on page refresh
- **After**: All settings are saved to MongoDB and persist permanently

### ✅ Database Integration
- Created `Settings` model in MongoDB
- All admin settings now save to the database
- Public API endpoint fetches settings for the main website

### ✅ Real-Time Reflection
- Store information updates immediately
- Homepage stats display updated values
- Feature toggles take effect instantly

## Settings Available

### 1. Store Information
**Location**: Admin Settings → Store Info

**Fields**:
- **Store Name**: Your business name (default: "Make My Memory")
- **Phone Number**: Contact phone number
- **Address**: Store address

**Where it's used**:
- Footer on main website
- Contact pages
- Store information sections

**API Endpoint**: `/api/admin/settings/store`

### 2. Homepage Stats
**Location**: Admin Settings → Homepage Stats

**Fields**:
- **Happy Customers**: Number of satisfied customers
- **Memories Created**: Total memories/products created
- **Average Rating**: Store rating (0-5)
- **Founded Year**: Year the business was founded

**Where it's used**:
- Homepage hero section
- About page
- Trust badges

**API Endpoint**: `/api/admin/settings/stats`

### 3. Feature Toggles
**Location**: Admin Settings → Maintenance

**Toggles**:
- **Reviews Active**: Show customer reviews or "Coming Soon" message
- **Maintenance Mode**: Temporarily disable the store
- **Order Notifications**: Enable/disable order notifications (coming soon)

**Where it's used**:
- Reviews page
- Store availability
- Notification system

**API Endpoint**: `/api/admin/settings/toggle`

### 4. Admin Password
**Location**: Admin Settings → Password

**Features**:
- Change admin login password
- Requires current password verification
- Minimum 6 characters

**Note**: Password changes require updating the `.env` file in production

**API Endpoint**: `/api/admin/settings/password`

## How It Works

### Data Flow

```
Admin Panel
    ↓
AdminSettingsClient (React Component)
    ↓
API Endpoints (/api/admin/settings/*)
    ↓
MongoDB Settings Collection
    ↓
Public API (/api/settings)
    ↓
Main Website Components
```

### Save Process

1. Admin changes a setting in the admin panel
2. Component sends PUT/POST request to API endpoint
3. API validates the data
4. API connects to MongoDB
5. Settings are updated or created (upsert)
6. Success message displayed to admin
7. Main website fetches updated settings

### Fetch Process

1. Main website component needs settings
2. Fetches from `/api/settings` endpoint
3. API connects to MongoDB
4. Returns current settings
5. Component displays updated values

## Database Schema

### Settings Collection

```typescript
{
  // Store Information
  storeName: String,
  phone: String,
  address: String,

  // Homepage Stats
  happyCustomers: Number,
  memoriesCreated: Number,
  averageRating: Number (0-5),
  founded: Number,

  // Feature Toggles
  reviewsActive: Boolean,
  maintenanceMode: Boolean,
  orderNotifications: Boolean,

  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Store Information

**GET** `/api/admin/settings/store`
- Fetch current store information
- Returns: `{ data: { storeName, phone, address } }`

**PUT** `/api/admin/settings/store`
- Update store information
- Body: `{ storeName, phone, address }`
- Returns: `{ success: true, data: {...} }`

### Homepage Stats

**GET** `/api/admin/settings/stats`
- Fetch current stats
- Returns: `{ stats: { happyCustomers, memoriesCreated, averageRating, founded } }`

**PUT** `/api/admin/settings/stats`
- Update stats
- Body: `{ happyCustomers, memoriesCreated, averageRating, founded }`
- Returns: `{ success: true, stats: {...} }`

### Feature Toggles

**GET** `/api/admin/settings/toggle`
- Fetch current toggles
- Returns: `{ data: { reviewsActive, maintenanceMode, orderNotifications } }`

**POST** `/api/admin/settings/toggle`
- Update a toggle
- Body: `{ key: "reviewsActive", value: true }`
- Returns: `{ success: true, data: {...} }`

### Admin Password

**POST** `/api/admin/settings/password`
- Change admin password
- Body: `{ oldPassword, newPassword }`
- Returns: `{ success: true, message: "..." }`

### Public Settings

**GET** `/api/settings`
- Fetch all settings for main website
- No authentication required
- Returns: `{ settings: {...} }`

## Using Settings on Main Website

### Example: Display Store Name

```typescript
// In a React component
import { useEffect, useState } from "react";

export default function StoreInfo() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setSettings(data.settings));
  }, []);

  return <h1>{settings?.storeName}</h1>;
}
```

### Example: Display Homepage Stats

```typescript
export default function Stats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        const { happyCustomers, memoriesCreated, averageRating } = data.settings;
        setStats({ happyCustomers, memoriesCreated, averageRating });
      });
  }, []);

  return (
    <div>
      <p>{stats?.happyCustomers} Happy Customers</p>
      <p>{stats?.memoriesCreated} Memories Created</p>
      <p>Rating: {stats?.averageRating}/5</p>
    </div>
  );
}
```

### Example: Check Maintenance Mode

```typescript
export default function App() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setMaintenanceMode(data.settings.maintenanceMode));
  }, []);

  if (maintenanceMode) {
    return <div>Store is under maintenance. Please check back soon!</div>;
  }

  return <YourApp />;
}
```

## Admin Workflow

### Step 1: Login to Admin Panel
1. Go to `/admin/login`
2. Enter admin password
3. Click "Login"

### Step 2: Navigate to Settings
1. Click "Admin Settings" in sidebar
2. Or go to `/admin/settings`

### Step 3: Update Settings
1. Click on the tab for the setting you want to change
2. Modify the values
3. Click "Save" button
4. Wait for success message

### Step 4: Verify Changes
1. Go to main website
2. Refresh the page
3. Check that changes are reflected

## Troubleshooting

### Settings Not Saving
**Problem**: Click save but nothing happens
**Solution**:
1. Check browser console for errors (F12)
2. Verify admin session is active
3. Check MongoDB connection
4. Try refreshing the page

### Settings Not Displaying on Website
**Problem**: Changed settings in admin but website shows old values
**Solution**:
1. Hard refresh website (Ctrl+Shift+R)
2. Clear browser cache
3. Check `/api/settings` endpoint directly
4. Verify settings were saved in admin panel

### Can't Access Admin Settings
**Problem**: Getting "Unauthorized" error
**Solution**:
1. Login to admin panel first
2. Check admin session cookie
3. Try logging out and logging back in
4. Clear browser cookies

### Database Connection Error
**Problem**: "MongoDB connection failed" error
**Solution**:
1. Check MONGODB_URI in .env file
2. Verify MongoDB cluster is running
3. Check network connection
4. Verify IP whitelist in MongoDB Atlas

## Best Practices

### For Admins
1. **Update regularly**: Keep store information current
2. **Monitor stats**: Update customer and memory counts periodically
3. **Use toggles wisely**: Only enable maintenance mode when necessary
4. **Backup settings**: Note down important settings before major changes
5. **Test changes**: Verify changes on website after saving

### For Developers
1. **Cache settings**: Consider caching settings on the client side
2. **Validate input**: Always validate settings before saving
3. **Error handling**: Provide clear error messages to admins
4. **Logging**: Log all settings changes for audit trail
5. **Performance**: Optimize settings fetching to reduce database queries

## Future Enhancements

1. **Settings History**: Track all changes to settings
2. **Bulk Updates**: Update multiple settings at once
3. **Settings Export**: Export settings as JSON
4. **Settings Import**: Import settings from JSON
5. **Scheduled Changes**: Schedule settings changes for future dates
6. **Settings Versioning**: Rollback to previous settings
7. **Settings Notifications**: Notify team of settings changes
8. **Settings Permissions**: Different admin roles with different permissions

## Files Modified

- `lib/db/models/Settings.ts` - Settings database model
- `app/api/admin/settings/store/route.ts` - Store info API
- `app/api/admin/settings/stats/route.ts` - Stats API
- `app/api/admin/settings/toggle/route.ts` - Toggles API
- `app/api/admin/settings/password/route.ts` - Password API
- `app/api/settings/route.ts` - Public settings API
- `components/admin/AdminSettingsClient.tsx` - Admin UI with loading state

## Support

For issues or questions:
1. Check browser console for errors
2. Check server logs for API errors
3. Verify MongoDB connection
4. Check `.env` file configuration
5. Review this guide for solutions

## Related Documentation

- `PRODUCT_FILE_UPLOAD_GUIDE.md` - File upload system
- `MOBILE_RESPONSIVENESS_GUIDE.md` - Mobile optimization
- `MOBILE_VISUAL_GUIDE.md` - Visual layout guide
