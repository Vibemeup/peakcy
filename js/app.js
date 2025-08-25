// --- Clean any accidental ?fullName=&... on load
if (location.search) {
  history.replaceState(null, "", location.pathname + location.hash);
}

function getNavHeight() {
  const nav = document.getElementById('navbar');
  return nav ? nav.offsetHeight : 0;
}

function scrollToTarget(el) {
  const y = el.getBoundingClientRect().top + window.scrollY - getNavHeight() - 12;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
  // --- Ensure page visible even if inline script delayed
  try { document.body.style.opacity = '1'; } catch (_) {}

  // --- Mobile Menu Toggle + a11y niceties
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (menuToggle && mobileMenu) {
    const closeMenu = () => {
      mobileMenu.setAttribute('hidden', '');
      menuToggle.setAttribute('aria-expanded', 'false');
    };
    const openMenu = () => {
      mobileMenu.removeAttribute('hidden');
      menuToggle.setAttribute('aria-expanded', 'true');
    };

    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    // Close on link click (within menu)
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeMenu);
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!mobileMenu.hasAttribute('hidden')) {
        const withinMenu = mobileMenu.contains(e.target);
        const onToggle = menuToggle.contains(e.target);
        if (!withinMenu && !onToggle) closeMenu();
      }
    });
  }

  // --- Smooth scroll (account for fixed navbar)
  // Handle anchors on same page (works for <a href="#id"> and <a href="/path#id"> on same pathname)
  document.querySelectorAll('a[href*="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const url = new URL(link.href, location.href);
      if (url.pathname !== location.pathname) return; // different page
      const hash = url.hash;
      if (!hash || hash === '#') return;

      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();
      scrollToTarget(target);
      // Keep the hash in the URL (optional: uncomment next line)
      // history.pushState(null, "", hash);
    });
  });

  // --- Navbar shadow on scroll (and set initial state)
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const setShadow = () => {
      if (window.scrollY > 100) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    };
    setShadow();
    window.addEventListener('scroll', setShadow, { passive: true });
  }

  // --- Apply form: submit via POST, show thank-you (if #thanks exists)
  const form = document.getElementById('applicationForm');
  if (form) {
    const submitBtn = form.querySelector('[type="submit"]');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const action = form.getAttribute('action');

      // Guard: don’t POST to '#'
      if (!action || action === '#') {
        alert('Form action is not configured.');
        return;
      }

      const fd = new FormData(form);
      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.dataset.originalText = submitBtn.textContent || '';
          submitBtn.textContent = 'Sending...';
        }

        const res = await fetch(action, { method: 'POST', body: fd });
        // You can check res.ok; for now assume success if we got a response
        if (!res.ok) throw new Error('Bad response');

        form.reset();

        const thanks = document.getElementById('thanks');
        if (thanks) {
          thanks.style.display = 'block';
          // Scroll the user to the thank you message
          scrollToTarget(thanks);
        }

        // Clean any appended query again (just in case server redirects back)
        history.replaceState(null, "", location.pathname + location.hash);
      } catch (err) {
        alert('Submission failed. Please try again later.');
        // console.error(err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText || 'Send';
        }
      }
    });
  }

  // --- Align nicely when landing on a hash (direct visit or reload)
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) setTimeout(() => scrollToTarget(target), 0);
  }

  // --- Micro reveal on scroll (no layout shifts)
  const revealables = document.querySelectorAll(
    '.about-unified-card, .identity-card, .pillar-card, .quote-box, .form-wrap'
  );
  if ('IntersectionObserver' in window) {
    revealables.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '40px 0px' });
    revealables.forEach(el => io.observe(el));
  }
});

// --- Close mobile menu on resize-up and click-outside
(function(){
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (!menuToggle || !mobileMenu) return;

  // close on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && !mobileMenu.hasAttribute('hidden')) {
      mobileMenu.setAttribute('hidden', '');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // click outside to close
  document.addEventListener('click', (e) => {
    if (mobileMenu.hasAttribute('hidden')) return;
    const withinMenu = mobileMenu.contains(e.target);
    const onToggle   = menuToggle.contains(e.target);
    if (!withinMenu && !onToggle) {
      mobileMenu.setAttribute('hidden', '');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
})();
