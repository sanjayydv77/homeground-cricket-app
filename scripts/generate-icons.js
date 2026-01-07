// Simple PNG icon generator for PWA
// Creates base64-encoded PNG icons for 192x192 and 512x512 sizes
const fs = require('fs');
const path = require('path');

// Create a simple canvas-based icon (emerald cricket stumps theme)
// For production, you should use proper image conversion tools
// This creates minimal valid PNG files

// Minimal 192x192 emerald square PNG (base64)
const icon192 = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="42" fill="#10b981"/>
  <g transform="translate(39, 39) scale(0.6)">
    <rect x="120" y="50" width="40" height="300" rx="10" fill="#ffffff"/>
    <rect x="230" y="50" width="40" height="300" rx="10" fill="#ffffff"/>
    <rect x="340" y="50" width="40" height="300" rx="10" fill="#ffffff"/>
    <path d="M130 40 H230 M250 40 H360" stroke="#ffffff" stroke-width="15" stroke-linecap="round"/>
    <circle cx="250" cy="400" r="40" fill="#fee2e2" stroke="#ffffff" stroke-width="5"/>
  </g>
</svg>
`.trim());

// Minimal 512x512 emerald square PNG (base64)
const icon512 = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#10b981"/>
  <g transform="translate(106, 106) scale(0.6)">
    <rect x="120" y="50" width="40" height="300" rx="10" fill="#ffffff"/>
    <rect x="230" y="50" width="40" height="300" rx="10" fill="#ffffff"/>
    <rect x="340" y="50" width="40" height="300" rx="10" fill="#ffffff"/>
    <path d="M130 40 H230 M250 40 H360" stroke="#ffffff" stroke-width="15" stroke-linecap="round"/>
    <circle cx="250" cy="400" r="40" fill="#fee2e2" stroke="#ffffff" stroke-width="5"/>
  </g>
</svg>
`.trim());

const publicDir = path.join(process.cwd(), 'public');

// For now, just copy the SVG and rename
// In production, use sharp or canvas to convert properly
fs.writeFileSync(path.join(publicDir, 'icon-192x192.svg'), icon192);
fs.writeFileSync(path.join(publicDir, 'icon-512x512.svg'), icon512);

console.log('✓ Generated icon-192x192.svg');
console.log('✓ Generated icon-512x512.svg');
console.log('\nIMPORTANT: For production, convert these SVG files to PNG using:');
console.log('  - Online: https://svgtopng.com/');
console.log('  - CLI: npx svg2img icon-192x192.svg icon-192x192.png');
console.log('  - Or use any image editor (GIMP, Photoshop, etc.)');
