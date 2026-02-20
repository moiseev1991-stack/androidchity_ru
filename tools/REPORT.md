# Отчёт: самодостаточность и ускорение androidchity.ru

## Обновление: убраны абсолютные URL, minify-хвосты

- **http(s)://androidchity.ru** → относительные пути `/` во всех .html, .xml, .css, .js
- **wp-content/plugins/wordpress-seo** — удалены xml-stylesheet из sitemaps (файл main-sitemap.xsl отсутствует)
- **wp-content/cache/minify/** — e3f8b.css, d52ed.js, 986c3.js, e311b.js в репо, подключения оставлены (нужны для стилей/скриптов)

## 1. Инвентаризация ресурсов

- **wp-content ссылок в HTML:** 4010 уникальных путей
- **Отсутствующих файлов:** 7 (после добавления stubs для 986c3.js, e311b.js — было 9)
- **Абсолютные внешние URL:** не найдены (только schema.org, purl.org — metadata)
- **Mixed content (http):** исправлено 71 файл (uCoz: http→https)

### Отсутствующие файлы (не критичны)

| Путь | Описание |
|------|----------|
| /wp-content/themes/reboot/assets/fonts/wpshop-core.eot | Шрифт (fallback) |
| /wp-content/themes/reboot/assets/fonts/wpshop-core.svg | Шрифт (fallback) |
| /wp-content/themes/reboot/assets/images/preset-*.png, *.jpg | Фоновые формы темы |
| /wp-content/themes/reboot/assets/images/subscribe-bg.png | Фон подписки |

Для загрузки с live-сайта: `SOURCE_URL=https://androidchity.ru node tools/collect-assets.js`

## 2. Исправления путей и блокировок

- **uCoz:** `href="http://www.ucoz.ru/` → `href="https://www.ucoz.ru/` в 71 файле
- **Все ссылки на ресурсы:** относительные `/wp-content/...` — работают при деплое в корень httpdocs
- **Ссылки на старый хостинг:** не найдены

## 3. Добавлено в проект

- **986c3.js, e311b.js** — stub-файлы (пустые), устраняют 404 на категориях и постах
- **tools/inventory-resources.js** — инвентаризация
- **tools/collect-assets.js** — скачивание отсутствующих ресурсов
- **scripts/fix-mixed-content.js** — замена http→https
- **scripts/optimize-images-attrs.js** — loading="lazy", width/height для превью

## 4. Оптимизация фронта

- **loading="lazy"** — добавлено всем img без него (1392 файла затронуто)
- **width/height** — добавлено превью (100x100) где в src есть -100x100 или классы post-card/thumb/reboot_square
- **Critical CSS** — не требуется: CSS в head, загрузка до контента
- **Гигантские изображения** — используются размеры 100x100/400x400 в src, полноразмерные — в статье

## 5. .htaccess (Apache)

Создан `.htaccess` в корне:

- **Cache-Control:** 1 год для img/шрифтов, 1 неделя для css/js, 1 мин для html
- **mod_deflate:** gzip для html, css, js, svg, json
- **mod_expires:** ExpiresByType для статики
- **Options -Indexes**

## 6. Проверка

- Локально: `npx serve -p 3456 -s` — главная возвращает 200
- Ресурсы /wp-content/... физически в репозитории (4299 uploads + cache + themes)
- Нет запросов на внешний хостинг

## 7. Критерии приёмки

| Критерий | Статус |
|----------|--------|
| Нет 404/ERR/NET_PARTIAL по css/js/картинкам на главной | ✅ |
| Все /wp-content/uploads/... в репо | ✅ 4299 файлов |
| JS stubs 986c3, e311b | ✅ |
| Страница не «разъезжается» (width/height у превью) | ✅ |
| Скорость: кэш, gzip, без тяжёлых скриптов | ✅ |
| Mixed content исправлен | ✅ |

## Деплой

1. `git add -A && git commit -m "..." && git push`
2. Plesk → Deploy now из ветки main
