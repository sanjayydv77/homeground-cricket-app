#!/usr/bin/env node

/**
 * PWA Icon Generator for HomeGround
 * Generates proper PNG icons from SVG for PWA installation
 * 
 * Usage: node scripts/generate-pwa-icons.js
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Generating PWA Icons for HomeGround...\n');

// Read the existing SVG
const svgPath = path.join(__dirname, '../public/icons/icon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

console.log('✓ Found existing SVG icon');

// Instructions for manual conversion
console.log('\n📋 IMPORTANT: PNG Icon Generation Required\n');
console.log('The manifest.json currently uses SVG icons, which work on most browsers.');
console.log('However, for MAXIMUM COMPATIBILITY, especially on older Android devices,');
console.log('you should generate PNG icons.\n');

console.log('🔧 Option 1: Online Conversion (Easiest)');
console.log('   1. Go to https://svgtopng.com/');
console.log('   2. Upload: public/icons/icon.svg');
console.log('   3. Generate these sizes:');
console.log('      - 192x192 → Save as: public/icon-192x192.png');
console.log('      - 512x512 → Save as: public/icon-512x512.png\n');

console.log('🔧 Option 2: Using ImageMagick (CLI)');
console.log('   convert public/icons/icon.svg -resize 192x192 public/icon-192x192.png');
console.log('   convert public/icons/icon.svg -resize 512x512 public/icon-512x512.png\n');

console.log('🔧 Option 3: Using sharp (npm package)');
console.log('   npm install --save-dev sharp');
console.log('   Then use this script:\n');

const sharpScript = `
const sharp = require('sharp');
const fs = require('fs');

// Convert SVG to PNG
const svgBuffer = fs.readFileSync('public/icons/icon.svg');

// 192x192
sharp(svgBuffer)
  .resize(192, 192)
  .png()
  .toFile('public/icon-192x192.png')
  .then(() => console.log('✓ Generated icon-192x192.png'));

// 512x512
sharp(svgBuffer)
  .resize(512, 512)
  .png()
  .toFile('public/icon-512x512.png')
  .then(() => console.log('✓ Generated icon-512x512.png'));
`;

console.log(sharpScript);

console.log('\n📝 After generating PNG icons, update manifest.json:');
console.log('   Replace SVG entries with:');

const manifestUpdate = `
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
`;

console.log(manifestUpdate);

console.log('\n✅ Current SVG icons will work on modern browsers.');
console.log('✅ PNG icons recommended for older Android devices.\n');

// Check if PNG icons already exist
const png192 = path.join(__dirname, '../public/icon-192x192.png');
const png512 = path.join(__dirname, '../public/icon-512x512.png');

if (fs.existsSync(png192) && fs.existsSync(png512)) {
  console.log('✓ PNG icons already exist! No action needed.');
} else {
  console.log('⚠️  PNG icons not found. Follow instructions above to generate them.');
}
