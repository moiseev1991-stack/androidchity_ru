/**
 * Генерирует осмысленные картинки по контексту страницы через Replicate (FLUX).
 * Одна картинка на страницу — по названию страницы строится промпт, затем она
 * сохраняется во все недостающие пути этой страницы (с ресайзом под размер).
 *
 * Нужен REPLICATE_API_TOKEN: https://replicate.com/account/api-tokens
 * Запуск: node scripts/generate-ai-images.js [--limit N] [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(ROOT, 'missing-images-report.json');

const DEFAULT_W = 512;
const DEFAULT_H = 512;

const args = process.argv.slice(2);
const limitIndex = args.indexOf('--limit');
const LIMIT = limitIndex >= 0 && args[limitIndex + 1] ? parseInt(args[limitIndex + 1], 10) : null;
const DRY_RUN = args.includes('--dry-run');

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

/** Вытаскиваем из заголовка суть (игра/приложение). В скобках часто английское название — его предпочитаем для FLUX. */
function titleToPrompt(title) {
  if (!title || typeof title !== 'string') return 'mobile game icon, android app, colorful';
  const bracketMatch = title.match(/\(([^)]+)\)/);
  const inBrackets = bracketMatch ? bracketMatch[1].trim() : '';
  let t = title
    .replace(/\s*[—–-]\s*главная\s*$/i, '')
    .replace(/\bскачать\b/gi, '')
    .replace(/\bскачайте\b/gi, '')
    .replace(/\bна\s+андроид\b/gi, '')
    .replace(/\bна\s+android\b/gi, '')
    .replace(/\bбесплатно\b/gi, '')
    .replace(/\bпоследняя\s+версия\b/gi, '')
    .replace(/\bбез\s+цензуры\b/gi, '')
    .replace(/\bна\s+русском\b/gi, '')
    .replace(/\bapk\b/gi, '')
    .replace(/\bmod\b/gi, '')
    .replace(/\bвзлом\b/gi, '')
    .replace(/\bчит[ыа]?\b/gi, '')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const subject = inBrackets.length > 0 ? inBrackets : t;
  const final = subject.length > 70 ? subject.slice(0, 67) + '…' : subject;
  if (!final) return 'mobile game icon, android app, colorful';
  return `mobile game or app icon, android, colorful illustration, ${final}, simple clean style, no text`;
}

function downloadUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (!replicateToken && !DRY_RUN) {
    console.error('Задайте REPLICATE_API_TOKEN (см. https://replicate.com/account/api-tokens)');
    process.exit(1);
  }

  if (!fs.existsSync(REPORT_PATH)) {
    console.error('Сначала запустите: node scripts/collect-missing-images.js');
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
  const table = report.table || [];

  const byPage = new Map();
  for (const row of table) {
    if (!row.pageUrl || !row.imageUrl) continue;
    if (!byPage.has(row.pageUrl)) {
      byPage.set(row.pageUrl, { pageTitle: row.pageTitle || '', imageUrls: [] });
    }
    const entry = byPage.get(row.pageUrl);
    if (!entry.imageUrls.includes(row.imageUrl)) entry.imageUrls.push(row.imageUrl);
    if (row.pageTitle) entry.pageTitle = row.pageTitle;
  }

  const pages = [...byPage.entries()];
  const total = LIMIT != null ? Math.min(LIMIT, pages.length) : pages.length;

  console.log('Страниц с недостающими картинками:', pages.length);
  console.log('Будет обработано:', total, DRY_RUN ? '(dry-run)' : '');
  if (DRY_RUN) {
    pages.slice(0, Math.min(3, total)).forEach(([url, data], i) => {
      console.log(`  ${i + 1}. ${url} → "${titleToPrompt(data.pageTitle).slice(0, 60)}..."`);
    });
    return;
  }

  let Replicate;
  try {
    Replicate = require('replicate').default || require('replicate');
  } catch (e) {
    console.error('Установите: npm install replicate');
    process.exit(1);
  }
  const sharp = require('sharp');
  const replicate = new Replicate({ auth: replicateToken });

  let done = 0;
  let errors = 0;

  for (let i = 0; i < total; i++) {
    const [pageUrl, data] = pages[i];
    const prompt = titleToPrompt(data.pageTitle);

    try {
      const output = await replicate.run('black-forest-labs/flux-schnell', {
        input: { prompt },
      });
      const raw = Array.isArray(output) ? output[0] : output;
      let imageBuffer;
      if (Buffer.isBuffer(raw)) {
        imageBuffer = raw;
      } else if (typeof raw === 'string' && (raw.startsWith('http://') || raw.startsWith('https://'))) {
        imageBuffer = await downloadUrl(raw);
      } else if (raw && typeof raw.url === 'function') {
        imageBuffer = await downloadUrl(raw.url());
      } else {
        throw new Error('Неожиданный формат ответа: ' + typeof raw);
      }
      let image = sharp(imageBuffer);

      for (const imageUrlPath of data.imageUrls) {
        const localPath = imageUrlPath.replace(/^\//, '').replace(/\//g, path.sep);
        const fullPath = path.join(ROOT, localPath);
        const dir = path.dirname(fullPath);
        const [w, h] = parseSizeFromFilename(localPath);
        const ext = path.extname(fullPath).toLowerCase();

        fs.mkdirSync(dir, { recursive: true });

        let pipeline = image.clone().resize(w, h);
        if (ext === '.jpg' || ext === '.jpeg') pipeline = pipeline.jpeg({ quality: 88 });
        else if (ext === '.webp') pipeline = pipeline.webp({ quality: 88 });
        else pipeline = pipeline.png();

        await pipeline.toFile(fullPath);
      }

      done++;
      console.log(`  [${i + 1}/${total}] ${pageUrl} — сохранено в ${data.imageUrls.length} файлов`);
    } catch (e) {
      errors++;
      console.warn(`  [${i + 1}/${total}] Ошибка ${pageUrl}:`, e.message);
    }

    if (i < total - 1) await new Promise((r) => setTimeout(r, 800));
  }

  console.log('\nГотово. Сгенерировано страниц:', done, 'Ошибок:', errors);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
