// ===============================
// PeakCY — app.js (dedup + video-pause overlay)
// ===============================

if (location.search) { try { history.replaceState(null, "", location.pathname + location.hash); } catch (_) {} }
window.__PEAKCY = window.__PEAKCY || {};

function navEl(){ return document.getElementById("navbar"); }
function getToggleEl(){ return document.getElementById("menuToggle") || document.querySelector(".menu-toggle"); }
function getPanelEl(){ return document.getElementById("mobileMenu") || document.querySelector(".mobile-menu"); }
function setNavHeightVar(){ const nav=navEl(); if(nav) document.documentElement.style.setProperty("--nav-height", nav.offsetHeight+"px"); }
function getNavHeight(){ const nav=navEl(); return nav?nav.offsetHeight:64; }
function smoothScrollTo(el){ if(!el) return; const top=el.getBoundingClientRect().top+window.scrollY-getNavHeight()-12; window.scrollTo({top,behavior:"smooth"}); }

document.addEventListener("DOMContentLoaded",()=>{
  try{ document.body.style.opacity="1"; }catch(_){}
  document.documentElement.style.overflowX="hidden";
  document.body.style.overflowX="hidden";
  setNavHeightVar(); window.addEventListener("resize", setNavHeightVar);

  const toggle=getToggleEl(), panel=getPanelEl(), body=document.body;
  if(toggle && panel){
    const isOpen=()=>toggle.getAttribute("aria-expanded")==="true";
    const open=()=>{ panel.removeAttribute("hidden"); panel.classList.add("is-open","active"); toggle.classList.add("active"); toggle.setAttribute("aria-expanded","true"); body.classList.add("menu-open"); document.body.style.overflow="hidden"; };
    const close=()=>{ panel.classList.remove("is-open","active"); panel.setAttribute("hidden",""); toggle.classList.remove("active"); toggle.setAttribute("aria-expanded","false"); body.classList.remove("menu-open"); document.body.style.overflow=""; };
    toggle.addEventListener("click",(e)=>{ e.preventDefault(); e.stopPropagation(); isOpen()?close():open(); });
    panel.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{ if(isOpen()) close(); }));
    document.addEventListener("keydown",(e)=>{ if(e.key==="Escape" && isOpen()) close(); });
    document.addEventListener("click",(e)=>{ if(!isOpen()) return; const inside=panel.contains(e.target); const onToggle=toggle.contains(e.target); if(!inside && !onToggle) close(); });
  }

  const handleAnchor=(e,a)=>{
    const href=a.getAttribute("href"); if(!href) return;
    let id=null; if(href.startsWith("#")) id=href.slice(1); else if(href.startsWith("/#")) id=href.replace("/#","");
    if(!id) return;
    const el=document.getElementById(id);
    if(el){ e.preventDefault(); if(document.body.classList.contains("menu-open")){ const t=getToggleEl(); if(t) t.click(); } smoothScrollTo(el); try{ history.pushState(null,"",`#${id}`);}catch(_){}}};
  document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(a=>a.addEventListener("click",(e)=>handleAnchor(e,a)));
  if(location.hash){ const el=document.getElementById(location.hash.substring(1)); if(el) setTimeout(()=>smoothScrollTo(el),100); }

  const nav=navEl(); if(nav){ window.addEventListener("scroll",()=>{ const y=window.pageYOffset; if(y>50) nav.classList.add("scrolled"); else nav.classList.remove("scrolled"); }); }
});

// Video controls (delegated) + paused overlay class
(function(){
  const hero = document.querySelector('.hero');
  const video = document.getElementById('heroVideo') || document.querySelector('.hero-video');
  if(!video || !hero) return;
  try{ video.muted=true; video.setAttribute('muted',''); video.setAttribute('playsinline',''); video.setAttribute('webkit-playsinline',''); }catch(_){}

  function syncIcons(){
    const playI=document.querySelector('.hero-video-controls .play-icon');
    const pauseI=document.querySelector('.hero-video-controls .pause-icon');
    const volOn=document.querySelector('.hero-video-controls .volume-on');
    const volOff=document.querySelector('.hero-video-controls .volume-off');
    const playing=!video.paused, muted=video.muted;
    if(playI && pauseI){ playI.style.display=playing?"none":""; pauseI.style.display=playing?"":"none"; }
    if(volOn && volOff){ volOn.style.display=muted?"none":""; volOff.style.display=muted?"":"none"; }
    // Sync overlay state
    if(playing) hero.classList.remove('video-paused'); else hero.classList.add('video-paused');
  }

  document.addEventListener('click',(e)=>{
    const toggleBtn=e.target.closest('.hero-video-controls .video-toggle');
    const muteBtn=e.target.closest('.hero-video-controls .video-mute');
    if(toggleBtn){
      e.preventDefault();
      if(video.paused){ try{ video.muted=true; }catch(_){}
        video.play().finally(syncIcons);
      }else{
        try{ video.pause(); }catch(_){}
        syncIcons();
      }
    }else if(muteBtn){
      e.preventDefault();
      try{ video.muted=!video.muted; }catch(_){}
      if(!video.muted && video.volume===0){ try{ video.volume=0.5; }catch(_){ } }
      syncIcons();
    }
  });

  ['play','pause','volumechange','loadeddata','ended'].forEach(evt=>video.addEventListener(evt, syncIcons));
  syncIcons();
})();

// Deduped enhancements
function initTypingAnimation(){
  if(window.__PEAKCY.typingInit) return; window.__PEAKCY.typingInit=true;
  const typed=document.querySelector('.typed-text'), cursor=document.querySelector('.cursor'); if(!typed || !cursor) return;
  const words=['health','wealth','mindset']; const typeDelay=100, eraseDelay=50, pause=1500; let wi=0, ci=0;
  typed.textContent=""; cursor.classList.remove("typing");
  function type(){ if(ci<words[wi].length){ if(!cursor.classList.contains('typing')) cursor.classList.add('typing'); typed.textContent+=words[wi].charAt(ci++); setTimeout(type,typeDelay);} else { cursor.classList.remove('typing'); setTimeout(erase,pause);} }
  function erase(){ if(ci>0){ if(!cursor.classList.contains('typing')) cursor.classList.add('typing'); typed.textContent=words[wi].substring(0,--ci); setTimeout(erase,eraseDelay);} else { cursor.classList.remove('typing'); wi=(wi+1)%words.length; setTimeout(type,typeDelay+1000);} }
  setTimeout(type, pause+250);
}
function initCounterAnimation(){
  if(window.__PEAKCY.countersInit) return; window.__PEAKCY.countersInit=true;
  const bar=document.querySelector('.stats-bar'), nums=document.querySelectorAll('.stat-number'); if(!bar || !nums.length) return;
  const speed=200; const step=()=>{ let pending=0; nums.forEach(n=>{ const target=+n.dataset.count, cur=+n.innerText, inc=Math.ceil(target/speed); if(cur<target){ n.innerText=Math.min(cur+inc,target); pending++; }}); if(pending) requestAnimationFrame(step); };
  const io=new IntersectionObserver((es)=>{ es.forEach(e=>{ if(e.isIntersecting){ step(); io.unobserve(e.target);} }); },{threshold:.5});
  io.observe(bar);
}
function initTestimonialSlider(){
  const slider=document.querySelector('.testimonial-slider'); if(!slider || slider.dataset.peakcyInited==="1") return; slider.dataset.peakcyInited="1";
  const items=slider.querySelectorAll('.testimonial'), dots=slider.querySelector('.testimonial-dots'), next=slider.querySelector('.testimonial-next'), prev=slider.querySelector('.testimonial-prev');
  if(!items.length || !dots || !next || !prev) return;
  dots.innerHTML=""; let idx=0; items.forEach((t,i)=>t.classList.toggle('active',i===0));
  items.forEach((_,i)=>{ const d=document.createElement('div'); d.className='testimonial-dot'+(i===0?' active':''); d.addEventListener('click',()=>show(i)); dots.appendChild(d); });
  function show(i){ items[idx].classList.remove('active'); dots.children[idx].classList.remove('active'); idx=(i+items.length)%items.length; items[idx].classList.add('active'); dots.children[idx].classList.add('active'); }
  prev.addEventListener('click',()=>show(idx-1)); next.addEventListener('click',()=>show(idx+1));
  if(window.__PEAKCY.testimonialTimer) clearInterval(window.__PEAKCY.testimonialTimer);
  window.__PEAKCY.testimonialTimer=setInterval(()=>show(idx+1),7000);
}
document.addEventListener('DOMContentLoaded', ()=>{ initTypingAnimation(); initCounterAnimation(); initTestimonialSlider(); });

// === Hero Video Controls (delegated + poster fade) ===
(function(){
  const hero = document.querySelector('.hero');
  const container = document.querySelector('.hero-video-container');
  const video = document.getElementById('heroVideo') || document.querySelector('.hero-video');
  if (!video || !hero) return;
  try {
    video.muted = true;
    video.setAttribute('muted','');
    video.setAttribute('playsinline','');
    video.setAttribute('webkit-playsinline','');
  } catch(_) {}

  // Ensure container shows poster when paused
  if (container && video.poster) {
    try { container.style.backgroundImage = `url('${video.poster}')`; } catch(_) {}
    container.style.backgroundSize = 'cover';
    container.style.backgroundPosition = 'center';
  }

  function syncUI() {
    const playI  = document.querySelector('.hero-video-controls .play-icon');
    const pauseI = document.querySelector('.hero-video-controls .pause-icon');
    const volOn  = document.querySelector('.hero-video-controls .volume-on');
    const volOff = document.querySelector('.hero-video-controls .volume-off');
    const playing = !video.paused;
    const muted   = video.muted;

    if (playI && pauseI) {
      playI.style.display  = playing ? 'none' : '';
      pauseI.style.display = playing ? '' : 'none';
    }
    if (volOn && volOff) {
      volOn.style.display  = muted ? 'none' : '';
      volOff.style.display = muted ? '' : 'none';
    }

    // Inline fade so we don't rely on CSS specificity
    video.style.transition = 'opacity .25s ease';
    video.style.opacity = playing ? '1' : '0';
    video.style.pointerEvents = playing ? 'auto' : 'none';

    if (playing) hero.classList.remove('video-paused');
    else hero.classList.add('video-paused');
  }

  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('.hero-video-controls .video-toggle');
    const muteBtn   = e.target.closest('.hero-video-controls .video-mute');
    if (toggleBtn) {
      e.preventDefault();
      if (video.paused) {
        try { video.muted = true; } catch(_) {}
        const p = video.play();
        if (p && typeof p.then === 'function') p.finally(syncUI); else syncUI();
      } else {
        try { video.pause(); } catch(_) {}
        syncUI();
      }
    } else if (muteBtn) {
      e.preventDefault();
      try { video.muted = !video.muted; } catch(_) {}
      if (!video.muted && video.volume === 0) { try { video.volume = 0.5; } catch(_) {} }
      syncUI();
    }
  });

  ['play','pause','volumechange','loadeddata','ended'].forEach(evt => video.addEventListener(evt, syncUI));
  syncUI();
})();

