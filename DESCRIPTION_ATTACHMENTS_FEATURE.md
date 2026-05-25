# Product Description Attachments Feature

## Overview
Added ability for admins to upload unlimited photos, videos, and PDFs as product description attachments. These attachments are displayed on the product detail page below the product description.

## Features Implemented

### 1. Database Model Updates
- **File**: `lib/db/models/Product.ts`
- **New Field**: `descriptionAttachments`
  - Array of objects with:
    - `url`: String (Cloudinary URL)
    - `type`: "image" | "video" | "pdf"
    - `name`: String (optional, file name)

### 2. Admin Interface
- **Location**: Admin Products → Add/Edit Product Form
- **Section**: "Description Attachments" (below description field)
- **Features**:
  - Upload multiple files at once (images, videos, PDFs)
  - Preview existing attachments
  - Preview new attachments before saving (shown in green)
  - Remove individual attachments
  - No limit on number of attachments
  - Accepts: `image/*`, `video/*`, `.pdf`

### 3. User-Facing Display
- **Location**: Product Detail Page (`/shop/[slug]`)
- **Position**: Below product description, above variant options
- **Section Title**: "Product Details"
- **Display**:
  - **Images**: Clickable thumbnails in 2-column grid, opens in new tab
  - **Videos**: Embedded video player with controls
  - **PDFs**: Document icon with filename, clickable to open in new tab
  - Hover effects on all items
  - Responsive grid layout

## How to Use

### For Admins:

1. Go to Admin → Products
2. Create or edit a product
3. Scroll to "Description Attachments" section
4. Click "Add Photos, Videos, or PDFs"
5. Select multiple files (images, videos, PDFs)
6. Review the files (new files shown in green)
7. Remove any unwanted files using the X button
8. Save the product

### For Users:

- Visit any product detail page
- Scroll below the product description
- View "Product Details" section with all attachments
- Click images/PDFs to view full size in new tab
- Play videos directly on the page

## Files Modified

### New/Modified Files:
- `lib/db/models/Product.ts` - Added descriptionAttachments field
- `lib/types/index.ts` - Updated Product interface
- `app/admin/products/page.tsx` - Added upload UI and logic
- `components/shop/ProductDetail.tsx` - Added display section

## Technical Details

### Upload Process:
1. Admin selects files
2. Files are stored in state as `DescriptionAttachment[]`
3. On save, files are uploaded to Cloudinary via `/api/upload`
4. URLs are saved to database with type and name
5. Existing attachments are preserved and merged with new ones

### Display Logic:
- Images: Displayed as clickable thumbnails with hover zoom effect
- Videos: Embedded with native HTML5 video player
- PDFs: Displayed as document icon with filename, opens in new tab

### Styling:
- 2-column grid on mobile/tablet
- Aspect ratio maintained for consistent layout
- Hover effects for better UX
- Border color changes on hover (#C9A84C)

## Use Cases

- **Product Instructions**: Upload PDF guides
- **Size Charts**: Upload image size charts
- **Care Instructions**: Upload care guide PDFs
- **Product Videos**: Show product in use
- **Detail Photos**: Show close-up details
- **Certificates**: Upload authenticity certificates
- **Warranty Info**: Upload warranty documents

## Notes

- Attachments are optional - products without attachments won't show the section
- No limit on number of attachments (consider storage costs)
- Files are uploaded to Cloudinary (same as product images)
- Attachments are displayed in the order they were added
- Removing an attachment from admin doesn't delete it from Cloudinary (manual cleanup needed)
