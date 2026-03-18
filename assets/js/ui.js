/**
 * ui.js — Mobile sidebar, filters toggle, scroll behaviour
 * Vanilla JS, no dependencies
 */
(function () {
  'use strict';

  /* ── Mobile Sidebar ───────────────────────────────────── */
  const burgerBtn      = document.getElementById('burgerBtn');
  const sidebar        = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarClose   = document.getElementById('sidebarClose');

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('open');
    sidebarOverlay && sidebarOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    burgerBtn && burgerBtn.setAttribute('aria-expanded', 'true');
    sidebarClose && sidebarClose.focus();
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    sidebarOverlay && sidebarOverlay.classList.remove('open');
    document.body.style.overflow = '';
    burgerBtn && burgerBtn.setAttribute('aria-expanded', 'false');
    burgerBtn && burgerBtn.focus();
  }

  burgerBtn      && burgerBtn.addEventListener('click', openSidebar);
  sidebarClose   && sidebarClose.addEventListener('click', closeSidebar);
  sidebarOverlay && sidebarOverlay.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });

  /* ── Sticky header shadow ────────────────────────────── */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = function () {
      header.style.boxShadow = window.scrollY > 4
        ? '0 2px 12px rgba(0,0,0,0.08)'
        : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Active nav link highlight ───────────────────────── */
  const currentPath = window.location.pathname;
  document.querySelectorAll('.header-nav__link').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href && href !== '/' && currentPath.startsWith(href)) {
      link.style.color = 'var(--color-primary)';
      link.style.fontWeight = '600';
    }
  });

  /* ── Active sidebar link ─────────────────────────────── */
  document.querySelectorAll('.sidebar__link').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href && href !== '/' && currentPath.startsWith(href)) {
      link.classList.add('active');
    }
  });

  /* ── Download button tracking ────────────────────────── */
  document.querySelectorAll('[data-track="download"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const title = document.querySelector('h1');
      if (typeof gtag === 'function' && title) {
        gtag('event', 'download', { event_category: 'APK', event_label: title.textContent });
      }
    });
  });

})();
