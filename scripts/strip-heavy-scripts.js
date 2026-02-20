/**
 * Удаляет тяжёлые/неиспользуемые скрипты для ускорения загрузки статического архива:
 * - Внешние скрипты (реклама, трекеры): newcreatework, runoffree, hubafile, filebest
 * - Yandex Ads (admin-ajax.php не существует на статике)
 * - flatPM (fpm) — рекламный менеджер, делает AJAX на несуществующие endpoints
 * - wps_ajax (admin-ajax)
 * Добавляет defer к оставшимся скриптам в head.
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

// Удалить внешние скрипты
function removeExternalScripts(html) {
  return html
    .replace(/<script[^>]*src="https?:\/\/(?:newcreatework\.monster|runoffree\.bid|hubafile\.com|filebest\.info)[^"]*"[^>]*><\/script>\s*/gi, '')
    .replace(/<script[^>]*src="https?:\/\/yandex\.ru\/ads\/system\/context\.js"[^>]*><\/script>\s*/gi, '')
    .replace(/<script[^>]*>window\.yaContextCb\s*=\s*window\.yaContextCb\s*\|\|\s*\[\s*\]\s*<\/script>\s*/gi, '');
}

// Удалить flatPM (fpm) блоки
function removeFpm(html) {
  let s = html;
  // Script с fpm_settings
  s = s.replace(/<script[^>]*data-noptimize[^>]*>[\s\S]*?window\.fpm_settings\s*=\s*\{[^}]*\}[\s\S]*?<\/script>\s*/gi, '');
  // noscript#fpm_modul с огромным style
  s = s.replace(/<noscript[^>]*id="fpm_modul"[^>]*>[\s\S]*?<\/noscript>\s*/gi, '');
  // Script с fpm_start, fpm_user и т.д. (огромный minified)
  s = s.replace(/<script[^>]*data-noptimize[^>]*>[\s\S]*?fpm_settings\.selector[\s\S]*?fpm_sticky_slider_sidebar[\s\S]*?<\/script>\s*/gi, '');
  // window.fpm_arr
  s = s.replace(/<script[^>]*>[\s\S]*?window\.fpm_arr\s*=\s*window\.fpm_arr[\s\S]*?fpm_start\(\)[\s\S]*?<\/script>\s*/gi, '');
  // wps_ajax
  s = s.replace(/<script[^>]*>[\s\S]*?var wps_ajax\s*=\s*\{[^}]*\}\s*;[\s\S]*?<\/script>\s*/gi, '');
  s = s.replace(/<script[^>]*>[\s\S]*?var wpshop_views_counter_params[\s\S]*?<\/script>\s*/gi, '');
  return s;
}

// Defer для скриптов в head (локальные)
function addDeferToLocalScripts(html) {
  return html.replace(
    /<script([^>]*)src="(\/wp-content\/[^"]+)"([^>]*)>/gi,
    (m, before, src, after) => {
      if (m.includes('defer') || m.includes('async')) return m;
      return `<script${before}src="${src}" defer${after}>`;
    }
  );
}

let total = 0;
walk(ROOT, (file) => {
  let html = fs.readFileSync(file, 'utf8');
  const orig = html;
  html = removeExternalScripts(html);
  html = removeFpm(html);
  html = addDeferToLocalScripts(html);
  if (html !== orig) {
    fs.writeFileSync(file, html);
    total++;
  }
});
console.log('Updated', total, 'files.');
