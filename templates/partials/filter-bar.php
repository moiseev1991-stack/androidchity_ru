<?php
/**
 * Filter Bar
 * $filterPills — массив [['label' => 'Все', 'value' => '', 'active' => true], ...]
 * $currentSort — текущая сортировка
 */
$filterPills = $filterPills ?? [
    ['label' => '🔀 Все',      'value' => '',        'active' => true],
    ['label' => '⚙️ Моды',     'value' => 'mod',     'active' => false],
    ['label' => '🃏 Читы',     'value' => 'cheat',   'active' => false],
    ['label' => '🔓 Взломы',   'value' => 'hack',    'active' => false],
    ['label' => '🆕 Новинки',  'value' => 'new',     'active' => false],
];
$currentSort = $currentSort ?? 'date';
$currentType = $_GET['type'] ?? '';
?>
<div class="filter-bar" role="toolbar" aria-label="Фильтры">

  <button class="filters-toggle" id="filtersToggle" aria-expanded="false" aria-controls="sidebar">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="8" y1="12" x2="20" y2="12"/>
      <line x1="12" y1="18" x2="20" y2="18"/>
    </svg>
    Фильтры
  </button>

  <?php foreach ($filterPills as $pill): ?>
  <?php $active = ($pill['value'] === $currentType) ? ' active' : ''; ?>
  <a
    href="?<?= http_build_query(['type' => $pill['value'], 'sort' => $currentSort]) ?>"
    class="filter-pill<?= $active ?>"
    <?= $active ? 'aria-current="true"' : '' ?>
  ><?= htmlspecialchars($pill['label']) ?></a>
  <?php endforeach; ?>

  <select class="filter-bar__sort" id="sortSelect" aria-label="Сортировка" onchange="applySortFilter(this.value)">
    <option value="date"      <?= $currentSort === 'date'      ? 'selected' : '' ?>>По дате</option>
    <option value="downloads" <?= $currentSort === 'downloads' ? 'selected' : '' ?>>По скачиваниям</option>
    <option value="rating"    <?= $currentSort === 'rating'    ? 'selected' : '' ?>>По рейтингу</option>
  </select>

</div>
