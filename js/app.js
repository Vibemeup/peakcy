// Clean accidental ?fullName=&... on load (from form autocompletes etc.)
if (location.search) {
  history.replaceState(null, "", location.pathname + location.hash);
}

function getNavHeight() {
  const nav = document.getElementById('navbar');
  return nav ? nav.offsetHeight : 0;
}

function smoothScrollTo(el) {
  const y = el.getBoundingClientRect().top + window.scrollY - getNavHeight() - 12;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
  // Ensure page visible even if earlier inline scripts were delayed
  try { document.body.style.opacity = '1'; } catch (_) {}

  // --- Navbar shadow on scroll
  const navbar = document.getElementById('navbar');
  const setScrolled = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 8);
  };
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });

  // --- Mobile Menu Toggle + Body Scroll Lock
  const toggle = document.querySelector('.menu-toggle');
  const menu   = document.querySelector('.mobile-menu');

  if (toggle && menu) {
    const open = () => {
      menu.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');     // lock body scroll
    };
    const close = () => {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');  // unlock
    };

    toggle.addEventListener('click', () => (menu.hidden ? open() : close()));

    // Close on any menu link click
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

    // Safety: close if resized to desktop
    window.addEventListener('resize', () => { if (innerWidth > 768) close(); });
  }

  // --- Smooth scroll for in‑page anchors (including nav & footer)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      smoothScrollTo(target);
      history.pushState(null, "", id);
    });
  });

  // --- Simple form handler (no backend yet): show thanks, clear fields
  const form = document.getElementById('applicationForm');
  const thanks = document.getElementById('thanks');
  if (form && thanks) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.reset();
      thanks.style.display = 'block';
      setTimeout(() => { thanks.style.display = 'none'; }, 4500);
    });
  }
});
