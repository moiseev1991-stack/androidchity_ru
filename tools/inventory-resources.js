/**
 * Инвентаризация ресурсов из HTML/CSS/JS.
 * Собирает: /wp-content/..., абсолютные http(s)://..., внешние домены.
 * Выход: resources-inventory.json
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXCLUDE = ['node_modules', '.git', 'scripts', 'tools'];

const wpContentRe = /\/wp-content\/([^\s"'<>)\]]+)/g;
const absHttpRe = /(?:src|href|content|url\s*\(\s*["']?)(https?:\/\/[^\s"'<>)\]]+)/gi;
const absHttpResRe = /(?:src|href)=["'](https?:\/\/[^"']+)["']/gi;

const wpPaths = new Set();
const absUrls = new Set();
const httpMixed = new Set();
const filesWithIssues = [];

function walk(dir, cb) {
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of items) {
      const full = path.join(dir, e.name);
      if (EXCLUDE.some(x => full.includes(path.sep + x + path.sep))) continue;
      if (e.isDirectory()) walk(full, cb);
      else cb(full, e);
    }
  } catch (_) {}
}

function extractPath(p) {
  const m = p.match(/^[^?#]+/);
  return m ? m[0] : p;
}

walk(ROOT, (file) => {
  const ext = path.extname(file).toLowerCase();
  if (!['.html', '.css', '.js'].includes(ext)) return;
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');

  const wp = [...content.matchAll(wpContentRe)].map(m => '/' + m[0].replace(/^\/+/, ''));
  wp.forEach(p => wpPaths.add(extractPath(p)));

  const http = [...content.matchAll(absHttpRe)].map(m => m[1]);
  http.forEach(u => {
    const url = extractPath(u);
    absUrls.add(url);
    if (url.startsWith('http://') && !url.includes('schema.org') && !url.includes('purl.org') && !url.includes('w3.org')) {
      httpMixed.add(url);
      filesWithIssues.push({ file: rel, url });
    }
  });
});

const wpList = [...wpPaths].sort();
const missing = [];
const wpBase = path.join(ROOT, 'wp-content');
for (const p of wpList) {
  const local = path.join(ROOT, p.replace(/^\//, '').replace(/\//g, path.sep));
  if (!fs.existsSync(local)) missing.push(p);
}

const out = {
  wpContent: { total: wpList.length, paths: wpList.slice(0, 500), missingCount: missing.length, missing: missing.slice(0, 100) },
  absoluteUrls: { total: absUrls.size, sample: [...absUrls].slice(0, 50) },
  httpMixedContent: { total: httpMixed.size, urls: [...httpMixed], files: filesWithIssues },
  summary: {
    wpTotal: wpList.length,
    wpMissing: missing.length,
    absUrlsTotal: absUrls.size,
    httpMixedTotal: httpMixed.size
  }
};

const outPath = path.join(ROOT, 'tools', 'resources-inventory.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
console.log('Inventory saved to', outPath);
console.log('wp-content refs:', wpList.length, '| missing:', missing.length);
console.log('absolute URLs:', absUrls.size);
console.log('http (mixed content):', httpMixed.size);
if (missing.length) console.log('Sample missing:', missing.slice(0, 10));
