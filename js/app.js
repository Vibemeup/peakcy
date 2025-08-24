// ------- Fade-in on load (also backed up by tiny inline snippet) -------
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '1';
});

// ------- Mobile Menu Toggle -------
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isExpanded));
    if (!isExpanded) mobileMenu.removeAttribute('hidden');
    else mobileMenu.setAttribute('hidden', '');
    menuToggle.blur(); // clear focus outline after tap
  });

  // Close menu when a link is tapped
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.setAttribute('hidden', '');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.hasAttribute('hidden')) {
      mobileMenu.setAttribute('hidden', '');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ------- Smooth scrolling (desktop + mobile) -------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;

    // On mobile, #apply should scroll to the form card itself
    if (href === '#apply' && window.innerWidth <= 768) {
      e.preventDefault();
      scrollToApplyForm();
      return;
    }

    e.preventDefault();
    const nav = document.querySelector('.navbar');
    const navHeight = nav ? nav.offsetHeight : 0;
    window.scrollTo({
      top: target.offsetTop - navHeight - 20,
      behavior: 'smooth'
    });
  });
});

function scrollToApplyForm() {
  const nav = document.querySelector('.navbar');
  const navHeight = nav ? nav.offsetHeight : 0;
  const formWrap = document.querySelector('#apply .form-wrap') || document.querySelector('#apply');
  if (!formWrap) return;
  const top = formWrap.getBoundingClientRect().top + window.scrollY - navHeight - 12;
  window.scrollTo({ top, behavior: 'smooth' });
}

// If user lands directly on #apply on mobile, align to the form
document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 768 && location.hash === '#apply') {
    setTimeout(scrollToApplyForm, 0);
  }
});

// ------- Navbar scroll effect -------
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }, { passive: true });
}

// ------- Mobile: shorten button label (desktop unchanged) -------
document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 768) {
    const btn = document.querySelector('#applicationForm .submit-btn');
    if (btn) btn.firstChild.nodeValue = 'Submit Application';
  }
});

// (Form handling placeholder – wire up later if needed)
