#!/usr/bin/env node
/**
 * scripts/bake-design.js
 * Вшивает новый дизайн в все статические HTML-файлы.
 * После запуска — файлы можно деплоить напрямую на Apache.
 *
 * Запуск: node scripts/bake-design.js
 * Флаги:  --dry-run  — только считать, не писать
 *         --reset    — удалить инъекцию из файлов (откат)
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const { processHead, processLayout, processImages, blockPushNotifications } =
  require('../server');

const DRY_RUN = process.argv.includes('--dry-run');
const RESET   = process.argv.includes('--reset');

/* ── Папки/файлы которые пропускаем ─────────────────────── */
const SKIP_DIRS = new Set([
  'node_modules', '.git', '.claude', 'scripts',
  'templates', 'assets',
]);

/* ── Рекурсивный обход HTML-файлов ──────────────────────── */
function walkHTML(dir, results = []) {
  let entries;
  try { entries = fs.readdirSync(dir); } catch { return results; }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    let stat;
    try { stat = fs.statSync(full); } catch { continue; }

    if (stat.isDirectory()) {
      walkHTML(full, results);
    } else if (entry.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

/* ── Путь к файлу → URL-путь ─────────────────────────────── */
function toUrlPath(filePath) {
  let rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, rel.length - 'index.html'.length);
  return '/' + rel;
}

/* ── Снять инъекцию (--reset) ────────────────────────────── */
function resetFile(html) {
  let out = html;
  // Убираем наши CSS и kill-switch стиль
  out = out.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\n?/g, '');
  out = out.replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\n?/g, '');
  out = out.replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]+>\n?/g, '');
  out = out.replace(/<link rel="stylesheet" href="\/assets\/css\/(?:base|layout|components|hero|responsive)\.css">\n?/g, '');
  out = out.replace(/<style id="new-design-kill">[\s\S]*?<\/style>\n?/g, '');
  // Убираем новый хедер
  out = out.replace(/<header class="site-header" id="newSiteHeader"[\s\S]*?<\/header>\n?/g, '');
  // Убираем hero
  out = out.replace(/<section class="hero"[\s\S]*?<\/section>\n?/g, '');
  // Убираем layout-обёртку
  out = out.replace(/<div class="layout">\s*<nav class="sidebar"[\s\S]*?<\/nav>\s*<div class="main" id="main-content">\n?/g, '');
  out = out.replace(/\n?\s*<\/div><!-- \/main -->\n?<\/div><!-- \/layout -->\n?/g, '');
  // Убираем footer
  out = out.replace(/<footer class="site-footer" id="newSiteFooter"[\s\S]*?<\/footer>\n?/g, '');
  // Убираем mobile menu (все варианты структуры)
  out = out.replace(/<div[^>]*id="mobileOverlay"[^>]*>[\s\S]*?<\/div>\n?/g, '');
  out = out.replace(/<div[^>]*id="mobileMenu"[^>]*>[\s\S]*?<\/nav>\s*<\/div>\s*<\/div>\n?/g, '');
  out = out.replace(/<div class="mobile-overlay"[^>]*><\/div>\n?/g, '');
  out = out.replace(/<div[^>]*class="[^"]*mobile-menu__body[^"]*"[^>]*>[\s\S]*?<\/nav>\s*<\/div>\n?/g, '');
  // Убираем sidebar-overlay (добавлено в новом дизайне)
  out = out.replace(/<div[^>]*id="sidebarOverlay"[^>]*><\/div>\n?/g, '');
  // Убираем preload/preconnect для шрифтов (все варианты)
  out = out.replace(/<link[^>]*rel="preload"[^>]*fonts\.googleapis[^>]*>\n?/g, '');
  // Убираем JS
  out = out.replace(/<script src="\/assets\/js\/ui\.js" defer><\/script>\n?/g, '');
  out = out.replace(/<script src="\/assets\/js\/search\.js" defer><\/script>\n?/g, '');
  return out;
}

/* ── Главный цикл ────────────────────────────────────────── */
const files = walkHTML(ROOT);

let processed = 0;
let skipped   = 0;
let errors    = 0;

console.log(`Найдено HTML-файлов: ${files.length}`);
if (DRY_RUN) console.log('Режим: DRY RUN (файлы не изменяются)');
if (RESET)   console.log('Режим: RESET (удаление инъекции)');

for (const filePath of files) {
  let html;
  try { html = fs.readFileSync(filePath, 'utf8'); } catch (e) {
    console.error(`Ошибка чтения: ${filePath}`);
    errors++;
    continue;
  }

  if (RESET) {
    // откат
    if (!html.includes('id="new-design-kill"')) { skipped++; continue; }
    const out = resetFile(html);
    if (!DRY_RUN) fs.writeFileSync(filePath, out, 'utf8');
    processed++;
  } else {
    // инъекция
    if (html.includes('id="new-design-kill"')) { skipped++; continue; }
    const urlPath = toUrlPath(filePath);
    let out = blockPushNotifications(html);
    out = processHead(out);
    out = processLayout(out, urlPath);
    out = processImages(out);
    if (!DRY_RUN) {
      try { fs.writeFileSync(filePath, out, 'utf8'); } catch (e) {
        console.error(`Ошибка записи: ${filePath}`);
        errors++;
        continue;
      }
    }
    processed++;
  }

  if ((processed + skipped) % 200 === 0) {
    process.stdout.write(`  ${processed + skipped} / ${files.length}...\r`);
  }
}

console.log(`\nГотово:`);
console.log(`  Обработано: ${processed}`);
console.log(`  Пропущено:  ${skipped} (уже обработаны)`);
if (errors) console.log(`  Ошибок:     ${errors}`);
