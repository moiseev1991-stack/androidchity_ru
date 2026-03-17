/**
 * search.js — Live search with debounce + dropdown
 * No external dependencies
 */
(function () {
  'use strict';

  const DEBOUNCE_MS = 300;
  const MIN_QUERY   = 2;

  // All search inputs on the page (header + hero)
  const inputs = [
    { input: document.getElementById('headerSearchInput'), dropdown: document.getElementById('headerSearchDropdown') },
    { input: document.getElementById('heroSearchInput'),   dropdown: null },
  ].filter(({ input }) => input !== null);

  if (!inputs.length) return;

  // Shared dropdown (attach to header only; hero redirects on submit)
  const { input: headerInput, dropdown } = inputs[0];

  let debounceTimer = null;
  let lastQuery     = '';
  let currentIndex  = -1;
  let results       = [];

  /* ── Debounce helper ─────────────────────────────────── */
  function debounce(fn, ms) {
    return function (...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  /* ── Fetch search results ────────────────────────────── */
  async function fetchResults(query) {
    try {
      const res = await fetch('/search/?q=' + encodeURIComponent(query) + '&format=json', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  /* ── Badge label helper ──────────────────────────────── */
  function badgeClass(type) {
    const map = { mod: 'mod', cheat: 'cheat', hack: 'hack', new: 'new' };
    return map[type] || 'mod';
  }

  /* ── Render dropdown ─────────────────────────────────── */
  function renderDropdown(items) {
    if (!dropdown) return;

    if (!items.length) {
      dropdown.innerHTML = '<div style="padding:12px 16px;font-size:13px;color:var(--color-text-muted)">Ничего не найдено</div>';
      dropdown.classList.add('active');
      return;
    }

    dropdown.innerHTML = items.slice(0, 8).map((item, i) => `
      <a href="/games/${encodeURIComponent(item.slug)}/" class="search-item" data-index="${i}" role="option">
        ${item.image
          ? `<img src="${escHtml(item.image)}" width="36" height="36" alt="${escHtml(item.title)}" loading="lazy">`
          : `<div style="width:36px;height:36px;border-radius:8px;background:var(--color-bg-muted);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${item.emoji || '🎮'}</div>`
        }
        <div class="search-item__info">
          <span class="search-title">${escHtml(item.title)}</span>
          <span class="search-cat">${escHtml(item.category || '')}</span>
        </div>
        <span class="search-badge card-badge ${badgeClass(item.type)}">${escHtml(item.type_label || 'МОД')}</span>
      </a>
    `).join('');

    dropdown.classList.add('active');
    results = items;
    currentIndex = -1;
  }

  /* ── HTML escape ─────────────────────────────────────── */
  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Close dropdown ──────────────────────────────────── */
  function closeDropdown() {
    if (dropdown) dropdown.classList.remove('active');
    currentIndex = -1;
  }

  /* ── Keyboard navigation ─────────────────────────────── */
  function handleKeydown(e) {
    if (!dropdown || !dropdown.classList.contains('active')) return;
    const items = dropdown.querySelectorAll('.search-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentIndex = Math.min(currentIndex + 1, items.length - 1);
      items[currentIndex].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentIndex = Math.max(currentIndex - 1, -1);
      if (currentIndex === -1) headerInput.focus();
      else items[currentIndex].focus();
    } else if (e.key === 'Escape') {
      closeDropdown();
      headerInput.focus();
    }
  }

  /* ── Main search handler ─────────────────────────────── */
  const handleInput = debounce(async function (query) {
    if (query.length < MIN_QUERY) {
      closeDropdown();
      return;
    }
    if (query === lastQuery) return;
    lastQuery = query;

    const items = await fetchResults(query);
    if (lastQuery !== query) return; // stale
    renderDropdown(items);
  }, DEBOUNCE_MS);

  /* ── Bind header input ───────────────────────────────── */
  headerInput.addEventListener('input', function () {
    handleInput(this.value.trim());
  });

  headerInput.addEventListener('keydown', handleKeydown);

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.header-search')) closeDropdown();
  });

  /* ── Hero search: just redirect on input ─────────────── */
  const heroInput = document.getElementById('heroSearchInput');
  if (heroInput) {
    heroInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && this.value.trim()) {
        window.location.href = '/search/?q=' + encodeURIComponent(this.value.trim());
      }
    });
  }

  /* ── Sort filter ─────────────────────────────────────── */
  window.applySortFilter = function (value) {
    const url = new URL(window.location.href);
    url.searchParams.set('sort', value);
    window.location.href = url.toString();
  };

})();
