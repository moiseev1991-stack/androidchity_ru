/**
 * Локальный HTTP-сервер для восстановленного сайта androidchity.ru
 * - Раздаёт статику из текущей папки
 * - Для HTML подменяет androidchity.ru на текущий хост (чтобы ссылки/стили работали локально)
 * - Главная / отдаёт index.html
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const ORIGIN = '';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function replaceHost(html, host) {
  if (!html || typeof html !== 'string') return html;
  return html
    .replace(/https:\/\/androidchity\.ru/g, `http://${host}`)
    .replace(/http:\/\/androidchity\.ru/g, `http://${host}`);
}

/** Блокировка push-уведомлений — отключает запрос разрешения в браузере. */
function blockPushNotifications(html) {
  if (!html || typeof html !== 'string') return html;
  const script = '<script id="block-push">(function(){if("Notification"in window){Notification.requestPermission=function(){return Promise.resolve("denied");};}if("serviceWorker"in navigator&&"getRegistration"in navigator.serviceWorker){var g=navigator.serviceWorker.getRegistration.bind(navigator.serviceWorker);navigator.serviceWorker.getRegistration=function(){return g().then(function(r){return null;});};}})();</script>';
  if (html.includes('id="block-push"')) return html;
  return html.replace(/<head\s*>/i, '<head>' + script);
}

/** Проксирование отсутствующих изображений с оригинального сайта. */
function proxyFromOrigin(urlPath, res, sendError) {
  const url = ORIGIN + (urlPath.startsWith('/') ? urlPath : '/' + urlPath);
  const ext = path.extname(urlPath.split('?')[0]);
  https.get(url, { timeout: 15000 }, (proxyRes) => {
    if (proxyRes.statusCode === 200) {
      res.writeHead(200, {
        'Content-Type': MIME[ext] || proxyRes.headers['content-type'] || 'application/octet-stream'
      });
      proxyRes.pipe(res);
    } else if (proxyRes.statusCode === 301 || proxyRes.statusCode === 302) {
      res.writeHead(proxyRes.statusCode, { Location: proxyRes.headers.location });
      res.end();
    } else {
      sendError(proxyRes.statusCode || 404, 'Not found');
    }
  }).on('error', () => sendError(502, 'Proxy error'));
}

/** Верхнее меню и левый сайдбар (Разделы сайта + Категории) на всех страницах кроме главной. */
const GLOBAL_NAV_HTML = '<nav class="home-nav"><a href="/">Главная</a><a href="/skachat-bk/" class="nav-bk">🏆 Скачать БК</a><a href="/category/novinki/">Новинки</a><a href="/category/top/">Топ</a><a href="/category/mody/">Моды</a><a href="/category/chity/">Читы</a><a href="/category/vzlomy/">Взломы</a><a href="/category/rolevye/">Ролевые</a><a href="/category/gonki/">Гонки</a><a href="/page/2/">Все записи</a></nav>';
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
const SIDEBAR_HTML = '<aside class="site-sidebar"><div class="widget"><h3>Разделы сайта</h3><a href="/">Главная</a><a href="/page/2/">Лента записей</a><a href="/skachat-bk/" class="sidebar-bk-link">🏆 Скачать БК</a><a href="/download/">Проверка файлов</a><a href="/register/">Регистрация</a></div><div class="widget widget--categories"><h3>Категории</h3>' + SIDEBAR_CATEGORIES_HTML + '</div></aside>';
const LAYOUT_SIDEBAR_CSS = '<style id="layout-sidebar-style-v2">*,*::before,*::after{box-sizing:border-box}body{font-family:\'Inter\',-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif!important;background:#f4f6f9;color:#1e293b;-webkit-font-smoothing:antialiased}#masthead.site-header,#masthead.site-header.fixed,.site-header,.site-header.fixed{background:linear-gradient(135deg,#004e18 0%,#1a8c3d 100%)!important;box-shadow:0 2px 16px rgba(0,0,0,.22)!important;position:sticky!important;top:0!important;z-index:100!important}.site-header-inner.fixed{max-width:1240px;margin:0 auto;padding:0 24px;min-height:64px}.site-title,.site-title a,div.site-title,div.site-title a{color:#fff!important;font-size:1.25rem!important;font-weight:700!important;text-decoration:none!important}.site-description{color:rgba(255,255,255,.80)!important;font-size:.78rem!important;text-transform:uppercase;font-weight:500!important;letter-spacing:.04em}.site-header a,.site-header .site-branding a{color:#fff!important}.site-logotype img{border-radius:6px}.humburger span{background:#fff!important}.home-nav,nav.home-nav{background:#fff!important;border-bottom:1px solid #e2e8f0!important;padding:0 24px!important;display:flex!important;align-items:center;gap:0;overflow-x:auto;scrollbar-width:none}.home-nav a{font-size:.875rem!important;font-weight:500!important;color:#64748b!important;text-decoration:none!important;padding:10px 14px!important;border-bottom:2px solid transparent;white-space:nowrap}.home-nav a:hover,.home-nav a.active{color:#1a8c3d!important;border-bottom-color:#1a8c3d}.layout-with-sidebar{display:flex!important;width:100%!important;max-width:100%!important;margin:0!important;padding:24px 0!important;gap:32px!important;align-items:flex-start}.layout-with-sidebar .home-main,.layout-with-sidebar #main,.layout-with-sidebar .site-main{flex:1!important;min-width:0!important}.site-sidebar{width:232px!important;flex-shrink:0}.site-sidebar .widget{background:#fff!important;border:1px solid #e2e8f0!important;border-radius:16px!important;padding:16px!important;margin-bottom:16px!important;box-shadow:0 1px 4px rgba(0,0,0,.07)}.site-sidebar .widget h3{font-size:.7rem!important;font-weight:700!important;text-transform:uppercase!important;letter-spacing:.07em!important;color:#64748b!important;border-bottom:1px solid #e2e8f0!important;padding-bottom:8px!important;margin:0 0 8px!important}.site-sidebar .widget a{display:block!important;color:#1e293b!important;text-decoration:none!important;font-size:.875rem!important;padding:7px 8px!important;border-radius:6px!important;transition:background .18s ease,color .18s ease!important}.site-sidebar .widget a:hover{background:#e7f5ed!important;color:#00681f!important;text-decoration:none!important}.site-sidebar .widget--categories{max-height:70vh;overflow-y:auto;scrollbar-width:thin}@media(max-width:768px){.layout-with-sidebar{flex-direction:column!important;padding:16px!important}.site-sidebar{display:none!important}}</style>';

/** Mobile menu CSS, HTML and JS */
const MOBILE_MENU_CSS = '<style id="mobile-menu-style">.mobile-menu-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9998}.mobile-menu-overlay.active{display:block}.mobile-menu{position:fixed;top:0;left:-280px;width:280px;height:100%;background:#fff;z-index:9999;overflow-y:auto;transition:left 0.3s ease;box-shadow:2px 0 10px rgba(0,0,0,0.2)}.mobile-menu.active{left:0}.mobile-menu-header{background:#00681f;color:#fff;padding:16px;display:flex;justify-content:space-between;align-items:center}.mobile-menu-header h3{margin:0;font-size:18px}.mobile-menu-close{background:none;border:none;color:#fff;font-size:28px;cursor:pointer;padding:0;line-height:1}.mobile-menu .widget{padding:16px;border-bottom:1px solid #e0e0e0}.mobile-menu .widget h3{margin:0 0 12px;font-size:14px;color:#00681f;text-transform:uppercase;font-weight:bold}.mobile-menu .widget a{display:block;color:#333;text-decoration:none;padding:10px 0;font-size:15px;border-bottom:1px solid #f0f0f0}.mobile-menu .widget a:last-child{border-bottom:none}.mobile-menu .widget a:hover{color:#00681f}.humburger{cursor:pointer}</style>';

const MOBILE_MENU_HTML = `<div class="mobile-menu-overlay"></div>
<div class="mobile-menu">
<div class="mobile-menu-header"><h3>Меню</h3><button class="mobile-menu-close">&times;</button></div>
<div class="widget"><h3>Разделы сайта</h3><a href="/">Главная</a><a href="/page/2/">Лента записей</a><a href="/skachat-bk/" class="sidebar-bk-link">🏆 Скачать БК</a><a href="/download/">Проверка файлов</a><a href="/register/">Регистрация</a></div>
<div class="widget"><h3>Категории</h3>${SIDEBAR_CATEGORIES.map(([slug, name]) => '<a href="/category/' + slug + '/">' + name + '</a>').join('')}</div>
</div>`;

const MOBILE_MENU_JS = '<script id="mobile-menu-js">(function(){var h=document.querySelector(".humburger,.js-humburger"),m=document.querySelector(".mobile-menu"),o=document.querySelector(".mobile-menu-overlay"),c=document.querySelector(".mobile-menu-close");function open(){m.classList.add("active");o.classList.add("active");document.body.style.overflow="hidden"}function close(){m.classList.remove("active");o.classList.remove("active");document.body.style.overflow=""}if(h)h.addEventListener("click",open);if(o)o.addEventListener("click",close);if(c)c.addEventListener("click",close)})();</script>';

/** Inject mobile menu into HTML */
function injectMobileMenu(html) {
  if (!html || typeof html !== 'string') return html;
  if (html.includes('id="mobile-menu-style"')) return html;
  let out = html;
  out = out.replace(/<\/head\s*>/i, MOBILE_MENU_CSS + '</head>');
  out = out.replace(/<\/body\s*>/i, MOBILE_MENU_HTML + MOBILE_MENU_JS + '</body>');
  return out;
}

/** Optimize images: add decoding="async", preload hero */
function optimizeImages(html) {
  if (!html || typeof html !== 'string') return html;
  let out = html;
  // Add preload for logo if not present
  if (!out.includes('rel="preload" as="image"')) {
    out = out.replace(/<\/title>/i, '</title>\n<link rel="preload" as="image" href="/wp-content/uploads/2023/11/remove-bg.ai_1701256636548.png">');
  }
  // Replace wp-content/cache/minify CSS with assets
  out = out.replace(/\/wp-content\/cache\/minify\/[a-z0-9]+\.css/gi, '/assets/css/main.min.css');
  // Add decoding="async" to images that don't have it
  out = out.replace(/<img\s+([^>]*?)(?<!decoding=["'][^"']*["'])>/gi, (match, attrs) => {
    if (attrs.includes('decoding=')) return match;
    return `<img ${attrs} decoding="async">`;
  });
  return out;
}

/** Добавляет ссылку "🏆 Скачать БК" в сайдбар на всех страницах, где её нет. */
function fixSidebarBKLink(html) {
  if (!html || typeof html !== 'string') return html;
  if (html.includes('sidebar-bk-link')) return html;
  if (!html.includes('site-sidebar')) return html;
  // Вставляем после "Лента записей", перед ссылкой на /download/ или /register/
  let out = html.replace(
    /(<a href="\/page\/2\/">Лента записей<\/a>)/g,
    '$1<a href="/skachat-bk/" class="sidebar-bk-link">🏆 Скачать БК</a>'
  );
  // Также в мобильном меню, если там есть сайдбар
  return out;
}

function injectGlobalNavAndSidebar(html, urlPath) {
  if (!html || typeof html !== 'string') return html;
  let out = html;
  const isHome = urlPath === '/' || urlPath === '/index.html' || urlPath === ''
    || urlPath === '/skachat-bk/' || urlPath === '/skachat-bk/index.html';
  // На внутренних страницах полностью удаляем home-nav (он не нужен ни на одной странице кроме скрытых)
  if (!isHome) {
    out = out.replace(/<nav\s+class="home-nav[^"]*"[^>]*>[\s\S]*?<\/nav>/gi, '');
  }
  if (isHome) return out;
  if (!out.includes('id="content"') || !out.includes('site-content')) return out;
  if (!out.includes('layout-with-sidebar')) {
    out = out.replace(/<div\s+id="content"\s+class="[^"]*site-content[^"]*"\s*>/i, '<div id="content" class="site-content fixed">\n<div class="layout-with-sidebar">\n' + SIDEBAR_HTML + '\n<div class="home-main">');
    out = out.replace(/(<div\s+class="site-footer-container\s*")/i, '</div></div>\n$1');
  }
  if (!out.includes('id="layout-sidebar-style-v2"')) {
    out = out.replace(/\s*<\/head\s*>/i, LAYOUT_SIDEBAR_CSS + '</head>');
  }
  return out;
}

/** Подключает design.css и критические стили шапки на все HTML-страницы. */
function injectDesignCSS(html) {
  if (!html || typeof html !== 'string') return html;
  if (html.includes('/assets/css/design.css')) return html;
  const link = '<link rel="stylesheet" href="/assets/css/design.css">';
  const criticalStyle = '<style id="design-critical">#masthead.site-header,#masthead.site-header.fixed,.site-header,.site-header.fixed{background-color:#00681f!important;background-image:linear-gradient(135deg,#004e18 0%,#1a8c3d 100%)!important}.site-title,.site-title a{color:#fff!important}.site-description{color:rgba(255,255,255,.80)!important}.site-header a{color:#fff!important}</style>';
  return html.replace(/(\s*<\/head\s*>)/i, link + criticalStyle + '$1');
}

/** Подключение CSS и скрипта, чтобы карточки постов были видны на страницах категорий. */
function ensurePostCardsVisible(html) {
  if (!html || typeof html !== 'string') return html;
  if (!html.includes('post-card')) return html;
  const link = '<link rel="stylesheet" href="/archive-fix.css" id="archive-fix-css">';
  const relatedStyle = '<style id="related-posts-grid">.post-cards, .post-cards--small, .post-cards--grid, .post-cards--vertical, #related-posts .post-cards, .related-posts .post-cards { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 1rem 1.25rem !important; position: relative !important; z-index: 0 !important; overflow: visible !important; } @media (max-width: 768px) { .post-cards, .post-cards--small, .post-cards--grid, .post-cards--vertical, #related-posts .post-cards, .related-posts .post-cards { grid-template-columns: repeat(2, 1fr) !important; } } .post-card, .post-card--small, .post-card--grid, .post-card--related, #related-posts .post-card, .related-posts .post-card, .w-animate, [data-animate-style] { margin: 0 !important; width: auto !important; max-width: 100% !important; opacity: 1 !important; visibility: visible !important; transform: none !important; animation: none !important; position: relative !important; z-index: 1 !important; } .home-section { position: relative !important; z-index: 0 !important; isolation: isolate !important; }</style>';
  const script = '<script id="archive-fix-js">(function(){var c=document.querySelectorAll(".post-cards");c.forEach(function(card){card.style.setProperty("opacity","1","important");card.style.setProperty("visibility","visible","important");card.style.setProperty("display","grid","important");card.style.setProperty("position","relative","important");card.style.setProperty("z-index","0","important");var cols=3;if(window.innerWidth<=768)cols=2;card.style.setProperty("grid-template-columns","repeat("+cols+", 1fr)","important");card.style.setProperty("gap","1rem 1.25rem","important");[].forEach.call(card.querySelectorAll(".post-card, .w-animate, [data-animate-style]"),function(el){el.style.setProperty("opacity","1","important");el.style.setProperty("visibility","visible","important");el.style.setProperty("transform","none","important");el.style.setProperty("animation","none","important");el.style.setProperty("margin","0","important");el.style.setProperty("width","auto","important");el.style.setProperty("position","relative","important");el.style.setProperty("z-index","1","important");});});document.querySelectorAll(".home-section").forEach(function(s){s.style.setProperty("position","relative","important");s.style.setProperty("z-index","0","important");});})();</script>';
  if (html.includes('id="archive-fix-css"')) {
    if (!html.includes('id="related-posts-grid"')) {
      return html.replace(/\s*<\/head\s*>/i, relatedStyle + '</head>');
    }
    return html;
  }
  let out = html.replace(/\s*<\/head\s*>/i, link + relatedStyle + '</head>');
  if (!out.includes('id="archive-fix-js"')) out = out.replace(/\s*<\/body\s*>/i, script + '</body>');
  return out;
}

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
    } catch (e) {
      sendError(400, '<h1>Bad Request</h1>');
      return;
    }
    if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
    if (urlPath === '/ping' || urlPath === '/ok') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('OK');
      return;
    }
    const safePath = path.normalize(urlPath).replace(/^[/\\]+/, '').replace(/\\/g, '/').replace(/\/+$/, '') || 'index.html';
    const filePath = path.resolve(ROOT, safePath.split('/').join(path.sep));

    const rootResolved = path.resolve(ROOT);
    if (!filePath.startsWith(rootResolved)) {
      sendError(403, 'Forbidden');
      return;
    }

    function serveFile(filePath) {
      const ext = path.extname(filePath);
      const isHtml = ext === '.html';
      const contentType = MIME[ext] || 'application/octet-stream';

      // Кэширование статики: CSS/JS не кешируем (часто меняются), изображения/шрифты — 1 день
      if (!isHtml) {
        const isCssOrJs = ext === '.css' || ext === '.js';
        const cacheMaxAge = isCssOrJs ? 0 : 86400;
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', isCssOrJs ? 'no-cache, no-store, must-revalidate' : `public, max-age=${cacheMaxAge}`);
        const stream = fs.createReadStream(filePath);
        stream.on('error', () => sendError(500, 'Error reading file'));
        stream.pipe(res);
        return;
      }

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          sendError(500, 'Error reading file');
          return;
        }
        try {
          const host = req.headers.host || `localhost:${port}`;
          let body = replaceHost(data, host);
          body = blockPushNotifications(body);
          body = injectDesignCSS(body);
          body = injectGlobalNavAndSidebar(body, urlPath);
          body = fixSidebarBKLink(body);
          body = ensurePostCardsVisible(body);
          body = injectMobileMenu(body);
          body = optimizeImages(body);
          res.setHeader('Content-Type', contentType);
          res.end(body);
        } catch (e) {
          sendError(500, 'Server error');
        }
      });
    }

    fs.stat(filePath, (err, stat) => {
      if (err) {
        if (safePath.startsWith('wp-content/uploads/')) {
          proxyFromOrigin(urlPath.startsWith('/') ? urlPath : '/' + urlPath, res, sendError);
          return;
        }
        const parts = safePath.split('/').filter(Boolean);
        if (parts[0] === 'category' && parts[1] && parts[2] === 'page' && parts[3]) {
          const fallbackPath = path.resolve(ROOT, 'category', parts[1], 'index.html');
          fs.stat(fallbackPath, (errF, statF) => {
            if (!errF && statF && statF.isFile()) {
              serveFile(fallbackPath);
              return;
            }
            const error404Path = path.join(ROOT, '404.html');
            if (fs.existsSync(error404Path)) {
              serveFile(error404Path);
            } else {
              sendError(404, '<!DOCTYPE html><html><body><h1>404</h1><p>Not found</p><p><a href="/">На главную</a></p></body></html>');
            }
          });
          return;
        }
        const error404Path = path.join(ROOT, '404.html');
        if (fs.existsSync(error404Path)) {
          serveFile(error404Path);
        } else {
          sendError(404, '<!DOCTYPE html><html><body><h1>404</h1><p>Not found</p><p><a href="/">На главную</a></p></body></html>');
        }
        return;
      }
      if (stat.isFile()) {
        serveFile(filePath);
        return;
      }
      if (stat.isDirectory()) {
        const indexPath = path.join(filePath, 'index.html');
        fs.stat(indexPath, (errIndex, statIndex) => {
          if (errIndex || !statIndex.isFile()) {
            const parts = safePath.split('/').filter(Boolean);
            if (parts[0] === 'category' && parts[1] && parts[2] === 'page' && parts[3]) {
              const fallbackPath = path.resolve(ROOT, 'category', parts[1], 'index.html');
              fs.stat(fallbackPath, (errF, statF) => {
                if (!errF && statF && statF.isFile()) {
                  serveFile(fallbackPath);
                  return;
                }
                const error404Path = path.join(ROOT, '404.html');
            if (fs.existsSync(error404Path)) {
              serveFile(error404Path);
            } else {
              sendError(404, '<!DOCTYPE html><html><body><h1>404</h1><p>Not found</p><p><a href="/">На главную</a></p></body></html>');
            }
              });
              return;
            }
            const error404Path = path.join(ROOT, '404.html');
            if (fs.existsSync(error404Path)) {
              serveFile(error404Path);
            } else {
              sendError(404, '<!DOCTYPE html><html><body><h1>404</h1><p>Not found</p><p><a href="/">На главную</a></p></body></html>');
            }
            return;
          }
          serveFile(indexPath);
        });
        return;
      }
      const error404PathFinal = path.join(ROOT, '404.html');
      if (fs.existsSync(error404PathFinal)) {
        serveFile(error404PathFinal);
      } else {
        sendError(404, '<!DOCTYPE html><html><body><h1>404</h1><p>Not found</p><p><a href="/">На главную</a></p></body></html>');
      }
    });
  };
}

function tryListen(port) {
  const server = http.createServer(createHandler(port));
  server.listen(port, '0.0.0.0', () => {
    console.log('Сервер запущен: http://127.0.0.1:' + port);
    console.log('Главная: http://127.0.0.1:' + port + '/');
    console.log('Остановка: Ctrl+C');
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log('Порт ' + port + ' занят, пробуем ' + (port + 1) + '…');
      tryListen(port + 1);
    } else {
      throw err;
    }
  });
}

let port = parseInt(process.env.PORT, 10) || 8080;
tryListen(port);
