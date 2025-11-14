# Export HTML Wireframes to PNG

This guide shows you how to convert your HTML wireframes into PNG images using browser developer tools.

## Prerequisites

- A modern browser (Chrome, Firefox, Edge, or Safari)
- HTML wireframe files in the `docs/wireframes/` directory

## Step-by-Step Instructions

### Step 1: Open the HTML File

1. Navigate to the `docs/wireframes/` folder
2. Double-click any HTML file (e.g., `landing.html`) to open it in your default browser
3. The wireframe should display in the browser window

### Step 2: Open Developer Tools

**Chrome/Edge:**
- Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
- Press `Cmd+Option+I` (Mac)

**Firefox:**
- Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
- Press `Cmd+Option+I` (Mac)

**Safari:**
- Press `Cmd+Option+I` (Mac)
- Note: You may need to enable Developer menu in Safari Preferences first

### Step 3: Enable Responsive Design Mode

**Chrome/Edge:**
- Click the device toolbar icon (📱) in the top toolbar, or
- Press `Ctrl+Shift+M` (Windows/Linux) or `Cmd+Shift+M` (Mac)

**Firefox:**
- Click the responsive design mode icon (📱) in the toolbar, or
- Press `Ctrl+Shift+M` (Windows/Linux) or `Cmd+Shift+M` (Mac)

**Safari:**
- Click "Enter Responsive Design Mode" from the Develop menu

### Step 4: Set Viewport Size

1. In responsive mode, you'll see device presets at the top
2. Choose a device size:
   - **Mobile**: 375px × 667px (iPhone SE)
   - **Tablet**: 768px × 1024px (iPad)
   - **Desktop**: 1920px × 1080px
3. Or enter custom dimensions in the width/height fields

### Step 5: Capture Screenshot

**Chrome/Edge:**
1. With DevTools open, press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "screenshot" in the command palette
3. Select one of these options:
   - **"Capture screenshot"** - Full page screenshot
   - **"Capture node screenshot"** - Screenshot of selected element
   - **"Capture area screenshot"** - Select area to capture

**Firefox:**
1. Right-click on the page (not in DevTools)
2. Select "Take a Screenshot"
3. Choose:
   - **"Visible portion"** - Current viewport
   - **"Full page"** - Entire page

**Safari:**
1. Use macOS built-in screenshot: `Cmd+Shift+4`
2. Or use third-party tools like Snagit or CleanShot X

### Step 6: Save the PNG

1. The screenshot will download automatically or appear in your Downloads folder
2. Rename the file to match your wireframe (e.g., `landing-mobile.png`)
3. Move it to a `docs/wireframes/exports/` folder if desired

## Tips

- **Mobile-first**: Start with mobile viewport (375px) for Planet Path's mobile-first design
- **Multiple sizes**: Export each wireframe at mobile, tablet, and desktop sizes
- **Naming convention**: Use format `[filename]-[size].png` (e.g., `dashboard-mobile.png`)
- **Clean view**: Hide DevTools panels before capturing for cleaner screenshots
- **Zoom**: Adjust browser zoom to 100% for accurate dimensions

## Quick Reference

| Action | Chrome/Edge | Firefox | Safari |
|--------|-------------|---------|--------|
| Open DevTools | `F12` or `Ctrl+Shift+I` | `F12` or `Ctrl+Shift+I` | `Cmd+Option+I` |
| Responsive Mode | `Ctrl+Shift+M` | `Ctrl+Shift+M` | Develop menu |
| Screenshot | `Ctrl+Shift+P` → "screenshot" | Right-click → Screenshot | `Cmd+Shift+4` |

## Example Workflow

1. Open `landing.html` in Chrome
2. Press `F12` to open DevTools
3. Press `Ctrl+Shift+M` for responsive mode
4. Select "iPhone SE" (375px width)
5. Press `Ctrl+Shift+P`, type "screenshot", select "Capture screenshot"
6. File downloads as `landing.png`
7. Rename to `landing-mobile.png`
8. Repeat for tablet and desktop sizes

---

**Note**: For best results, ensure the wireframe displays correctly before capturing. Check that all elements are visible and properly aligned.

