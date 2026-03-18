<?php
/**
 * Wide Card partial — горизонтальная карточка
 * Ожидает $post: slug, title, image, description, type, type_label, emoji
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
?>
<article class="wide-card">
  <a href="<?= htmlspecialchars($href) ?>" class="wide-card-link">

    <?php if (!empty($post['image'])): ?>
      <img
        class="wide-card__img"
        src="<?= htmlspecialchars($post['image']) ?>"
        alt="<?= htmlspecialchars($post['title'] ?? '') ?>"
        loading="lazy"
        width="70" height="70"
        decoding="async"
      >
    <?php else: ?>
      <div class="wide-card__img-placeholder"><?= $post['emoji'] ?? '🎮' ?></div>
    <?php endif; ?>

    <div class="wide-card__body">
      <div class="wide-card__title"><?= htmlspecialchars($post['title'] ?? '') ?></div>
      <?php if (!empty($post['description'])): ?>
      <div class="wide-card__desc"><?= htmlspecialchars($post['description']) ?></div>
      <?php endif; ?>
      <span class="wide-card__badge card-badge <?= $typeClass ?>"><?= $badge ?></span>
    </div>

  </a>
</article>
