/**
 * Заменяет Ya.Context.AdvManager (Yandex ads) на простой window.open — рекламный скрипт удалён.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXCLUDE = ['node_modules', '.git', 'scripts'];

const MARKER = 'Ya.Context.AdvManager.render(';

function findMatchingClose(str, start) {
  let depth = 1;
  let i = start;
  while (i < str.length && depth > 0) {
    const c = str[i];
    if (c === '(' || c === '{') depth++;
    else if (c === ')' || c === '}') depth--;
    i++;
  }
  return i;
}

function replaceBlock(html) {
  const idx = html.indexOf(MARKER);
  if (idx === -1) return html;
  const end = findMatchingClose(html, idx + MARKER.length);
  const before = html.slice(0, idx);
  const after = html.slice(end);
  return before + 'window.open(href,"_blank")' + after;
}

function walk(dir, cb) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of items) {
    const full = path.join(dir, e.name);
    if (EXCLUDE.some(x => full.includes(path.sep + x + path.sep))) continue;
    if (e.isDirectory()) walk(full, cb);
    else if (e.name.toLowerCase().endsWith('.html')) cb(full);
  }
}

let total = 0;
walk(ROOT, (file) => {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes(MARKER)) {
    html = replaceBlock(html);
    fs.writeFileSync(file, html);
    total++;
  }
});
console.log('Fixed download handler in', total, 'files.');
