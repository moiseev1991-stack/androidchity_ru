/**
 * Собирает все URL из sitemap-файлов и проверяет наличие соответствующих файлов.
 * Выводит отчёт: восстановлено / не восстановлено.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function extractUrlsFromSitemap(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const urls = [];
  const re = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    urls.push(m[1].trim());
  }
  return urls;
}

function urlToLocalPath(url) {
  try {
    const u = new URL(url);
    if (u.hostname !== 'androidchity.ru') return null;
    let p = u.pathname.replace(/\/$/, '') || '/';
    if (p === '/') return path.join(ROOT, 'index.html');
    p = p.replace(/^\//, '');
    if (p === 'download') return path.join(ROOT, 'download', 'index.html');
    if (p === 'register') return path.join(ROOT, 'register', 'index.html');
    if (p.startsWith('category/')) return path.join(ROOT, p, 'index.html');
    if (p.startsWith('page/')) return path.join(ROOT, p, 'index.html');
    if (p.startsWith('search/')) return path.join(ROOT, p, 'index.html');
    if (p.startsWith('load/')) return path.join(ROOT, p, 'index.html');
    if (p.startsWith('author/')) return path.join(ROOT, p, 'index.html');
    if (/^\d{4}\/\d{2}\/\d{2}\//.test(p)) return path.join(ROOT, p, 'index.html');
    return path.join(ROOT, p, 'index.html');
  } catch (e) {
    return null;
  }
}

const sitemapFiles = [
  'post-sitemap.xml',
  'post-sitemap2.xml',
  'page-sitemap.xml',
  'category-sitemap.xml',
  'author-sitemap.xml',
];

const allUrls = new Set();
for (const name of sitemapFiles) {
  const fp = path.join(ROOT, name);
  if (fs.existsSync(fp)) {
    const urls = extractUrlsFromSitemap(fp);
    urls.forEach((u) => allUrls.add(u));
  }
}

const restored = [];
const notRestored = [];

for (const url of allUrls) {
  const localPath = urlToLocalPath(url);
  if (!localPath) {
    notRestored.push({ url, reason: 'unknown_path' });
    continue;
  }
  if (fs.existsSync(localPath)) {
    restored.push(url);
  } else {
    notRestored.push({ url, reason: 'file_missing', path: localPath });
  }
}

const report = {
  total: allUrls.size,
  restored: restored.length,
  notRestored: notRestored.length,
  restoredList: restored.sort(),
  notRestoredList: notRestored,
};

const reportPath = path.join(ROOT, 'URL_REPORT.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

const md = [];
md.push('# Отчёт по восстановлению URL (androidchity.ru)');
md.push('');
md.push(`- **Всего URL в sitemap:** ${report.total}`);
md.push(`- **Восстановлено (файл есть):** ${report.restored}`);
md.push(`- **Не восстановлено (файла нет):** ${report.notRestored}`);
md.push('');
md.push('## Восстановленные URL');
md.push('');
report.restoredList.forEach((u) => md.push(`- ${u}`));
md.push('');
md.push('## Не восстановленные URL');
md.push('');
report.notRestoredList.forEach(({ url }) => md.push(`- ${url}`));

fs.writeFileSync(path.join(ROOT, 'URL_REPORT.md'), md.join('\n'), 'utf8');

console.log('Total URLs:', report.total);
console.log('Restored:', report.restored);
console.log('Not restored:', report.notRestored);
console.log('Report written to URL_REPORT.json and URL_REPORT.md');
