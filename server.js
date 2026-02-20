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
const ORIGIN = 'https://androidchity.ru';

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
const GLOBAL_NAV_HTML = '<nav class="home-nav"></nav>';
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
const LAYOUT_SIDEBAR_CSS = '<style id="layout-sidebar-style">.home-nav{background:#f0f0f0;padding:10px 20px;border-bottom:1px solid #ddd}.home-nav a{color:#333;text-decoration:none;margin-right:16px;font-size:14px}.home-nav a:hover{color:#00681f}.layout-with-sidebar{display:flex;max-width:1200px;margin:0 auto;padding:20px;gap:24px}.site-sidebar{width:220px;flex-shrink:0}.site-sidebar .widget{background:#f8f8f8;border:1px solid #e0e0e0;border-radius:8px;padding:16px;margin-bottom:20px}.site-sidebar .widget h3{margin:0 0 12px;font-size:1rem;color:#00681f;border-bottom:1px solid #ddd;padding-bottom:8px}.site-sidebar .widget a{display:block;color:#0693e3;text-decoration:none;padding:6px 0;font-size:14px}.site-sidebar .widget a:hover{color:#0073aa;text-decoration:underline}.site-sidebar .widget--categories{max-height:70vh;overflow-y:auto}.layout-with-sidebar .home-main{flex:1;min-width:0}@media(max-width:768px){.layout-with-sidebar{flex-direction:column}.site-sidebar{width:100%}}</style>';

function injectGlobalNavAndSidebar(html, urlPath) {
  if (!html || typeof html !== 'string') return html;
  let out = html;
  // Убрать пункты меню из home-nav на всех страницах — оставить только серую полоску
  out = out.replace(/<nav\s+class="home-nav"[^>]*>[\s\S]*?<\/nav>/gi, '<nav class="home-nav"></nav>');
  const isHome = urlPath === '/' || urlPath === '/index.html' || urlPath === '';
  if (isHome) return out;
  if (!out.includes('id="content"') || !out.includes('site-content')) return out;

  if (!out.includes('class="home-nav"')) {
    out = out.replace(/<div\s+class="[^"]*container[^"]*header-separator[^"]*"\s*><\/div>\s*/i, '<div class="container header-separator"></div>\n' + GLOBAL_NAV_HTML + '\n');
  }
  if (!out.includes('layout-with-sidebar')) {
    out = out.replace(/<div\s+id="content"\s+class="[^"]*site-content[^"]*"\s*>/i, '<div id="content" class="site-content fixed">\n<div class="layout-with-sidebar">\n' + SIDEBAR_HTML + '\n<div class="home-main">');
    out = out.replace(/(<div\s+class="site-footer-container\s*")/i, '</div></div>\n$1');
  }
  if (!out.includes('id="layout-sidebar-style"')) {
    out = out.replace(/\s*<\/head\s*>/i, LAYOUT_SIDEBAR_CSS + '</head>');
  }
  return out;
}

/** Подключение CSS и скрипта, чтобы карточки постов были видны на страницах категорий. */
function ensurePostCardsVisible(html) {
  if (!html || typeof html !== 'string') return html;
  if (!html.includes('post-card')) return html;
  const link = '<link rel="stylesheet" href="/archive-fix.css" id="archive-fix-css">';
  const relatedStyle = '<style id="related-posts-grid">.post-cards, .post-cards--small, .post-cards--grid, .post-cards--vertical, #related-posts .post-cards, .related-posts .post-cards { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 1rem 1.25rem !important; } @media (max-width: 1200px) { .post-cards, .post-cards--small, .post-cards--grid, .post-cards--vertical, #related-posts .post-cards, .related-posts .post-cards { grid-template-columns: repeat(3, 1fr) !important; } } @media (max-width: 768px) { .post-cards, .post-cards--small, .post-cards--grid, .post-cards--vertical, #related-posts .post-cards, .related-posts .post-cards { grid-template-columns: repeat(2, 1fr) !important; } } .post-card, .post-card--small, .post-card--grid, .post-card--related, #related-posts .post-card, .related-posts .post-card { margin: 0 !important; width: auto !important; max-width: 100% !important; }</style>';
  const script = '<script id="archive-fix-js">(function(){var c=document.querySelectorAll(".post-cards");c.forEach(function(card){card.style.setProperty("opacity","1","important");card.style.setProperty("visibility","visible","important");card.style.setProperty("display","grid","important");var cols=4;if(window.innerWidth<=1200)cols=3;if(window.innerWidth<=768)cols=2;card.style.setProperty("grid-template-columns","repeat("+cols+", 1fr)","important");card.style.setProperty("gap","1rem 1.25rem","important");[].forEach.call(card.querySelectorAll(".post-card, .w-animate"),function(el){el.style.setProperty("opacity","1","important");el.style.setProperty("visibility","visible","important");el.style.setProperty("transform","none","important");el.style.setProperty("margin","0","important");el.style.setProperty("width","auto","important");});});})();</script>';
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

      // Кэширование статики (CSS, JS, изображения, шрифты)
      if (!isHtml) {
        const cacheMaxAge = 86400; // 1 день
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', `public, max-age=${cacheMaxAge}`);
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
          body = injectGlobalNavAndSidebar(body, urlPath);
          body = ensurePostCardsVisible(body);
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
