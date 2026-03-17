<header class="site-header" role="banner">
  <div class="site-header__inner">

    <!-- Logo -->
    <a href="/" class="site-logo">Android<span>Читы</span></a>

    <!-- Search -->
    <div class="header-search" role="search">
      <form class="header-search__form" action="/search/" method="get">
        <span class="header-search__icon" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input
          type="search"
          name="q"
          id="headerSearchInput"
          class="header-search__input"
          placeholder="Найти игру, мод, чит..."
          autocomplete="off"
          aria-label="Поиск"
          value="<?= htmlspecialchars($_GET['q'] ?? '') ?>"
        >
        <button type="submit" class="header-search__submit">Найти</button>
      </form>
      <div class="search-dropdown" id="headerSearchDropdown" aria-live="polite"></div>
    </div>

    <!-- Desktop nav -->
    <nav class="header-nav" aria-label="Главное меню">
      <a href="/games/novinki/" class="header-nav__link">Новинки</a>
      <a href="/games/mody/"    class="header-nav__link">Моды</a>
      <a href="/games/chity/"   class="header-nav__link">Читы</a>
      <a href="/bk/"            class="header-nav__link header-nav__link--bk">🏆 Скачать БК</a>
    </nav>

    <!-- Burger -->
    <button class="header-burger" id="burgerBtn" aria-label="Открыть меню" aria-expanded="false" aria-controls="mobileMenu">
      <span class="header-burger__line"></span>
      <span class="header-burger__line"></span>
      <span class="header-burger__line"></span>
    </button>

  </div>
</header>
