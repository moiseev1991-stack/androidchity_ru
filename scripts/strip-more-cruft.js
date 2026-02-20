/**
 * Дополнительная очистка: убирает лишнее, что тормозит загрузку.
 * - clearfy cookie (блок + скрипт)
 * - Swiper (элемент .js-swiper-home не существует — скрипт падает впустую)
 * - yandex-verification (дубли, оставляем один)
 * - noscript пустые
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXCLUDE = ['node_modules', '.git', 'scripts'];

function walk(dir, cb) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of items) {
    const full = path.join(dir, e.name);
    if (EXCLUDE.some(x => full.includes(path.sep + x + path.sep))) continue;
    if (e.isDirectory()) walk(full, cb);
    else if (e.name.toLowerCase().endsWith('.html')) cb(full);
  }
}

function clean(html) {
  let s = html;

  // clearfy cookie блок полностью (div + скрипт)
  s = s.replace(/<div id="clearfy-cookie"[^>]*>[\s\S]*?<\/div><script>var cookie_clearfy_hide[\s\S]*?removeChild[\s\S]*?<\/script>/gi, '');

  // Swiper — элемент .js-swiper-home не существует
  s = s.replace(/<noscript><div><\/div><\/noscript>\s*<script>[\s\S]*?var wpshopSwiper\s*=\s*new Swiper\([^)]+\)[\s\S]*?<\/script>/gi, '');

  // Дубли yandex-verification (оставить первый)
  s = s.replace(/(<meta name="yandex-verification"[^>]+>)(\s*<meta name="yandex-verification"[^>]+>)+/gi, '$1');

  return s;
}

let total = 0;
walk(ROOT, (file) => {
  let html = fs.readFileSync(file, 'utf8');
  const out = clean(html);
  if (out !== html) {
    fs.writeFileSync(file, out);
    total++;
  }
});
console.log('Cleaned', total, 'files.');
