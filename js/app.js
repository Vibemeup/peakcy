// ===============================
// PeakCY — Final app.js (stable)
// ===============================

/* --- Clean any accidental query (?foo=...) on load, keep hash --- */
if (location.search) {
  try { history.replaceState(null, "", location.pathname + location.hash); } catch (_) {}
}

/* --- Helpers --- */
function getNavHeight() {
  const nav = document.getElementById("navbar");
  return nav ? nav.offsetHeight : 0;
}

function smoothScrollTo(el) {
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - getNavHeight() - 12;
  window.scrollTo({ top: y, behavior: "smooth" });
}

function lockScroll() { document.documentElement.style.overflow = "hidden"; }
function unlockScroll() { document.documentElement.style.overflow = ""; }

document.addEventListener("DOMContentLoaded", () => {
  // Ensure page visible
  try { document.body.style.opacity = "1"; } catch (_) {}

  // Set CSS var for nav height (used by mobile menu top offset)
  const navEl = document.getElementById("navbar");
  const setNavHeightVar = () => {
    if (navEl) document.documentElement.style.setProperty("--nav-height", navEl.offsetHeight + "px");
  };
  setNavHeightVar();
  window.addEventListener("resize", setNavHeightVar);

  // Kill accidental horizontal wobble
  try {
    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";
  } catch (_) {}

  // --- Mobile Menu Toggle + a11y niceties
  const menuToggle = document.getElementById("menuToggle") || document.querySelector(".menu-toggle");
  const mobileMenu = document.getElementById("mobileMenu") || document.querySelector(".mobile-menu");

  const openMenu = () => {
    if (!mobileMenu) return;
    mobileMenu.removeAttribute("hidden");
    mobileMenu.classList.add("is-open");           // force visible via CSS class
    mobileMenu.style.display = "block";            // hard fallback
    menuToggle?.setAttribute("aria-expanded", "true");
    lockScroll();
  };

  const closeMenu = () => {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("hidden", "");
    menuToggle?.setAttribute("aria-expanded", "false");
    unlockScroll();
  };

  const isMenuOpen = () => menuToggle?.getAttribute("aria-expanded") === "true";

  if (menuToggle && mobileMenu) {
    // Toggle on button click
    menuToggle.addEventListener("click", () => {
      if (isMenuOpen()) closeMenu();
      else openMenu();
    });

    // Close when any link inside mobile menu is clicked
    mobileMenu.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => closeMenu());
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isMenuOpen()) closeMenu();
    });

    // Close when clicking outside the menu (but not the toggle)
    document.addEventListener("click", (e) => {
      if (!isMenuOpen()) return;
      const target = e.target;
      if (!mobileMenu.contains(target) && !menuToggle.contains(target)) closeMenu();
    });
  }

  // --- Smooth-scroll for in-page anchors (desktop & mobile)
  const handleAnchorClick = (e, anchor) => {
    const href = anchor.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      if (isMenuOpen()) closeMenu();
      smoothScrollTo(el);
      history.pushState(null, "", `#${id}`);
    }
  };

  // All same-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => handleAnchorClick(e, a));
  });

  // Also support anchors like "/#about"
  document.querySelectorAll('a[href^="/#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      const id = href.replace("/#", "");
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        if (isMenuOpen()) closeMenu();
        smoothScrollTo(el);
        history.pushState(null, "", `#${id}`);
      }
    });
  });

  // If page loads with a hash, offset-scroll to it once DOM is ready
  if (location.hash) {
    const el = document.getElementById(location.hash.substring(1));
    if (el) setTimeout(() => smoothScrollTo(el), 0);
  }

  // Recalculate on resize—helps if navbar height changes
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (location.hash) {
        const el = document.getElementById(location.hash.substring(1));
        if (el) smoothScrollTo(el);
      }
    }, 120);
  });
});
