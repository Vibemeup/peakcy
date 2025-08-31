// ===============================
// PeakCY — app.js (FULL, deduped, pause-overlay restored)
// ===============================

/* Strip accidental ?query on load (keep hash) */
if (location.search) {
  try { history.replaceState(null, "", location.pathname + location.hash); } catch (_) {}
}

/* Global guard namespace */
window.__PEAKCY = window.__PEAKCY || {};

/* Helpers */
function navEl() { return document.getElementById("navbar"); }
function getToggleEl() { return document.getElementById("menuToggle") || document.querySelector(".menu-toggle"); }
function getPanelEl() { return document.getElementById("mobileMenu") || document.querySelector(".mobile-menu"); }
function setNavHeightVar() { const nav = navEl(); if (nav) document.documentElement.style.setProperty("--nav-height", nav.offsetHeight + "px"); }
function getNavHeight() { const nav = navEl(); return nav ? nav.offsetHeight : 64; }
function smoothScrollTo(el) { if (!el) return; const top = el.getBoundingClientRect().top + window.scrollY - getNavHeight() - 12; window.scrollTo({ top, behavior: "smooth" }); }
function lockScroll() { document.body.style.overflow = "hidden"; }
function unlockScroll() { document.body.style.overflow = ""; }

document.addEventListener("DOMContentLoaded", () => {
  try { document.body.style.opacity = "1"; } catch (_) {}
  document.documentElement.style.overflowX = "hidden";
  document.body.style.overflowX = "hidden";

  setNavHeightVar(); window.addEventListener("resize", setNavHeightVar);

  const toggle = getToggleEl();
  const panel  = getPanelEl();
  const body   = document.body;

  if (toggle && panel) {
    const isMenuOpen = () => toggle.getAttribute("aria-expanded") === "true";

    // Initialize menu state (closed)
    toggle.setAttribute("aria-expanded", "false");
    toggle.classList.remove("active");
    panel.classList.remove("is-open", "active");
    panel.setAttribute("hidden", "");
    body.classList.remove("menu-open");
    unlockScroll();

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
  }

  // Smooth-scroll for in-page anchors
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
      if (document.body.classList.contains("menu-open")) {
        const t = getToggleEl(); if (t) t.click();
      }
      smoothScrollTo(el);
      try { history.pushState(null, "", `#${id}`); } catch (_) {}
    }
  };

  document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(anchor => {
    anchor.addEventListener("click", (e) => handleAnchorClick(e, anchor));
  });

  if (location.hash) {
    const el = document.getElementById(location.hash.substring(1));
    if (el) setTimeout(() => smoothScrollTo(el), 100);
  }

  // Navbar scroll effect
  const navbar = navEl();
  if (navbar) {
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 50) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    });
  }
});

// === Hero Video Controls (delegated + poster fade) ===
(function(){
  const hero = document.querySelector('.hero');
  const container = document.querySelector('.hero-video-container');
  const video = document.getElementById('heroVideo') || document.querySelector('.hero-video');
  if (!video || !hero) return;

  try {
    video.muted = true;
    video.setAttribute('muted','');
    video.setAttribute('playsinline','');
    video.setAttribute('webkit-playsinline','');
  } catch(_) {}

  // Set container bg to poster so it's visible when video fades
  try { if (container && video.poster) { container.style.backgroundImage = `url('${video.poster}')`; } } catch(_){}
  if (container) { container.style.backgroundSize = 'cover'; container.style.backgroundPosition = 'center'; }

  function syncUI() {
    const playI  = document.querySelector('.hero-video-controls .play-icon');
    const pauseI = document.querySelector('.hero-video-controls .pause-icon');
    const volOn  = document.querySelector('.hero-video-controls .volume-on');
    const volOff = document.querySelector('.hero-video-controls .volume-off');
    const playing = !video.paused;
    const muted   = video.muted;

    if (playI && pauseI) {
      playI.style.display  = playing ? 'none' : '';
      pauseI.style.display = playing ? '' : 'none';
    }
    if (volOn && volOff) {
      volOn.style.display  = muted ? 'none' : '';
      volOff.style.display = muted ? '' : 'none';
    }

    // Fade the video (independent of theme CSS)
    video.style.transition = 'opacity .25s ease';
    video.style.opacity = playing ? '1' : '0';
    video.style.pointerEvents = playing ? 'auto' : 'none';

    hero.classList.toggle('video-paused', !playing);
  }

  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('.hero-video-controls .video-toggle');
    const muteBtn   = e.target.closest('.hero-video-controls .video-mute');
    if (toggleBtn) {
      e.preventDefault();
      if (video.paused) {
        try { video.muted = true; } catch(_){}
        const p = video.play();
        if (p && typeof p.then === 'function') p.finally(syncUI); else syncUI();
      } else {
        try { video.pause(); } catch(_){}
        syncUI();
      }
    } else if (muteBtn) {
      e.preventDefault();
      try { video.muted = !video.muted; } catch(_){}
      if (!video.muted && video.volume === 0) { try { video.volume = 0.5; } catch(_){ } }
      syncUI();
    }
  });

  ['play','pause','volumechange','loadeddata','ended'].forEach(evt => video.addEventListener(evt, syncUI));
  syncUI();
})();

// Mobile apply: scroll directly to the first form field
document.addEventListener("DOMContentLoaded", () => {
  function isMobile() { return window.matchMedia && window.matchMedia("(max-width: 768px)").matches; }
  function targetApplyField() {
    return document.getElementById("fullName") || document.querySelector("#apply input, #apply textarea, #apply .form-group");
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
// ENHANCED FUNCTIONALITY (deduped)
// ===============================

// Typing animation for hero section
function initTypingAnimation() {
  if (window.__PEAKCY.typingInit) return;
  window.__PEAKCY.typingInit = true;

  const typedTextSpan = document.querySelector('.typed-text');
  const cursorSpan = document.querySelector('.cursor');
  if (!typedTextSpan || !cursorSpan) return;

  const textArray = ['health', 'wealth', 'mindset']; // requested words
  const typingDelay = 100;
  const erasingDelay = 50;
  const newTextDelay = 1500;
  let textArrayIndex = 0;
  let charIndex = 0;

  // clean start to prevent doubled letters
  typedTextSpan.textContent = "";
  cursorSpan.classList.remove('typing');

  function type() {
    if (charIndex < textArray[textArrayIndex].length) {
      if (!cursorSpan.classList.contains('typing')) cursorSpan.classList.add('typing');
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
      if (!cursorSpan.classList.contains('typing')) cursorSpan.classList.add('typing');
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
  if (window.__PEAKCY.countersInit) return;
  window.__PEAKCY.countersInit = true;

  const counters = document.querySelectorAll('.stat-number');
  const speed = 200;
  if (!counters.length) return;

  function step() {
    let pending = 0;
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-count');
      const count = +counter.innerText;
      const increment = Math.ceil(target / speed);

      if (count < target) {
        counter.innerText = Math.min(count + increment, target);
        pending++;
      }
    });
    if (pending) requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        step();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) observer.observe(statsBar);
}

// Testimonial slider functionality
function initTestimonialSlider() {
  const slider = document.querySelector('.testimonial-slider');
  if (!slider || slider.dataset.peakcyInited === "1") return;
  slider.dataset.peakcyInited = "1";

  const testimonials = slider.querySelectorAll('.testimonial');
  const dotsContainer = slider.querySelector('.testimonial-dots');
  const nextBtn = slider.querySelector('.testimonial-next');
  const prevBtn = slider.querySelector('.testimonial-prev');
  if (!testimonials.length || !dotsContainer || !nextBtn || !prevBtn) return;

  dotsContainer.innerHTML = "";
  let currentTestimonial = 0;
  testimonials.forEach((t, i) => t.classList.toggle('active', i === 0));

  testimonials.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => showTestimonial(i));
    dotsContainer.appendChild(dot);
  });

  function showTestimonial(index) {
    testimonials[currentTestimonial].classList.remove('active');
    dotsContainer.children[currentTestimonial].classList.remove('active');

    currentTestimonial = (index + testimonials.length) % testimonials.length;

    testimonials[currentTestimonial].classList.add('active');
    dotsContainer.children[currentTestimonial].classList.add('active');
  }

  prevBtn.addEventListener('click', () => showTestimonial(currentTestimonial - 1));
  nextBtn.addEventListener('click', () => showTestimonial(currentTestimonial + 1));

  if (window.__PEAKCY.testimonialTimer) clearInterval(window.__PEAKCY.testimonialTimer);
  window.__PEAKCY.testimonialTimer = setInterval(() => showTestimonial(currentTestimonial + 1), 7000);
}

// Initialize all enhanced functionality
document.addEventListener('DOMContentLoaded', function() {
  initTypingAnimation();
  initCounterAnimation();
  initTestimonialSlider();
});