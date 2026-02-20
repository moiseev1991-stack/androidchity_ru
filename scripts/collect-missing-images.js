/**
 * Собирает список недостающих картинок (wp-content/uploads/) по всем HTML.
 * Результат: CSV-таблица с колонками: адрес картинки, адрес страницы, название страницы.
 * Запуск из корня проекта: node scripts/collect-missing-images.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_CSV = path.join(ROOT, 'missing-images-report.csv');
const OUT_JSON = path.join(ROOT, 'missing-images-report.json');

// Путь к картинке: /wp-content/uploads/... до кавычки, пробела или конца (учитываем \/ и \" в JSON)
const UPLOADS_REGEX = /\/wp-content\/uploads\/[^"'\s\\]+/gi;

function extractUploadsPaths(html) {
  // В JSON внутри HTML слэши экранированы: \/ → нормализуем для поиска
  const normalized = html.replace(/\\\//g, '/');
  const paths = new Set();
  for (const m of normalized.matchAll(UPLOADS_REGEX)) {
    let p = m[0].replace(/\\/g, '/').replace(/\\+$/, ''); // путь и убрать хвостовой \ от \"
    const q = p.indexOf('?');
    if (q !== -1) p = p.slice(0, q);
    if (p.startsWith('/wp-content/uploads/') && !p.includes('*')) paths.add(p);
  }
  return [...paths];
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return '';
  return (match[1] || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function filePathToPageUrl(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');
  if (normalized === 'index.html') return '/';
  if (normalized.endsWith('/index.html')) return '/' + normalized.slice(0, -11);
  return '/' + normalized.replace(/\/index\.html$/, '');
}

function getAllHtmlFiles(dir, list = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      getAllHtmlFiles(full, list);
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.html')) {
      list.push(full);
    }
  }
  return list;
}

function escapeCsvCell(s) {
  const str = String(s == null ? '' : s);
  if (/["\r\n,]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
  return str;
}

// ——— main ———

const rows = [];           // { imageUrl, pageUrl, pageTitle }
const missingPaths = new Set();

console.log('Сканирование HTML...');
const htmlFiles = getAllHtmlFiles(ROOT).filter((f) => {
  const r = path.relative(ROOT, f);
  return !r.startsWith('node_modules') && !r.startsWith('.git');
});

let processed = 0;
for (const htmlPath of htmlFiles) {
  const relativePath = path.relative(ROOT, htmlPath);
  let html;
  try {
    html = fs.readFileSync(htmlPath, 'utf8');
  } catch (err) {
    console.warn('Не удалось прочитать:', relativePath, err.message);
    continue;
  }

  const pageUrl = filePathToPageUrl(relativePath);
  const pageTitle = extractTitle(html);
  const uploadsPaths = extractUploadsPaths(html);

  for (const imagePath of uploadsPaths) {
    // Локальный путь: без ведущего /
    const localPath = imagePath.replace(/^\//, '').replace(/\//g, path.sep);
    const fullPath = path.join(ROOT, localPath);
    let exists = false;
    try {
      exists = fs.existsSync(fullPath) && fs.statSync(fullPath).isFile();
    } catch (_) {}

    if (!exists) {
      missingPaths.add(imagePath);
      rows.push({
        imageUrl: imagePath,
        pageUrl,
        pageTitle,
      });
    }
  }

  processed++;
  if (processed % 200 === 0) console.log('  обработано страниц:', processed);
}

// Уникальные недостающие картинки (для справки)
const uniqueMissing = [...missingPaths].sort();

console.log('');
console.log('Всего страниц:', htmlFiles.length);
console.log('Недостающих картинок (уникальных):', uniqueMissing.length);
console.log('Строк в таблице (картинка + страница):', rows.length);

// CSV с BOM для корректного открытия в Excel (UTF-8)
const header = 'Адрес картинки;Адрес страницы;Название страницы';
const csvLines = [
  '\uFEFF' + header,
  ...rows.map((r) =>
    [r.imageUrl, r.pageUrl, r.pageTitle].map(escapeCsvCell).join(';')
  ),
];
fs.writeFileSync(OUT_CSV, csvLines.join('\r\n'), 'utf8');
console.log('CSV сохранён:', OUT_CSV);

// JSON: и таблица, и список уникальных URL для скриптов
const report = {
  summary: {
    totalPages: htmlFiles.length,
    uniqueMissingImages: uniqueMissing.length,
    tableRows: rows.length,
  },
  uniqueMissingImageUrls: uniqueMissing,
  table: rows,
};
fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), 'utf8');
console.log('JSON сохранён:', OUT_JSON);
