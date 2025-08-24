/* ===============================
   PeakCY – app.js (mobile fixes + fade-in)
   =============================== */

// Fade-in on load (fix black page if CSS starts at opacity:0)
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '1';
});

/* ---------- Helpers ---------- */
function getNavHeight() {
  const nav = document.querySelector('.navbar');
  return nav ? nav.offsetHeight : 0;
}

function scrollToApplyForm() {
  const formWrap = document.querySelector('#apply .form-wrap') || document.querySelector('#apply');
  if (!formWrap) return;
  const top = formWrap.getBoundingClientRect().top + window.scrollY - getNavHeight() - 12;
  window.scrollTo({ top, behavior: 'smooth' });
}

function isMobile() {
  return window.innerWidth <= 768;
}

/* ---------- Mobile Menu Toggle ---------- */
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isExpanded));
    if (!isExpanded) {
      mobileMenu.removeAttribute('hidden');
    } else {
      mobileMenu.setAttribute('hidden', '');
    }
    // remove tap focus glow on mobile
    menuToggle.blur();
  });

  // Close menu when any link inside the menu is clicked
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.setAttribute('hidden', '');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.hasAttribute('hidden')) {
      mobileMenu.setAttribute('hidden', '');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---------- Smooth scrolling (with mobile #apply special case) ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;

    // If it's the Apply link on mobile, scroll to the form card specifically
    if (isMobile() && href === '#apply') {
      e.preventDefault();
      scrollToApplyForm();
      return;
    }

    // Normal smooth scroll for other anchors
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - getNavHeight() - 20;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// If a user lands on /#apply directly on mobile, adjust scroll after load
document.addEventListener('DOMContentLoaded', () => {
  if (isMobile() && location.hash === '#apply') {
    // allow layout to settle first
    setTimeout(scrollToApplyForm, 0);
  }
});

/* ---------- Navbar scroll effect ---------- */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ---------- Mobile-only: shorten submit button label ---------- */
document.addEventListener('DOMContentLoaded', () => {
  if (!isMobile()) return;
  const btn = document.querySelector('#applicationForm .submit-btn');
  if (btn) btn.textContent = 'Submit Application';
});

// (Form handling placeholder – add your own if needed)
