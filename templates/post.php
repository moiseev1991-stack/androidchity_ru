<?php
/**
 * templates/post.php — Страница поста/игры
 *
 * Ожидаемые переменные:
 *   $post         — массив: slug, title, image, type, type_label, category,
 *                   android_min, file_size, version, updated_at, downloads,
 *                   description, features[], instructions[], download_url
 *   $relatedPosts — массив похожих постов (4 шт)
 *   $breadcrumbs  — [{title, url}]
 *   $meta         — SEO-мета
 */

$post         ??= [];
$relatedPosts ??= [];
$breadcrumbs  ??= [];

$postTitle = htmlspecialchars($post['title'] ?? 'Игра');
$postSlug  = $post['slug'] ?? '';

$meta ??= [
    'title'       => $postTitle . ' — скачать APK на Android | AndroidЧиты',
    'description' => 'Скачать ' . mb_strtolower($postTitle) . ' на Android бесплатно. Мод, чит или взлом без бана.',
    'canonical'   => 'https://androidchity.ru/games/' . $postSlug . '/',
    'image'       => $post['image'] ?? '',
    'schema'      => json_encode([
        '@context'            => 'https://schema.org',
        '@type'               => 'SoftwareApplication',
        'name'                => $post['title'] ?? '',
        'operatingSystem'     => 'Android',
        'applicationCategory' => 'GameApplication',
        'dateModified'        => $post['updated_at'] ?? date('Y-m-d'),
        'offers'              => ['@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'RUB'],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
];

$typeClass = match($post['type'] ?? '') {
    'mod'   => 'mod',
    'cheat' => 'cheat',
    'hack'  => 'hack',
    default => 'mod',
};

ob_start();
?>

<div class="layout">
  <?php include __DIR__ . '/partials/sidebar.php'; ?>

  <main class="main" id="main-content">

    <!-- Breadcrumb -->
    <?php if (!empty($breadcrumbs)): ?>
    <nav class="breadcrumb" aria-label="Хлебные крошки">
      <a href="/">Главная</a>
      <?php foreach ($breadcrumbs as $crumb): ?>
      <span class="breadcrumb__sep" aria-hidden="true">›</span>
      <?php if (!empty($crumb['url'])): ?>
        <a href="<?= htmlspecialchars($crumb['url']) ?>"><?= htmlspecialchars($crumb['title']) ?></a>
      <?php else: ?>
        <span aria-current="page"><?= htmlspecialchars($crumb['title']) ?></span>
      <?php endif; ?>
      <?php endforeach; ?>
    </nav>
    <?php endif; ?>

    <!-- Post heading -->
    <h1 style="margin:12px 0 4px"><?= $postTitle ?></h1>

    <!-- Meta -->
    <div class="post-meta">
      <?php if (!empty($post['type_label'])): ?>
      <span class="meta-item">⚙️ <?= htmlspecialchars($post['type_label']) ?></span>
      <?php endif; ?>
      <?php if (!empty($post['android_min'])): ?>
      <span class="meta-item">📱 Android <?= htmlspecialchars($post['android_min']) ?>+</span>
      <?php endif; ?>
      <?php if (!empty($post['file_size'])): ?>
      <span class="meta-item">📦 <?= htmlspecialchars($post['file_size']) ?></span>
      <?php endif; ?>
      <?php if (!empty($post['version'])): ?>
      <span class="meta-item">🔄 Версия <?= htmlspecialchars($post['version']) ?></span>
      <?php endif; ?>
      <?php if (!empty($post['updated_at'])): ?>
      <span class="meta-item">📅 <?= htmlspecialchars($post['updated_at']) ?></span>
      <?php endif; ?>
    </div>

    <!-- Image -->
    <?php if (!empty($post['image'])): ?>
    <picture>
      <img
        class="post-image"
        src="<?= htmlspecialchars($post['image']) ?>"
        alt="<?= $postTitle ?>"
        loading="eager"
        width="480" height="480"
      >
    </picture>
    <?php endif; ?>

    <!-- Description -->
    <?php if (!empty($post['description'])): ?>
    <div class="post-content">
      <?= $post['description'] /* HTML допускается, фильтруется на этапе сохранения */ ?>
    </div>
    <?php endif; ?>

    <!-- Features -->
    <?php if (!empty($post['features'])): ?>
    <div class="post-block">
      <h2>✨ Особенности</h2>
      <ul class="post-content">
        <?php foreach ($post['features'] as $feature): ?>
        <li><?= htmlspecialchars($feature) ?></li>
        <?php endforeach; ?>
      </ul>
    </div>
    <?php endif; ?>

    <!-- Instructions -->
    <?php if (!empty($post['instructions'])): ?>
    <div class="post-block">
      <h2>📋 Инструкция по установке</h2>
      <ol class="post-content">
        <?php foreach ($post['instructions'] as $step): ?>
        <li><?= htmlspecialchars($step) ?></li>
        <?php endforeach; ?>
      </ol>
    </div>
    <?php endif; ?>

    <!-- Download button -->
    <?php if (!empty($post['download_url'])): ?>
    <a href="<?= htmlspecialchars($post['download_url']) ?>" class="download-btn" rel="nofollow" data-track="download">
      ⬇ Скачать APK бесплатно
    </a>
    <?php endif; ?>

    <!-- Related posts -->
    <?php if (!empty($relatedPosts)): ?>
    <section class="related-section" aria-labelledby="sec-related">
      <h2 id="sec-related">Похожие игры</h2>
      <div class="cards-grid">
        <?php foreach ($relatedPosts as $post): ?>
          <?php include __DIR__ . '/partials/card.php'; ?>
        <?php endforeach; ?>
      </div>
    </section>
    <?php endif; ?>

  </main>
</div>

<?php
$content = ob_get_clean();
include __DIR__ . '/layout.php';
