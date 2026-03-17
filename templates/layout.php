<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- SEO -->
  <title><?= htmlspecialchars($meta['title'] ?? 'Android Читы — APK игры, моды, взломы') ?></title>
  <meta name="description" content="<?= htmlspecialchars($meta['description'] ?? '') ?>">
  <?php if (!empty($meta['canonical'])): ?>
  <link rel="canonical" href="<?= htmlspecialchars($meta['canonical']) ?>">
  <?php endif; ?>
  <?php if (!empty($meta['robots'])): ?>
  <meta name="robots" content="<?= htmlspecialchars($meta['robots']) ?>">
  <?php endif; ?>

  <!-- Open Graph -->
  <meta property="og:type"        content="website">
  <meta property="og:title"       content="<?= htmlspecialchars($meta['title'] ?? '') ?>">
  <meta property="og:description" content="<?= htmlspecialchars($meta['description'] ?? '') ?>">
  <meta property="og:url"         content="<?= htmlspecialchars($meta['canonical'] ?? '') ?>">
  <?php if (!empty($meta['image'])): ?>
  <meta property="og:image"       content="<?= htmlspecialchars($meta['image']) ?>">
  <?php endif; ?>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" onload="this.rel='stylesheet'"
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800&family=Manrope:wght@400;500;600&display=swap">
  <noscript>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800&family=Manrope:wght@400;500;600&display=swap">
  </noscript>

  <!-- CSS -->
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/layout.css">
  <link rel="stylesheet" href="/assets/css/components.css">
  <?php if (!empty($useHero)): ?>
  <link rel="stylesheet" href="/assets/css/hero.css">
  <?php endif; ?>
  <link rel="stylesheet" href="/assets/css/responsive.css">

  <?php if (!empty($meta['schema'])): ?>
  <script type="application/ld+json"><?= $meta['schema'] ?></script>
  <?php endif; ?>
</head>
<body>

<?php include __DIR__ . '/partials/header.php'; ?>

<?php echo $content ?? ''; ?>

<?php include __DIR__ . '/partials/footer.php'; ?>

<!-- Mobile menu overlay -->
<div class="mobile-overlay" id="mobileOverlay"></div>
<div class="mobile-menu" id="mobileMenu" role="dialog" aria-modal="true" aria-label="Навигация">
  <div class="mobile-menu__header">
    <span class="site-logo">Android<span>Читы</span></span>
    <button class="mobile-menu__close" id="mobileMenuClose" aria-label="Закрыть">✕</button>
  </div>
  <div class="mobile-menu__body">
    <?php include __DIR__ . '/partials/sidebar.php'; ?>
  </div>
</div>

<!-- JS -->
<script src="/assets/js/ui.js" defer></script>
<script src="/assets/js/search.js" defer></script>
</body>
</html>
