/**
 * Подменяет пути картинок/ресурсов для сервера.
 * Запуск: BASE_URL=https://androidchity.ru node scripts/fix-image-paths.js
 * или: BASE_URL=/subfolder node scripts/fix-image-paths.js
 *
 * Заменяет src="/wp-content/ → src="BASE_URL/wp-content/
 * и href="/wp-content/ → href="BASE_URL/wp-content/
 */
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || '';
if (!BASE) {
  console.log('Usage: BASE_URL=https://your-domain.com node scripts/fix-image-paths.js');
  console.log('  or: BASE_URL=  (empty = revert to relative /wp-content/)');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const EXCLUDE = ['node_modules', '.git', 'scripts'];

const prefix = BASE.replace(/\/$/, '');
const fromSrc = /src="\/wp-content\//g;
const fromHref = /href="\/wp-content\//g;
const toSrc = `src="${prefix}/wp-content/`;
const toHref = `href="${prefix}/wp-content/`;

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
  if (html.includes('"/wp-content/')) {
    html = html.replace(fromSrc, toSrc).replace(fromHref, toHref);
    fs.writeFileSync(file, html);
    total++;
  }
});
console.log('Fixed paths in', total, 'files. Base:', prefix || '(none)');
