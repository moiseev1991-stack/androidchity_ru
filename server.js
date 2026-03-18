/**
 * server.js — локальный сервер androidchity.ru
 * Раздаёт статику + инжектирует новый дизайн в каждую HTML-страницу.
 */

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const ROOT   = __dirname;
const ORIGIN = '';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.xml':  'application/xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
};

/* ══════════════════════════════════════════════════════════
   DESIGN CONSTANTS
   ══════════════════════════════════════════════════════════ */

const SEARCH_ICON_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;

const NEW_HEADER = `
<header class="site-header" id="newSiteHeader" role="banner">
  <div class="site-header__inner">
    <a href="/" class="site-logo">Android<span>Читы</span></a>
    <nav class="header-nav" aria-label="Главное меню">
      <a href="/category/novinki/" class="header-nav__link">Новинки</a>
      <a href="/category/mody/"    class="header-nav__link">Моды</a>
      <a href="/category/chity/"   class="header-nav__link">Читы</a>
      <a href="/skachat-bk/"       class="header-nav__link header-nav__link--bk">🏆 Скачать БК</a>
    </nav>
    <button class="header-burger" id="burgerBtn" aria-label="Открыть меню" aria-expanded="false" aria-controls="sidebar">
      <span class="header-burger__line"></span>
      <span class="header-burger__line"></span>
      <span class="header-burger__line"></span>
    </button>
  </div>
</header>`;

const SIDEBAR_GROUPS = [
  ['Тип', [
    ['/category/novinki/', '🆕', 'Новинки',  64],
    ['/category/mody/',    '⚙️', 'Моды',    480],
    ['/category/chity/',   '🃏', 'Читы',    210],
    ['/category/vzlomy/',  '🔓', 'Взломы',  195],
    ['/',                  '🎮', 'Все игры',1200],
    ['/category/top/',     '🔥', 'Топ',     null],
  ]],
  ['Жанры', [
    ['/category/shutery/',     '🔫', 'Шутеры',      null],
    ['/category/rolevye/',     '⚔️', 'Ролевые',     null],
    ['/category/strategii/',   '♟️', 'Стратегии',   null],
    ['/category/gonki/',       '🏎️', 'Гонки',       null],
    ['/category/golovolomki/', '🧩', 'Головоломки', null],
    ['/category/arkady/',      '👾', 'Аркады',      null],
    ['/category/anime/',       '⛩️', 'Аниме',       null],
    ['/category/zombi/',       '🧟', 'Зомби',       null],
    ['/category/simulyatory/', '🕹️', 'Симуляторы',  null],
    ['/category/ekshen/',      '💥', 'Экшен',       null],
    ['/category/horror/',      '👻', 'Хоррор',      null],
    ['/category/fentezi/',     '🧙', 'Фэнтези',     null],
    ['/category/dlya-detey/',  '👶', 'Для детей',   null],
    ['/category/dlya-vzroslyh/','🔞','Для взрослых',null],
  ]],
  ['Игры', [
    ['/category/stendoff-2/', '🎯', 'Standoff 2', null],
    ['/category/toka-boka/',  '🏠', 'Toca Boca',  null],
  ]],
  ['Приложения', [
    ['/category/fotoredaktory/', '📷', 'Фоторедакторы', null],
    ['/category/instrumenty/',   '🔧', 'Инструменты',   null],
  ]],
  ['Ещё', [
    ['/skachat-bk/', '🏆', 'Скачать БК',       null],
    ['/download/',   '🛡️', 'Проверка файлов',  null],
  ]],
];

function buildSidebarHTML(urlPath) {
  let html = `<nav class="sidebar" id="sidebar" aria-label="Категории">`
           + `<button class="sidebar__close" id="sidebarClose" aria-label="Закрыть меню">✕ Закрыть</button>`;
  for (const [title, links] of SIDEBAR_GROUPS) {
    html += `<div class="sidebar__group"><div class="sidebar__group-title">${title}</div>`;
    for (const [href, icon, label, count] of links) {
      const isActive = urlPath && (
        href !== '/' ? urlPath.startsWith(href) : (urlPath === '/' || urlPath === '/index.html')
      );
      const countHtml = count !== null && count !== undefined
        ? `<span class="sidebar__count">${count.toLocaleString('ru-RU')}</span>` : '';
      html += `<a href="${href}" class="sidebar__link${isActive ? ' active' : ''}">`
            + `<span class="sidebar__icon">${icon}</span>`
            + `<span class="sidebar__label">${label}</span>${countHtml}</a>`;
    }
    html += `</div>`;
  }
  html += `</nav>`;
  return html;
}

function buildSidebarOverlayHTML() {
  return `<div class="sidebar-overlay" id="sidebarOverlay"></div>`;
}

const NEW_FOOTER = `
<footer class="site-footer" id="newSiteFooter" role="contentinfo">
  <div class="site-footer__inner">
    <nav class="site-footer__nav" aria-label="Навигация в подвале">
      <div class="site-footer__col">
        <h4>Тип контента</h4>
        <a href="/category/novinki/">Новинки</a>
        <a href="/category/chity/">Читы</a>
        <a href="/category/vzlomy/">Взломы</a>
        <a href="/category/mody/">Моды</a>
        <a href="/category/top/">Топ игр</a>
      </div>
      <div class="site-footer__col">
        <h4>Жанры</h4>
        <a href="/category/shutery/">Шутеры</a>
        <a href="/category/gonki/">Гонки</a>
        <a href="/category/rolevye/">Ролевые</a>
        <a href="/category/strategii/">Стратегии</a>
        <a href="/category/simulyatory/">Симуляторы</a>
      </div>
      <div class="site-footer__col">
        <h4>Популярное</h4>
        <a href="/category/stendoff-2/">Standoff 2</a>
        <a href="/category/toka-boka/">Toca Boca</a>
        <a href="/category/anime/">Аниме</a>
        <a href="/category/horror/">Хоррор</a>
        <a href="/skachat-bk/">Букмекеры APK</a>
      </div>
      <div class="site-footer__col">
        <h4>Сайт</h4>
        <a href="/">Главная</a>
        <a href="/download/">Проверка файлов</a>
        <a href="/register/">Регистрация</a>
        <a href="/skachat-bk/">Скачать БК</a>
      </div>
    </nav>
    <div class="site-footer__bottom">
      <span>&copy; ${new Date().getFullYear()} AndroidЧиты — APK игры для Android бесплатно</span>
    </div>
  </div>
</footer>`;

const HERO_HTML = `
<section class="hero" aria-label="Поиск игр">
  <div class="hero__inner">
    <h1 class="hero__title">APK-игры, моды и читы<br><span>для Android</span> — бесплатно</h1>
    <p class="hero__subtitle">Тысячи проверенных файлов: моды с безлимитными ресурсами, читы без бана, взломы популярных игр.</p>
    <form class="hero__search" action="/search/" method="get" role="search">
      <span class="hero__search-icon">${SEARCH_ICON_SVG}</span>
      <input type="search" name="q" class="hero__search-input" id="heroSearchInput" placeholder="Найти игру, мод, чит..." autocomplete="off" aria-label="Поиск по сайту">
      <button type="submit" class="hero__search-btn">Найти</button>
    </form>
    <div class="hero__tags">
      <a href="/category/stendoff-2/" class="hero__tag">🔥 Standoff 2</a>
      <a href="/category/toka-boka/"  class="hero__tag">🏠 Toca Boca</a>
      <a href="/category/mody/"       class="hero__tag">⚙️ Моды</a>
      <a href="/category/chity/"      class="hero__tag">🃏 Читы</a>
      <a href="/category/rolevye/"    class="hero__tag">⚔️ Ролевые</a>
      <a href="/category/gonki/"      class="hero__tag">🏎️ Гонки</a>
      <a href="/category/zombi/"      class="hero__tag">🧟 Зомби</a>
    </div>
  </div>
</section>`;

/* CSS-инъекция в <head> */
const NEW_CSS_HEAD = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800&family=Manrope:wght@400;500;600&display=swap">
<link rel="stylesheet" media="print" onload="this.media='all'" href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800&family=Manrope:wght@400;500;600&display=swap">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800&family=Manrope:wght@400;500;600&display=swap"></noscript>
<link rel="stylesheet" href="/assets/css/base.css">
<link rel="stylesheet" href="/assets/css/layout.css">
<link rel="stylesheet" href="/assets/css/components.css">
<link rel="stylesheet" href="/assets/css/hero.css">
<link rel="stylesheet" href="/assets/css/responsive.css">
<style id="new-design-kill">
/* ── Убиваем старые WP-элементы ─────────────────────────── */
header#masthead,
header.site-header:not(#newSiteHeader),
.site-header:not(#newSiteHeader) { display:none!important; }
aside.site-sidebar,.site-sidebar { display:none!important; }
nav.home-nav,.home-nav { display:none!important; }
footer#colophon,.site-footer-container,
#global-footer,.global-footer,
footer.site-footer:not(#newSiteFooter) { display:none!important; }
.mobile-menu-overlay,
.mobile-menu,
.mobile-overlay,
.mobile-menu__body,
.mobile-menu__header { display:none!important; }
/* Reset WP containers */
body{background:var(--color-bg-page)!important;margin:0!important;padding:0!important;}
#page{background:transparent!important;margin:0!important;padding:0!important;max-width:100%!important;}
.site-content,#content{margin:0!important;padding:0!important;max-width:100%!important;background:transparent!important;}
.wrap{max-width:100%!important;margin:0!important;padding:0!important;}
.layout-with-sidebar{display:contents!important;padding:0!important;gap:0!important;}
.home-main{padding:0!important;margin:0!important;}
/* Kill WP animations that hide cards */
.w-animate,[data-animate-style]{opacity:1!important;visibility:visible!important;transform:none!important;animation:none!important;}
/* ── Совместимость: старые WP-классы → новый дизайн ─────── */
.post-cards,.post-cards--small,.post-cards--grid,.post-cards--vertical{
  display:grid!important;
  grid-template-columns:repeat(auto-fill,minmax(150px,1fr))!important;
  gap:14px!important;
}
@media(max-width:768px){
  .post-cards,.post-cards--small,.post-cards--grid,.post-cards--vertical{
    grid-template-columns:repeat(2,1fr)!important;
    gap:10px!important;
  }
}
.post-card,.post-card--small,.post-card--grid,.post-card--related{
  background:var(--color-bg-surface)!important;
  border:1px solid var(--color-border)!important;
  border-radius:var(--radius-lg)!important;
  overflow:hidden!important;
  transition:transform .18s ease,box-shadow .18s ease!important;
  margin:0!important;width:auto!important;
  position:relative!important;z-index:0!important;
}
.post-card:hover{transform:translateY(-3px)!important;box-shadow:var(--shadow-card)!important;}
.post-card__thumbnail a,.post-card__thumbnail{display:block!important;}
.post-card__thumbnail img{width:100%!important;aspect-ratio:1/1!important;object-fit:cover!important;display:block!important;}
.post-card__body{padding:10px!important;}
.post-card__title{font-size:13px!important;font-weight:600!important;line-height:1.35!important;
  display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important;
  color:var(--color-text-primary)!important;}
.post-card__title a{color:inherit!important;text-decoration:none!important;}
.post-card__category{font-size:11px!important;color:var(--color-text-muted)!important;display:block!important;margin-top:4px!important;}
.home-section{margin-bottom:32px!important;}
.home-section__head{display:flex!important;align-items:center!important;gap:10px!important;margin-bottom:14px!important;}
.home-section__head h2{flex:1!important;font-family:var(--font-display)!important;font-size:17px!important;font-weight:800!important;}
.scroll-nav{display:flex!important;gap:6px!important;}
.scroll-nav__btn{width:28px!important;height:28px!important;border-radius:var(--radius-sm)!important;
  border:1px solid var(--color-border)!important;background:var(--color-bg-surface)!important;
  font-size:14px!important;display:flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;}
.scroll-row{display:flex!important;gap:10px!important;overflow-x:auto!important;scrollbar-width:none!important;padding-bottom:4px!important;}
.scroll-row::-webkit-scrollbar{display:none!important;}
.scroll-card{display:flex!important;flex-direction:column!important;align-items:center!important;gap:6px!important;
  padding:14px 16px!important;background:var(--color-bg-surface)!important;border:1px solid var(--color-border)!important;
  border-radius:var(--radius-lg)!important;min-width:80px!important;text-align:center!important;
  transition:transform .18s,box-shadow .18s!important;text-decoration:none!important;}
.scroll-card:hover{transform:translateY(-2px)!important;box-shadow:var(--shadow-card)!important;}
.scroll-card--bk{background:linear-gradient(135deg,#1e3a5f,#2563eb)!important;color:#fff!important;border-color:transparent!important;}
.scroll-card__icon{font-size:24px!important;}
.scroll-card__label{font-size:11px!important;font-weight:600!important;color:var(--color-text-secondary)!important;white-space:nowrap!important;}
.scroll-card--bk .scroll-card__label{color:#fff!important;}
.categories-grid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(130px,1fr))!important;gap:10px!important;}
.category-card{display:flex!important;align-items:center!important;justify-content:center!important;
  padding:10px 12px!important;background:var(--color-bg-surface)!important;border:1px solid var(--color-border)!important;
  border-radius:var(--radius-md)!important;font-size:13px!important;font-weight:600!important;
  color:var(--color-text-primary)!important;text-align:center!important;text-decoration:none!important;
  transition:background .18s,color .18s,border-color .18s!important;}
.category-card:hover{background:var(--color-primary-light)!important;color:var(--color-primary)!important;border-color:var(--color-primary)!important;}
.category-card--bk{background:linear-gradient(135deg,#1e3a5f,#2563eb)!important;color:#fff!important;border-color:transparent!important;}
.bk-promo-banner{display:flex!important;align-items:center!important;gap:16px!important;
  background:linear-gradient(135deg,#0f172a,#1e3a5f)!important;border-radius:var(--radius-lg)!important;
  padding:18px 20px!important;margin:24px 0!important;color:#fff!important;}
.bk-promo-banner__content{flex:1!important;}
.bk-promo-banner__badge{display:inline-block!important;padding:2px 8px!important;background:rgba(255,255,255,.15)!important;
  border-radius:var(--radius-xl)!important;font-size:11px!important;font-weight:600!important;margin-bottom:6px!important;}
.bk-promo-banner__title{font-family:var(--font-display)!important;font-size:18px!important;font-weight:800!important;}
.bk-promo-banner__text{font-size:13px!important;color:rgba(255,255,255,.75)!important;margin-top:4px!important;}
.bk-promo-banner__btn{display:inline-flex!important;align-items:center!important;padding:9px 18px!important;
  background:var(--color-primary)!important;color:#fff!important;border-radius:var(--radius-xl)!important;
  font-size:13px!important;font-weight:700!important;white-space:nowrap!important;flex-shrink:0!important;text-decoration:none!important;}
.bk-promo-banner__btn:hover{background:var(--color-primary-dark)!important;}
.bk-promo-banner__icons{font-size:48px!important;flex-shrink:0!important;}
/* Old home-page-h1 */
.home-page-h1{font-family:var(--font-display)!important;font-size:20px!important;font-weight:800!important;margin-bottom:20px!important;color:var(--color-text-primary)!important;}
/* WP entry content */
.entry-content,.entry-content-wrap{max-width:720px!important;font-size:14px!important;line-height:1.7!important;}
.entry-content p{margin-bottom:12px!important;}
.entry-content ul{list-style:disc!important;padding-left:20px!important;margin-bottom:12px!important;}
.entry-content ol{list-style:decimal!important;padding-left:20px!important;margin-bottom:12px!important;}
.entry-content li{margin-bottom:6px!important;}
.entry-content h2{font-size:16px!important;margin:20px 0 8px!important;}
/* Related posts section */
#related-posts,.related-posts{margin-top:32px!important;}
#related-posts .post-cards,.related-posts .post-cards{margin-top:14px!important;}
/* Sidebar overlay hidden by default */
.sidebar-overlay{display:none;}
/* WP виджеты «Разделы сайта» и «Категории» — стили ссылок-пилюль */
.widget{margin:20px 0!important;padding:14px 16px!important;background:#f8f7f4!important;border:1px solid #e8e6e0!important;border-radius:10px!important;}
.widget h3{font-size:11px!important;font-weight:700!important;text-transform:uppercase!important;letter-spacing:.8px!important;color:#999!important;margin:0 0 10px!important;padding:0!important;border:none!important;}
.widget a{display:inline-block!important;margin:3px 5px 3px 0!important;padding:5px 12px!important;background:#fff!important;border:1px solid #e2e0db!important;border-radius:20px!important;font-size:12.5px!important;color:#2563eb!important;text-decoration:none!important;transition:background .15s,border-color .15s!important;}
.widget a:hover{background:#eff6ff!important;border-color:#2563eb!important;}
</style>`;

const JS_INJECT = `
<script src="/assets/js/ui.js" defer></script>
<script src="/assets/js/search.js" defer></script>`;

/* ══════════════════════════════════════════════════════════
   TRANSFORM FUNCTIONS
   ══════════════════════════════════════════════════════════ */

function replaceHost(html, host) {
  return html
    .replace(/https:\/\/androidchity\.ru/g, `http://${host}`)
    .replace(/http:\/\/androidchity\.ru/g, `http://${host}`);
}

function blockPushNotifications(html) {
  if (html.includes('id="block-push"')) return html;
  const s = '<script id="block-push">(function(){if("Notification"in window){Notification.requestPermission=function(){return Promise.resolve("denied");};}})();<\/script>';
  return html.replace(/<head\s*>/i, '<head>' + s);
}

/** Чистим старый CSS из <head> и добавляем новый */
function processHead(html) {
  if (html.includes('id="new-design-kill"')) return html;
  let out = html;
  // Убиваем старые stylesheet-ссылки WP / design.css / archive-fix
  out = out.replace(/<link[^>]+rel=["']stylesheet["'][^>]*wp-content[^>]+>/gi, '');
  out = out.replace(/<link[^>]+rel=["']stylesheet["'][^>]*(?:design|archive-fix|main\.min)\.css[^>]+>/gi, '');
  // Убиваем старые Google Fonts WP-темы
  out = out.replace(/<link[^>]+fonts\.googleapis\.com[^>]+>/gi, '');
  // Убиваем старые инлайн-стили от предыдущих инъекций
  out = out.replace(/<style id="layout-sidebar-style-v2"[^>]*>[\s\S]*?<\/style>/gi, '');
  out = out.replace(/<style id="design-critical"[^>]*>[\s\S]*?<\/style>/gi, '');
  out = out.replace(/<style id="mobile-menu-style"[^>]*>[\s\S]*?<\/style>/gi, '');
  out = out.replace(/<style id="related-posts-grid"[^>]*>[\s\S]*?<\/style>/gi, '');
  // Инжектируем новые CSS
  out = out.replace(/(<\/head\s*>)/i, NEW_CSS_HEAD + '$1');
  return out;
}

/** Перестраиваем layout: новый хедер, сайдбар, футер, overlay */
function processLayout(html, urlPath) {
  if (html.includes('id="newSiteHeader"')) return html;

  const isHome = urlPath === '/' || urlPath === '/index.html' || urlPath === '';
  const sidebar = buildSidebarHTML(urlPath);
  const sidebarOverlay = buildSidebarOverlayHTML();

  // Убираем старые header/footer/nav инъекции из body
  let out = html;

  // Старый injected footer
  out = out.replace(/<footer[^>]*id="global-footer"[^>]*>[\s\S]*?<\/footer>/gi, '');
  // Убираем старый mobile overlay (пустой div)
  out = out.replace(/<div[^>]*(?:class="mobile-overlay"|id="mobileOverlay")[^>]*><\/div>\s*/gi, '');
  // Убираем mobile-menu__body с сайдбаром внутри (сирота от неполного reset)
  out = out.replace(/<div[^>]*class="[^"]*mobile-menu__body[^"]*"[^>]*>[\s\S]*?<\/nav>\s*<\/div>\s*/gi, '');
  // Убираем полный mobile-menu (если остался целым)
  out = out.replace(/<div[^>]*(?:class="[^"]*mobile-menu[^"]*"|id="mobileMenu")[^>]*>[\s\S]*?<\/nav>\s*<\/div>\s*<\/div>\s*/gi, '');
  // Убираем mobile-menu-overlay (альтернативный class)
  out = out.replace(/<div[^>]*class="[^"]*mobile-menu-overlay[^"]*"[^>]*><\/div>\s*/gi, '');
  // Старый injected mobile-menu-js
  out = out.replace(/<script id="mobile-menu-js">[\s\S]*?<\/script>/gi, '');
  // archive-fix js
  out = out.replace(/<script id="archive-fix-js">[\s\S]*?<\/script>/gi, '');
  // Старый injected lws closing divs
  out = out.replace(/(<\/main>)?<\/div><\/div><\/div><\/div><\/div><\/div><\/div><!-- \/lws -->/g, '');

  // Удаляем блок «Популярные разделы» (горизонтальный скролл с иконками)
  out = out.replace(/<section(?:(?!<section|<\/section>)[\s\S])*?js-scroll-row(?:(?!<\/section>)[\s\S])*?<\/section>/gi, '');
  // Удаляем блок «Популярные категории» (сетка кнопок-пилюль)
  out = out.replace(/<section(?:(?!<section|<\/section>)[\s\S])*?categories-grid(?:(?!<\/section>)[\s\S])*?<\/section>/gi, '');
  // Удаляем старый WP сайдбар-виджет обёрнутый в <aside>
  out = out.replace(/<aside[^>]*class="[^"]*site-sidebar[^"]*"[^>]*>[\s\S]*?<\/aside>/gi, '');

  const hero = isHome ? HERO_HTML : '';

  // Вставляем новый header сразу после <body>
  const layoutOpen = `
<div class="layout">
  ${sidebar}
  <div class="main" id="main-content">`;
  const layoutClose = `  </div><!-- /main -->
</div><!-- /layout -->`;

  out = out.replace(/(<body[^>]*>)/i,
    `$1\n${NEW_HEADER}\n${hero}\n${layoutOpen}`);

  // Закрываем layout перед </body>
  out = out.replace(/(<\/body\s*>)/i,
    `\n${layoutClose}\n${NEW_FOOTER}\n${sidebarOverlay}\n${JS_INJECT}\n$1`);

  return out;
}

/** lazy loading + убираем лишний preload логотипа */
function processImages(html) {
  let out = html;
  // Убираем старый preload логотипа
  out = out.replace(/<link[^>]*rel="preload"[^>]*as="image"[^>]*remove-bg[^>]*>/gi, '');
  // Замена старых CSS в тегах link (cache/minify)
  out = out.replace(/\/wp-content\/cache\/minify\/[a-z0-9]+\.css/gi, '/assets/css/main.min.css');
  // lazy loading для img без него (кроме первой картинки поста)
  let firstImg = true;
  out = out.replace(/<img\b([^>]*)>/gi, (match, attrs) => {
    if (firstImg) { firstImg = false; return match; }
    if (/loading=/i.test(attrs)) return match;
    return `<img${attrs} loading="lazy">`;
  });
  return out;
}

/* ══════════════════════════════════════════════════════════
   PROXY (отсутствующие изображения с оригинала)
   ══════════════════════════════════════════════════════════ */

function proxyFromOrigin(urlPath, res, sendError) {
  const url = ORIGIN + (urlPath.startsWith('/') ? urlPath : '/' + urlPath);
  const ext = path.extname(urlPath.split('?')[0]);
  https.get(url, { timeout: 15000 }, (proxyRes) => {
    if (proxyRes.statusCode === 200) {
      res.writeHead(200, { 'Content-Type': MIME[ext] || proxyRes.headers['content-type'] || 'application/octet-stream' });
      proxyRes.pipe(res);
    } else if (proxyRes.statusCode === 301 || proxyRes.statusCode === 302) {
      res.writeHead(proxyRes.statusCode, { Location: proxyRes.headers.location });
      res.end();
    } else {
      sendError(proxyRes.statusCode || 404, 'Not found');
    }
  }).on('error', () => sendError(502, 'Proxy error'));
}

/* ══════════════════════════════════════════════════════════
   REQUEST HANDLER
   ══════════════════════════════════════════════════════════ */

function createHandler(port) {
  return (req, res) => {
    const sendError = (code, msg) => {
      if (res.headersSent) return;
      res.statusCode = code;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(msg || 'Error');
    };

    let urlPath;
    try {
      urlPath = decodeURIComponent(req.url || '').split('?')[0];
    } catch {
      sendError(400, '<h1>Bad Request</h1>');
      return;
    }

    if (urlPath === '/ping' || urlPath === '/ok') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('OK');
      return;
    }

    const normalizedPath = urlPath === '/' || urlPath === '' ? '/index.html' : urlPath;
    const safePath = path.normalize(normalizedPath).replace(/^[/\\]+/, '').replace(/\\/g, '/').replace(/\/+$/, '') || 'index.html';
    const filePath = path.resolve(ROOT, safePath.split('/').join(path.sep));

    if (!filePath.startsWith(path.resolve(ROOT))) {
      sendError(403, 'Forbidden');
      return;
    }

    function serveHTML(fp) {
      fs.readFile(fp, 'utf8', (err, data) => {
        if (err) { sendError(500, 'Error reading file'); return; }
        try {
          const host = req.headers.host || `localhost:${port}`;
          let body = replaceHost(data, host);
          body = blockPushNotifications(body);
          body = processHead(body);
          body = processLayout(body, urlPath);
          body = processImages(body);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(body);
        } catch (e) {
          console.error('Transform error:', e.message);
          sendError(500, 'Server error');
        }
      });
    }

    function serveFile(fp) {
      const ext = path.extname(fp);
      if (ext === '.html') { serveHTML(fp); return; }
      const isCssJs = ext === '.css' || ext === '.js';
      res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
      res.setHeader('Cache-Control', isCssJs ? 'no-cache, no-store, must-revalidate' : 'public, max-age=86400');
      const stream = fs.createReadStream(fp);
      stream.on('error', () => sendError(500, 'Error reading file'));
      stream.pipe(res);
    }

    fs.stat(filePath, (err, stat) => {
      if (!err && stat.isFile()) { serveFile(filePath); return; }

      if (!err && stat.isDirectory()) {
        const indexPath = path.join(filePath, 'index.html');
        if (fs.existsSync(indexPath)) { serveFile(indexPath); return; }
      }

      // Не нашли файл
      if (safePath.startsWith('wp-content/uploads/')) {
        proxyFromOrigin(urlPath, res, sendError);
        return;
      }

      // Fallback для пагинации категорий /category/X/page/N/
      const parts = safePath.split('/').filter(Boolean);
      if (parts[0] === 'category' && parts[1] && parts[2] === 'page') {
        const fallback = path.resolve(ROOT, 'category', parts[1], 'index.html');
        if (fs.existsSync(fallback)) { serveFile(fallback); return; }
      }

      const e404 = path.join(ROOT, '404.html');
      if (fs.existsSync(e404)) { serveFile(e404); return; }
      sendError(404, '<!DOCTYPE html><html lang="ru"><body><h1>404</h1><p><a href="/">На главную</a></p></body></html>');
    });
  };
}

/* ══════════════════════════════════════════════════════════
   START
   ══════════════════════════════════════════════════════════ */

function tryListen(port) {
  const server = http.createServer(createHandler(port));
  server.listen(port, '0.0.0.0', () => {
    console.log(`Сервер: http://127.0.0.1:${port}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Порт ${port} занят, пробуем ${port + 1}…`);
      tryListen(port + 1);
    } else throw err;
  });
}

if (require.main === module) {
  tryListen(parseInt(process.env.PORT, 10) || 8080);
}

module.exports = { processHead, processLayout, processImages, blockPushNotifications, buildSidebarHTML };
