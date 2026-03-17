<?php
$heroTags = [
  ['🔥', 'Standoff 2',  '/games/igry/standoff-2/'],
  ['🧱', 'Minecraft',   '/games/'],
  ['🏎️', 'GTA',         '/games/'],
  ['🏠', 'Toca Boca',   '/games/igry/toca-boka/'],
  ['🧟', 'Зомби',       '/games/zhanry/zombi/'],
  ['⚔️', 'Ролевые',     '/games/zhanry/rolevye/'],
  ['🔫', 'Шутеры',      '/games/zhanry/shutery/'],
];
?>
<section class="hero" aria-label="Поиск игр">
  <div class="hero__inner">
    <h1 class="hero__title">
      APK-игры, моды и читы<br>
      <span>для Android</span> — бесплатно
    </h1>
    <p class="hero__subtitle">Тысячи проверенных файлов: моды с безлимитными ресурсами,<br>читы без бана, взломы популярных игр.</p>

    <form class="hero__search" action="/search/" method="get" role="search">
      <span class="hero__search-icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </span>
      <input
        type="search"
        name="q"
        class="hero__search-input"
        id="heroSearchInput"
        placeholder="Найти игру, мод, чит..."
        autocomplete="off"
        aria-label="Поиск по сайту"
      >
      <button type="submit" class="hero__search-btn">Найти</button>
    </form>

    <div class="hero__tags" role="list">
      <?php foreach ($heroTags as [$icon, $label, $href]): ?>
      <a href="<?= htmlspecialchars($href) ?>" class="hero__tag" role="listitem">
        <?= $icon ?> <?= htmlspecialchars($label) ?>
      </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>
