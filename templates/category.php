<?php
/**
 * templates/category.php — Страница категории
 *
 * Ожидаемые переменные:
 *   $category    — массив: slug, title, description, breadcrumbs[{title,url}]
 *   $posts       — массив постов для сетки
 *   $currentPage — текущая страница
 *   $totalPages  — всего страниц
 *   $meta        — SEO-мета
 */

$category    ??= ['title' => 'Категория', 'description' => '', 'breadcrumbs' => [], 'slug' => ''];
$posts       ??= [];
$currentPage ??= 1;
$totalPages  ??= 1;

// robots: noindex для пустых категорий
if (empty($posts)) {
    $meta['robots'] = 'noindex, nofollow';
}
// robots: noindex для страниц пагинации
if ($currentPage > 1) {
    $meta['robots'] = 'noindex, follow';
}

$meta ??= [
    'title'       => htmlspecialchars($category['title']) . ' — скачать APK для Android | AndroidЧиты',
    'description' => 'Скачать ' . mb_strtolower($category['title']) . ' для Android бесплатно. ' . mb_substr($category['description'], 0, 120),
    'canonical'   => 'https://androidchity.ru/games/' . ($category['slug'] ?? '') . '/',
];

$baseUrl = '/games/' . ($category['slug'] ?? '');

ob_start();
?>

<div class="layout">
  <?php include __DIR__ . '/partials/sidebar.php'; ?>

  <main class="main" id="main-content">

    <!-- Category header -->
    <div class="page-header cat-header">
      <?php if (!empty($category['breadcrumbs'])): ?>
      <nav class="breadcrumb" aria-label="Хлебные крошки">
        <a href="/">Главная</a>
        <?php foreach ($category['breadcrumbs'] as $crumb): ?>
        <span class="breadcrumb__sep" aria-hidden="true">›</span>
        <?php if (!empty($crumb['url'])): ?>
          <a href="<?= htmlspecialchars($crumb['url']) ?>"><?= htmlspecialchars($crumb['title']) ?></a>
        <?php else: ?>
          <span aria-current="page"><?= htmlspecialchars($crumb['title']) ?></span>
        <?php endif; ?>
        <?php endforeach; ?>
      </nav>
      <?php endif; ?>

      <h1><?= htmlspecialchars($category['title']) ?></h1>
      <?php if (!empty($category['description'])): ?>
      <p class="cat-desc"><?= nl2br(htmlspecialchars($category['description'])) ?></p>
      <?php endif; ?>
    </div>

    <?php include __DIR__ . '/partials/filter-bar.php'; ?>

    <!-- Posts grid -->
    <?php if (!empty($posts)): ?>
    <section aria-label="Список игр">
      <div class="cards-grid">
        <?php foreach ($posts as $post): ?>
          <?php include __DIR__ . '/partials/card.php'; ?>
        <?php endforeach; ?>
      </div>
    </section>
    <?php else: ?>
    <p style="color:var(--color-text-muted);padding:24px 0;">В этой категории пока нет материалов.</p>
    <?php endif; ?>

    <?php include __DIR__ . '/partials/pagination.php'; ?>

  </main>
</div>

<?php
$content = ob_get_clean();
include __DIR__ . '/layout.php';
