<?php
/**
 * Pagination
 * $currentPage  — текущая страница (int)
 * $totalPages   — всего страниц (int)
 * $baseUrl      — базовый URL (напр. /games/mody/) без /page/N/
 */
if (empty($totalPages) || $totalPages <= 1) return;

$currentPage = max(1, (int)($currentPage ?? 1));
$totalPages  = (int)($totalPages ?? 1);
$baseUrl     = rtrim($baseUrl ?? '/games/', '/');

function paginationUrl(string $base, int $page): string {
    return $page === 1 ? $base . '/' : $base . '/page/' . $page . '/';
}

$delta = 2; // страниц вокруг текущей
$pages = [];

$pages[] = 1;
for ($i = max(2, $currentPage - $delta); $i <= min($totalPages - 1, $currentPage + $delta); $i++) {
    $pages[] = $i;
}
$pages[] = $totalPages;
$pages = array_unique($pages);
sort($pages);
?>
<nav class="pagination" aria-label="Пагинация">

  <?php if ($currentPage > 1): ?>
  <a href="<?= paginationUrl($baseUrl, $currentPage - 1) ?>" class="pagination__btn" aria-label="Предыдущая страница">‹</a>
  <?php endif; ?>

  <?php $prev = 0; foreach ($pages as $page): ?>
    <?php if ($prev && $page - $prev > 1): ?>
      <span class="pagination__btn dots" aria-hidden="true">…</span>
    <?php endif; ?>
    <a
      href="<?= paginationUrl($baseUrl, $page) ?>"
      class="pagination__btn<?= $page === $currentPage ? ' active' : '' ?>"
      <?= $page === $currentPage ? 'aria-current="page"' : '' ?>
    ><?= $page ?></a>
  <?php $prev = $page; endforeach; ?>

  <?php if ($currentPage < $totalPages): ?>
  <a href="<?= paginationUrl($baseUrl, $currentPage + 1) ?>" class="pagination__btn" aria-label="Следующая страница">›</a>
  <?php endif; ?>

</nav>
