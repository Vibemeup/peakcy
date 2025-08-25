/* ==================================================
   PeakCY — app.js (robust mobile menu + UX helpers)
   ================================================== */

// Clean accidental ?fullName=&... on load (from autofills, etc.)
if (location.search) {
  try { history.replaceState(null, "", location.pathname + location.hash); } catch (_) {}
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
  // Ensure body is visible even if inline fallback missed
  try { document.body.style.opacity = '1'; } catch (_) {}

  /* ------------------------------
     Navbar: add shadow when scrolled
     ------------------------------ */
  const navbar = document.getElementById('navbar');
  const setScrolled = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 8);
  };
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });

  /* --------------------------------------
     Mobile Menu Toggle (robust + scrolllock)
     -------------------------------------- */
  const toggle = document.querySelector('.menu-toggle');
  const menu   = document.querySelector('.mobile-menu');

  if (toggle && menu) {
    let isAnimating = false;

    const open = () => {
      if (isAnimating || !menu.hidden) return;
      isAnimating = true;

      // Ensure width rules apply immediately; CSS transitions will handle opacity/transform
      menu.style.display = 'flex';
      menu.hidden = false;

      // Next frame: mark expanded + lock scroll
      requestAnimationFrame(() => {
        toggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');   // CSS sets overflow:hidden
        isAnimating = false;
      });
    };

    const close = () => {
      if (isAnimating || menu.hidden) return;
      isAnimating = true;

      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');

      // Hide on next frame so styles settle and we avoid "stuck" states
      requestAnimationFrame(() => {
        menu.hidden = true;
        menu.style.display = ''; // release inline style; CSS controls on next open
        isAnimating = false;
      });
    };

    toggle.addEventListener('click', () => (menu.hidden ? open() : close()));

    // Close when a link inside the menu is tapped
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    // Close if clicking outside the menu (and not on the toggle)
    document.addEventListener('click', (e) => {
      if (menu.hidden) return;
      const clickedInsideMenu = menu.contains(e.target);
      const clickedToggle = toggle.contains(e.target);
      if (!clickedInsideMenu && !clickedToggle) close();
    });

    // Safety: if resized to desktop, close and reset
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) close();
    });
  }

  /* -----------------------------------
     Smooth in‑page anchors (with offset)
     ----------------------------------- */
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

  /* ----------------------------
     Simple form "thanks" handler
     ---------------------------- */
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
