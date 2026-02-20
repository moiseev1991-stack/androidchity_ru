/**
 * Генерирует осмысленные картинки через БЕСПЛАТНЫЙ Hugging Face Inference API.
 * Одна картинка на страницу — по названию страницы строится промпт, затем она
 * сохраняется во все недостающие пути этой страницы (с ресайзом под размер).
 *
 * Нужен HUGGINGFACE_API_TOKEN (бесплатный): https://huggingface.co/settings/tokens
 * Запуск: node scripts/generate-ai-images-free.js [--limit N] [--offset N] [--dry-run]
 *
 * Лимиты: ~100-300 запросов/час на бесплатном аккаунте. Для 1303 страниц
 * можно запускать несколько раз в день или использовать несколько аккаунтов.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(ROOT, 'missing-images-report.json');

const DEFAULT_W = 512;
const DEFAULT_H = 512;

// Модель (через router.huggingface.co — бесплатный tier)
const HF_MODEL = 'black-forest-labs/FLUX.1-schnell';

const args = process.argv.slice(2);
const limitIndex = args.indexOf('--limit');
const LIMIT = limitIndex >= 0 && args[limitIndex + 1] ? parseInt(args[limitIndex + 1], 10) : null;
const offsetIndex = args.indexOf('--offset');
const OFFSET = offsetIndex >= 0 && args[offsetIndex + 1] ? parseInt(args[offsetIndex + 1], 10) : 0;
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

/** Вытаскиваем из заголовка суть (игра/приложение). В скобках часто английское название — его предпочитаем. */
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

async function generateImageWithHF(prompt, token) {
  const { InferenceClient } = require('@huggingface/inference');
  const client = new InferenceClient(token);
  const blob = await client.textToImage({
    model: HF_MODEL,
    inputs: prompt,
  });
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function main() {
  const hfToken = process.env.HUGGINGFACE_API_TOKEN;
  if (!hfToken && !DRY_RUN) {
    console.error('Задайте HUGGINGFACE_API_TOKEN (бесплатный токен: https://huggingface.co/settings/tokens)');
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
  const start = Math.min(OFFSET, pages.length);
  const end = LIMIT != null ? Math.min(start + LIMIT, pages.length) : pages.length;
  const total = end - start;
  const pagesSlice = pages.slice(start, end);

  console.log('Страниц с недостающими картинками:', pages.length);
  console.log('Будет обработано:', total, start > 0 ? `(начиная с ${start + 1})` : '', DRY_RUN ? '(dry-run)' : '');
  if (DRY_RUN) {
    pagesSlice.slice(0, Math.min(3, total)).forEach(([url, data], i) => {
      console.log(`  ${i + 1}. ${url} → "${titleToPrompt(data.pageTitle).slice(0, 60)}..."`);
    });
    console.log('\nПримечание: бесплатный HF API имеет лимиты (~100-300 запросов/час).');
    console.log('Для полного прогона (1303 страницы) запускайте скрипт несколько раз в день.');
    return;
  }

  const sharp = require('sharp');

  let done = 0;
  let errors = 0;

  for (let i = 0; i < total; i++) {
    const [pageUrl, data] = pagesSlice[i];
    const prompt = titleToPrompt(data.pageTitle);

    try {
      const imageBuffer = await generateImageWithHF(prompt, hfToken);
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
      console.log(`  [${start + i + 1}/${pages.length}] ${pageUrl} — сохранено в ${data.imageUrls.length} файлов`);
    } catch (e) {
      errors++;
      if (e.message.includes('503') || e.message.includes('загружается')) {
        console.warn(`  [${start + i + 1}/${pages.length}] Модель загружается, ждём 30 секунд...`);
        await new Promise((r) => setTimeout(r, 30000));
        i--;
        continue;
      }
      console.warn(`  [${start + i + 1}/${pages.length}] Ошибка ${pageUrl}:`, e.message);
    }

    if (i < total - 1) await new Promise((r) => setTimeout(r, 2500));
  }

  console.log('\nГотово. Сгенерировано страниц:', done, 'Ошибок:', errors);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
