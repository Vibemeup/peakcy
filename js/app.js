/* ==================================================
   PeakCY — app.js (stable mobile menu + lazy video)
   ================================================== */

function getNavHeight() {
  const nav = document.getElementById('navbar');
  return nav ? nav.offsetHeight : 0;
}

function smoothScrollTo(el) {
  const y = el.getBoundingClientRect().top + window.scrollY - getNavHeight() - 12;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
  // Ensure page is visible
  document.body.style.opacity = '1';

  /* Navbar shadow */
  const navbar = document.getElementById('navbar');
  const setScrolled = () => navbar && navbar.classList.toggle('scrolled', window.scrollY > 8);
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });

  /* -------- Mobile menu: simple, no inline pinning -------- */
  const toggle = document.querySelector('.menu-toggle');
  const menu   = document.querySelector('.mobile-menu');

  const openMenu = () => {
    if (!menu) return;
    menu.hidden = false;
    document.body.classList.add('menu-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    if (!menu) return;
    menu.hidden = true;
    document.body.classList.remove('menu-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  };

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    // Close when tapping any link in the mobile menu
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (menu.hidden) return;
      const clickInsideMenu = menu.contains(e.target);
      const clickOnToggle   = toggle.contains(e.target);
      if (!clickInsideMenu && !clickOnToggle) closeMenu();
    });

    // ESC closes
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

    // Safety on resize
    window.addEventListener('resize', () => { if (innerWidth > 768) closeMenu(); });
  }

  /* Smooth anchor scroll (offset fixed navbar) */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      smoothScrollTo(target);
      try { history.pushState(null, "", id); } catch (_) {}
    });
  });

  /* -------- Lazy PLAY/PAUSE for /video.mp4 when in view -------- */
  const vid = document.getElementById('clubVideo');
  if (vid) {
    // Mobile autoplay requires muted + playsinline (already set in HTML)
    const io = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          try { await vid.play(); } catch(_) { /* ignore autoplay blocks */ }
        } else {
          try { vid.pause(); } catch(_) {}
        }
      });
    }, { threshold: 0.35 });

    io.observe(vid);
  }

  /* -------- Footer social links: never hijack to the form -------- */
  document.querySelectorAll('.footer .social-link, .mobile-menu .mobile-social').forEach(a => {
    a.addEventListener('click', (e) => {
      // Make sure clicks do not bubble into any labels/overlays
      e.stopPropagation();
    });
  });
});
