/* ===========================================
   PeakCY — Final JS (menu, smooth scroll, fixes)
   =========================================== */

(function () {
  const body = document.body;
  const nav = document.querySelector('.navbar');
  const toggle = document.querySelector('.menu-toggle');
  const panel = document.querySelector('.mobile-menu');

  // Guard for missing elements (SSR etc.)
  if (!toggle || !panel) return;

  // -------------------------------
  // Helpers
  // -------------------------------
  const openMenu = () => {
    toggle.setAttribute('aria-expanded', 'true');
    panel.classList.add('is-open');
    panel.hidden = false;
    body.classList.add('menu-open');
  };

  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open');
    // Let the closing transition finish, then fully hide
    setTimeout(() => { panel.hidden = true; }, 180);
    body.classList.remove('menu-open');
  };

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  // Reset panel geometry on each open (prevents “drift” on some Androids)
  const clampPanel = () => {
    if (window.matchMedia('(max-width: 768px)').matches) {
      panel.style.left = '0';
      panel.style.right = '0';
      panel.style.width = '100vw';
      panel.style.maxWidth = '100vw';
    } else {
      panel.style.left = '';
      panel.style.right = '';
      panel.style.width = '';
      panel.style.maxWidth = '';
    }
  };

  // -------------------------------
  // Toggle button
  // -------------------------------
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    clampPanel();
    isOpen() ? closeMenu() : openMenu();
  });

  // Close on ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) closeMenu();
  });

  // Close when clicking a link inside the panel
  panel.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    // For internal anchors, scroll after closing
    if (a.getAttribute('href')?.startsWith('#')) {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      closeMenu();
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
      }
    } else {
      // External links: just close menu and let the browser follow
      closeMenu();
    }
  });

  // Prevent accidental background scroll or layout drift
  window.addEventListener('resize', () => {
    if (isOpen()) clampPanel();
  });
  window.addEventListener('orientationchange', () => {
    if (isOpen()) clampPanel();
  });

  // -------------------------------
  // Smart smooth scroll (OPT-IN)
  // Only anchors with [data-scroll] will smooth scroll.
  // This avoids hijacking external/social links in the footer.
  // -------------------------------
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-scroll]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (!href.startsWith('#')) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    // Close menu first if we’re on mobile and it’s open
    if (isOpen()) closeMenu();

    const offset = nav ? nav.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - (offset + 8);
    window.scrollTo({ top, behavior: 'smooth' });
  });

  // -------------------------------
  // Navbar shadow on scroll
  // -------------------------------
  const onScroll = () => {
    if (window.scrollY > 4) nav?.classList.add('scrolled');
    else nav?.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
