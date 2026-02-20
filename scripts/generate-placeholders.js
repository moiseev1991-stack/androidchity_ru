/**
 * Генерирует простые заглушки для недостающих картинок.
 * Текст на заглушке: название страницы (где картинка отсутствует) или имя файла.
 * Запуск из корня: node scripts/generate-placeholders.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(ROOT, 'missing-images-report.json');

// Размер по умолчанию, если не удалось вытащить из имени файла (например 1-14-300x200.webp → 300x200)
const DEFAULT_W = 400;
const DEFAULT_H = 300;

function parseSizeFromFilename(filePath) {
  const base = path.basename(filePath);
  const m = base.match(/-(\d+)x(\d+)\.?(?:webp|jpg|jpeg|png|gif)?$/i) || base.match(/-(\d+)x(\d+)$/);
  if (m) {
    const w = Math.min(2000, Math.max(50, parseInt(m[1], 10)));
    const h = Math.min(2000, Math.max(50, parseInt(m[2], 10)));
    return [w, h];
  }
  return [DEFAULT_W, DEFAULT_H];
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function createSvg(width, height, textLine1, textLine2) {
  const line1 = escapeXml(textLine1 || '');
  const line2 = escapeXml(textLine2 || '');
  const fontSize = Math.max(10, Math.min(20, Math.floor(Math.min(width, height) / 20)));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#e8e8e8"/>
  <text x="50%" y="${textLine2 ? '45%' : '50%'}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" fill="#555" font-family="Arial,sans-serif">${line1}</text>
  ${line2 ? `<text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" fill="#555" font-family="Arial,sans-serif">${line2}</text>` : ''}
</svg>`;
}

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('Установите зависимость: npm install');
    process.exit(1);
  }

  if (!fs.existsSync(REPORT_PATH)) {
    console.error('Сначала запустите: node scripts/collect-missing-images.js');
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
  const urls = report.uniqueMissingImageUrls || [];
  const table = report.table || [];

  const imageToTitle = {};
  for (const row of table) {
    if (row.imageUrl && row.pageTitle && !imageToTitle[row.imageUrl]) {
      imageToTitle[row.imageUrl] = row.pageTitle;
    }
  }

  console.log('Недостающих картинок (уникальных):', urls.length);
  console.log('Генерация заглушек…\n');

  let done = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < urls.length; i++) {
    const imageUrl = urls[i];
    const localPath = imageUrl.replace(/^\//, '').replace(/\//g, path.sep);
    const fullPath = path.join(ROOT, localPath);

    if (fs.existsSync(fullPath)) {
      skipped++;
      if ((i + 1) % 500 === 0) console.log(`  ${i + 1}/${urls.length} (пропущено: ${skipped})`);
      continue;
    }

    const dir = path.dirname(fullPath);
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      errors++;
      if (errors <= 5) console.warn('Ошибка создания папки:', dir, e.message);
      continue;
    }

    const basename = path.basename(localPath);
    const [w, h] = parseSizeFromFilename(localPath);
    const pageTitle = imageToTitle[imageUrl];
    const text1 = (pageTitle && pageTitle.length > 0)
      ? pageTitle.slice(0, 35) + (pageTitle.length > 35 ? '…' : '')
      : basename.slice(0, 40);
    const text2 = pageTitle && pageTitle.length > 35 ? basename.slice(0, 30) : '';

    const svg = createSvg(w, h, text1, text2 ? text2 : null);
    const ext = path.extname(fullPath).toLowerCase();

    try {
      let pipeline = sharp(Buffer.from(svg));
      if (ext === '.jpg' || ext === '.jpeg') {
        pipeline = pipeline.jpeg({ quality: 85 });
      } else if (ext === '.webp') {
        pipeline = pipeline.webp({ quality: 85 });
      } else {
        pipeline = pipeline.png();
      }
      await pipeline.toFile(fullPath);
      done++;
    } catch (e) {
      errors++;
      if (errors <= 5) console.warn('Ошибка записи:', fullPath, e.message);
    }

    if ((i + 1) % 200 === 0) {
      console.log(`  ${i + 1}/${urls.length} — создано: ${done}, пропущено: ${skipped}, ошибок: ${errors}`);
    }
  }

  console.log('\nГотово.');
  console.log('  Создано:', done);
  console.log('  Пропущено (файл уже есть):', skipped);
  console.log('  Ошибок:', errors);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
