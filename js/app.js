// ===============================
// PeakCY — FINAL app.js (mobile menu + smooth scroll + safety)
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
  // Ensure page visible even if inline script didn't run
  try { document.body.style.opacity = "1"; } catch (_) {}

  // Set CSS var for nav height (for mobile menu top offset) and keep updated
  const navEl = document.getElementById("navbar");
  const setNavHeightVar = () => {
    if (navEl) document.documentElement.style.setProperty("--nav-height", navEl.offsetHeight + "px");
  };
  setNavHeightVar();
  window.addEventListener("resize", setNavHeightVar);

  // Extra safety: prevent horizontal wobble
  try {
    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";
  } catch (_) {}

  // --- Mobile Menu Toggle + a11y
  const menuToggle = document.getElementById("menuToggle") || document.querySelector(".menu-toggle");
  const mobileMenu = document.getElementById("mobileMenu") || document.querySelector(".mobile-menu");

  const openMenu = () => {
    if (!mobileMenu) return;
    mobileMenu.removeAttribute("hidden");
    mobileMenu.classList.add("is-open");  // CSS makes it visible
    mobileMenu.style.display = "block";   // hard fallback in case of CSS caching
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
      const t = e.target;
      if (!mobileMenu.contains(t) && !menuToggle.contains(t)) closeMenu();
    });
  }

  // --- Smooth-scroll for in-page anchors (desktop & mobile)
  const handleAnchorClick = (e, anchor) => {
    const href = anchor.getAttribute("href");
    if (!href) return;

    // Support "#about" and "/#about"
    const isHash = href.startsWith("#");
    const isRootHash = href.startsWith("/#");
    if (!isHash && !isRootHash) return;

    const id = isHash ? href.slice(1) : href.replace("/#", "");
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      if (isMenuOpen()) closeMenu();
      smoothScrollTo(el);
      history.pushState(null, "", `#${id}`);
    }
  };

  // All same-page anchors
  document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(a => {
    a.addEventListener("click", (e) => handleAnchorClick(e, a));
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
      setNavHeightVar();
      if (location.hash) {
        const el = document.getElementById(location.hash.substring(1));
        if (el) smoothScrollTo(el);
      }
    }, 120);
  });
});
