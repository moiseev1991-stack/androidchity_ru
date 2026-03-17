<?php
/**
 * Card partial — маленькая карточка игры
 * Ожидает переменную $post:
 *   slug, title, image, type (mod|cheat|hack|new), type_label, category, downloads, emoji
 */
$typeClass = match($post['type'] ?? '') {
    'mod'   => 'mod',
    'cheat' => 'cheat',
    'hack'  => 'hack',
    'new'   => 'new',
    default => 'mod',
};
$badge = strtoupper($post['type_label'] ?? 'МОД');
$href  = '/games/' . ($post['slug'] ?? '') . '/';
$dl    = !empty($post['downloads']) ? $post['downloads'] : '';
?>
<article class="card">
  <a href="<?= htmlspecialchars($href) ?>" class="card-link">
    <div class="card-img">
      <?php if (!empty($post['image'])): ?>
        <img
          src="<?= htmlspecialchars($post['image']) ?>"
          alt="<?= htmlspecialchars($post['title'] ?? '') ?>"
          loading="lazy"
          width="300" height="300"
        >
      <?php else: ?>
        <span class="card-placeholder"><?= $post['emoji'] ?? '🎮' ?></span>
      <?php endif; ?>
      <span class="card-badge <?= $typeClass ?>"><?= $badge ?></span>
    </div>
    <div class="card-body">
      <h3 class="card-title"><?= htmlspecialchars($post['title'] ?? '') ?></h3>
      <div class="card-meta">
        <span class="card-cat"><?= htmlspecialchars($post['category'] ?? '') ?></span>
        <?php if ($dl): ?>
        <span class="card-dl"><?= htmlspecialchars($dl) ?>↓</span>
        <?php endif; ?>
      </div>
    </div>
  </a>
</article>
