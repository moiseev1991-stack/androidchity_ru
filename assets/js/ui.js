/**
 * ui.js — Mobile menu, filters toggle, scroll behaviour
 * Vanilla JS, no dependencies
 */
(function () {
  'use strict';

  /* ── Mobile Menu ─────────────────────────────────────── */
  const burger      = document.getElementById('burgerBtn');
  const mobileMenu  = document.getElementById('mobileMenu');
  const overlay     = document.getElementById('mobileOverlay');
  const closeBtn    = document.getElementById('mobileMenuClose');

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('open');
    overlay && overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    burger && burger.setAttribute('aria-expanded', 'true');
    closeBtn && closeBtn.focus();
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    overlay && overlay.classList.remove('open');
    document.body.style.overflow = '';
    burger && burger.setAttribute('aria-expanded', 'false');
    burger && burger.focus();
  }

  burger   && burger.addEventListener('click', openMenu);
  overlay  && overlay.addEventListener('click', closeMenu);
  closeBtn && closeBtn.addEventListener('click', closeMenu);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
      closeMenu();
    }
  });

  /* ── Filters Toggle (sidebar on tablet) ──────────────── */
  const filtersToggle = document.getElementById('filtersToggle');
  const sidebar       = document.getElementById('sidebar');

  if (filtersToggle && sidebar) {
    filtersToggle.addEventListener('click', function () {
      const isOpen = sidebar.classList.toggle('open');
      filtersToggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        overlay && overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      } else {
        overlay && overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    // Close sidebar via overlay
    overlay && overlay.addEventListener('click', function () {
      if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        filtersToggle.setAttribute('aria-expanded', 'false');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

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

  /* ── Scroll-row buttons (if any) ─────────────────────── */
  document.querySelectorAll('.js-scroll-row').forEach(function (row) {
    const prev = row.parentElement && row.parentElement.querySelector('.js-scroll-prev');
    const next = row.parentElement && row.parentElement.querySelector('.js-scroll-next');
    next && next.addEventListener('click', function () {
      row.scrollBy({ left: 240, behavior: 'smooth' });
    });
    prev && prev.addEventListener('click', function () {
      row.scrollBy({ left: -240, behavior: 'smooth' });
    });
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
