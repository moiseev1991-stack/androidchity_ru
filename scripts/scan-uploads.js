/**
 * Сканирует wp-content/uploads и выводит список локальных файлов.
 * Запуск: node scripts/scan-uploads.js
 */

const fs = require('fs');
const path = require('path');

const UPLOADS = path.join(__dirname, '..', 'wp-content', 'uploads');

function walkDir(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkDir(full, list);
    else list.push(path.relative(UPLOADS, full).replace(/\\/g, '/'));
  }
  return list;
}

const files = walkDir(UPLOADS).sort();
console.log('Локальных файлов в wp-content/uploads:', files.length);
files.forEach((f) => console.log('  ' + f));

// сохраняем в JSON для отчёта
const reportPath = path.join(__dirname, '..', 'UPLOADS_LOCAL.json');
fs.writeFileSync(reportPath, JSON.stringify({ count: files.length, files }, null, 2));
console.log('\nСписок сохранён в UPLOADS_LOCAL.json');
