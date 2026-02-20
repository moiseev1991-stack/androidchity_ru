/**
 * A) Заменяет абсолютные URL androidchity.ru на относительные.
 * Обрабатывает: .html, .css, .js, .xml и файлы в wp-content с вшитым HTML.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXCLUDE = ['node_modules', '.git', 'scripts', 'tools'];

// Замена: протокол+домен на путь. Захватываем путь после .ru
const DOMAIN_RE = /(?:https?:)?\/\/(?:www\.)?androidchity\.ru(\/[^"'\s<>]*|)/gi;

function shouldProcess(filePath) {
  if (EXCLUDE.some(e => filePath.includes(path.sep + e + path.sep))) return false;
  const ext = path.extname(filePath).toLowerCase();
  if (['.html', '.htm', '.css', '.js', '.xml'].includes(ext)) return true;
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (rel.startsWith('wp-content/') && (rel.endsWith('.png') || rel.endsWith('.jpg') || rel.endsWith('.webp'))) {
    try {
      const c = fs.readFileSync(filePath, 'utf8').slice(0, 500);
      if (c.includes('<!DOCTYPE') || c.includes('<html')) return true;
    } catch (_) {}
  }
  return false;
}

function replaceDomain(str) {
  let s = str.replace(DOMAIN_RE, (_, path) => path || '/');
  // убрать protocol-relative "//" в начале путей (ошибочно оставшиеся)
  s = s.replace(/(href|src|loc)="\/\/(?=[^\/])/g, '$1="/');
  s = s.replace(/(<loc>)\/\//g, '$1/');
  s = s.replace(/(<image:loc>)\/\//g, '$1/');
  return s;
}

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
  if (!shouldProcess(file)) return;
  let content;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch (_) { return; }
  const next = replaceDomain(content);
  if (next !== content) {
    fs.writeFileSync(file, next);
    total++;
    console.log(path.relative(ROOT, file).replace(/\\/g, '/'));
  }
});
console.log('Fixed', total, 'files.');
