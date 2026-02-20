/**
 * A) Убирает ссылки на wp-content/plugins/wordpress-seo (Yoast) из sitemaps.
 * Файл main-sitemap.xsl отсутствует — убираем xml-stylesheet.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const sitemaps = ['sitemap_index.xml', 'post-sitemap.xml', 'post-sitemap2.xml', 'page-sitemap.xml', 'category-sitemap.xml', 'author-sitemap.xml'];

let total = 0;
for (const name of sitemaps) {
  const p = path.join(ROOT, name);
  if (!fs.existsSync(p)) continue;
  let s = fs.readFileSync(p, 'utf8');
  const re = /<\?xml-stylesheet[^?]*\?>\s*/;
  const before = s;
  s = s.replace(re, '');
  if (s !== before) {
    fs.writeFileSync(p, s);
    total++;
    console.log(name);
  }
}
console.log('Removed plugin refs from', total, 'sitemaps.');
