/**
 * Проверка sitemap: удалить URL дающие 404, добавить отсутствующие рабочие URL.
 * Запуск: node scripts/verify-and-update-sitemap.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'https://androidchity.ru';

function urlToLocalPath(loc) {
  let p = (loc || '').replace(/^\//, '').replace(/\/$/, '') || '';
  if (!p) return path.join(ROOT, 'index.html');
  if (p === 'download') return path.join(ROOT, 'download', 'index.html');
  if (p === 'register') return path.join(ROOT, 'register', 'index.html');
  if (/^page\/\d+$/.test(p)) return path.join(ROOT, p, 'index.html');
  if (p.startsWith('category/')) return path.join(ROOT, p, 'index.html');
  if (p.startsWith('search/')) return path.join(ROOT, p, 'index.html');
  if (p.startsWith('load/')) return path.join(ROOT, p, 'index.html');
  if (p.startsWith('author/')) return path.join(ROOT, p, 'index.html');
  if (/^\d{4}\/\d{2}\/\d{2}\//.test(p)) return path.join(ROOT, p, 'index.html');
  return path.join(ROOT, p, 'index.html');
}

function pathToUrl(relPath) {
  const normalized = relPath.replace(/\\/g, '/').replace(/\/index\.html$/, '');
  if (!normalized || normalized === '.') return '/';
  return '/' + normalized.replace(/^\.\//, '');
}

function extractUrlsFromSitemap(content) {
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    let loc = m[1].trim();
    if (loc.startsWith('http')) loc = new URL(loc).pathname;
    urls.push(loc.startsWith('/') ? loc : '/' + loc);
  }
  return urls;
}

function walkHtml(dir, baseDir, out) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'terminals', 'wp-content', 'assets', 'ops', 'scripts', 'tools'].includes(f)) {
        walkHtml(full, baseDir, out);
      }
    } else if (f === 'index.html') {
      const rel = path.relative(baseDir, full);
      const url = pathToUrl(rel);
      out.add(url);
    }
  }
}

// 1. Собрать все реальные URL из файловой системы
const realUrls = new Set();
walkHtml(ROOT, ROOT, realUrls);

// 2. Прочитать текущий sitemap.xml
const sitemapPath = path.join(ROOT, 'sitemap.xml');
let currentUrls = new Set();
if (fs.existsSync(sitemapPath)) {
  const content = fs.readFileSync(sitemapPath, 'utf8');
  currentUrls = new Set(extractUrlsFromSitemap(content));
}

// 3. Проверить каждый URL из sitemap — существует ли файл
const validFromSitemap = [];
const removed = [];
for (const loc of currentUrls) {
  const localPath = urlToLocalPath(loc);
  if (fs.existsSync(localPath)) {
    validFromSitemap.push(loc);
  } else {
    removed.push(loc);
  }
}

// 4. Добавить URL из файловой системы, которых нет в sitemap
const added = [];
for (const url of realUrls) {
  if (!currentUrls.has(url) && !currentUrls.has(url.replace(/\/$/, '')) && !currentUrls.has(url || '/')) {
    added.push(url || '/');
  }
}

// 5. Итоговый набор URL
const finalUrls = new Set(validFromSitemap);
added.forEach((u) => finalUrls.add(u));

// 6. Записать новый sitemap.xml
const sorted = Array.from(finalUrls).sort((a, b) => (a || '/').localeCompare(b || '/'));

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
for (const loc of sorted) {
  const fullUrl = loc ? (loc.startsWith('http') ? loc : BASE + (loc.startsWith('/') ? loc : '/' + loc)) : BASE + '/';
  xml += '  <url>\n';
  xml += `    <loc>${fullUrl}</loc>\n`;
  xml += '    <changefreq>monthly</changefreq>\n';
  xml += '    <priority>0.8</priority>\n';
  xml += '  </url>\n';
}
xml += '</urlset>\n';

fs.writeFileSync(sitemapPath, xml, 'utf8');

console.log('=== Sitemap verification ===');
console.log('Removed (404):', removed.length);
console.log('Added (missing):', added.length);
console.log('Final URLs:', sorted.length);
if (removed.length) console.log('Removed:', removed.slice(0, 10).join(', '), removed.length > 10 ? '...' : '');
if (added.length) console.log('Added:', added.slice(0, 10).join(', '), added.length > 10 ? '...' : '');
