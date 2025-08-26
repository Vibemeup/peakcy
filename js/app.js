// ===============================
// PeakCY — Final app.js
// ===============================

/* --- Clean any accidental query (?foo=...) on load, keep hash --- */
if (location.search) {
  try {
    history.replaceState(null, "", location.pathname + location.hash);
  } catch (_) {}
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

function lockScroll() {
  // Lock horizontal & vertical scroll while menu is open
  document.documentElement.style.overflow = "hidden";
}

function unlockScroll() {
  document.documentElement.style.overflow = "";
}

document.addEventListener("DOMContentLoaded", () => {
  // --- Ensure page is visible even if earlier inline script failed
  try { document.body.style.opacity = "1"; } catch (_) {}

  // --- Kill accidental horizontal wobble in JS as extra safety
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
    menuToggle?.setAttribute("aria-expanded", "true");
    lockScroll();
  };

  const closeMenu = () => {
    if (!mobileMenu) return;
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
      if (!mobileMenu.contains(target) && !menuToggle.contains(target)) {
        closeMenu();
      }
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
      closeMenu(); // just in case we’re on mobile
      smoothScrollTo(el);
      // Update the hash without jumping
      history.pushState(null, "", `#${id}`);
    }
  };

  // All same-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => handleAnchorClick(e, a));
  });

  // Also support anchors like "/#about" that live in the header include
  document.querySelectorAll('a[href^="/#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      const id = href.replace("/#", "");
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        closeMenu();
        smoothScrollTo(el);
        history.pushState(null, "", `#${id}`);
      }
    });
  });

  // If page loads with a hash, offset-scroll to it once DOM is ready
  if (location.hash) {
    const el = document.getElementById(location.hash.substring(1));
    if (el) {
      // Give the browser a tick to finish layout so nav height is correct
      setTimeout(() => smoothScrollTo(el), 0);
    }
  }

  // (Optional) Recalculate on resize—helps if navbar height changes on orientation switch
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
