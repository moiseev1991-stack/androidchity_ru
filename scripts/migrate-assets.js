/**
 * Migrate WP minify assets to local assets folder
 * Replace all wp-content/cache/minify references in HTML files
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const replacements = [
  // CSS: replace e3f8b.css with assets/css/main.min.css
  [/\/wp-content\/cache\/minify\/e3f8b\.css/g, '/assets/css/main.min.css'],
  
  // JS: replace 3c49a.js with assets/js/main.min.js + defer
  [/<script[^>]*src=["']\/wp-content\/cache\/minify\/3c49a\.js["'][^>]*><\/script>/gi, 
   '<script src="/assets/js/main.min.js" defer></script>'],
  
  // Remove stub JS files (986c3.js, e311b.js, d52ed.js)
  [/<script[^>]*src=["']\/wp-content\/cache\/minify\/986c3\.js["'][^>]*><\/script>/gi, ''],
  [/<script[^>]*src=["']\/wp-content\/cache\/minify\/e311b\.js["'][^>]*><\/script>/gi, ''],
  [/<script[^>]*src=["']\/wp-content\/cache\/minify\/d52ed\.js["'][^>]*><\/script>/gi, ''],
  
  // Generic fallback: any remaining minify CSS → main.min.css
  [/\/wp-content\/cache\/minify\/[a-z0-9]+\.css/gi, '/assets/css/main.min.css'],
  
  // Generic fallback: any remaining minify JS → main.min.js
  [/\/wp-content\/cache\/minify\/[a-z0-9]+\.js/gi, '/assets/js/main.min.js'],
];

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'assets', 'terminals'].includes(file)) {
        walkDir(filepath, callback);
      }
    } else if (file.endsWith('.html')) {
      callback(filepath);
    }
  }
}

let processed = 0;
let modified = 0;

walkDir(ROOT, (filepath) => {
  processed++;
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;
  
  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }
  
  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    modified++;
    console.log('Modified:', path.relative(ROOT, filepath));
  }
});

console.log(`\nProcessed: ${processed} files`);
console.log(`Modified: ${modified} files`);
