// ===============================
// PeakCY — app.js (deduplicated fix)
// ===============================

/* Strip accidental ?query on load (keep hash) */
if (location.search) {
  try { history.replaceState(null, "", location.pathname + location.hash); } catch (_) {}
}

/* Global guard */
window.__PEAKCY = window.__PEAKCY || {};

/* Helpers */
function navEl() { return document.getElementById("navbar"); }
function getToggleEl() {
  return document.getElementById("menuToggle") || document.querySelector(".menu-toggle");
}
function getPanelEl() {
  return document.getElementById("mobileMenu") || document.querySelector(".mobile-menu");
}

function setNavHeightVar() {
  const nav = navEl();
  if (nav) document.documentElement.style.setProperty("--nav-height", nav.offsetHeight + "px");
}

function getNavHeight() {
  const nav = navEl();
  return nav ? nav.offsetHeight : 64; // fallback
}

function smoothScrollTo(el) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - getNavHeight() - 12;
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

  if (toggle && panel) {
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

  // Smooth-scroll for in-page anchors (supports "#id" and "/#id")
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
        // best-effort: close menu if open
        const t = getToggleEl(); if (t) t.click();
      }
      smoothScrollTo(el);
      try { history.pushState(null, "", `#${id}`); } catch (_) {}
    }
  };

  document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(anchor => {
    anchor.addEventListener("click", (e) => handleAnchorClick(e, anchor));
  });

  // Handle hash on page load
  if (location.hash) {
    const el = document.getElementById(location.hash.substring(1));
    if (el) setTimeout(() => smoothScrollTo(el), 100);
  }

  // NAVBAR SCROLL EFFECT
  const navbar = navEl();
  if (navbar) {
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 50) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    });
  }
});

// === Hero Video Controls (lean) ===
(function(){
  const hero = document.querySelector('.hero');
  const video = document.querySelector('.hero-video') || document.getElementById('heroVideo');
  if (!video) return;

  // Ensure autoplay-friendly flags remain (for safety)
  try { video.muted = true; video.setAttribute('muted',''); video.setAttribute('playsinline',''); video.setAttribute('webkit-playsinline',''); } catch(_){}

  const toggleBtn = document.querySelector('.hero-video-controls .video-toggle');
  const muteBtn   = document.querySelector('.hero-video-controls .video-mute');
  const playIcon  = document.querySelector('.hero-video-controls .play-icon');
  const pauseIcon = document.querySelector('.hero-video-controls .pause-icon');
  const volOnIcon = document.querySelector('.hero-video-controls .volume-on');
  const volOffIcon= document.querySelector('.hero-video-controls .volume-off');

  function updateIcons(){
    try {
      if (video.paused) { if (pauseIcon) pauseIcon.style.display='none'; if (playIcon) playIcon.style.display=''; }
      else { if (pauseIcon) pauseIcon.style.display=''; if (playIcon) playIcon.style.display='none'; }
      if (video.muted) { if (volOnIcon) volOnIcon.style.display='none'; if (volOffIcon) volOffIcon.style.display=''; }
      else { if (volOnIcon) volOnIcon.style.display=''; if (volOffIcon) volOffIcon.style.display='none'; }
    } catch(_){}
  }

  if (toggleBtn) toggleBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    if (video.paused) {
      try { video.muted = true; } catch(_){}
      video.play().then(()=>{ if (hero) hero.classList.remove('video-paused'); updateIcons(); }).catch(()=>{});
    } else {
      try { video.pause(); } catch(_){}
      if (hero) hero.classList.add('video-paused'); // show static bg when paused
      updateIcons();
    }
  });

  if (muteBtn) muteBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    try { video.muted = !video.muted; } catch(_){}
    try { if (!video.muted && video.volume === 0) video.volume = 0.5; } catch(_){}
    updateIcons();
  });

  ['play','pause','volumechange','loadeddata','ended'].forEach(evt=>video.addEventListener(evt,updateIcons));
  updateIcons();
})();

// Mobile apply: scroll directly to the first form field (not the section title)
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
// DEDUPED ENHANCEMENTS
// ===============================

// Typing animation (health / wealth / mindset) — idempotent
function initTypingAnimation() {
  if (window.__PEAKCY.typingInit) return; // guard
  window.__PEAKCY.typingInit = true;

  const typedTextSpan = document.querySelector('.typed-text');
  const cursorSpan = document.querySelector('.cursor');
  if (!typedTextSpan || !cursorSpan) return;

  const words = ['health', 'wealth', 'mindset'];
  const typingDelay = 100;
  const erasingDelay = 50;
  const newTextDelay = 1500;
  let wi = 0;
  let ci = 0;

  // ensure clean start (prevents "wweeaalltthh" from prior runs)
  typedTextSpan.textContent = "";
  cursorSpan.classList.remove("typing");

  function type() {
    if (ci < words[wi].length) {
      if (!cursorSpan.classList.contains('typing')) cursorSpan.classList.add('typing');
      typedTextSpan.textContent += words[wi].charAt(ci++);
      setTimeout(type, typingDelay);
    } else {
      cursorSpan.classList.remove('typing');
      setTimeout(erase, newTextDelay);
    }
  }

  function erase() {
    if (ci > 0) {
      if (!cursorSpan.classList.contains('typing')) cursorSpan.classList.add('typing');
      typedTextSpan.textContent = words[wi].substring(0, ci - 1);
      ci--;
      setTimeout(erase, erasingDelay);
    } else {
      cursorSpan.classList.remove('typing');
      wi = (wi + 1) % words.length;
      setTimeout(type, typingDelay + 1000);
    }
  }

  if (words.length) setTimeout(type, newTextDelay + 250);
}

// Counter animation — idempotent
function initCounterAnimation() {
  if (window.__PEAKCY.countersInit) return;
  window.__PEAKCY.countersInit = true;

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

  // Start counter animation when stats are in viewport
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

// Testimonial slider — idempotent and self-cleaning
function initTestimonialSlider() {
  const slider = document.querySelector('.testimonial-slider');
  if (!slider || slider.dataset.peakcyInited === "1") return; // guard per element
  slider.dataset.peakcyInited = "1";

  const testimonials = slider.querySelectorAll('.testimonial');
  const dotsContainer = slider.querySelector('.testimonial-dots');
  const nextBtn = slider.querySelector('.testimonial-next');
  const prevBtn = slider.querySelector('.testimonial-prev');
  if (!testimonials.length || !dotsContainer || !nextBtn || !prevBtn) return;

  // Clear any existing dots to avoid duplicates
  dotsContainer.innerHTML = "";

  let current = 0;
  testimonials.forEach((t, i) => t.classList.toggle('active', i === 0));

  // Create dots
  testimonials.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => show(i));
    dotsContainer.appendChild(dot);
  });

  function show(i) {
    testimonials[current].classList.remove('active');
    dotsContainer.children[current].classList.remove('active');
    current = (i + testimonials.length) % testimonials.length;
    testimonials[current].classList.add('active');
    dotsContainer.children[current].classList.add('active');
  }

  prevBtn.addEventListener('click', () => show(current - 1));
  nextBtn.addEventListener('click', () => show(current + 1));

  // Single interval; clear any previous
  if (window.__PEAKCY.testimonialTimer) clearInterval(window.__PEAKCY.testimonialTimer);
  window.__PEAKCY.testimonialTimer = setInterval(() => show(current + 1), 7000);
}

// Initialize all enhanced functionality once
document.addEventListener('DOMContentLoaded', function() {
  initTypingAnimation();
  initCounterAnimation();
  initTestimonialSlider();
});
