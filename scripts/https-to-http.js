/**
 * Заменяет https:// на http:// во внешних ссылках (по требованию: все пути HTTP).
 * Внимание: при открытии сайта по https:// будет mixed content.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXCLUDE = ['node_modules', '.git', 'scripts', 'tools'];

let total = 0;
function walk(dir, cb) {
  try {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (EXCLUDE.some(x => full.includes(path.sep + x + path.sep))) continue;
      if (e.isDirectory()) walk(full, cb);
      else if (/\.(html|xml)$/i.test(e.name)) cb(full);
    }
  } catch (_) {}
}

walk(ROOT, (file) => {
  let s = fs.readFileSync(file, 'utf8');
  const next = s.replace(/https:\/\//g, 'http://');
  if (next !== s) {
    fs.writeFileSync(file, next);
    total++;
  }
});
console.log('Replaced https with http in', total, 'files.');
