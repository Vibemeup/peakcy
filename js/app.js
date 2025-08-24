/* =========================
   PeakCY — app.js (mobile + fade-in fixes)
   ========================= */

// 1) Fade the page in (your CSS starts at body{opacity:0})
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '1';
});

// 2) Mobile menu toggle (with centered X + blur to remove tap outline)
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    const next = !isExpanded;

    menuToggle.setAttribute('aria-expanded', String(next));
    if (next) {
      mobileMenu.removeAttribute('hidden');
    } else {
      mobileMenu.setAttribute('hidden', '');
    }

    // Prevent the green outline from lingering after tap
    menuToggle.blur();
  });

  // Close menu when clicking any link inside it
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

// 3) Smooth scrolling for in-page anchors (accounts for fixed navbar)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const nav = document.querySelector('.navbar');
    const navHeight = nav ? nav.offsetHeight : 0;

    window.scrollTo({
      top: target.offsetTop - navHeight - 20,
      behavior: 'smooth'
    });

    // If we clicked a link from the mobile menu, close it
    if (mobileMenu && !mobileMenu.hasAttribute('hidden')) {
      mobileMenu.setAttribute('hidden', '');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// 4) Navbar shadow/color on scroll
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

// 5) (Optional placeholder) Form handling
// const form = document.getElementById('applicationForm');
// if (form) { /* your form logic here */ }
