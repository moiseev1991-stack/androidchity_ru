/**
 * Генерирует sitemap.xml из URL_REPORT.json + дополнительные страницы.
 * BASE_URL: process.env.BASE_URL || 'https://androidchity.ru'
 * Запуск: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(ROOT, 'URL_REPORT.json');
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');
const BASE_URL = (process.env.BASE_URL || 'https://androidchity.ru').replace(/\/+$/, '');

const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
const urlSet = new Set(report.restoredList || []);

// Дополнительные страницы, которые есть на сайте, но могли отсутствовать в исходных sitemap
const extra = [];
if (fs.existsSync(path.join(ROOT, 'register', 'index.html'))) {
  extra.push(`${BASE_URL}/register/`);
}
const pageDir = path.join(ROOT, 'page');
if (fs.existsSync(pageDir)) {
  const dirs = fs.readdirSync(pageDir).filter((n) => /^\d+$/.test(n));
  for (const n of dirs) {
    if (fs.existsSync(path.join(pageDir, n, 'index.html'))) extra.push(`${BASE_URL}/page/${n}/`);
  }
}
extra.forEach((u) => urlSet.add(u));

const urls = Array.from(urlSet).sort();

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

for (const url of urls) {
  const loc = url.replace(/\/$/, '') || url;
  xml += '  <url>\n';
  xml += `    <loc>${loc}</loc>\n`;
  xml += '    <changefreq>monthly</changefreq>\n';
  xml += '    <priority>0.8</priority>\n';
  xml += '  </url>\n';
}

xml += '</urlset>\n';

fs.writeFileSync(SITEMAP_PATH, xml, 'utf8');
console.log(`Sitemap создан: ${SITEMAP_PATH}`);
console.log(`URL в sitemap: ${urls.length}`);
