/**
 * Исправляет ошибочные "//path" на "/path" в XML и HTML (от прошлого replace).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXCLUDE = ['node_modules', '.git', 'scripts', 'tools'];

function walk(dir, cb) {
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of items) {
      const full = path.join(dir, e.name);
      if (EXCLUDE.some(x => full.includes(path.sep + x + path.sep))) continue;
      if (e.isDirectory()) walk(full, cb);
      else cb(full);
    }
  } catch (_) {}
}

let total = 0;
walk(ROOT, (file) => {
  const ext = path.extname(file).toLowerCase();
  if (!['.html', '.xml'].includes(ext)) return;
  let s = fs.readFileSync(file, 'utf8');
  const orig = s;
  s = s.replace(/(<loc>)\/\//g, '$1/');
  s = s.replace(/(<image:loc>)\/\//g, '$1/');
  s = s.replace(/(href|src)="\/\/(?=[^\/"])/g, '$1="/');
  if (s !== orig) {
    fs.writeFileSync(file, s);
    total++;
  }
});
console.log('Fixed double-slash in', total, 'files.');
