/**
 * Check if all referenced images in HTML files exist
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Extract unique image paths from HTML
function extractImagePaths(html) {
  const paths = new Set();
  // Match src="/wp-content/uploads/..."
  const srcRegex = /src=["']([^"']*\/wp-content\/uploads\/[^"']+)["']/gi;
  let match;
  while ((match = srcRegex.exec(html)) !== null) {
    paths.add(match[1]);
  }
  // Match srcset paths
  const srcsetRegex = /srcset=["']([^"']+)["']/gi;
  while ((match = srcsetRegex.exec(html)) !== null) {
    const srcset = match[1];
    const urls = srcset.split(',').map(s => s.trim().split(' ')[0]);
    urls.forEach(url => {
      if (url.includes('/wp-content/uploads/')) {
        paths.add(url);
      }
    });
  }
  return paths;
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'terminals'].includes(file)) {
        walkDir(filepath, callback);
      }
    } else if (file.endsWith('.html')) {
      callback(filepath);
    }
  }
}

const allPaths = new Set();
let htmlCount = 0;

walkDir(ROOT, (filepath) => {
  htmlCount++;
  const content = fs.readFileSync(filepath, 'utf8');
  const paths = extractImagePaths(content);
  paths.forEach(p => allPaths.add(p));
});

console.log(`Scanned ${htmlCount} HTML files`);
console.log(`Found ${allPaths.size} unique image paths\n`);

let missing = 0;
let found = 0;

for (const imgPath of allPaths) {
  // Convert URL path to filesystem path
  const fsPath = path.join(ROOT, imgPath.replace(/^\//, ''));
  if (fs.existsSync(fsPath)) {
    found++;
  } else {
    missing++;
    console.log('MISSING:', imgPath);
  }
}

console.log(`\n=== Summary ===`);
console.log(`Found: ${found}`);
console.log(`Missing: ${missing}`);
