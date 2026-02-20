/**
 * Заменяет http:// на https:// для внешних ссылок (mixed content).
 * uCoz, и т.д.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXCLUDE = ['node_modules', '.git', 'scripts', 'tools'];

let total = 0;
function walk(dir, cb) {
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of items) {
      const full = path.join(dir, e.name);
      if (EXCLUDE.some(x => full.includes(path.sep + x + path.sep))) continue;
      if (e.isDirectory()) walk(full, cb);
      else if (e.name.toLowerCase().endsWith('.html')) cb(full);
    }
  } catch (_) {}
}

walk(ROOT, (file) => {
  let html = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (html.includes('href="http://www.ucoz.ru/')) {
    html = html.replace(/href="http:\/\/www\.ucoz\.ru\//g, 'href="https://www.ucoz.ru/');
    changed = true;
  }
  if (html.includes('href="http://ucoz.ru/')) {
    html = html.replace(/href="http:\/\/ucoz\.ru\//g, 'href="https://ucoz.ru/');
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(file, html);
    total++;
  }
});
console.log('Fixed mixed content in', total, 'files');
