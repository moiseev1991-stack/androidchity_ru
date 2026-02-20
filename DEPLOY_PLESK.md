# Деплой на Plesk (shared hosting)

## Инструкция

1. Откройте **Plesk** → **Git** для нужного домена.
2. Укажите репозиторий: `https://github.com/moiseev1991-stack/androidchity_ru.git`
3. Настройте **Deploy to**: `/httpdocs`
4. Нажмите **Deploy now**

После деплоя все файлы окажутся в `/httpdocs`. Сайт — статический, без Node.js. Главная страница: `index.html` в корне.

## Изображения (wp-content/uploads)

В репозитории уже есть папка `wp-content/uploads/` (4299 файлов за 2023/11, 2023/12 и далее). Git Deploy должен скопировать их в `httpdocs/wp-content/uploads/`.

**Если картинки не отображаются после Deploy:**

1. Локально в папке проекта: `Compress-Archive -Path "wp-content\uploads\*" -DestinationPath "uploads.zip" -Force`
2. Plesk → **Files** → перейдите в `httpdocs/wp-content/`
3. **Upload** → выберите `uploads.zip` → **Extract** (распаковать)
4. Убедитесь, что появилась структура `uploads/2023/11/`, `uploads/2023/12/` и т.д.

**Проверка:** `https://ваш-домен/wp-content/uploads/2023/11/remove-bg.ai_1701256636548.png` должен возвращать картинку (200 OK).

## Проверка

После Deploy now откройте сайт по домену — главная должна открыться с корня (`/`). Картинки в шапке и в постах должны загружаться. Внутренние страницы (category, page, записи) работают через стандартные `index.html` в подпапках.
