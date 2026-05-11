# Image Carousel Feature - Product Detail Page

## Overview
Added Instagram-style image carousel to the product detail page. Users can now scroll through multiple product images with smooth animations and interactive dots below.

## Features

### 1. **Smooth Image Transitions**
- Swipe-like animations when navigating between images
- Direction-aware transitions (left/right based on navigation direction)
- Smooth fade and slide effects using Framer Motion

### 2. **Multiple Navigation Methods**
- **Arrow Buttons**: Left/right arrows appear on hover
- **Dot Indicators**: Click any dot to jump to that image
- **Keyboard Navigation**: Use arrow keys (← →) to navigate
- **Thumbnail Strip**: Mobile-friendly thumbnail preview (on small screens)

### 3. **Visual Indicators**
- **Dots Below**: Instagram-style dots showing current position
- **Image Counter**: "1 / 5" style counter in top-right
- **Active Dot**: Larger, darker dot for current image
- **Hover Effects**: Dots scale up on hover

### 4. **Responsive Design**
- Desktop: Full carousel with arrow buttons and dots
- Mobile: Carousel with dots and thumbnail strip
- Tablet: Optimized layout with all features

### 5. **Accessibility**
- Keyboard navigation support
- ARIA labels for all buttons
- Semantic HTML structure
- Screen reader friendly

## File Structure

### New Component
```
components/shop/ImageCarousel.tsx
```

### Updated Component
```
components/shop/ProductDetail.tsx
```

## Component Props

```typescript
interface ImageCarouselProps {
  images: string[];        // Array of image URLs
  productName: string;     // Product name for alt text
}
```

## Usage

```typescript
import ImageCarousel from "@/components/shop/ImageCarousel";

<ImageCarousel 
  images={product.images} 
  productName={product.name} 
/>
```

## Features Breakdown

### 1. Arrow Navigation
- **Left Arrow**: Go to previous image
- **Right Arrow**: Go to next image
- Appears on hover (desktop)
- Always visible on mobile

### 2. Dot Navigation
- Click any dot to jump to that image
- Current dot is larger and darker
- Smooth animation when changing
- Hover effect for better UX

### 3. Keyboard Navigation
- **Left Arrow Key**: Previous image
- **Right Arrow Key**: Next image
- Works anywhere on the page when carousel is visible

### 4. Image Counter
- Shows current position: "1 / 5"
- Located in top-right corner
- Semi-transparent background for visibility

### 5. Thumbnail Strip (Mobile)
- Shows all images as small thumbnails
- Horizontal scroll on mobile
- Click to jump to image
- Current thumbnail has ring border

## Styling

### Colors
- **Dots**: Stone-300 (inactive), Ink (active)
- **Arrows**: White background with ink icons
- **Counter**: Ink background with white text
- **Thumbnails**: Stone border on active

### Animations
- **Slide**: 0.3s ease-in-out
- **Dot Scale**: 0.2s on hover
- **Opacity**: Smooth fade transitions

### Responsive Breakpoints
- **Mobile**: < 640px - Thumbnail strip visible
- **Tablet**: 640px - 1024px - Full carousel
- **Desktop**: > 1024px - Full carousel with hover effects

## Behavior

### Single Image
- No carousel controls shown
- Just displays the single image
- No dots or arrows

### Multiple Images
- Full carousel with all controls
- Dots for each image
- Arrow buttons on hover
- Keyboard navigation enabled

### Image Loading
- Uses Next.js Image component
- Optimized for performance
- Lazy loading support
- Responsive image sizes

## Accessibility Features

1. **Keyboard Support**
   - Arrow keys for navigation
   - Tab to focus buttons
   - Enter/Space to activate

2. **ARIA Labels**
   - All buttons have descriptive labels
   - Image counter announces position
   - Dots labeled with image numbers

3. **Visual Feedback**
   - Clear active state for dots
   - Hover effects on buttons
   - Focus rings on interactive elements

4. **Screen Readers**
   - Semantic HTML structure
   - Descriptive alt text
   - Proper heading hierarchy

## Performance Optimization

1. **Image Optimization**
   - Next.js Image component
   - Responsive image sizes
   - Lazy loading
   - WebP format support

2. **Animation Performance**
   - GPU-accelerated transforms
   - Optimized Framer Motion
   - Minimal re-renders

3. **Bundle Size**
   - Lightweight component
   - Minimal dependencies
   - Tree-shakeable

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## Future Enhancements

1. **Swipe Gestures**
   - Touch swipe to navigate
   - Pinch to zoom
   - Long press for details

2. **Lightbox Mode**
   - Click image to expand
   - Full-screen view
   - Zoom capabilities

3. **Image Filters**
   - Color adjustment
   - Brightness/contrast
   - Zoom preview

4. **Video Support**
   - Play product videos
   - Video thumbnails
   - Auto-play on hover

## Testing Checklist

- [x] Single image displays correctly
- [x] Multiple images carousel works
- [x] Arrow buttons navigate correctly
- [x] Dots navigate correctly
- [x] Keyboard navigation works
- [x] Thumbnail strip works on mobile
- [x] Animations are smooth
- [x] Responsive on all screen sizes
- [x] Accessibility features work
- [x] Image loading optimized

## Example Usage

```typescript
// Product with multiple images
const product = {
  id: "1",
  name: "Gold Foil Handprint Frame",
  images: [
    "https://cdn.example.com/image1.jpg",
    "https://cdn.example.com/image2.jpg",
    "https://cdn.example.com/image3.jpg",
    "https://cdn.example.com/image4.jpg",
  ],
  // ... other properties
};

// In ProductDetail component
<ImageCarousel 
  images={product.images} 
  productName={product.name} 
/>
```

## Styling Customization

To customize colors and styles, edit the Tailwind classes in `ImageCarousel.tsx`:

```typescript
// Active dot color
bg-ink  // Change to your color

// Inactive dot color
bg-stone-300  // Change to your color

// Arrow button background
bg-white/80  // Change opacity or color

// Counter background
bg-ink/70  // Change opacity or color
```

## Troubleshooting

### Images not loading
- Check image URLs are valid
- Verify Cloudinary configuration
- Check browser console for errors

### Carousel not appearing
- Ensure product has images array
- Check ImageCarousel component is imported
- Verify images array is not empty

### Animations stuttering
- Check browser performance
- Disable other animations
- Clear browser cache

### Dots not clickable
- Check z-index values
- Verify button event handlers
- Check for CSS conflicts

## Support

For issues or questions about the image carousel feature, please refer to:
- Component code: `components/shop/ImageCarousel.tsx`
- Usage: `components/shop/ProductDetail.tsx`
- Documentation: This file
