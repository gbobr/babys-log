#!/bin/bash

# Generate placeholder icons for Alexa Skill
# Requires ImageMagick: brew install imagemagick (Mac) or apt-get install imagemagick (Linux)

cd "$(dirname "$0")"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed."
    echo "Install it with:"
    echo "  Mac: brew install imagemagick"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  Or use the HTML file (icon-generator.html) in your browser"
    exit 1
fi

echo "🎨 Generating Alexa Skill icons..."

# Small icon (108x108)
convert -size 108x108 \
    gradient:'#667eea-#764ba2' \
    -gravity center \
    \( -background none -fill white -font Arial-Bold -pointsize 54 label:'🍼' \) \
    -composite \
    icon-108.png

echo "✅ Created icon-108.png (108x108)"

# Large icon (512x512)
convert -size 512x512 \
    gradient:'#667eea-#764ba2' \
    -gravity center \
    \( -background none -fill white -font Arial-Bold -pointsize 256 label:'🍼' \) \
    -composite \
    icon-512.png

echo "✅ Created icon-512.png (512x512)"
echo ""
echo "📁 Icons saved in: $(pwd)"
echo ""
echo "Upload these to Alexa Developer Console:"
echo "  • icon-108.png (Small Icon)"
echo "  • icon-512.png (Large Icon)"
