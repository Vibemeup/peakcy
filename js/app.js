// ===============================
// PeakCY — FIXED app.js (unified)
// ===============================

/* Strip accidental ?query on load (keep hash) */
if (location.search) {
  try { history.replaceState(null, "", location.pathname + location.hash); }
  catch (_) {}
}

/* Helpers */
function navEl() { return document.getElementById("navbar"); }
function getToggleEl() {
  return document.getElementById("menuToggle") ||
  document.querySelector(".menu-toggle");
}
function getPanelEl() {
  return document.getElementById("mobileMenu") ||
  document.querySelector(".mobile-menu");
}

function setNavHeightVar() {
  const nav = navEl();
  if (nav) document.documentElement.style.setProperty("--nav-height",
  nav.offsetHeight + "px");
}

function getNavHeight() {
  const nav = navEl();
  return nav ? nav.offsetHeight : 64; // fallback
}

function smoothScrollTo(el) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY -
  getNavHeight() - 12;
  window.scrollTo({ top, behavior: "smooth" });
}

function lockScroll() { document.body.style.overflow = "hidden"; }
function unlockScroll() { document.body.style.overflow = ""; }

document.addEventListener("DOMContentLoaded", () => {
  // Make page visible
  try { document.body.style.opacity = "1"; } catch (_) {}

  // Safety: prevent horizontal wobble
  document.documentElement.style.overflowX = "hidden";
  document.body.style.overflowX = "hidden";

  // Nav height CSS var
  setNavHeightVar();
  window.addEventListener("resize", setNavHeightVar);

  const toggle = getToggleEl();
  const panel  = getPanelEl();
  const body   = document.body;

  if (!toggle || !panel) {
    console.error("Missing hamburger toggle || mobile menu elements");
    return;
  }

  // Utility
  const isMenuOpen = () => toggle.getAttribute("aria-expanded") === "true";

  // Initialize menu state (closed)
  toggle.setAttribute("aria-expanded", "false");
  toggle.classList.remove("active");
  panel.classList.remove("is-open", "active");
  panel.setAttribute("hidden", "");
  body.classList.remove("menu-open");
  unlockScroll();

  // Open/Close controls
  const openMenu = () => {
    panel.removeAttribute("hidden");
    panel.classList.add("is-open", "active");
    toggle.classList.add("active");
    toggle.setAttribute("aria-expanded", "true");
    body.classList.add("menu-open");
    lockScroll();
  };

  const closeMenu = () => {
    panel.classList.remove("is-open", "active");
    panel.setAttribute("hidden", "");
    toggle.classList.remove("active");
    toggle.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-open");
    unlockScroll();
  };

  const toggleMenu = () => (isMenuOpen() ? closeMenu() : openMenu());

  // Toggle button click
  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  // Close when clicking a link inside the mobile menu
  panel.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      if (isMenuOpen()) closeMenu();
    });
  });

  // Close on ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen()) closeMenu();
  });

  // Close when clicking outside menu & toggle
  document.addEventListener("click", (e) => {
    if (!isMenuOpen()) return;
    const clickedInsideMenu = panel.contains(e.target);
    const clickedToggle = toggle.contains(e.target);
    if (!clickedInsideMenu && !clickedToggle) closeMenu();
  });

  // Smooth-scroll for in-page anchors (supports "#id" && "/#id")
  const handleAnchorClick = (e, anchor) => {
    const href = anchor.getAttribute("href");
    if (!href) return;

    let id = null;
    if (href.startsWith("#")) id = href.slice(1);
    else if (href.startsWith("/#")) id = href.replace("/#", "");

    if (!id) return;

    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      if (isMenuOpen()) closeMenu();
      smoothScrollTo(el);
      try { history.pushState(null, "", `#${id}`); } catch (_) {}
    }
  };

  document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(anchor =>
  {
    anchor.addEventListener("click", (e) => handleAnchorClick(e, anchor));
  });

  // Handle hash on page load
  if (location.hash) {
    const el = document.getElementById(location.hash.substring(1));
    if (el) setTimeout(() => smoothScrollTo(el), 100);
  }

  // Re-adjust scroll target on resize if hash present (with light debounce)
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      try { if (typeof setNavHeightVar === 'function') setNavHeightVar(); }
    catch(_){}
      // Removed hash-based auto re-scroll on resize to prevent mobile snap-
      // to-top
    }, 150);
  });

  // NAVBAR SCROLL EFFECT
  const navbar = navEl();
  if (navbar) {
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    });
  }
});

// === Hero Video Controls (delegated + poster fade) ===
(function(){
  const hero = document.querySelector('.hero');
  const container = document.querySelector('.hero-video-container');
  const getVideo = () => document.getElementById('heroVideo') ||
  document.querySelector('.hero .hero-video') || document.querySelector('.hero video') || document.querySelector('video');
  const video = getVideo();
  if (!video || !hero) return;

  try {
    video.muted = true;
    video.setAttribute('muted','');
    video.setAttribute('playsinline','');
    video.setAttribute('webkit-playsinline','');
  } catch(_){}

  if (container && video.poster) {
    try { container.style.backgroundImage = `url('${video.poster}')`; } catch(_){}
    container.style.backgroundSize = 'cover';
    container.style.backgroundPosition = 'center';
  }

  function syncUI(){
    const controls = document.querySelector('.hero-video-controls') ||
    document.querySelector('[data-video-controls]');
    const playIcon  = controls && controls.querySelector('.play-icon');
    const pauseIcon = controls && controls.querySelector('.pause-icon');
    const volOnIcon = controls && controls.querySelector('.volume-on');
    const volOffIcon= controls && controls.querySelector('.volume-off');
    const playing = !video.paused;
    const muted   = video.muted;

    if (playIcon && pauseIcon) {
      playIcon.style.display = playing ? 'none' : '';
      pauseIcon.style.display = playing ? '' : 'none';
    }
    if (volOnIcon && volOffIcon) {
      volOnIcon.style.display = muted ? 'none' : '';
      volOffIcon.style.display = muted ? '' : 'none';
    }

    video.style.transition = 'opacity .25s ease';
    video.style.opacity = playing ? '1' : '0';
    video.style.pointerEvents = playing ? 'auto' : 'none';
    hero.classList.toggle('video-paused', !playing);
  }

  document.addEventListener('click', (e) => {
    const root = e.target.closest('.hero-video-controls, [data-video-controls]');
    if (!root) return;

    const btn = e.target.closest('button, [role="button"], .video-toggle, .video-mute, [data-action]');
    if (!btn) return;

    const aria = (btn.getAttribute('aria-label') || '').toLowerCase();
    const cls  = (btn.className || '').toLowerCase();
    const act  = (btn.getAttribute('data-action') || '').toLowerCase();

    const isMute   = cls.includes('video-mute') ||
                     act === 'mute' ||
                     aria.includes('mute') ||
                     aria.includes('unmute');
    const isToggle = cls.includes('video-toggle') ||
                     act === 'toggle' ||
                     aria.includes('play') ||
                     aria.includes('pause');

    if (!(isMute || isToggle)) {
      return;
    }

    e.preventDefault();

    if (isMute) {
      try { video.muted = !video.muted; } catch(_){}
      if (!video.muted && video.volume === 0) {
        try { video.volume = 0.5; } catch(_){}
      }
      return syncUI();
    }

    if (video.paused) {
      try { video.muted = true; } catch(_){}
      const p = video.play();
      if (p && typeof p.then === 'function') p.finally(syncUI); else syncUI();
    } else {
      try { video.pause(); } catch(_){}
      syncUI();
    }
  });

  ['play','pause','volumechange','loadeddata','ended'].forEach(evt => video.addEventListener(evt, syncUI));
  syncUI();
})();

// Mobile apply: scroll directly to the first form field (not the section title)
document.addEventListener("DOMContentLoaded", () => {
  function isMobile() {
    return window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
  }
  function targetApplyField() {
    return document.getElementById("fullName") ||
    document.querySelector("#apply input, #apply textarea, #apply .form-group");
  }
  function scrollToApplyField(e) {
    if (!isMobile()) return false;
    const field = targetApplyField();
    if (!field) return false;
    if (e && e.preventDefault) e.preventDefault();
    if (typeof smoothScrollTo === "function") smoothScrollTo(field);
    else field.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  }

  document.querySelectorAll('a[href="#apply"], a[href="/#apply"]').forEach(a => {
    a.addEventListener("click", (e) => { scrollToApplyField(e); });
  });

  window.addEventListener("load", () => {
    if (location.hash === "#apply") scrollToApplyField();
  });
});

// ===============================
// ENHANCED FUNCTIONALITY FOR PEAKCY
// ===============================

// Typing animation for hero section
function initTypingAnimation() {
  const typedTextSpan = document.querySelector('.typed-text');
  const cursorSpan = document.querySelector('.cursor');

  if (!typedTextSpan || !cursorSpan) return;

  // Reset any existing content from prior initialisations. Without clearing
  // the text up front, repeated calls to initTypingAnimation will append
  // characters to the existing word, resulting in duplicated letters like
  // "wweeaalltthh". Clearing the content ensures a fresh start each time.
  typedTextSpan.textContent = '';
  cursorSpan.classList.remove('typing');

  const textArray = ['health', 'wealth', 'mindset'];
  const typingDelay = 100;
  const erasingDelay = 50;
  const newTextDelay = 1500;
  let textArrayIndex = 0;
  let charIndex = 0;

  function type() {
    if (charIndex < textArray[textArrayIndex].length) {
      if (!cursorSpan.classList.contains('typing'))
        cursorSpan.classList.add('typing');
      typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
      charIndex++;
      setTimeout(type, typingDelay);
    } else {
      cursorSpan.classList.remove('typing');
      setTimeout(erase, newTextDelay);
    }
  }

  function erase() {
    if (charIndex > 0) {
      if (!cursorSpan.classList.contains('typing'))
        cursorSpan.classList.add('typing');
      typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
      charIndex--;
      setTimeout(erase, erasingDelay);
    } else {
      cursorSpan.classList.remove('typing');
      textArrayIndex++;
      if (textArrayIndex >= textArray.length) textArrayIndex = 0;
      setTimeout(type, typingDelay + 1000);
    }
  }

  if (textArray.length) setTimeout(type, newTextDelay + 250);
}

// Counter animation for stats
function initCounterAnimation() {
  const counters = document.querySelectorAll('.stat-number');
  const speed = 200;

  if (!counters.length) return;

  function animateCounters() {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-count');
      const count = +counter.innerText;
      const increment = Math.ceil(target / speed);

      if (count < target) {
        counter.innerText = Math.min(count + increment, target);
        setTimeout(() => animateCounters(), 1);
      }
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) observer.observe(statsBar);
}

// Testimonial slider functionality
function initTestimonialSlider() {
  const testimonials = document.querySelectorAll('.testimonial');
  const dotsContainer = document.querySelector('.testimonial-dots');

  if (!testimonials.length || !dotsContainer) return;

  let currentTestimonial = 0;

  // If dots already exist, remove them before adding new ones. This prevents
  // duplicate dot elements and duplicated event listeners when the slider is
  // initialised multiple times (for example if multiple scripts call this).
  while (dotsContainer.firstChild) {
    dotsContainer.removeChild(dotsContainer.firstChild);
  }

  testimonials.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.classList.add('testimonial-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => showTestimonial(i));
    dotsContainer.appendChild(dot);
  });

  function showTestimonial(index) {
    testimonials[currentTestimonial].classList.remove('active');
    document.querySelectorAll('.testimonial-dot')[currentTestimonial].classList.remove('active');

    currentTestimonial = index;
    if (currentTestimonial >= testimonials.length) currentTestimonial = 0;
    if (currentTestimonial < 0) currentTestimonial = testimonials.length - 1;

    testimonials[currentTestimonial].classList.add('active');
    document.querySelectorAll('.testimonial-dot')[currentTestimonial].classList.add('active');
  }

  const nextBtn = document.querySelector('.testimonial-next');
  const prevBtn = document.querySelector('.testimonial-prev');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      showTestimonial(currentTestimonial + 1);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      showTestimonial(currentTestimonial - 1);
    });
  }

  setInterval(() => {
    showTestimonial(currentTestimonial + 1);
  }, 7000);
}

// Initialize enhanced functionality
document.addEventListener('DOMContentLoaded', function() {
  initTypingAnimation();
  initCounterAnimation();
  initTestimonialSlider();
});