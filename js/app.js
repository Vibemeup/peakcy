// ===============================
// PeakCY — FINAL app.js
// ===============================

/* Strip accidental ?query on load (keep hash) */
if (location.search) {
  try { history.replaceState(null, "", location.pathname + location.hash); } catch (_) {}
}

/* Helpers */
function navEl() { return document.getElementById("navbar"); }
function menuToggleEl() { return document.getElementById("menuToggle") || document.querySelector(".menu-toggle"); }
function mobileMenuEl() { return document.getElementById("mobileMenu") || document.querySelector(".mobile-menu"); }

function setNavHeightVar() {
  const nav = navEl();
  if (nav) document.documentElement.style.setProperty("--nav-height", nav.offsetHeight + "px");
}

function getNavHeight() {
  const nav = navEl();
  return nav ? nav.offsetHeight : 0;
}

function smoothScrollTo(el) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - getNavHeight() - 12;
  window.scrollTo({ top, behavior: "smooth" });
}

function lockScroll() {
  document.documentElement.style.overflow = "hidden";
}

function unlockScroll() {
  document.documentElement.style.overflow = "";
}

document.addEventListener("DOMContentLoaded", () => {
  // Always show page even if inline script didn’t run
  try { document.body.style.opacity = "1"; } catch (_) {}

  // Prevent horizontal wobble as a safety
  document.documentElement.style.overflowX = "hidden";
  document.body.style.overflowX = "hidden";

  setNavHeightVar();
  window.addEventListener("resize", setNavHeightVar);

  const toggle = menuToggleEl();
  const panel  = mobileMenuEl();

  const openMenu = () => {
    if (!panel) return;
    panel.removeAttribute("hidden");
    panel.classList.add("is-open");
    panel.style.display = "block"; // hard fallback against old CSS
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
    lockScroll();
  };

  const closeMenu = () => {
    if (!panel) return;
    panel.classList.remove("is-open");
    panel.setAttribute("hidden", "");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    unlockScroll();
  };

  const isMenuOpen = () => toggle && toggle.getAttribute("aria-expanded") === "true";

  if (toggle && panel) {
    // Toggle button
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      isMenuOpen() ? closeMenu() : openMenu();
    });

    // Close when clicking a link inside the panel
    panel.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => closeMenu());
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isMenuOpen()) closeMenu();
    });

    // Close when clicking outside panel & toggle
    document.addEventListener("click", (e) => {
      if (!isMenuOpen()) return;
      const t = e.target;
      if (!panel.contains(t) && !toggle.contains(t)) closeMenu();
    });
  }

  // Smooth-scroll for in-page anchors like #about
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
      history.pushState(null, "", `#${id}`);
    }
  };

  document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(a => {
    a.addEventListener("click", (e) => handleAnchorClick(e, a));
  });

  // If page loads with a hash, offset-scroll to it after layout
  if (location.hash) {
    const el = document.getElementById(location.hash.substring(1));
    if (el) setTimeout(() => smoothScrollTo(el), 0);
  }

  // Re-adjust scroll target on orientation/resize if hash present
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
