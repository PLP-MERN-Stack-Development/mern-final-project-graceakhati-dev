# Favicon Setup

## Current Status ✅

- **favicon.svg** - Created and configured
  - Location: `client/public/favicon.svg`
  - Modern browsers will use this SVG favicon
  - Based on the Planet Path leaf icon

## HTML Configuration ✅

The `index.html` file has been updated with:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
```

## Adding favicon.ico (Optional)

If you need a `.ico` file for older browser compatibility:

### Option 1: Convert SVG to ICO
1. Use an online converter like:
   - https://convertio.co/svg-ico/
   - https://cloudconvert.com/svg-to-ico
   - https://realfavicongenerator.net/

2. Upload `favicon.svg` and download `favicon.ico`

3. Place the downloaded `favicon.ico` in `client/public/`

### Option 2: Use ImageMagick (Command Line)
```bash
# Install ImageMagick first, then:
magick convert favicon.svg -resize 32x32 favicon.ico
```

### Option 3: Use Node.js Package
```bash
npm install -g svg2ico
svg2ico favicon.svg favicon.ico
```

## Browser Support

- **Modern browsers**: Will use `favicon.svg` (SVG support)
- **Older browsers**: Will fall back to `favicon.ico` if present
- **Current setup**: Works with SVG only (covers 95%+ of browsers)

## Testing

1. Start your dev server: `npm run dev`
2. Open `http://localhost:3001`
3. Check the browser tab - you should see the leaf icon
4. Check browser DevTools → Network tab to verify favicon loads

## Notes

- Vite automatically serves files from the `public` folder
- The favicon will be available at `/favicon.svg` and `/favicon.ico`
- No build configuration changes needed

