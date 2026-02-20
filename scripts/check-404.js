/**
 * Диагностика 404: проверяет все URL из URL_REPORT.json на наличие соответствующих файлов.
 * Учитывает fallback сервера (category/xxx/page/N -> category/xxx/index.html).
 * Запуск: node scripts/check-404.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(ROOT, 'URL_REPORT.json');

const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
const urls = report.restoredList || [];

function pathExists(url) {
  const p = url.replace(/^https?:\/\/[^/]+/i, '').replace(/\/+$/, '') || '';
  const parts = p ? p.split('/').filter(Boolean) : [];
  if (parts.length === 0) return fs.existsSync(path.join(ROOT, 'index.html'));
  if (parts[0] === 'register') return fs.existsSync(path.join(ROOT, 'register', 'index.html'));
  if (parts[0] === 'download') return fs.existsSync(path.join(ROOT, 'download', 'index.html'));
  if (parts[0] === 'page' && parts[1]) return fs.existsSync(path.join(ROOT, 'page', parts[1], 'index.html'));
  if (parts[0] === 'category' && parts[1]) {
    if (parts[2] === 'page' && parts[3]) {
      const pagePath = path.join(ROOT, 'category', parts[1], 'page', parts[3], 'index.html');
      if (fs.existsSync(pagePath)) return true;
      return fs.existsSync(path.join(ROOT, 'category', parts[1], 'index.html'));
    }
    return fs.existsSync(path.join(ROOT, 'category', parts[1], 'index.html'));
  }
  if (parts[0] === 'search') return fs.existsSync(path.join(ROOT, 'search', parts.slice(1).join('/'), 'index.html'));
  if (/^\d{4}$/.test(parts[0]) && parts[1] && parts[2]) {
    return fs.existsSync(path.join(ROOT, parts.join(path.sep), 'index.html'));
  }
  const filePath = path.join(ROOT, parts.join(path.sep), 'index.html');
  return fs.existsSync(filePath) || fs.existsSync(path.join(ROOT, parts.join(path.sep) + '.html'));
}

const ok = [];
const missing = [];

for (const url of urls) {
  if (pathExists(url)) {
    ok.push(url);
  } else {
    missing.push(url);
  }
}

console.log('=== Диагностика 404 ===');
console.log('Проверено URL:', urls.length);
console.log('OK (файл есть):', ok.length);
console.log('404 (файла нет):', missing.length);
console.log('');

if (missing.length > 0) {
  console.log('--- Страницы с 404 ---');
  missing.forEach((u) => console.log(u));
}
process.exit(missing.length > 0 ? 1 : 0);
