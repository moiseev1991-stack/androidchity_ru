/**
 * Добавляет блок post-cards (рекомендации) в категории, где его нет.
 * Собирает посты по category-XXX из article class и вставляет карточки.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXCLUDE = ['node_modules', '.git', 'scripts'];

// Собираем все посты: { categorySlug: [{url, title, img, category}] }
const postsByCategory = {};

function walk(dir, cb) {
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of items) {
      const full = path.join(dir, e.name);
      if (EXCLUDE.some(x => full.includes(path.sep + x + path.sep))) continue;
      if (e.isDirectory()) walk(full, cb);
      else cb(full, e);
    }
  } catch (_) {}
}

// Посты — в 2023/, 2024/ и т.д., не в category/, page/, download/
function isPostFile(filePath) {
  let rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (rel.startsWith('category/')) return false;
  if (rel.startsWith('page/')) return false;
  if (rel === 'download/index.html') return false;
  if (rel === 'index.html') return false;
  const m = rel.match(/^(\d{4})\/(\d{2})\/(\d{2})\/.+$/);
  return !!m;
}

walk(ROOT, (file) => {
  if (!file.toLowerCase().endsWith('.html')) return;
  if (!isPostFile(file)) return;
  const html = fs.readFileSync(file, 'utf8');
  const catMatch = html.match(/class="[^"]*article-post[^"]*category-([a-z0-9-]+)/i);
  if (!catMatch) return;
  const categories = html.match(/category-([a-z0-9-]+)/gi) || [];
  const uniq = [...new Set(categories.map(c => c.replace('category-', '')))];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  const url = canonical ? canonical[1] : '/' + path.relative(ROOT, path.dirname(file)).replace(/\\/g, '/') + '/';
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/) || html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1].trim() : 'Post';
  let img = html.match(/og:image" content="([^"]+)"/);
  img = img ? img[1] : '/wp-content/uploads/2023/11/remove-bg.ai_1701256636548.png';
  const artSection = html.match(/articleSection[^>]*>([^<]+)</);
  const catLabel = artSection ? artSection[1] : 'Игры';
  const post = { url, title, img, category: catLabel };
  uniq.forEach(slug => {
    if (!postsByCategory[slug]) postsByCategory[slug] = [];
    postsByCategory[slug].push(post);
  });
});

// Категории без post-cards
function getCategorySlug(filePath) {
  const rel = path.relative(ROOT, path.dirname(filePath));
  const parts = rel.split(path.sep).filter(Boolean);
  if (parts[0] === 'category' && parts[1]) return parts[1];
  return null;
}

function makePostCard(p) {
  return `<div class="post-card post-card--small w-animate" itemscope itemtype="http://schema.org/BlogPosting" data-animate-style="fadeinup">
<div class="post-card__thumbnail"><a href="${p.url}"><img width="100" height="100" src="${p.img}" class="attachment-reboot_square size-reboot_square wp-post-image" alt decoding="async" loading="lazy"></a></div>
<div class="post-card__body"><span itemprop="articleSection" class="post-card__category">${p.category}</span><div class="post-card__title" itemprop="name"><span itemprop="headline"><a href="${p.url}">${p.title}</a></span></div></div>
</div>`;
}

let total = 0;
walk(ROOT, (file) => {
  if (!file.toLowerCase().endsWith('index.html')) return;
  let rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (!rel.startsWith('category/')) return;
  if (rel.includes('/page/')) return;
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('post-cards post-cards--small')) return;
  const slug = getCategorySlug(file);
  if (!slug) return;
  const posts = postsByCategory[slug] || [];
  if (posts.length === 0) return;
  const cards = posts.slice(0, 15).map(makePostCard).join(' ');
  const block = `</div></header><div class="post-cards post-cards--small">${cards}</div>`;
  const re = /<\/p>\s*<script src="(\/wp-content\/cache\/minify\/[^"]+\.js)"/;
  const m = html.match(re);
  if (!m) return;
  html = html.replace(re, block + '<script src="' + m[1] + '"');
  if (html.includes(block)) {
    fs.writeFileSync(file, html);
    total++;
  }
});
console.log('Added recommendations to', total, 'category pages.');
