# Category Management & Coming Soon Badge Feature

## Overview
Added dynamic category management system and "Coming Soon" badge for products.

## Features Implemented

### 1. Coming Soon Badge
- Added "Coming Soon" to the product badges list
- Admins can now mark products as "Coming Soon" in the product form
- Badge appears on product cards in the shop

### 2. Dynamic Category Management

#### Database Model
- **File**: `lib/db/models/Category.ts`
- **Fields**:
  - `id`: Unique slug-like identifier (e.g., "foil-imprints")
  - `title`: Display name (e.g., "Foil Imprints")
  - `description`: Short description for shop page
  - `sortOrder`: Display order

#### API Endpoints

**Admin Endpoints** (require admin authentication):
- `GET /api/admin/categories` - List all categories
- `POST /api/admin/categories` - Create new category
- `PATCH /api/admin/categories/[id]` - Update category
- `DELETE /api/admin/categories/[id]` - Delete category

**Public Endpoint**:
- `GET /api/categories` - Public endpoint to fetch categories

#### Admin UI
- **Location**: Admin Settings → Categories tab
- **Features**:
  - View all categories
  - Add new categories with ID, title, and description
  - Edit existing categories (title and description only)
  - Delete categories
  - Drag-to-reorder (sortOrder field)

#### Integration
All category dropdowns now fetch from the database:
- **Admin Products Page**: Category dropdown fetches from API
- **Admin Gallery Page**: Category dropdown fetches from API
- **Shop Page**: Category filter cards fetch from API

### 3. Seed Script
- **File**: `scripts/seed-categories.js`
- **Purpose**: Initialize default categories (foil-imprints, 3d-casting)
- **Usage**: `node scripts/seed-categories.js`

## How to Use

### For Admins

#### Adding a New Category:
1. Go to Admin Settings → Categories tab
2. Click "Add Category"
3. Enter:
   - **Category ID**: Lowercase, hyphens only (e.g., "photo-frames")
   - **Display Title**: User-friendly name (e.g., "Photo Frames")
   - **Description**: Short description for shop page
4. Click "Add Category"

#### Marking Products as Coming Soon:
1. Go to Admin → Products
2. Create or edit a product
3. In the "Badge" dropdown, select "Coming Soon"
4. Save the product

### Default Categories
- **Foil Imprints**: Delicate gold & silver foil impressions
- **3D Casting**: Lifelike three-dimensional casts

## Files Modified

### New Files:
- `lib/db/models/Category.ts`
- `app/api/admin/categories/route.ts`
- `app/api/admin/categories/[id]/route.ts`
- `app/api/categories/route.ts`
- `components/admin/CategoriesManager.tsx`
- `scripts/seed-categories.js`

### Modified Files:
- `app/admin/products/page.tsx` - Added "Coming Soon" badge, dynamic categories
- `app/admin/gallery/page.tsx` - Dynamic categories
- `components/admin/AdminSettingsClient.tsx` - Added Categories tab
- `components/shop/ShopClient.tsx` - Dynamic categories

## Notes
- Category IDs cannot be changed after creation (to maintain data integrity)
- Deleting a category doesn't delete associated products/gallery items
- Categories appear in shop page based on sortOrder
- Empty categories still show in shop (consider hiding if no products)
