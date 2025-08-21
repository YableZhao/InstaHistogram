#!/bin/bash

# Chrome Web Store Package Creator for InstaHistogram
# This script creates a clean ZIP package ready for Chrome Web Store submission

set -e  # Exit on any error

echo "📦 Creating Chrome Web Store package..."

# Get version from manifest.json
VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": "\(.*\)".*/\1/')
PACKAGE_NAME="instahistogram-v${VERSION}"

echo "🔖 Version: ${VERSION}"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
PACKAGE_DIR="${TEMP_DIR}/${PACKAGE_NAME}"

echo "📁 Creating package structure..."

# Create package directory
mkdir -p "${PACKAGE_DIR}"

# Copy required files
echo "📄 Copying extension files..."
cp manifest.json "${PACKAGE_DIR}/"
cp content.js "${PACKAGE_DIR}/"
cp content.css "${PACKAGE_DIR}/"
cp popup.html "${PACKAGE_DIR}/"
cp popup.js "${PACKAGE_DIR}/"
cp background.js "${PACKAGE_DIR}/"

# Copy icons directory
echo "🎨 Copying icons..."
mkdir -p "${PACKAGE_DIR}/icons"
cp icons/*.png "${PACKAGE_DIR}/icons/"

# Remove any unwanted files from icons directory
find "${PACKAGE_DIR}/icons/" -name "*.svg" -delete 2>/dev/null || true
find "${PACKAGE_DIR}/icons/" -name ".DS_Store" -delete 2>/dev/null || true

echo "🔍 Debug: Icons directory contents:"
ls -la "${PACKAGE_DIR}/icons/"

echo "🔍 Validating package contents..."

# Validate required files exist
REQUIRED_FILES=(
    "manifest.json"
    "content.js"
    "content.css"
    "popup.html"
    "popup.js"
    "background.js"
    "icons/icon16.png"
    "icons/icon48.png"
    "icons/icon128.png"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "${PACKAGE_DIR}/${file}" ]; then
        echo "❌ Error: Required file missing: ${file}"
        exit 1
    fi
done

echo "✅ All required files present"

# Create ZIP package
echo "🗜️  Creating ZIP package..."
cd "${TEMP_DIR}"
zip -r "${PACKAGE_NAME}.zip" "${PACKAGE_NAME}/" -x "*.DS_Store" "*.git*" >/dev/null

# Move package to project directory
mv "${PACKAGE_NAME}.zip" "${OLDPWD}/"

# Cleanup
rm -rf "${TEMP_DIR}"

echo "🎉 Package created successfully!"
echo "📦 File: ${PACKAGE_NAME}.zip"
echo "📊 Size: $(du -h "${OLDPWD}/${PACKAGE_NAME}.zip" | cut -f1)"

# Show package contents
echo ""
echo "📋 Package contents:"
unzip -l "${OLDPWD}/${PACKAGE_NAME}.zip" | grep -v "Archive:"

echo ""
echo "🚀 Ready for Chrome Web Store submission!"
echo "📝 Next steps:"
echo "   1. Go to https://chrome.google.com/webstore/devconsole/"
echo "   2. Click 'Add new item'"
echo "   3. Upload ${PACKAGE_NAME}.zip"
echo "   4. Follow the submission guide in CHROME_STORE_SUBMISSION.md"

echo ""
echo "✨ Good luck with your Chrome Web Store submission!"
