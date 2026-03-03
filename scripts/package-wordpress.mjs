#!/usr/bin/env node
/**
 * Assembles the WordPress plugin directory from the Vite build output.
 *
 * Run via: npm run build:wordpress
 *
 * Result:
 *   dist-wordpress/
 *     linemaster-product-finder/
 *       linemaster-product-finder.php
 *       readme.txt
 *       assets/
 *         app.js, app.css, vendor-*.js
 */

import { cpSync, mkdirSync, readdirSync, renameSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist-wordpress');
const pluginDir = join(dist, 'linemaster-product-finder');
const pluginAssets = join(pluginDir, 'assets');

// Create the plugin directory
mkdirSync(pluginAssets, { recursive: true });

// Copy WordPress source files into the plugin
cpSync(join(root, 'wordpress', 'linemaster-product-finder.php'), join(pluginDir, 'linemaster-product-finder.php'));
cpSync(join(root, 'wordpress', 'readme.txt'), join(pluginDir, 'readme.txt'));

// Move built assets into the plugin's assets/ folder
const builtAssets = join(dist, 'assets');
if (existsSync(builtAssets)) {
  for (const file of readdirSync(builtAssets)) {
    renameSync(join(builtAssets, file), join(pluginAssets, file));
  }
}

console.log('');
console.log('WordPress plugin assembled at:');
console.log('  dist-wordpress/linemaster-product-finder/');
console.log('');
console.log('To install:');
console.log('  1. Zip the folder:  cd dist-wordpress && zip -r linemaster-product-finder.zip linemaster-product-finder/');
console.log('  2. Upload via WordPress Admin → Plugins → Add New → Upload Plugin');
console.log('  3. Activate, then add [switch-wizard] to any page.');
console.log('');
