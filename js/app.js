// ===============================
// PeakCY — FIXED app.js (unified)
// ===============================

/* Strip accidental ?query on load (keep hash) */
if (location.search) {
  try { history.replaceState(null, "", location.pathname + location.hash); } catch (_) {}
}

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

  if (!toggle || !panel) {
    console.error("Missing hamburger toggle or mobile menu elements");
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
      if (isMenuOpen()) closeMenu();
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

  // Re-adjust scroll target on resize if hash present (with light debounce)
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      setNavHeightVar();
      if (location.hash) {
        const el = document.getElementById(location.hash.substring(1));
        if (el) smoothScrollTo(el);
      }
    }, 150);
  });

  // ===============================
  // NAVBAR SCROLL EFFECT
  // ===============================
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

// ===== Hero Background Video + Fallback (added) =====
document.addEventListener("DOMContentLoaded", () => {
  const heroSection = document.querySelector(".hero");
  const video = document.getElementById("heroVideo");
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const showFallback = () => {
    try { heroSection && heroSection.classList.add("video-fallback"); } catch (_) {}
  };

  if (!video) { showFallback(); return; }

  // Ensure autoplay-friendly flags (esp. iOS)
  try {
    video.muted = true;
    video.setAttribute("muted","");
    video.setAttribute("playsinline","");
    video.setAttribute("webkit-playsinline","");
    video.setAttribute("autoplay","");
    video.loop = true;
  } catch (_) {}

  // Safe diagnostics (won't throw if console disabled)
  const log = (...args) => { try { console.debug("[heroVideo]", ...args); } catch(_) {} };

  // Attach error handlers
  const onErr = (e) => { log("video error", e && (e.message || e.type)); showFallback(); };
  video.addEventListener("error", onErr);
  Array.from(video.querySelectorAll("source")).forEach(s => s.addEventListener("error", onErr));

  if (prefersReduced) { showFallback(); return; }

  let attempts = 0, played = false;
  const MAX = 5;

  const tryPlay = () => {
    attempts++;
    log("play attempt", attempts, "readyState", video.readyState, "networkState", video.networkState);
    let p;
    try { p = video.play(); } catch (err) { log("play() threw", err && err.message); p = null; }
    if (p && typeof p.then === "function") {
      p.then(() => { played = True; log("autoplay success"); heroSection && heroSection.classList.remove("video-fallback"); })
       .catch((err) => {
         log("autoplay blocked", err && err.message);
         if (attempts < MAX) {
           try { video.currentTime = 0.01; } catch(_) {}
           setTimeout(tryPlay, 250 * attempts);
         } else {
           // User gesture fallback
           const once = () => {
             try { video.muted = true; } catch(_) {}
             video.play().then(() => {
               played = true; heroSection && heroSection.classList.remove("video-fallback");
             }).catch(onErr);
             window.removeEventListener("touchend", once);
             window.removeEventListener("click", once);
           };
           window.addEventListener("touchend", once, { once: true, passive: true });
           window.addEventListener("click", once, { once: true });
           showFallback();
         }
       });
    } else {
      // play() didn't return a promise; assume success or retry
      if (!played && attempts < MAX) setTimeout(tryPlay, 200);
    }
  };

  if (document.visibilityState === "hidden") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && !played) tryPlay();
    }, { once: true });
  }

  if (video.readyState >= 2) tryPlay();
  else {
    const onReady = () => { video.removeEventListener("loadeddata", onReady); tryPlay(); };
    video.addEventListener("loadeddata", onReady);
    setTimeout(() => { if (!played) tryPlay(); }, 1200);
  }

  // Controls (safe-guarded)
  const playIcon  = document.querySelector(".hero-video-controls .play-icon");
  const pauseIcon = document.querySelector(".hero-video-controls .pause-icon");
  const volOnIcon = document.querySelector(".hero-video-controls .volume-on");
  const volOffIcon= document.querySelector(".hero-video-controls .volume-off");
  const toggleBtn = document.querySelector(".hero-video-controls .video-toggle");
  const muteBtn   = document.querySelector(".hero-video-controls .video-mute");

  const updateIcons = () => {
    try {
      if (video.paused) { if (pauseIcon) pauseIcon.style.display = "none"; if (playIcon) playIcon.style.display = ""; }
      else { if (pauseIcon) pauseIcon.style.display = ""; if (playIcon) playIcon.style.display = "none"; }
      if (video.muted) { if (volOnIcon) volOnIcon.style.display = "none"; if (volOffIcon) volOffIcon.style.display = ""; }
      else { if (volOnIcon) volOnIcon.style.display = ""; if (volOffIcon) volOffIcon.style.display = "none"; }
    } catch (_) {}
  };

  if (toggleBtn) toggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (video.paused) {
      try { video.muted = true; } catch(_) {}
      video.play().then(updateIcons).catch(onErr);
    } else {
      try { video.pause(); } catch(_) {}
      updateIcons();
    }
  });

  if (muteBtn) muteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    try { video.muted = !video.muted; } catch(_) {}
    try { if (!video.muted && video.volume === 0) video.volume = 0.5; } catch(_) {}
    updateIcons();
  });

  updateIcons();
});
