# Исправление скорости загрузки и ошибок ассетов

## Миграция ассетов (февраль 2026)

**Все WP-хвосты удалены!** Ссылки на `wp-content/cache/minify/` заменены локальными ассетами:

| До | После |
|---|---|
| `/wp-content/cache/minify/e3f8b.css` | `/assets/css/main.min.css` |
| `/wp-content/cache/minify/3c49a.js` | `/assets/js/main.min.js` |
| Стабы `986c3.js`, `e311b.js`, `d52ed.js` | **Удалены** |

### Результат
- ✅ **1405 HTML-файлов** обновлены
- ✅ **0 ссылок** на `wp-content/cache/minify/` 
- ✅ `decoding="async"` на изображениях
- ✅ `<link rel="preload">` для hero-изображения
- ✅ `fetchpriority="high"` на логотипе

### Деплой в httpdocs

Просто копируйте всё содержимое репозитория в `httpdocs`:

```bash
# Вариант 1: rsync
rsync -avz --delete ./ /var/www/vhosts/androidchity.ru/httpdocs/

# Вариант 2: git pull на сервере
cd /var/www/vhosts/androidchity.ru/httpdocs
git pull origin main
```

Важно: папка `assets/` должна быть в httpdocs:
```
httpdocs/
├── assets/
│   ├── css/main.min.css
│   └── js/main.min.js
├── index.html
├── 404.html
└── ...
```

---

## Статус проблем (legacy)

### 1. CSS minify
**Статус:** ✅ Мигрировано → `/assets/css/main.min.css`

Старый путь `wp-content/cache/minify/e3f8b.css` больше не используется в HTML.

### 2. Картинки remove-bg.ai
**Статус:** ✅ Файлы существуют  
- `wp-content/uploads/2023/11/remove-bg.ai_1701256636548.png` (100 KB) — логотип
- `wp-content/uploads/2023/11/remove-bg.ai_1701256378395.png` (601 KB) — фон хедера

### 3. Миниатюры -100x100
**Статус:** ✅ Файлы существуют  
Миниатюры находятся в `wp-content/uploads/` и присутствуют в репозитории.

---

## Nginx конфиги для Plesk

Созданы готовые конфиги в папке `ops/`:

| Файл | Описание |
|------|----------|
| `cache_headers_nginx.conf` | Только cache headers для статики |
| `security_nginx.conf` | Только security rules |
| `plesk_combined_nginx.conf` | **Рекомендуемый** — всё в одном |

### Установка в Plesk

1. Войдите в Plesk
2. Перейдите: **Домены** → **androidchity.ru** → **Хостинг**
3. Откройте **Настройки Apache и nginx**
4. Найдите поле **Additional nginx directives**
5. Вставьте содержимое файла `ops/plesk_combined_nginx.conf`
6. Сохраните

### Cache headers

| Тип файла | Время кэширования |
|-----------|-------------------|
| CSS/JS | 30 дней |
| Изображения (jpg/png/webp/gif/svg/ico) | 90 дней |
| Шрифты (woff/woff2/ttf) | 1 год |
| XML/JSON | 1 час |
| HTML | Без кэша (для быстрого деплоя) |

### Security rules

Блокируются:
- `.env`, `.git`, `.htaccess`
- `wp-config.php`
- `phpunit.*`, `composer.*`
- `/vendor/`, `/node_modules/`, `/cgi-bin/`
- Бэкапы: `.bak`, `.sql`, `.tar`, `.zip`

---

## Шаги проверки

### Локальная проверка

```bash
# Запустить локальный сервер
node server.js

# Проверить новый CSS
curl -I http://127.0.0.1:8080/assets/css/main.min.css

# Проверить изображения
curl -I http://127.0.0.1:8080/wp-content/uploads/2023/11/remove-bg.ai_1701256636548.png
```

### Проверка на продакшене

```bash
# После деплоя проверить cache headers
curl -I https://androidchity.ru/assets/css/main.min.css

# Ожидаемый ответ:
# HTTP/2 200
# cache-control: public, immutable
# expires: (дата +30 дней)

# Проверить security
curl -I https://androidchity.ru/.env
# Ожидаемый ответ: HTTP/2 404

curl -I https://androidchity.ru/.git/config
# Ожидаемый ответ: HTTP/2 404
```

### Проверка в браузере

1. Откройте DevTools (F12) → Network
2. Перезагрузите страницу (Ctrl+Shift+R для hard reload)
3. Проверьте:
   - CSS/JS имеют статус 200 (не 404 или pending)
   - Изображения загружаются без ошибок
   - В Response Headers для статики есть `Cache-Control`

---

## Troubleshooting

### Проблема: CSS/изображения 404

**Возможные причины:**
1. Неправильный Document Root (должен указывать на папку с `index.html`)
2. Файлы не попали в деплой

**Решение:**
```bash
# Проверить структуру на сервере
ls -la /var/www/vhosts/androidchity.ru/httpdocs/wp-content/cache/minify/
```

### Проблема: Pending запросы

**Возможные причины:**
1. Файлы не существуют на сервере
2. Nginx location rules перехватывают запросы

**Решение:**
Проверьте, что файлы из `wp-content/` деплоятся корректно.

### Проблема: Медленная загрузка

После добавления cache headers первая загрузка будет обычной, но повторные — из кэша браузера. Проверьте с помощью Lighthouse или WebPageTest.

---

## Файлы конфигов

- `ops/cache_headers_nginx.conf` — cache headers
- `ops/security_nginx.conf` — security rules  
- `ops/plesk_combined_nginx.conf` — всё в одном (рекомендуется)
