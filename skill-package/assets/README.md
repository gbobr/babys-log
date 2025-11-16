# Alexa Skill Icons

This directory contains tools to create placeholder icons for your Alexa skill.

## Requirements

- **Small Icon:** 108x108 pixels, PNG format
- **Large Icon:** 512x512 pixels, PNG format

## Option 1: HTML Generator (Easiest - No Installation)

1. Open `icon-generator.html` in your web browser
2. Use a screenshot tool to capture each icon:
   - **Small:** 108x108 pixels
   - **Large:** 512x512 pixels
3. Save as `icon-108.png` and `icon-512.png`

### How to Screenshot Precisely:

**Mac:**
- Press `Cmd + Shift + 4`
- Press `Space` to capture a specific element
- Click on the icon

**Windows:**
- Use Snipping Tool or Snip & Sketch
- Select "Window Snip" or "Rectangular Snip"
- Capture the icon area

**Chrome DevTools Method (Most Accurate):**
1. Right-click on an icon → "Inspect"
2. In DevTools, right-click on the highlighted `<div class="icon">` element
3. Select "Capture node screenshot"
4. Icon will be saved with exact dimensions

## Option 2: Canva (Professional Looking)

1. Go to [canva.com](https://www.canva.com)
2. Create custom size design:
   - First: 108 x 108 pixels
   - Second: 512 x 512 pixels
3. Design your icon:
   - Add a colored circle or square background
   - Add the 🍼 emoji or upload a baby bottle icon
   - Use gradient for modern look (purple/blue suggested)
4. Download as PNG
5. Repeat for both sizes

### Recommended Colors:
- **Purple gradient:** `#667eea` to `#764ba2` (modern tech)
- **Blue gradient:** `#4facfe` to `#00f2fe` (trust, calm)
- **Pink gradient:** `#f857a6` to `#ff5858` (baby-friendly)

## Option 3: Command Line (Requires ImageMagick)

If you have ImageMagick installed:

```bash
cd skill-package/assets
./generate-icons.sh
```

### Install ImageMagick:

**Mac:**
```bash
brew install imagemagick
```

**Ubuntu/Debian:**
```bash
sudo apt-get install imagemagick
```

**Fedora:**
```bash
sudo dnf install imagemagick
```

## Option 4: Free Design Tools

- **Photopea:** https://www.photopea.com (free Photoshop in browser)
- **GIMP:** https://www.gimp.org (free desktop app)
- **Figma:** https://www.figma.com (free for personal use)

## Design Tips

### Do:
✅ Use simple, recognizable symbols (🍼 bottle is perfect)
✅ Use high contrast for visibility on all backgrounds
✅ Keep design centered and balanced
✅ Use soft, baby-friendly colors
✅ Test on dark and light backgrounds

### Don't:
❌ Use text (too small at 108px)
❌ Use too many details (keeps it clean)
❌ Use low contrast colors
❌ Use copyrighted images without permission

## Current Icon Design

The HTML generator creates:
- **Background:** Purple gradient (`#667eea` → `#764ba2`)
- **Symbol:** 🍼 Baby bottle emoji
- **Style:** Modern, rounded corners, subtle glow effect

## Upload to Alexa Developer Console

Once you have your icons:

1. Go to Alexa Developer Console
2. Open your skill
3. Navigate to **Distribution** → **Skill Preview**
4. Upload:
   - `icon-108.png` as **Small Icon**
   - `icon-512.png` as **Large Icon**
5. Save and continue

## Files in This Directory

- `icon-generator.html` - Browser-based icon generator (recommended)
- `generate-icons.sh` - Command-line generator (requires ImageMagick)
- `README.md` - This file
- `icon-108.png` - Small icon (after generation)
- `icon-512.png` - Large icon (after generation)
