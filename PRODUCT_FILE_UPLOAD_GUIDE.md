# Product File Upload System - Complete Guide

## Overview
The product file upload system allows admins to upload images, videos, and PDFs to product descriptions. These files are displayed on the product detail page in a dedicated "Product Details" section.

## Features

### Admin Panel (`/admin/products`)
- **Drag-and-drop file upload** for images, videos, and PDFs
- **File preview** with type badges (IMAGE, VIDEO, PDF)
- **Remove files** with hover overlay
- **Max 50MB per file** limit
- **Supported formats**:
  - Images: JPG, PNG, GIF, WebP, etc.
  - Videos: MP4, WebM, etc.
  - Documents: PDF

### Frontend Display (`/shop/[slug]`)
- Files displayed in a "Product Details" section
- **Images**: Clickable thumbnails with hover zoom effect
- **Videos**: Embedded video player with controls
- **PDFs**: Downloadable document links with icon
- **Grid layout**: 2-column responsive grid
- **Hover effects**: Scale animation on images, border highlight on hover

## How It Works

### 1. Admin Upload Process

#### Adding Files to a New Product
1. Go to `/admin/products`
2. Click "Add Product"
3. Fill in product details (name, description, price, etc.)
4. Scroll to "Product Files (Images, Videos, PDFs)" section
5. Either:
   - **Drag files** into the upload area
   - **Click to browse** and select files
6. Files appear with previews and type badges
7. Remove files by clicking the X button on hover
8. Click "Add Product" to save

#### Adding Files to Existing Product
1. Go to `/admin/products`
2. Click the edit (pencil) icon on a product
3. Scroll to "Product Files" section
4. Existing files are shown with their URLs
5. Add new files using the upload area
6. Remove existing files by clicking the X button
7. Click "Save Changes" to update

### 2. File Upload Flow

```
Admin selects files
    ↓
ProductFileUploader validates files
    ↓
Files uploaded to /api/upload endpoint
    ↓
URLs returned and stored in form state
    ↓
Product saved with descriptionAttachments array
    ↓
Files displayed on product detail page
```

### 3. Frontend Display

Files are displayed in the product detail page under "Product Details" section:

```
Product Details
┌─────────────────────────────────────┐
│ Image 1    │ Image 2               │
├─────────────────────────────────────┤
│ Video 1    │ PDF Document          │
└─────────────────────────────────────┘
```

## Technical Details

### Components

#### ProductFileUploader (`components/admin/ProductFileUploader.tsx`)
- Handles file upload UI and logic
- Validates file types and sizes
- Manages drag-and-drop
- Shows file previews
- Communicates with `/api/upload` endpoint

**Props:**
```typescript
interface ProductFileUploaderProps {
  attachments: FileAttachment[];
  onAttachmentsChange: (attachments: FileAttachment[]) => void;
}

interface FileAttachment {
  url: string;
  type: "image" | "video" | "pdf";
  name?: string;
}
```

#### Admin Products Page (`app/admin/products/page.tsx`)
- Integrates ProductFileUploader component
- Manages form state with `descriptionAttachments`
- Handles file upload on product save
- Displays existing files for editing

#### Product Detail Page (`components/shop/ProductDetail.tsx`)
- Displays uploaded files in "Product Details" section
- Shows images with hover zoom
- Embeds videos with controls
- Links to PDF documents

### Database Schema

**Product Model** (`lib/db/models/Product.ts`):
```typescript
descriptionAttachments?: Array<{
  url: string;
  type: "image" | "video" | "pdf";
  name?: string;
}>;
```

### API Endpoints

#### Upload Endpoint (`app/api/upload/route.ts`)
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Input**: Files in FormData
- **Output**: 
```json
{
  "files": [
    {
      "url": "https://...",
      "type": "image|video|pdf"
    }
  ]
}
```

## Usage Examples

### Example 1: Adding Product with Files

1. Admin navigates to `/admin/products`
2. Clicks "Add Product"
3. Fills in:
   - Name: "Gold Foil Handprint Frame"
   - Description: "Beautiful handprint frame with gold foil..."
   - Price: 1299
   - Category: "foil-imprints"
4. Drags 3 images and 1 PDF into the upload area
5. Files appear with previews
6. Clicks "Add Product"
7. Files are uploaded and product is created
8. Customer sees files on product detail page

### Example 2: Editing Product Files

1. Admin navigates to `/admin/products`
2. Clicks edit icon on existing product
3. Existing files are shown
4. Admin adds 2 new images
5. Admin removes 1 old image
6. Clicks "Save Changes"
7. Product is updated with new files

### Example 3: Customer Views Files

1. Customer visits `/shop/gold-foil-handprint-frame`
2. Scrolls down to "Product Details" section
3. Sees 3 images in a grid
4. Clicks on an image to view full size
5. Sees embedded video with play controls
6. Clicks PDF link to download document

## File Size and Format Limits

| Format | Max Size | Supported Types |
|--------|----------|-----------------|
| Images | 50MB | JPG, PNG, GIF, WebP, BMP, SVG |
| Videos | 50MB | MP4, WebM, OGG, MOV |
| PDFs | 50MB | PDF |

## Error Handling

### Upload Errors
- **Unsupported format**: "X is not a supported format. Use images, videos, or PDFs."
- **File too large**: "X is too large. Max 50MB per file."
- **Upload failed**: "Failed to upload file"

### Validation
- Files are validated before upload
- Invalid files are skipped with error message
- Valid files continue uploading

## Best Practices

### For Admins
1. **Use high-quality images** (at least 800x600px)
2. **Compress videos** before uploading (use MP4 format)
3. **Keep file names descriptive** (e.g., "product-detail-1.jpg")
4. **Limit to 5-10 files per product** for better performance
5. **Test on mobile** to ensure files display correctly

### For Developers
1. **Monitor upload endpoint** for performance
2. **Implement CDN** for faster file delivery
3. **Add image optimization** (resize, compress)
4. **Implement file cleanup** for deleted products
5. **Add virus scanning** for production

## Troubleshooting

### Files Not Uploading
- Check file size (max 50MB)
- Verify file format is supported
- Check network connection
- Check browser console for errors

### Files Not Displaying
- Verify files were uploaded successfully
- Check product detail page loads correctly
- Verify file URLs are accessible
- Check browser console for 404 errors

### Performance Issues
- Reduce file sizes
- Limit number of files per product
- Use CDN for file delivery
- Implement lazy loading for images

## Future Enhancements

1. **Image optimization**: Auto-resize and compress images
2. **Video thumbnails**: Generate thumbnails for videos
3. **Bulk upload**: Upload multiple files at once
4. **File reordering**: Drag to reorder files
5. **File categories**: Organize files by type
6. **Watermarking**: Add watermarks to images
7. **Video streaming**: Use HLS for better video delivery
8. **Analytics**: Track file downloads and views

## Related Files

- `components/admin/ProductFileUploader.tsx` - Upload component
- `app/admin/products/page.tsx` - Admin products page
- `components/shop/ProductDetail.tsx` - Product detail page
- `lib/db/models/Product.ts` - Product model
- `app/api/upload/route.ts` - Upload API endpoint

## Support

For issues or questions about the file upload system, check:
1. Browser console for errors
2. Network tab for failed requests
3. Server logs for upload errors
4. Product model for schema validation
