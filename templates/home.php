<?php
/**
 * templates/home.php — Главная страница
 *
 * Ожидаемые переменные:
 *   $newPosts    — массив постов для «Новые поступления» (6 шт)
 *   $topPosts    — массив постов для «Популярное сегодня» (4 шт)
 *   $newCount    — количество новых постов
 *   $meta        — SEO-мета (title, description, canonical)
 */

$meta ??= [
    'title'       => 'Скачать APK игры для Android — моды, читы, взломы бесплатно | AndroidЧиты',
    'description' => 'Тысячи APK-файлов для Android: моды с безлимитными ресурсами, читы без бана, взломы популярных игр. Standoff 2, Minecraft, Toca Boca и другие.',
    'canonical'   => 'https://androidchity.ru/',
    'image'       => 'https://androidchity.ru/wp-content/uploads/2023/11/remove-bg.ai_1701256636548.png',
];
$newPosts  ??= [];
$topPosts  ??= [];
$newCount  ??= 0;
$useHero    = true;

ob_start();
?>

<?php include __DIR__ . '/partials/hero.php'; ?>

<div class="layout">
  <?php include __DIR__ . '/partials/sidebar.php'; ?>

  <main class="main" id="main-content">

    <?php include __DIR__ . '/partials/filter-bar.php'; ?>

    <!-- Новые поступления -->
    <section class="section" aria-labelledby="sec-new">
      <div class="sec-hdr">
        <h2 id="sec-new">Новые поступления</h2>
        <?php if ($newCount > 0): ?>
        <span class="badge-count"><?= $newCount ?> новых</span>
        <?php endif; ?>
        <a href="/games/novinki/">Смотреть все →</a>
      </div>
      <?php if (!empty($newPosts)): ?>
      <div class="cards-grid">
        <?php foreach ($newPosts as $post): ?>
          <?php include __DIR__ . '/partials/card.php'; ?>
        <?php endforeach; ?>
      </div>
      <?php else: ?>
      <p style="color:var(--color-text-muted);font-size:14px;">Посты загружаются...</p>
      <?php endif; ?>
    </section>

    <?php include __DIR__ . '/partials/bk-banner.php'; ?>

    <!-- Популярное сегодня -->
    <section class="section" aria-labelledby="sec-top">
      <div class="sec-hdr">
        <h2 id="sec-top">Популярное сегодня</h2>
        <a href="/games/top/">Все топ-игры →</a>
      </div>
      <?php if (!empty($topPosts)): ?>
      <div class="wide-grid">
        <?php foreach ($topPosts as $post): ?>
          <?php include __DIR__ . '/partials/wide-card.php'; ?>
        <?php endforeach; ?>
      </div>
      <?php else: ?>
      <p style="color:var(--color-text-muted);font-size:14px;">Загружается...</p>
      <?php endif; ?>
    </section>

    <?php
    $baseUrl     = '/games';
    $currentPage = 1;
    $totalPages  = 1;
    include __DIR__ . '/partials/pagination.php';
    ?>

  </main>
</div>

<?php
$content = ob_get_clean();
include __DIR__ . '/layout.php';
