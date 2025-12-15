#!/bin/bash
# Deploy Astrolytix website files to /var/www/html/
# Usage: ./deploy.sh

set -e

SOURCE_DIR="/home/ruslan/astrolytix"
DEST_DIR="/var/www/html"

echo "🚀 Deploying Astrolytix website..."

# Copy all website files
sudo cp "$SOURCE_DIR/index.html" "$DEST_DIR/"
sudo cp "$SOURCE_DIR/styles.css" "$DEST_DIR/"
sudo cp "$SOURCE_DIR/app.js" "$DEST_DIR/"
sudo cp "$SOURCE_DIR/robots.txt" "$DEST_DIR/"
sudo cp "$SOURCE_DIR/privacy.html" "$DEST_DIR/"
sudo cp "$SOURCE_DIR/terms.html" "$DEST_DIR/"
sudo cp "$SOURCE_DIR/stellar-vault-9k7m2x.html" "$DEST_DIR/"
sudo cp "$SOURCE_DIR/logo.svg" "$DEST_DIR/"
sudo cp "$SOURCE_DIR/logo-star.svg" "$DEST_DIR/"
sudo cp "$SOURCE_DIR/logo-star-tm.svg" "$DEST_DIR/"
sudo cp "$SOURCE_DIR/i18n.js" "$DEST_DIR/"
sudo cp "$SOURCE_DIR/space_far.png" "$DEST_DIR/"
sudo cp "$SOURCE_DIR/space_near.png" "$DEST_DIR/"

# Copy locales folder for i18n translations
sudo mkdir -p "$DEST_DIR/locales"
sudo cp -r "$SOURCE_DIR/locales/"* "$DEST_DIR/locales/"

# Copy pics4site folder with app screenshots (only optimized .jpg files)
sudo mkdir -p "$DEST_DIR/pics4site"
sudo cp "$SOURCE_DIR/pics4site/"*.jpg "$DEST_DIR/pics4site/"

# Set correct permissions (readable by web server)
sudo chmod 644 "$DEST_DIR/index.html"
sudo chmod 644 "$DEST_DIR/styles.css"
sudo chmod 644 "$DEST_DIR/app.js"
sudo chmod 644 "$DEST_DIR/robots.txt"
sudo chmod 644 "$DEST_DIR/privacy.html"
sudo chmod 644 "$DEST_DIR/terms.html"
sudo chmod 644 "$DEST_DIR/stellar-vault-9k7m2x.html"
sudo chmod 644 "$DEST_DIR/logo.svg"
sudo chmod 644 "$DEST_DIR/logo-star.svg"
sudo chmod 644 "$DEST_DIR/logo-star-tm.svg"
sudo chmod 644 "$DEST_DIR/i18n.js"
sudo chmod 644 "$DEST_DIR/space_far.png"
sudo chmod 644 "$DEST_DIR/space_near.png"
sudo chmod 755 "$DEST_DIR/locales"
sudo chmod 644 "$DEST_DIR/locales/"*
sudo chmod 755 "$DEST_DIR/pics4site"
sudo chmod 644 "$DEST_DIR/pics4site/"*

echo "✅ Deployed files:"
ls -la "$DEST_DIR"/*.html "$DEST_DIR"/*.css "$DEST_DIR"/*.js "$DEST_DIR"/robots.txt 2>/dev/null
echo ""
echo "🌍 Deployed locales:"
ls -la "$DEST_DIR/locales/" 2>/dev/null
echo ""
echo "📷 Deployed images:"
ls -la "$DEST_DIR/pics4site/" 2>/dev/null | head -5
echo "... and $(ls "$DEST_DIR/pics4site/" | wc -l) total images"

echo ""
echo "🌐 Website updated at https://astrolytix.com"
