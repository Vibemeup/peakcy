// Clean any accidental ?fullName=&... on load
if (location.search) {
  history.replaceState(null, "", location.pathname + location.hash);
}

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    if (isOpen) mobileMenu.setAttribute('hidden', '');
    else mobileMenu.removeAttribute('hidden');
  });

  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.setAttribute('hidden', '');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Smooth scroll (account for fixed navbar)
function scrollToTarget(el) {
  const nav = document.getElementById('navbar');
  const navH = nav ? nav.offsetHeight : 0;
  const y = el.getBoundingClientRect().top + window.scrollY - navH - 12;
  window.scrollTo({ top: y, behavior: 'smooth' });
}
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    scrollToTarget(target);
  });
});

// Navbar shadow on scroll
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }, { passive: true });
}

// Apply form: submit via POST, show thank-you (if #thanks exists)
const form = document.getElementById('applicationForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    try {
      await fetch(form.action || '#', { method: 'POST', body: fd });
      form.reset();
      const thanks = document.getElementById('thanks');
      if (thanks) thanks.style.display = 'block';
      history.replaceState(null, "", location.pathname + location.hash);
    } catch (err) {
      alert('Submission failed. Please try again later.');
    }
  });
}

// Align nicely when landing on a hash
document.addEventListener('DOMContentLoaded', () => {
  if (location.hash && document.querySelector(location.hash)) {
    scrollToTarget(document.querySelector(location.hash));
  }
});

// Micro reveal on scroll (no layout changes)
const revealables = document.querySelectorAll(
  '.about-unified-card, .identity-card, .pillar-card, .quote-box, .form-wrap'
);
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
}, { threshold: 0.16 });
revealables.forEach(el => io.observe(el));
