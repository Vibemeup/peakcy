/* ==================================================
   PeakCY — app.js (menu + UX hardening)
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
  document.body.style.opacity = '1';

  /* Navbar shadow on scroll */
  const navbar = document.getElementById('navbar');
  const setScrolled = () => navbar && navbar.classList.toggle('scrolled', window.scrollY > 8);
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });

  /* -------- Mobile menu (robust, no overflow, X pinned) -------- */
  const toggle = document.querySelector('.menu-toggle');
  const menu   = document.querySelector('.mobile-menu');

  if (toggle && menu) {
    let isAnimating = false;

    const open = () => {
      if (isAnimating || !menu.hidden) return;
      isAnimating = true;

      // ensure correct display box and width constraints before transition
      menu.style.display = 'flex';
      menu.hidden = false;

      requestAnimationFrame(() => {
        toggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');   // lock scroll
        isAnimating = false;
      });
    };

    const close = () => {
      if (isAnimating || menu.hidden) return;
      isAnimating = true;

      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');

      requestAnimationFrame(() => {
        menu.hidden = true;
        menu.style.display = '';
        isAnimating = false;
      });
    };

    toggle.addEventListener('click', () => (menu.hidden ? open() : close()));
    // close on link tap
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    // close on ESC
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    // outside click closes
    document.addEventListener('click', (e) => {
      if (menu.hidden) return;
      if (!menu.contains(e.target) && !toggle.contains(e.target)) close();
    });
    // desktop resize safety
    window.addEventListener('resize', () => { if (innerWidth > 768) close(); });
  }

  /* Smooth anchor scroll (offset for fixed navbar) */
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

  /* ---------- Form "thanks" (strict) ---------- */
  const form = document.getElementById('applicationForm');
  const thanks = document.getElementById('thanks');
  let submitViaBtn = false;

  if (form) {
    const submitBtn = form.querySelector('.submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => { submitViaBtn = true; }, true);
    }

    form.addEventListener('submit', (e) => {
      // Only trigger when the actual submit button submits the form
      const fromBtn = (e.submitter && e.submitter.classList && e.submitter.classList.contains('submit-btn')) || submitViaBtn;
      if (!fromBtn) return;  // ignore any stray submits
      e.preventDefault();
      submitViaBtn = false;

      form.reset();
      if (thanks) {
        thanks.style.display = 'block';
        setTimeout(() => { thanks.style.display = 'none'; }, 4500);
      }
    });
  }

  /* Footer socials — open normally (no interference) */
  document.querySelectorAll('.footer .social-link, .mobile-menu .mobile-social').forEach(a => {
    a.addEventListener('click', (e) => {
      // let the browser handle external links
      e.stopPropagation();
    });
  });
});
