/**
 * Генерирует картинки через OpenAI DALL·E (платный API).
 * Одна картинка на страницу, сохраняется во все пути этой страницы.
 * Нужен OPENAI_API_KEY. Запуск: node scripts/generate-ai-images-openai.js [--limit N] [--offset N]
 */

const fs = require('fs');
const path = require('path');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');

const ROOT = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(ROOT, 'missing-images-report.json');
const DEFAULT_W = 512;
const DEFAULT_H = 512;

const args = process.argv.slice(2);
const limitIndex = args.indexOf('--limit');
const LIMIT = limitIndex >= 0 && args[limitIndex + 1] ? parseInt(args[limitIndex + 1], 10) : null;
const offsetIndex = args.indexOf('--offset');
const OFFSET = offsetIndex >= 0 && args[offsetIndex + 1] ? parseInt(args[offsetIndex + 1], 10) : 0;

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

function getProxyAgent() {
  // Проверяем переменные окружения для прокси
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.PROXY;
  if (!proxyUrl) return undefined;
  
  // Определяем тип прокси по протоколу
  if (proxyUrl.startsWith('socks4://') || proxyUrl.startsWith('socks5://') || proxyUrl.startsWith('socks://')) {
    return new SocksProxyAgent(proxyUrl);
  } else {
    return new HttpsProxyAgent(proxyUrl);
  }
}

async function generateImageWithOpenAI(prompt, apiKey) {
  const proxyAgent = getProxyAgent();
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-2',
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    }),
  };
  
  // Добавляем прокси, если он настроен
  if (proxyAgent) {
    fetchOptions.agent = proxyAgent;
  }
  
  const res = await fetch('https://api.openai.com/v1/images/generations', fetchOptions);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  if (!data.data || !data.data[0] || !data.data[0].b64_json) throw new Error('Нет изображения в ответе');
  return Buffer.from(data.data[0].b64_json, 'base64');
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Задайте OPENAI_API_KEY');
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
    if (!byPage.has(row.pageUrl)) byPage.set(row.pageUrl, { pageTitle: row.pageTitle || '', imageUrls: [] });
    const e = byPage.get(row.pageUrl);
    if (!e.imageUrls.includes(row.imageUrl)) e.imageUrls.push(row.imageUrl);
    if (row.pageTitle) e.pageTitle = row.pageTitle;
  }

  const pages = [...byPage.entries()];
  const start = Math.min(OFFSET, pages.length);
  const end = LIMIT != null ? Math.min(start + LIMIT, pages.length) : pages.length;
  const total = end - start;
  const pagesSlice = pages.slice(start, end);

  console.log('OpenAI DALL·E 2 — генерация картинок');
  console.log('Страниц к обработке:', total, start > 0 ? `(с ${start + 1})` : '');
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.PROXY;
  if (proxyUrl) {
    console.log('Используется прокси:', proxyUrl.replace(/:[^:@]*@/, ':****@')); // Скрываем пароль
  }
  const sharp = require('sharp');
  const baseUrl = 'http://127.0.0.1:8080';
  const generatedPages = [];

  for (let i = 0; i < total; i++) {
    const [pageUrl, data] = pagesSlice[i];
    const prompt = titleToPrompt(data.pageTitle);
    try {
      const imageBuffer = await generateImageWithOpenAI(prompt, apiKey);
      let image = sharp(imageBuffer);
      for (const imageUrlPath of data.imageUrls) {
        const localPath = imageUrlPath.replace(/^\//, '').replace(/\//g, path.sep);
        const fullPath = path.join(ROOT, localPath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        const [w, h] = parseSizeFromFilename(localPath);
        const ext = path.extname(fullPath).toLowerCase();
        let pipeline = image.clone().resize(w, h);
        if (ext === '.jpg' || ext === '.jpeg') pipeline = pipeline.jpeg({ quality: 88 });
        else if (ext === '.webp') pipeline = pipeline.webp({ quality: 88 });
        else pipeline = pipeline.png();
        await pipeline.toFile(fullPath);
      }
      generatedPages.push(baseUrl + pageUrl);
      console.log(`  [${start + i + 1}/${pages.length}] ${pageUrl} — сохранено в ${data.imageUrls.length} файлов`);
    } catch (e) {
      console.warn(`  [${start + i + 1}/${pages.length}] Ошибка ${pageUrl}:`, e.message);
    }
    if (i < total - 1) await new Promise((r) => setTimeout(r, 500));
  }

  console.log('\n--- Ссылки на страницы с новыми картинками ---');
  generatedPages.forEach((url, idx) => console.log(`${idx + 1}. ${url}`));
  console.log('\n--- Расход (оценка) ---');
  console.log('Сгенерировано изображений:', generatedPages.length);
  console.log('Модель: DALL·E 2, 1024×1024. Ориентир: ~$0.02 за изображение.');
  console.log('Потрачено примерно:', (generatedPages.length * 0.02).toFixed(2), 'USD');
  console.log('Точный расход смотрите в https://platform.openai.com/usage');
}

main().catch((e) => { console.error(e); process.exit(1); });
