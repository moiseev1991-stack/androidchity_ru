/**
 * Восстанавливает критичные CSS/JS в head, если они отсутствуют (после strip-heavy-scripts).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXCLUDE = ['node_modules', '.git', 'scripts'];
const CRITICAL = '<link rel="stylesheet" href="/wp-content/cache/minify/e3f8b.css" media="all">\n  <script src="/wp-content/cache/minify/d52ed.js" defer></script>';

function walk(dir, cb) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of items) {
    const full = path.join(dir, e.name);
    if (EXCLUDE.some(x => full.includes(path.sep + x + path.sep))) continue;
    if (e.isDirectory()) walk(full, cb);
    else if (e.name.toLowerCase().endsWith('.html')) cb(full);
  }
}

let total = 0;
walk(ROOT, (file) => {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('e3f8b.css') && html.includes('<head')) {
    html = html.replace(/<head([^>]*)>/i, `<head$1>\n  ${CRITICAL}\n  `);
    fs.writeFileSync(file, html);
    total++;
  }
});
console.log('Restored critical assets in', total, 'files.');
