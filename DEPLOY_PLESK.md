# Деплой на Plesk (shared hosting)

## Инструкция

1. Откройте **Plesk** → **Git** для нужного домена.
2. Укажите репозиторий: `https://github.com/moiseev1991-stack/androidchity_ru.git`
3. Настройте **Deploy to**: `/httpdocs`
4. Нажмите **Deploy now**

После деплоя все файлы окажутся в `/httpdocs`. Сайт — статический, без Node.js. Главная страница: `index.html` в корне.

## Изображения (wp-content/uploads)

В репозитории уже есть папка `wp-content/uploads/` (4299 файлов). Git Deploy должен скопировать их в `httpdocs/wp-content/uploads/`.

**Если картинки не отображаются после Deploy:**

1. Убедитесь, что папка `wp-content/uploads/` есть в репозитории и попала в httpdocs.
2. Если нет — локально: `Compress-Archive -Path "wp-content\uploads\*" -DestinationPath "uploads.zip" -Force`
3. Plesk → **Files** → `httpdocs/wp-content/` → **Upload** → `uploads.zip` → **Extract**
4. Проверьте: `https://ваш-домен/wp-content/uploads/2023/12/4-38-400x400-1-100x100.jpg` (200 OK).

**Если сайт в подпапке** (например `https://domain.com/blog/`), пути в HTML нужно исправить:
```powershell
$env:BASE_URL="https://ваш-домен"
node scripts/fix-image-paths.js
```
Скрипт заменит `src="/wp-content/` на `src="https://ваш-домен/wp-content/` во всех HTML.

## Проверка

После Deploy now откройте сайт по домену — главная должна открыться с корня (`/`). Картинки в шапке и в постах должны загружаться. Внутренние страницы (category, page, записи) работают через стандартные `index.html` в подпапках.
