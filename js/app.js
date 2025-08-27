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
  const hero = document.querySelector(".hero");
  const video = document.getElementById("heroVideo");
  if (!video) return;

  // Minimal: make sure the element has the right flags for mobile autoplay
  try {
    video.muted = true;
    video.setAttribute("muted","");
    video.setAttribute("playsinline","");
    video.setAttribute("webkit-playsinline","");
    video.setAttribute("autoplay","");
    video.loop = true;
  } catch (_) {}

  // Try a single play() and silently fall back to static if blocked
  try {
    const p = video.play();
    if (p && typeof p.then === "function") {
      p.catch(() => { if (hero) hero.classList.add("video-fallback"); });
    }
  } catch (_) {
    if (hero) hero.classList.add("video-fallback");
  }
});
