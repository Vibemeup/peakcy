// ===============================
// PeakCY — FIXED app.js
// ===============================

/* Strip accidental ?query on load (keep hash) */
if (location.search) {
  try { history.replaceState(null, "", location.pathname + location.hash); } catch (_) {}
}

/* Helpers */
function navEl() { return document.getElementById("navbar"); }
function menuToggleEl() { return document.getElementById("menuToggle"); }
function mobileMenuEl() { return document.getElementById("mobileMenu"); }

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

function lockScroll() { 
  document.body.style.overflow = "hidden"; 
}

function unlockScroll() { 
  document.body.style.overflow = ""; 
}

document.addEventListener("DOMContentLoaded", () => {
  // Make page visible
  document.body.style.opacity = "1";

  // Safety: prevent horizontal wobble
  document.documentElement.style.overflowX = "hidden";
  document.body.style.overflowX = "hidden";

  // Nav height CSS var
  setNavHeightVar();
  window.addEventListener("resize", setNavHeightVar);

  const toggle = menuToggleEl();
  const panel = mobileMenuEl();

  console.log("Toggle element:", toggle);
  console.log("Panel element:", panel);

  if (!toggle || !panel) {
    console.error("Missing hamburger toggle or mobile menu elements");
    return;
  }

  const openMenu = () => {
    console.log("Opening menu");
    panel.removeAttribute("hidden");
    panel.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
    lockScroll();
  };

  const closeMenu = () => {
    console.log("Closing menu");
    panel.classList.remove("is-open");
    panel.setAttribute("hidden", "");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    unlockScroll();
  };

  const isMenuOpen = () => {
    return toggle.getAttribute("aria-expanded") === "true";
  };

  // Initialize menu state
  toggle.setAttribute("aria-expanded", "false");
  panel.setAttribute("hidden", "");
  panel.classList.remove("is-open");

  // Toggle button click
  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Hamburger clicked, current state:", isMenuOpen());
    
    if (isMenuOpen()) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close when clicking menu links
  panel.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", (e) => {
      console.log("Menu link clicked, closing menu");
      closeMenu();
    });
  });

  // Close on ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen()) {
      console.log("ESC pressed, closing menu");
      closeMenu();
    }
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!isMenuOpen()) return;
    
    const clickedInsideMenu = panel.contains(e.target);
    const clickedToggle = toggle.contains(e.target);
    
    if (!clickedInsideMenu && !clickedToggle) {
      console.log("Clicked outside menu, closing");
      closeMenu();
    }
  });

  // Smooth-scroll for in-page anchors
  const handleAnchorClick = (e, anchor) => {
    const href = anchor.getAttribute("href");
    if (!href) return;

    let id = null;
    if (href.startsWith("#")) {
      id = href.slice(1);
    } else if (href.startsWith("/#")) {
      id = href.replace("/#", "");
    }

    if (!id) return;

    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      if (isMenuOpen()) closeMenu();
      smoothScrollTo(el);
      history.pushState(null, "", `#${id}`);
    }
  };

  document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(anchor => {
    anchor.addEventListener("click", (e) => handleAnchorClick(e, anchor));
  });

  // Handle hash on page load
  if (location.hash) {
    const el = document.getElementById(location.hash.substring(1));
    if (el) {
      setTimeout(() => smoothScrollTo(el), 100);
    }
  }

  // Re-adjust scroll target on resize if hash present
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
});