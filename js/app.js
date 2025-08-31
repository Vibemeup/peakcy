// ===============================
// PeakCY — app.js (FULL robust)
// ===============================

/* Strip accidental ?query on load (keep hash) */
if (location.search) {
  try { history.replaceState(null, "", location.pathname + location.hash); } catch (_) {}
}

/* Namespace for idempotent inits */
window.__PEAKCY = window.__PEAKCY || {};

/* Helpers */
function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
function navEl(){ return qs("#navbar"); }
function setNavHeightVar(){ const nav=navEl(); if(nav) document.documentElement.style.setProperty("--nav-height", nav.offsetHeight+"px"); }
function getNavHeight(){ const nav=navEl(); return nav?nav.offsetHeight:64; }
function smoothScrollTo(el){ if(!el) return; const top = el.getBoundingClientRect().top + window.scrollY - getNavHeight() - 12; window.scrollTo({top, behavior:"smooth"}); }
function lockScroll(){ document.body.style.overflow = "hidden"; }
function unlockScroll(){ document.body.style.overflow = ""; }

document.addEventListener("DOMContentLoaded", () => {
  try { document.body.style.opacity = "1"; } catch(_) {}
  document.documentElement.style.overflowX = "hidden";
  document.body.style.overflowX = "hidden";
  setNavHeightVar(); window.addEventListener("resize", setNavHeightVar);

  // ===== Mobile menu (robust, delegated) =====
  if (!window.__PEAKCY.menuInit) {
    window.__PEAKCY.menuInit = true;

    document.addEventListener("click", (e) => {
      const toggle = e.target.closest("#menuToggle, .menu-toggle, [data-menu-toggle]");
      if (!toggle) return;

      // Find panel: aria-controls / data-target / fallback ids/classes
      const targetId = toggle.getAttribute("aria-controls") || toggle.getAttribute("data-target") || "mobileMenu";
      let panel = document.getElementById(targetId) || qs(targetId) || qs("#mobileMenu") || qs(".mobile-menu");

      if (!panel) return;

      const isOpen = toggle.getAttribute("aria-expanded") === "true" || panel.classList.contains("is-open") || !panel.hasAttribute("hidden");

      if (!isOpen) {
        panel.removeAttribute("hidden");
        panel.classList.add("is-open", "active");
        toggle.classList.add("active");
        toggle.setAttribute("aria-expanded", "true");
        document.body.classList.add("menu-open");
        lockScroll();
      } else {
        panel.classList.remove("is-open", "active");
        panel.setAttribute("hidden", "");
        toggle.classList.remove("active");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
        unlockScroll();
      }
    });

    // Close on escape
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const panel = qs("#mobileMenu, .mobile-menu");
      const toggle = qs("#menuToggle, .menu-toggle, [data-menu-toggle]");
      if (panel && (panel.classList.contains("is-open") || !panel.hasAttribute("hidden"))) {
        panel.classList.remove("is-open", "active");
        panel.setAttribute("hidden", "");
        if (toggle) { toggle.classList.remove("active"); toggle.setAttribute("aria-expanded", "false"); }
        document.body.classList.remove("menu-open");
        unlockScroll();
      }
    });

    // Close when clicking a link inside panel
    document.addEventListener("click", (e) => {
      const panel = qs("#mobileMenu, .mobile-menu");
      if (!panel) return;
      if (!panel.contains(e.target)) return;
      const link = e.target.closest("a[href]");
      if (!link) return;
      // Only close for same-page anchors or internal links; otherwise let navigation replace the page
      const href = link.getAttribute("href") || "";
      const isAnchor = href.startsWith("#") || href.startsWith("/#");
      if (isAnchor) {
        panel.classList.remove("is-open", "active");
        panel.setAttribute("hidden", "");
        const toggle = qs("#menuToggle, .menu-toggle, [data-menu-toggle]");
        if (toggle) { toggle.classList.remove("active"); toggle.setAttribute("aria-expanded", "false"); }
        document.body.classList.remove("menu-open");
        unlockScroll();
      }
    });
  }

  // ===== Smooth-scroll for in-page anchors =====
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
        const t = qs("#menuToggle, .menu-toggle, [data-menu-toggle]"); if (t) t.click();
      }
      smoothScrollTo(el);
      try { history.pushState(null, "", `#${id}`); } catch(_) {}
    }
  };
  qsa('a[href^="#"], a[href^="/#"]').forEach(a => a.addEventListener("click", (e) => handleAnchorClick(e, a)));

  if (location.hash) {
    const el = document.getElementById(location.hash.substring(1));
    if (el) setTimeout(() => smoothScrollTo(el), 100);
  }

  // Navbar scroll effect
  const navbar = navEl();
  if (navbar) {
    window.addEventListener("scroll", () => {
      const y = window.pageYOffset;
      if (y > 50) navbar.classList.add("scrolled"); else navbar.classList.remove("scrolled");
    });
  }
});

// ===== Hero Video Controls (delegated + poster fade) =====
(function(){
  const hero = qs(".hero");
  const container = qs(".hero-video-container");
  const video = document.getElementById("heroVideo") || qs(".hero-video");
  if (!video || !hero) return;

  try {
    video.muted = true;
    video.setAttribute("muted","");
    video.setAttribute("playsinline","");
    video.setAttribute("webkit-playsinline","");
  } catch(_){}

  // Ensure container shows poster (fallback background) when video is faded
  if (container && video.poster) {
    try { container.style.backgroundImage = `url('${video.poster}')`; } catch(_){}
    container.style.backgroundSize = "cover";
    container.style.backgroundPosition = "center";
  }

  function syncUI(){
    const playI  = qs(".hero-video-controls .play-icon");
    const pauseI = qs(".hero-video-controls .pause-icon");
    const volOn  = qs(".hero-video-controls .volume-on");
    const volOff = qs(".hero-video-controls .volume-off");
    const playing = !video.paused;
    const muted   = video.muted;

    if (playI && pauseI) {
      playI.style.display  = playing ? "none" : "";
      pauseI.style.display = playing ? "" : "none";
    }
    if (volOn && volOff) {
      volOn.style.display  = muted ? "none" : "";
      volOff.style.display = muted ? "" : "none";
    }

    // Fade via inline styles (not dependent on theme CSS)
    video.style.transition = "opacity .25s ease";
    video.style.opacity = playing ? "1" : "0";
    video.style.pointerEvents = playing ? "auto" : "none";

    hero.classList.toggle("video-paused", !playing);
  }

  // Delegated click handlers
  document.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest(".hero-video-controls .video-toggle");
    const muteBtn   = e.target.closest(".hero-video-controls .video-mute");
    if (toggleBtn) {
      e.preventDefault();
      if (video.paused) {
        try { video.muted = true; } catch(_){}
        const p = video.play();
        if (p && typeof p.then === "function") p.finally(syncUI); else syncUI();
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

  ["play","pause","volumechange","loadeddata","ended"].forEach(evt => video.addEventListener(evt, syncUI));
  syncUI();
})();

// ===== Enhancements (idempotent) =====
function initTypingAnimation(){
  if (window.__PEAKCY.typingInit) return; window.__PEAKCY.typingInit = true;
  const typed = qs(".typed-text"); const cursor = qs(".cursor"); if (!typed || !cursor) return;
  const words = ["health","wealth","mindset"]; const typeDelay=100, eraseDelay=50, pause=1500; let wi=0, ci=0;
  typed.textContent=""; cursor.classList.remove("typing");
  function type(){ if(ci<words[wi].length){ if(!cursor.classList.contains("typing")) cursor.classList.add("typing"); typed.textContent+=words[wi][ci++]; setTimeout(type,typeDelay);} else { cursor.classList.remove("typing"); setTimeout(erase,pause);} }
  function erase(){ if(ci>0){ if(!cursor.classList.contains("typing")) cursor.classList.add("typing"); typed.textContent=words[wi].substring(0,--ci); setTimeout(erase,eraseDelay);} else { cursor.classList.remove("typing"); wi=(wi+1)%words.length; setTimeout(type,typeDelay+1000);} }
  setTimeout(type, pause+250);
}
function initCounterAnimation(){
  if (window.__PEAKCY.countersInit) return; window.__PEAKCY.countersInit = true;
  const bar = qs(".stats-bar"); const nums = qsa(".stat-number"); if(!bar || !nums.length) return;
  const speed = 200;
  const step = () => {
    let pending = 0;
    nums.forEach(n => {
      const target = +n.dataset.count; const cur = +n.innerText; const inc = Math.ceil(target / speed);
      if (cur < target) { n.innerText = Math.min(cur + inc, target); pending++; }
    });
    if (pending) requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{ if(entry.isIntersecting){ step(); io.unobserve(entry.target);} });
  }, {threshold:.5});
  io.observe(bar);
}
function initTestimonialSlider(){
  const slider = qs(".testimonial-slider"); if(!slider || slider.dataset.peakcyInited==="1") return; slider.dataset.peakcyInited="1";
  const items = qsa(".testimonial", slider); const dots = qs(".testimonial-dots", slider);
  const next = qs(".testimonial-next", slider); const prev = qs(".testimonial-prev", slider);
  if(!items.length || !dots || !next || !prev) return;
  dots.innerHTML=""; let idx=0; items.forEach((t,i)=>t.classList.toggle("active", i===0));
  items.forEach((_,i)=>{ const d=document.createElement("div"); d.className="testimonial-dot"+(i===0?" active":""); d.addEventListener("click",()=>show(i)); dots.appendChild(d); });
  function show(i){ items[idx].classList.remove("active"); dots.children[idx].classList.remove("active"); idx=(i+items.length)%items.length; items[idx].classList.add("active"); dots.children[idx].classList.add("active"); }
  prev.addEventListener("click", ()=>show(idx-1)); next.addEventListener("click", ()=>show(idx+1));
  if (window.__PEAKCY.testimonialTimer) clearInterval(window.__PEAKCY.testimonialTimer);
  window.__PEAKCY.testimonialTimer = setInterval(()=>show(idx+1), 7000);
}
document.addEventListener("DOMContentLoaded", ()=>{ initTypingAnimation(); initCounterAnimation(); initTestimonialSlider(); });