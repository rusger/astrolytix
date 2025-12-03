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
sudo cp "$SOURCE_DIR/stellar-vault-9k7m2x.html" "$DEST_DIR/"

# Set correct permissions (readable by web server)
sudo chmod 644 "$DEST_DIR/index.html"
sudo chmod 644 "$DEST_DIR/styles.css"
sudo chmod 644 "$DEST_DIR/app.js"
sudo chmod 644 "$DEST_DIR/robots.txt"
sudo chmod 644 "$DEST_DIR/stellar-vault-9k7m2x.html"

echo "✅ Deployed files:"
ls -la "$DEST_DIR"/*.html "$DEST_DIR"/*.css "$DEST_DIR"/*.js "$DEST_DIR"/robots.txt 2>/dev/null

echo ""
echo "🌐 Website updated at https://astrolytix.com"
