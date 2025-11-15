# ImageLoader Component

A reusable image component with lazy loading, error handling, and fade-in animations for Planet Path.

## Features

- ✅ **Lazy Loading** - Automatically lazy loads images (except SVGs)
- ✅ **Error Handling** - Falls back to error image on load failure
- ✅ **Fade-in Animation** - Smooth opacity transition (500ms)
- ✅ **SVG Support** - Handles SVG images correctly
- ✅ **Type-safe** - Works with `imagePaths` utility

## Usage

### Basic Usage

```tsx
import ImageLoader from '@/components/ImageLoader';

<ImageLoader 
  src="/assets/hero/hero-landscape-1.png" 
  alt="Planet Path landscape" 
/>
```

### With Type-safe Paths

```tsx
import ImageLoader from '@/components/ImageLoader';
import { heroImages, courseIcons } from '@/utils/imagePaths';

// Hero image
<ImageLoader 
  src={heroImages.landscape1} 
  alt="Planet Path landscape" 
  className="w-full h-64 rounded-lg"
/>

// Course icon
<ImageLoader 
  src={courseIcons.climateBasics} 
  alt="Climate Basics Course" 
  className="w-16 h-16"
/>
```

### Custom Fallback

```tsx
<ImageLoader 
  src="/custom-image.png" 
  alt="Custom image"
  fallback="/assets/illustrations/error-404-earth.png"
/>
```

### Disable Lazy Loading

```tsx
// For above-the-fold images
<ImageLoader 
  src={navIcons.leaf} 
  alt="Logo"
  lazy={false}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | **required** | Image source path |
| `alt` | `string` | `''` | Alt text for accessibility |
| `className` | `string` | `''` | Additional CSS classes |
| `fallback` | `string` | `/assets/illustrations/error-offline-plant.png` | Fallback image on error |
| `lazy` | `boolean` | `true` | Enable lazy loading |

## Examples

### Course Card

```tsx
<ImageLoader
  src={courseIcons.climateBasics}
  alt={courseTitle}
  className="w-full h-48 object-cover"
/>
```

### Dashboard Badge

```tsx
<ImageLoader
  src={dashboardBadges.leaf}
  alt="Leaf Badge"
  className="w-16 h-16"
/>
```

### Hero Image

```tsx
<ImageLoader
  src={heroImages.landscape1}
  alt="Planet Path - Climate Action"
  className="w-full max-w-4xl mx-auto rounded-lg shadow-lg"
/>
```

## Notes

- SVG images automatically skip lazy loading
- Fade-in animation uses Tailwind's `transition-opacity duration-500`
- Error handling tries fallback image before showing placeholder
- All images are accessible with proper alt text

