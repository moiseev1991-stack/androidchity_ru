/**
 * Добавляет loading="lazy" и width/height (100) к img без них.
 * Для post-card thumbnails и аналогичных превью.
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
      else if (e.name.toLowerCase().endsWith('.html')) cb(full);
    }
  } catch (_) {}
}

let total = 0;
walk(ROOT, (file) => {
  let html = fs.readFileSync(file, 'utf8');
  let changed = false;
  // img: loading="lazy" где нет; width/height только для превью (100x100 в src, post-card, thumb)
  html = html.replace(/<img([^>]*?)(\s*\/?)>/gi, (m, attrs, closing) => {
    let a = attrs;
    if (!/loading\s*=/i.test(a)) {
      a += ' loading="lazy"';
      changed = true;
    }
    const isThumb = /-100x100\.|post-card|thumb|reboot_square|size-reboot_square/i.test(a);
    if (!/width\s*=/i.test(a) && isThumb) {
      a += ' width="100" height="100"';
      changed = true;
    }
    return '<img' + a + closing + '>';
  });
  if (changed) {
    fs.writeFileSync(file, html);
    total++;
  }
});
console.log('Optimized images in', total, 'files');
