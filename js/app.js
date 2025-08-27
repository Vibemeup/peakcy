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
  const heroVideo = document.querySelector(".hero-video");
  const playIcon  = document.querySelector(".hero-video-controls .play-icon");
  const pauseIcon = document.querySelector(".hero-video-controls .pause-icon");
  const volOnIcon = document.querySelector(".hero-video-controls .volume-on");
  const volOffIcon= document.querySelector(".hero-video-controls .volume-off");
  const toggleBtn = document.querySelector(".hero-video-controls .video-toggle");
  const muteBtn   = document.querySelector(".hero-video-controls .video-mute");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// If user prefers reduced motion, immediately show fallback and stop further video handling
if (prefersReducedMotion) {
  showFallback();
  return;
}

  function ensureMutedAttribute(el) {
    if (!el) return;
    if (!el.hasAttribute("muted")) el.setAttribute("muted", "");
    el.muted = true;
  }
  function safePlay(el) {
    try {
      const p = el.play();
      if (p && typeof p.then === "function") return p.catch(() => false);
      return Promise.resolve(true);
    } catch (_) { return Promise.resolve(false); }
  }
  function showFallback() {
    if (heroSection) heroSection.classList.add("video-fallback");
  }

  if (heroVideo) {
    ensureMutedAttribute(heroVideo);
    heroVideo.setAttribute("playsinline", "");
    heroVideo.loop = true;
    heroVideo.addEventListener("error", showFallback);

    // Try immediate autoplay if allowed
    (async () => {
      if (prefersReducedMotion) return;
      const ok = await safePlay(heroVideo);
      if (!ok) showFallback();
    })();

    // Pause/resume when off/on screen
    const io = new IntersectionObserver(async (entries) => {
      for (const entry of entries) {
        if (prefersReducedMotion) return;
        if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
          await safePlay(heroVideo);
          if (pauseIcon && playIcon) { pauseIcon.style.display = ""; playIcon.style.display = "none"; }
        } else {
          try { heroVideo.pause(); } catch(_) {}
          if (pauseIcon && playIcon) { pauseIcon.style.display = "none"; playIcon.style.display = ""; }
        }
      }
    }, { threshold: [0, 0.25, 0.5, 1] });
    io.observe(heroVideo);

    // Tab hidden/visible
    document.addEventListener("visibilitychange", async () => {
      if (document.hidden) {
        try { heroVideo.pause(); } catch(_) {}
        if (pauseIcon && playIcon) { pauseIcon.style.display = "none"; playIcon.style.display = ""; }
      } else if (!prefersReducedMotion) {
        await safePlay(heroVideo);
        if (pauseIcon && playIcon) { pauseIcon.style.display = ""; playIcon.style.display = "none"; }
      }
    });

    // Controls
    if (toggleBtn) {
      toggleBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        if (heroVideo.paused) {
          ensureMutedAttribute(heroVideo);
          await safePlay(heroVideo);
          if (pauseIcon && playIcon) { pauseIcon.style.display = ""; playIcon.style.display = "none"; }
        } else {
          heroVideo.pause();
          if (pauseIcon && playIcon) { pauseIcon.style.display = "none"; playIcon.style.display = ""; }
        }
      });
    }
    if (muteBtn) {
      muteBtn.addEventListener("click", (e) => {
        e.preventDefault();
        heroVideo.muted = !heroVideo.muted;
        if (heroVideo.muted) {
          if (volOnIcon && volOffIcon) { volOnIcon.style.display = "none"; volOffIcon.style.display = ""; }
        } else {
          if (volOnIcon && volOffIcon) { volOnIcon.style.display = ""; volOffIcon.style.display = "none"; }
          try { heroVideo.volume = 0.5; } catch(_) {}
        }
      });
    }

    // Init icons
    (function initIcons(){
      if (heroVideo.paused) {
        if (pauseIcon && playIcon) { pauseIcon.style.display = "none"; playIcon.style.display = ""; }
      } else {
        if (pauseIcon && playIcon) { pauseIcon.style.display = ""; playIcon.style.display = "none"; }
      }
      if (heroVideo.muted) {
        if (volOnIcon && volOffIcon) { volOnIcon.style.display = "none"; volOffIcon.style.display = ""; }
      } else {
        if (volOnIcon && volOffIcon) { volOnIcon.style.display = ""; volOffIcon.style.display = "none"; }
      }
    })();
  }
});
