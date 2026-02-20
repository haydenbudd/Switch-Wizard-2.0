#!/usr/bin/env bash
# Build the React app for WordPress and package it as a ready-to-install plugin.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "==> Building React app for WordPress..."
cd "$ROOT_DIR"
BUILD_TARGET=wordpress npx vite build

echo "==> Assembling plugin package..."
PLUGIN_DIR="$ROOT_DIR/dist-wordpress-plugin/linemaster-product-finder"
rm -rf "$PLUGIN_DIR"
mkdir -p "$PLUGIN_DIR"

# Copy plugin PHP + readme
cp "$ROOT_DIR/wordpress/linemaster-product-finder.php" "$PLUGIN_DIR/"
cp "$ROOT_DIR/wordpress/readme.txt" "$PLUGIN_DIR/"

# Copy built assets
cp -r "$ROOT_DIR/dist-wordpress/assets" "$PLUGIN_DIR/assets"

echo "==> Plugin package ready at: dist-wordpress-plugin/linemaster-product-finder/"
echo ""
echo "To install:"
echo "  1. Zip the folder:  cd dist-wordpress-plugin && zip -r linemaster-product-finder.zip linemaster-product-finder/"
echo "  2. Upload via WordPress admin > Plugins > Add New > Upload Plugin"
echo "  3. Activate and add [linemaster_product_finder] to any page."
