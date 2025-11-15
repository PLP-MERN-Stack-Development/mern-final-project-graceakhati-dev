# Planet Path Hero Images

## Required Images

Place the following PNG images in this directory:

1. **hero-landscape-1.png** - Trees + hills + sunrise
2. **hero-landscape-2.png** - Mountains + forest  
3. **hero-earth-soft.png** - Cute, smiling illustrated Earth
4. **hero-youth-planting.png** - Illustrated youth planting trees
5. **hero-youth-learning.png** - Students learning outdoors

## Image Generation Tools

You can use these tools to generate the images:

- **AI Image Generators**: 
  - DALL-E 3 (via ChatGPT Plus)
  - Midjourney
  - Stable Diffusion
  - Canva AI Image Generator
  
- **Design Tools**:
  - Figma (with illustration plugins)
  - Adobe Illustrator
  - Procreate (for iPad)
  - Affinity Designer

## Prompt Suggestions

### For hero-landscape-1.png:
```
Soft illustrated landscape with rolling green hills, stylized trees, warm sunrise in soft pastel colors (greens #A5D6A7, yellows #FFF9C4), friendly playful style, mobile-friendly composition, 16:9 ratio
```
picture (1).png
### For hero-landscape-2.png:
```
Soft illustrated mountains and forest scene, pastel colors (blues #B39DDB, greens #A5D6A7), friendly playful style, mobile-friendly, 16:9 ratio
```

### For hero-earth-soft.png:
```
Cute smiling illustrated Earth planet, large friendly eyes, soft smile, pastel green and blue colors, warm inviting expression, playful style, square format
```

### For hero-youth-planting.png:
```
Illustrated diverse youth character planting a tree sapling, soft rounded character design, green environment, happy expression, friendly playful style, 3:2 ratio, mobile-friendly
```

### For hero-youth-learning.png:
```
Group of illustrated students learning outdoors, sitting on grass, books visible, trees in background, friendly engaged expressions, soft pastel colors, playful style, 3:2 ratio
```

## Usage in Code

**Note:** Hero images should be placed in `/client/public/assets/hero/` (not `/client/src/assets/images/`)

```tsx
// Example usage in Landing page (public folder assets)
<img src="/assets/hero/hero-landscape-1.png" alt="Planet Path landscape" />
<img src="/assets/hero/hero-earth-soft.png" alt="Planet Path Earth mascot" />

// Or using Vite's public asset reference
<img src="/assets/hero/hero-landscape-1.png" alt="Planet Path landscape" />
```

