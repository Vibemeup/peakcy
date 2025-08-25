/* ==================================================
   PeakCY — app.js (robust mobile menu + strict form)
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

  /* ----------------- Mobile menu (full overlay, bulletproof) ----------------- */
  const toggle = document.querySelector('.menu-toggle');
  const menu   = document.querySelector('.mobile-menu');

  if (toggle && menu) {
    let openState = false;

    const open = () => {
      if (openState) return;
      openState = true;

      // full overlay mode
      menu.hidden = false;
      menu.style.display = 'flex';
      document.body.classList.add('menu-open');
      toggle.setAttribute('aria-expanded', 'true');

      // pin X so it never “runs away”
      toggle.style.position = 'fixed';
      toggle.style.top = '14px';
      toggle.style.right = '14px';
      toggle.style.left = 'auto';
      toggle.style.zIndex = '5001';
    };

    const close = () => {
      if (!openState) return;
      openState = false;

      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');

      menu.hidden = true;
      menu.style.display = '';

      // restore toggle positioning
      toggle.style.position = '';
      toggle.style.top = '';
      toggle.style.right = '';
      toggle.style.left = '';
      toggle.style.zIndex = '';
    };

    toggle.addEventListener('click', () => (openState ? close() : open()));
    // Close when tapping any link in the menu
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!openState) return;
      if (!menu.contains(e.target) && !toggle.contains(e.target)) close();
    });
    // ESC closes
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    // Safety on resize
    window.addEventListener('resize', () => { if (innerWidth > 768) close(); });
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

  /* ----------------- Form: "thanks" only on real submit ----------------- */
  const form = document.getElementById('applicationForm');
  const thanks = document.getElementById('thanks');

  if (form) {
    let lastClickedIsSubmit = false;

    form.addEventListener('mousedown', (e) => {
      lastClickedIsSubmit = !!(e.target && e.target.classList && e.target.classList.contains('submit-btn'));
    }, true);

    form.addEventListener('submit', (e) => {
      const viaBtn =
        (e.submitter && e.submitter.classList && e.submitter.classList.contains('submit-btn')) ||
        lastClickedIsSubmit;

      if (!viaBtn) {
        // Ignore phantom submits (e.g., from labels/overlays)
        lastClickedIsSubmit = false;
        return;
      }

      e.preventDefault();
      lastClickedIsSubmit = false;

      form.reset();
      if (thanks) {
        thanks.style.display = 'block';
        setTimeout(() => { thanks.style.display = 'none'; }, 4500);
      }
    });
  }

  /* Footer & mobile socials: never hijack to form */
  document.querySelectorAll('.footer .social-link, .mobile-menu .mobile-social').forEach(a => {
    a.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent any accidental bubbling to labels/overlays
    });
  });
});
