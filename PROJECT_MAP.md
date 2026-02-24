# PROJECT MAP — androidchity.ru

> Карта проекта. Обновлять при добавлении новых страниц или файлов.
> Последнее обновление: 2026-02-24

---

## Тип проекта

**Статический HTML-сайт.** Восстановлен из WordPress-архива.  
Деплой: GitHub → GitHub Pages / Plesk.  
Домен: https://androidchity.ru  
Локальный запуск: `node server.js` → http://127.0.0.1:8080

---

## Структура директорий

```
androidchity_ru/
│
├── index.html                  # Главная страница
├── sitemap.xml                 # Sitemap (1408 URL, абсолютные https://)
├── robots.txt                  # robots: Sitemap → sitemap.xml
├── 404.html                    # Страница ошибки 404
├── archive-fix.css             # Быстрый фикс стилей архивов
├── server.js                   # Локальный Node.js HTTP-сервер
├── package.json
│
├── assets/                     # ← ОСНОВНЫЕ АССЕТЫ (локальные копии)
│   ├── css/
│   │   └── main.min.css        # ← ГЛАВНЫЙ CSS всего сайта
│   └── js/
│       └── main.min.js         # ← ГЛАВНЫЙ JS всего сайта
│
├── .s/src/                     # Дополнительные/вспомогательные ассеты
│   ├── base.css                # Базовые стили (из оригинального WP-темы)
│   ├── social.css              # Стили блока соцсетей
│   ├── socCom.css              # Стили социальных комментариев
│   ├── layer7.css              # Стили layer7
│   ├── ulightbox/
│   │   ├── ulightbox.css       # Стили лайтбокса
│   │   ├── ulightbox.min.css
│   │   ├── ulightbox.js        # JS лайтбокса
│   │   └── ulightbox.min.js
│   ├── uwnd.min.js             # JS дополнительный (упоминание owl/swiper — не активен)
│   ├── socCom.js               # JS социальных комментариев
│   └── crit_image.js           # JS критических изображений
│
├── _st/
│   └── my.css                  # Доп. CSS
│
├── wp-content/
│   ├── uploads/                # Изображения и медиафайлы оригинального сайта
│   └── cache/minify/
│       ├── main.min.css        # WP-минифицированный CSS (e3f8b.css)
│       ├── 986c3.js            # WP-минифицированный JS
│       ├── e311b.js
│       ├── d52ed.js
│       └── 3c49a.js
│
├── page/                       # Пагинация главной ленты
│   ├── 2/index.html
│   ├── 3/index.html
│   ├── ...
│   └── 82/index.html
│
├── 2023/                       # Посты 2023 года
│   └── 12/
│       ├── 07/{slug}/index.html
│       ├── 08/{slug}/index.html
│       └── ...
│
├── 2024/                       # Посты 2024 года (основной массив)
│   └── 12/
│       ├── 21/{slug}/index.html
│       └── 25/{slug}/index.html
│
├── category/                   # Страницы категорий
│   ├── 18/index.html
│   ├── 2d/index.html
│   ├── 3d/index.html
│   ├── anime/index.html
│   ├── arkady/index.html
│   ├── brodilki/index.html
│   ├── chity/index.html
│   ├── dinamichnye/index.html  (+ page/2/, page/9/)
│   ├── dlya-detey/index.html
│   ├── dlya-vzroslyh/index.html (+ page/2/, page/4/)
│   ├── ekshen/index.html
│   ├── fentezi/index.html
│   ├── fotoredaktory/index.html
│   ├── golovolomki/index.html
│   ├── gonki/index.html
│   ├── hentay/index.html
│   ├── horror/index.html
│   ├── instrumenty/index.html
│   ├── kazualnye/index.html
│   ├── kraft/index.html
│   ├── mody/index.html
│   ├── multipleer/index.html
│   ├── na-planshet/index.html  (+ page/12/)
│   ├── na-russkom/index.html
│   ├── na-vyzhivanie/index.html (+ page/8/)
│   ├── novinki/index.html
│   ├── onlayn/index.html
│   ├── ot-pervogo-litsa/index.html (+ page/2/, page/4/)
│   ├── pikselnye/index.html
│   ├── pk-igry/index.html
│   ├── poleznoe/index.html
│   ├── prilozheniya/index.html
│   ├── ranery/index.html
│   ├── rolevye/index.html
│   ├── shutery/index.html
│   ├── simulyatory/index.html
│   ├── s-otkrytym-mirom/index.html
│   ├── sots-seti/index.html
│   ├── sportivnye/index.html
│   ├── s-sozdaniem-mira/index.html
│   ├── s-sozdaniem-personazha/index.html
│   ├── s-syuzhetom/index.html
│   ├── stendoff-2/index.html
│   ├── strategii/index.html
│   ├── toka-boka/index.html
│   ├── top/index.html
│   ├── vizualnye-novelly/index.html
│   ├── vzlomy/index.html       (+ page/2/, page/10/)
│   └── zombi/index.html
│
├── download/
│   └── index.html              # Страница загрузки
│
├── register/
│   ├── index.html              # Страница регистрации
│   └── register-light.css      # CSS только для страницы регистрации
│
├── cheats/
│   └── index.html              # Страница читов
│
├── cheatz/
│   └── index.html              # Страница читов (дубль)
│
├── search/                     # Страницы поиска (по сохранённым запросам)
│   └── {query}/index.html
│
├── load/                       # Страницы загрузки файлов
│   └── {slug}/index.html
│
├── index/                      # Вспомогательная папка
│
├── scripts/                    # Node.js-скрипты для обслуживания проекта
│   ├── verify-and-update-sitemap.js  # Проверка и обновление sitemap
│   ├── build-url-report.js           # Отчёт по URL (читает sitemap.xml)
│   ├── generate-sitemap.js           # Генерация sitemap из URL_REPORT.json
│   ├── inject-verification.js        # Вставка meta-тегов верификации
│   ├── bake-static-fixes.js          # Запечь правки в статику
│   ├── add-category-recommendations.js
│   ├── migrate-assets.js
│   ├── fix-*.js                      # Разные фиксеры
│   └── strip-*.js                    # Скрипты очистки WP-мусора
│
├── tools/                      # Утилиты инвентаризации
│   ├── inventory-resources.js
│   └── collect-assets.js
│
└── ops/                        # Конфиги деплоя (nginx, Plesk)
```

---

## CSS — какой файл за что отвечает

| Файл | Назначение | Подключается где |
|------|-----------|-----------------|
| `assets/css/main.min.css` | **Главный CSS всего сайта** | Все страницы (`<link>` в `<head>`) |
| `archive-fix.css` | Фикс отображения архивных страниц | Страницы архивов |
| `register/register-light.css` | Стили страницы регистрации | `register/index.html` |
| `.s/src/base.css` | Базовые стили (оригинальная WP-тема) | Подключён в `main.min.css` |
| `.s/src/social.css` | Блок соцсетей | Внутри `main.min.css` |
| `.s/src/ulightbox/ulightbox.css` | Лайтбокс для изображений | Внутри `main.min.css` |
| `_st/my.css` | Дополнительные кастомные стили | Ряд страниц |
| `wp-content/cache/minify/e3f8b.css` | Минифицированный WP CSS | Часть старых страниц |

---

## JS — какой файл за что отвечает

| Файл | Назначение |
|------|-----------|
| `assets/js/main.min.js` | **Главный JS**: jQuery, мобильное меню, навигация, sticky sidebar, лайтбокс, share-кнопки, анимации, star-rating, table-of-contents, iframe resize |
| `.s/src/uwnd.min.js` | Дополнительный JS (упоминание slider/owl — предположительно не активен) |
| `.s/src/ulightbox/ulightbox.min.js` | Лайтбокс |
| `.s/src/socCom.js` | Социальные комментарии |
| `.s/src/crit_image.js` | Критические изображения (lazy/preload логика) |
| `sAx1Mn4rK_.js` | Назначение неизвестно — не трогать без анализа |
| `wp-content/cache/minify/*.js` | Старые WP-минифицированные JS |

---

## Слайдеры

**Текущее состояние:** Активных слайдеров в HTML-файлах **нет** (проверено поиском по owl/swiper/slider/carousel — 0 совпадений в index.html файлах).

Если слайдеры будут добавляться:
- Не копировать DOM из DevTools (`.owl-stage`, `.cloned`, inline transform).
- Использовать исходную разметку + JS-инициализацию.
- Инициализацию добавлять в `assets/js/main.min.js` (или отдельный файл с `defer`).

---

## Ключевые классы/JS-хуки (не трогать без анализа)

| Класс / ID | Используется в |
|------------|---------------|
| `.js-humburger` / `.js-search-icon` | `main.min.js` — мобильное меню и поиск |
| `.js-sticky-sidebar` | `main.min.js` — sticky sidebar |
| `.js-spoiler-box-title` | `main.min.js` — спойлеры |
| `.js-scrolltop` | `main.min.js` — кнопка «наверх» |
| `.js-star-rating-item` | `main.min.js` — рейтинг |
| `.js-table-of-contents-hide` | `main.min.js` — оглавление |
| `.js-link` | `main.min.js` — obfuscated-ссылки (base64) |
| `.w-animate` | `main.min.js` — CSS-анимации при скролле |
| `#site-navigation` | `main.min.js` — основная навигация |
| `#top-menu` | `main.min.js` — меню |
| `.js-mobile-menu-placeholder` | `main.min.js` — мобильное меню |
| `[data-social="vkontakte"]` и др. | `main.min.js` — share-кнопки (goodshare) |
| `.entry-content` | `main.min.js` — лайтбокс, таблицы, iframe |

---

## Страницы, которые нельзя ломать (SEO/бизнес)

| URL | Файл | Назначение |
|-----|------|-----------|
| `/` | `index.html` | Главная |
| `/download/` | `download/index.html` | Страница загрузки APK |
| `/register/` | `register/index.html` | Регистрация |
| `/cheats/` | `cheats/index.html` | Читы |
| `/cheatz/` | `cheatz/index.html` | Читы (дубль) |
| `/category/*` | `category/*/index.html` | Все категории |

---

## Sitemap и robots

- `sitemap.xml` — единственный актуальный sitemap (1408 URL, абсолютные).
- `robots.txt` → `Sitemap: https://androidchity.ru/sitemap.xml`
- Старые WP-сitemaps (post-sitemap.xml, category-sitemap.xml и др.) **удалены**.

---

## Скрипты для обслуживания

```bash
# Проверить и обновить sitemap
node scripts/verify-and-update-sitemap.js

# Запустить локальный сервер
node server.js
# или
npm start
```
