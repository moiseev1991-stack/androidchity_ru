<?php
$currentPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

function sidebarLink(string $href, string $icon, string $label, ?int $count = null, string $current = ''): string {
    $active = rtrim($current, '/') === rtrim($href, '/') ? ' active' : '';
    $countHtml = $count !== null
        ? '<span class="sidebar__count">' . number_format($count, 0, '.', ' ') . '</span>'
        : '';
    return '<a href="' . $href . '" class="sidebar__link' . $active . '">'
         . '<span class="sidebar__icon">' . $icon . '</span>'
         . '<span class="sidebar__label">' . htmlspecialchars($label) . '</span>'
         . $countHtml
         . '</a>';
}
?>
<nav class="sidebar" id="sidebar" aria-label="Категории">

  <div class="sidebar__group">
    <div class="sidebar__group-title">Тип</div>
    <?= sidebarLink('/games/',         '🎮', 'Все игры',  1200, $currentPath) ?>
    <?= sidebarLink('/games/mody/',    '⚙️', 'Моды',       480, $currentPath) ?>
    <?= sidebarLink('/games/chity/',   '🃏', 'Читы',       210, $currentPath) ?>
    <?= sidebarLink('/games/vzlomy/',  '🔓', 'Взломы',     195, $currentPath) ?>
    <?= sidebarLink('/games/novinki/', '🆕', 'Новинки',     64, $currentPath) ?>
    <?= sidebarLink('/games/top/',     '🔥', 'Топ',        null, $currentPath) ?>
  </div>

  <div class="sidebar__group">
    <div class="sidebar__group-title">Жанры</div>
    <?= sidebarLink('/games/zhanry/shutery/',    '🔫', 'Шутеры',       null, $currentPath) ?>
    <?= sidebarLink('/games/zhanry/rolevye/',    '⚔️', 'Ролевые',      null, $currentPath) ?>
    <?= sidebarLink('/games/zhanry/strategii/',  '♟️', 'Стратегии',    null, $currentPath) ?>
    <?= sidebarLink('/games/zhanry/gonki/',      '🏎️', 'Гонки',        null, $currentPath) ?>
    <?= sidebarLink('/games/zhanry/golovolomki/','🧩', 'Головоломки',  null, $currentPath) ?>
    <?= sidebarLink('/games/zhanry/arkady/',     '👾', 'Аркады',       null, $currentPath) ?>
    <?= sidebarLink('/games/zhanry/anime/',      '⛩️', 'Аниме',        null, $currentPath) ?>
    <?= sidebarLink('/games/zhanry/zombi/',      '🧟', 'Зомби',        null, $currentPath) ?>
    <?= sidebarLink('/games/zhanry/simulyatory/','🕹️', 'Симуляторы',  null, $currentPath) ?>
    <?= sidebarLink('/games/zhanry/ekshen/',     '💥', 'Экшен',        null, $currentPath) ?>
    <?= sidebarLink('/games/zhanry/horror/',     '👻', 'Хоррор',       null, $currentPath) ?>
    <?= sidebarLink('/games/zhanry/fentezi/',    '🧙', 'Фэнтези',      null, $currentPath) ?>
    <?= sidebarLink('/games/zhanry/dlya-detey/', '👶', 'Для детей',    null, $currentPath) ?>
    <?= sidebarLink('/games/zhanry/dlya-vzroslyh/', '🔞', 'Для взрослых', null, $currentPath) ?>
  </div>

  <div class="sidebar__group">
    <div class="sidebar__group-title">Игры</div>
    <?= sidebarLink('/games/igry/standoff-2/', '🎯', 'Standoff 2', null, $currentPath) ?>
    <?= sidebarLink('/games/igry/toca-boka/',  '🏠', 'Toca Boca',  null, $currentPath) ?>
  </div>

  <div class="sidebar__group">
    <div class="sidebar__group-title">Приложения</div>
    <?= sidebarLink('/apps/fotoredaktory/', '📷', 'Фоторедакторы', null, $currentPath) ?>
    <?= sidebarLink('/apps/instrumenty/',   '🔧', 'Инструменты',   null, $currentPath) ?>
  </div>

  <div class="sidebar__group">
    <div class="sidebar__group-title">Ещё</div>
    <?= sidebarLink('/bk/', '🏆', 'Скачать БК', null, $currentPath) ?>
    <?= sidebarLink('/download/', '🛡️', 'Проверка файлов', null, $currentPath) ?>
  </div>

</nav>
