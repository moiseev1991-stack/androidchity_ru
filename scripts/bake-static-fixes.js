/**
 * Bake archive-fix.css, sidebar and layout into static HTML
 * so category/archive pages display correctly without server.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const SIDEBAR_CATEGORIES = [
  ['novinki', 'Новинки'], ['chity', 'Читы'], ['vzlomy', 'Взломы'], ['mody', 'Моды'], ['3d', '3D'], ['2d', '2D'],
  ['anime', 'Аниме'], ['arkady', 'Аркады'], ['brodilki', 'Бродилки'], ['vizualnye-novelly', 'Визуальные новеллы'],
  ['golovolomki', 'Головоломки'], ['gonki', 'Гонки'], ['dinamichnye', 'Динамичные'], ['dlya-vzroslyh', 'Для взрослых'],
  ['dlya-detey', 'Для детей'], ['zombi', 'Зомби'], ['instrumenty', 'Инструменты'], ['kazualnye', 'Казуальные'],
  ['kraft', 'Крафт'], ['multipleer', 'Мультиплеер'], ['na-vyzhivanie', 'На выживание'], ['na-planshet', 'На планшет'],
  ['na-russkom', 'На русском'], ['onlayn', 'Онлайн'], ['ot-pervogo-litsa', 'От первого лица'], ['pikselnye', 'Пиксельные'],
  ['pk-igry', 'ПК игры'], ['poleznoe', 'Полезное'], ['prilozheniya', 'Приложения'], ['ranery', 'Ранеры'],
  ['rolevye', 'Ролевые'], ['s-otkrytym-mirom', 'С открытым миром'], ['s-sozdaniem-mira', 'С созданием мира'],
  ['s-sozdaniem-personazha', 'С созданием персонажа'], ['s-syuzhetom', 'С сюжетом'], ['simulyatory', 'Симуляторы'],
  ['sots-seti', 'Соц сети'], ['sportivnye', 'Спортивные'], ['stendoff-2', 'Standoff 2'], ['strategii', 'Стратегии'],
  ['toka-boka', 'Toca Boca'], ['top', 'Топ'], ['fentezi', 'Фэнтези'], ['fotoredaktory', 'Фоторедакторы'],
  ['hentay', 'Хентай'], ['horror', 'Хоррор'], ['shutery', 'Шутеры'], ['ekshen', 'Экшен'], ['18', '18+']
];
const SIDEBAR_CATEGORIES_HTML = SIDEBAR_CATEGORIES.map(([slug, name]) => '<a href="/category/' + slug + '/">' + name + '</a>').join('');
const SIDEBAR_HTML = '<aside class="site-sidebar"><div class="widget"><h3>Разделы сайта</h3><a href="/">Главная</a><a href="/page/2/">Лента записей</a><a href="/download/">Проверка файла на вирусы</a><a href="/register/">Регистрация</a></div><div class="widget widget--categories"><h3>Категории</h3>' + SIDEBAR_CATEGORIES_HTML + '</div></aside>';
const LAYOUT_SIDEBAR_CSS = '<style id="layout-sidebar-style">.home-nav{background:#f0f0f0;padding:10px 20px;border-bottom:1px solid #ddd}.home-nav a{color:#333;text-decoration:none;margin-right:16px;font-size:14px}.home-nav a:hover{color:#00681f}.layout-with-sidebar{display:flex;max-width:1200px;margin:0 auto;padding:20px;gap:24px}.site-sidebar{width:220px;flex-shrink:0}.site-sidebar .widget{background:#f8f8f8;border:1px solid #e0e0e0;border-radius:8px;padding:16px;margin-bottom:20px}.site-sidebar .widget h3{margin:0 0 12px;font-size:1rem;color:#00681f;border-bottom:1px solid #ddd;padding-bottom:8px}.site-sidebar .widget a{display:block;color:#0693e3;text-decoration:none;padding:6px 0;font-size:14px}.site-sidebar .widget a:hover{color:#0073aa;text-decoration:underline}.site-sidebar .widget--categories{max-height:70vh;overflow-y:auto}.layout-with-sidebar .home-main{flex:1;min-width:0}@media(max-width:768px){.layout-with-sidebar{flex-direction:column;padding:10px}.site-sidebar{display:none}}</style>';

const ARCHIVE_FIX_LINK = '<link rel="stylesheet" href="/archive-fix.css" id="archive-fix-css">';

const MOBILE_MENU_CSS = '<style id="mobile-menu-style">.mobile-menu-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9998}.mobile-menu-overlay.active{display:block}.mobile-menu{position:fixed;top:0;left:-280px;width:280px;height:100%;background:#fff;z-index:9999;overflow-y:auto;transition:left 0.3s ease;box-shadow:2px 0 10px rgba(0,0,0,0.2)}.mobile-menu.active{left:0}.mobile-menu-header{background:#00681f;color:#fff;padding:16px}.mobile-menu-close{background:none;border:none;color:#fff;font-size:28px;cursor:pointer}.mobile-menu .widget{padding:16px;border-bottom:1px solid #e0e0e0}.mobile-menu .widget h3{margin:0 0 12px;font-size:14px;color:#00681f}.mobile-menu .widget a{display:block;color:#333;text-decoration:none;padding:10px 0}.humburger{cursor:pointer}@media(min-width:769px){.mobile-menu-overlay,.mobile-menu{display:none!important}}</style>';
const MOBILE_MENU_HTML = '<div class="mobile-menu-overlay"></div><div class="mobile-menu"><div class="mobile-menu-header"><h3>Меню</h3><button class="mobile-menu-close">&times;</button></div><div class="widget"><h3>Разделы сайта</h3><a href="/">Главная</a><a href="/page/2/">Лента записей</a><a href="/download/">Проверка файла на вирусы</a><a href="/register/">Регистрация</a></div><div class="widget"><h3>Категории</h3>' + SIDEBAR_CATEGORIES_HTML + '</div></div>';
const MOBILE_MENU_JS = '<script id="mobile-menu-js">(function(){var h=document.querySelector(".humburger,.js-humburger"),m=document.querySelector(".mobile-menu"),o=document.querySelector(".mobile-menu-overlay"),c=document.querySelector(".mobile-menu-close");function open(){m.classList.add("active");o.classList.add("active");document.body.style.overflow="hidden"}function close(){m.classList.remove("active");o.classList.remove("active");document.body.style.overflow=""}if(h)h.addEventListener("click",open);if(o)o.addEventListener("click",close);if(c)c.addEventListener("click",close)})();</script>';

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'terminals'].includes(file)) {
        walkDir(filepath, callback);
      }
    } else if (file.endsWith('.html')) {
      callback(filepath);
    }
  }
}

let processed = 0;
let modified = 0;

walkDir(ROOT, (filepath) => {
  processed++;
  let content = fs.readFileSync(filepath, 'utf8');
  let changed = false;

  const hasPostCards = content.includes('post-cards') || content.includes('post-card');
  const hasLayoutSidebar = content.includes('layout-with-sidebar');
  const hasArchiveFix = content.includes('archive-fix-css');
  const hasContent = content.includes('id="content"') && content.includes('site-content');

  // 1. Add archive-fix.css for pages with post-cards
  if (hasPostCards && !hasArchiveFix) {
    content = content.replace(/<\/head\s*>/i, ARCHIVE_FIX_LINK + '\n  </head>');
    changed = true;
  }

  // 2. Add layout-with-sidebar + sidebar for archive/category/search pages
  if (hasContent && !hasLayoutSidebar && (content.includes('content-area') || content.includes('site-main'))) {
    content = content.replace(
      /<div\s+id="content"\s+class="[^"]*site-content[^"]*"\s*>/i,
      '<div id="content" class="site-content fixed">\n<div class="layout-with-sidebar">\n' + SIDEBAR_HTML + '\n<div class="home-main">'
    );
    content = content.replace(
      /(<div\s+class="site-footer-container\s*")/i,
      '</div></div>\n$1'
    );
    if (!content.includes('id="layout-sidebar-style"')) {
      content = content.replace(/<\/head\s*>/i, LAYOUT_SIDEBAR_CSS + '</head>');
    }
    changed = true;
  }

  // 3. Add mobile menu for pages with humburger
  const hasHumburger = content.includes('humburger') || content.includes('js-humburger');
  const hasMobileMenu = content.includes('id="mobile-menu-style"');
  if (hasHumburger && !hasMobileMenu) {
    content = content.replace(/<\/head\s*>/i, MOBILE_MENU_CSS + '</head>');
    content = content.replace(/<\/body\s*>/i, MOBILE_MENU_HTML + MOBILE_MENU_JS + '</body>');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filepath, content, 'utf8');
    modified++;
  }
});

console.log(`Processed: ${processed} files, modified: ${modified}`);
