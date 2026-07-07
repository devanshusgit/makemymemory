# MongoDB Database Query Results - Instructions

## Objective
Query the Make My Memory MongoDB database to:
1. Get all categories from the Category collection
2. For each category, count how many products exist in that category
3. Report which categories have 0 products (coming soon) and which have products
4. List the categories with products that should be enabled

## Database Connection Details
- **URI**: `mongodb+srv://yo_bro_db_user:dev123@cluster0.e4avkz4.mongodb.net/?appName=Cluster0`
- **Database**: Default database in the connection string (typically first database)
- **Collections**: 
  - `categories` - Contains category documents
  - `products` - Contains product documents with `category` field

## How to Execute the Query

### Option 1: Using the API Endpoint (Recommended)

**Step 1**: Start the development server
```bash
cd make-my-memory
npm run dev
```

**Step 2**: Call the API endpoint in another terminal
```bash
# Using curl
curl http://localhost:3000/api/admin/categories-report

# Using PowerShell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/categories-report"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Response Format**:
```json
{
  "success": true,
  "totalCategories": 2,
  "categoriesWithProducts": {
    "count": 1,
    "items": [
      {
        "id": "foil-imprints",
        "title": "Foil Imprints",
        "description": "Delicate gold & silver foil impressions...",
        "sortOrder": 0,
        "productCount": 5
      }
    ]
  },
  "categoriesComingSoon": {
    "count": 1,
    "items": [
      {
        "id": "3d-casting",
        "title": "3D Casting",
        "description": "Lifelike three-dimensional casts...",
        "sortOrder": 1,
        "productCount": 0
      }
    ]
  },
  "summary": {
    "total": 2,
    "withProducts": 1,
    "withoutProducts": 1
  }
}
```

**API Endpoint Location**: `app/api/admin/categories-report/route.ts`

### Option 2: Using MongoDB Atlas UI

1. Go to https://cloud.mongodb.com
2. Connect to cluster0
3. Select the database
4. Run the aggregation query below in the aggregation pipeline

### Option 3: Using MongoDB Compass

1. Connect with the MongoDB URI
2. Navigate to the database
3. Run the queries below

## MongoDB Aggregation Queries

### Query 1: All Categories with Product Counts
```javascript
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
      description: 1,
      sortOrder: 1,
      productCount: { $size: "$products" }
    }
  },
  {
    $sort: { sortOrder: 1, createdAt: 1 }
  }
])
```

### Query 2: Categories with 0 Products (Coming Soon)
```javascript
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
    $match: {
      products: { $size: 0 }
    }
  },
  {
    $project: {
      _id: 0,
      id: 1,
      title: 1,
      description: 1,
      sortOrder: 1
    }
  }
])
```

### Query 3: Categories with Products (Should Be Enabled)
```javascript
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
    $match: {
      products: { $ne: [] }
    }
  },
  {
    $project: {
      _id: 0,
      id: 1,
      title: 1,
      description: 1,
      sortOrder: 1,
      productCount: { $size: "$products" }
    }
  },
  {
    $sort: { sortOrder: 1 }
  }
])
```

## Expected Results Format

### Categories WITH products (should be enabled):
```
1. Foil Imprints
   ID: foil-imprints
   Products: 5
   Description: Delicate gold & silver foil impressions...

2. [Other category with products...]
```

### Categories with 0 products (currently coming soon):
```
1. 3D Casting
   ID: 3d-casting
   Products: 0
   Description: Lifelike three-dimensional casts...

2. [Other empty category...]
```

## Default Categories (Pre-configured)

The system comes with two default categories:

1. **Foil Imprints** (ID: `foil-imprints`)
   - Description: Delicate gold & silver foil impressions of tiny hands, feet, and paws — preserved forever.
   - Default Sort Order: 0

2. **3D Casting** (ID: `3d-casting`)
   - Description: Lifelike three-dimensional casts of hands and feet — a tangible memory you can hold.
   - Default Sort Order: 1

To ensure these exist, run:
```bash
node scripts/seed-categories.js
```

## System Architecture

### Category Model
- Located in: `lib/db/models/Category.ts`
- Fields:
  - `id`: Unique slug identifier (e.g., "foil-imprints")
  - `title`: Display name
  - `description`: Short description
  - `sortOrder`: Display order
  - `createdAt`, `updatedAt`: Timestamps

### Product Model
- Located in: `lib/db/models/Product.ts`
- Key field: `category` - Stores the category ID string
- Products are linked to categories via this field

### Database Connection
- Located in: `lib/db/connect.ts`
- Uses Mongoose ORM
- Implements connection caching for Next.js
- Supports both development and production

## API Endpoint Implementation

**File**: `app/api/admin/categories-report/route.ts`

The endpoint:
1. Connects to MongoDB via Mongoose
2. Fetches all categories sorted by sortOrder
3. For each category, counts products where `category` field matches the category ID
4. Returns results with categories grouped by product count

**Note**: This endpoint does NOT require authentication in the current implementation.

## Troubleshooting

### Connection Error: ECONNREFUSED
**Problem**: Cannot connect to MongoDB
**Solution**: 
- Verify network connectivity
- Ensure MongoDB URI is correct
- Check firewall rules for MongoDB Atlas
- Verify IP whitelist in MongoDB Atlas

### Collections Not Found
**Problem**: 404 errors when querying collections
**Solution**:
- Run seed script: `node scripts/seed-categories.js`
- Manually create categories via admin UI
- Verify database name in connection string

### No Results Returned
**Problem**: Query runs but returns empty arrays
**Solution**:
- Check if categories exist: `db.categories.count()`
- Check if products exist: `db.products.count()`
- Verify product `category` field matches category `id` field

## Next Steps After Getting Results

1. **Review the product counts** for each category
2. **Identify enabled categories** (those with products)
3. **Identify coming soon categories** (those with 0 products)
4. **Update admin settings** if needed to hide/show coming soon categories
5. **Add products** to categories that are ready to launch
6. **Monitor regularly** using the API endpoint

---

**Files Related to This Query**:
- `app/api/admin/categories-report/route.ts` - Query API endpoint
- `CATEGORY_PRODUCT_ANALYSIS.md` - Full analysis documentation
- `scripts/seed-categories.js` - Category initialization script
- `lib/db/models/Category.ts` - Category schema
- `lib/db/models/Product.ts` - Product schema
- `lib/db/connect.ts` - Database connection
