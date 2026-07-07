# How to Enable Coming Soon Categories

## Overview

The "Coming Soon" status for categories is **automatic** and based on whether products exist in that category:

- **Category Enabled**: Has ≥1 products
- **Category Coming Soon**: Has 0 products

## How It Works

### Current System Architecture

```
Shop Page (/shop)
    ↓
Fetches /api/categories
    ↓
Gets all categories from database
    ↓
For each category, fetches /api/products?category=CATEGORY_ID
    ↓
Counts products returned
    ↓
If count > 0: Category is ENABLED ✅
If count = 0: Category shows "COMING SOON" ⏱️
```

### Code Logic (components/shop/ShopClient.tsx)

```typescript
const isEmpty = (cat.productCount || 0) === 0;

if (isEmpty) {
  showToast("This category is coming soon!", "info");
  return;
}
```

**This means**: A category automatically becomes enabled the moment you add the first product to it!

## To Enable a Coming Soon Category

Simply add a product to that category:

### Method 1: Via Admin Dashboard

1. Go to `/admin/products`
2. Click "Add New Product" or upload CSV
3. Set the `category` field to the category you want to enable
4. Add product details (name, price, images, etc.)
5. Click "Create Product"
6. The category will now appear enabled in `/shop`

### Method 2: Via CSV Upload

1. Go to `/admin/products`
2. Use the "Upload CSV" option
3. Include the category ID in the `category` column
4. Upload the CSV
5. The category will now appear enabled in `/shop`

### Method 3: Via API

**Endpoint**: `POST /api/admin/products`

```bash
curl -X POST http://localhost:3000/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Name",
    "slug": "product-name",
    "price": 999,
    "category": "3d-casting",
    "description": "Product description",
    "images": ["https://example.com/image1.jpg"],
    "inStock": true
  }'
```

## Default Categories

The system comes with default categories that can be found in:

### Default Categories List

1. **Foil Imprints** (ID: `foil-imprints`)
   - Gold & silver foil impressions
   - Usually has products

2. **3D Casting** (ID: `3d-casting`)
   - 3D casts of hands/feet
   - Usually comes soon (until products added)

### How Categories are Created

Categories are created via:
1. `/admin/categories` interface (if exists)
2. Seed script: `scripts/seed-categories.js`
3. Direct database insertion

## Finding Which Categories Have Products

### Option 1: Use the API Endpoint

```bash
# Start the dev server
npm run dev

# In another terminal
curl http://localhost:3000/api/admin/categories-report
```

**Response** will show:
- Categories WITH products (should be enabled)
- Categories with 0 products (coming soon)

### Option 2: Check in Admin Dashboard

1. Go to `/admin` 
2. Navigate to Products section
3. Filter by category to see which categories have products
4. Categories appearing here are ENABLED
5. Categories with NO products are COMING SOON

### Option 3: Direct Database Query (MongoDB Compass or Atlas UI)

```javascript
// Find all categories with product counts
db.categories.aggregate([
  {
    $lookup: {
      from: "products",
      localField: "id",
      foreignField: "category",
      as: "products"
    }
  },
  {
    $project: {
      _id: 0,
      id: 1,
      title: 1,
      productCount: { $size: "$products" }
    }
  },
  { $sort: { productCount: -1 } }
])
```

## Step-by-Step: Enable a Specific Category

### Example: Enable "3D Casting" Category

**Step 1**: Verify the category exists
- Go to `/admin` (if admin interface exists)
- Or query: `db.categories.findOne({ id: "3d-casting" })`

**Step 2**: Add products to the category
- Go to `/admin/products`
- Click "Create New Product"
- Set category to `3d-casting`
- Fill in product details
- Save product

**Step 3**: Verify it's enabled
- Go to `/shop`
- The "3D Casting" category card should now be clickable
- "Coming Soon" overlay should be gone
- Clicking it should show the products

**Step 4**: Repeat for other categories
- Add more products to each category you want to enable
- Each category auto-enables when it gets its first product

## Automated Process

Once products are added:

1. Admin adds product with `category: "3d-casting"`
2. Product saved to database
3. Shop page queries `/api/products?category=3d-casting`
4. Returns 1 product (instead of 0)
5. `isEmpty` becomes false
6. Category is automatically enabled ✅
7. "Coming Soon" overlay removed
8. Category becomes clickable

**No manual configuration needed!**

## Check Current Status

### Via Shop Page
1. Go to `/shop`
2. Look at each category card
3. Cards with products are clickable
4. Cards without products show "Coming Soon"

### Via Product Count API
```bash
curl "http://localhost:3000/api/products?category=3d-casting"
# If returns: { "products": [...], "pagination": { "total": 0 } }
# → 0 products = "Coming Soon"

# If returns: { "products": [...], "pagination": { "total": 5 } }
# → 5 products = Enabled ✅
```

## Summary: Enabling Coming Soon Categories

**TL;DR**: To enable a coming soon category, just add products to it. That's it!

### Automatic Process:
```
Add Product to Category
    ↓
Product saved to MongoDB
    ↓
/api/products?category=XXX now returns products
    ↓
Shop page recalculates product count
    ↓
Count > 0, so isEmpty = false
    ↓
"Coming Soon" overlay removed
    ↓
Category now enabled and clickable ✅
```

### What You Need To Do:
1. ✅ Add products to desired categories via admin panel
2. ✅ Verify products have correct category ID
3. ✅ Products will automatically make categories available
4. ✅ No additional configuration needed

---

**Current Categories Status**:

To see which categories currently have products and which are coming soon:

```bash
npm run dev
# Then call:
curl http://localhost:3000/api/admin/categories-report | jq .
```

This will show:
- `categoriesWithProducts`: Categories that are enabled
- `categoriesComingSoon`: Categories still showing "Coming Soon"

---

## Related Files

- `components/shop/ShopClient.tsx` - Shop category rendering logic
- `app/api/products/route.ts` - Product fetching logic
- `app/api/categories/route.ts` - Category fetching logic
- `app/api/admin/categories-report/route.ts` - Category status report API
- `app/admin/products/page.tsx` - Product management interface

---

**Status**: ✅ Categories auto-enable based on product count  
**Action Required**: Add products to categories to enable them
