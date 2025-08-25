/* ===============================
   PeakCY — App JS (Optimized)
   =============================== */

// 1) Fade-in on load
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '1';
});

// 2) Navbar scrolled shadow
(function(){
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 6);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// 3) Mobile menu toggle + close on resize/click-outside
(function(){
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  if (!toggle || !menu) return;

  const open = () => { menu.removeAttribute('hidden'); toggle.setAttribute('aria-expanded', 'true'); };
  const close = () => { menu.setAttribute('hidden', ''); toggle.setAttribute('aria-expanded', 'false'); };

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    if (expanded) close(); else open();
  });

  // click outside
  document.addEventListener('click', (e) => {
    if (menu.hasAttribute('hidden')) return;
    const inside = menu.contains(e.target) || toggle.contains(e.target);
    if (!inside) close();
  });

  // resize up -> close
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && !menu.hasAttribute('hidden')) close();
  });
})();

// 4) Lazy images with shimmer: use <img data-src="...">
(function(){
  const imgs = document.querySelectorAll('img[data-src]');
  if (!imgs.length) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const load = (img) => {
    img.classList.add('img-skeleton');
    const src = img.getAttribute('data-src');
    const loader = new Image();
    loader.onload = () => {
      img.src = src;
      img.classList.remove('img-skeleton');
      img.removeAttribute('data-src');
    };
    loader.src = src;
  };

  // If IntersectionObserver available, defer off-screen images
  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          load(e.target);
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '200px 0px' });
    imgs.forEach(img => io.observe(img));
  } else {
    imgs.forEach(load);
  }
})();

// 5) Magnetic hover (buttons/cards) — add class "magnetic"
(function(){
  const els = document.querySelectorAll('.magnetic');
  if (!els.length) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  els.forEach(el => {
    const strength = 10; // px
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width/2);
      const my = e.clientY - (r.top  + r.height/2);
      el.style.transform = `translate(${(mx/r.width)*strength}px, ${(my/r.height)*strength}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

// 6) Tilt effect on cards — structure: <div class="tiltable"><div class="tilt-inner">…</div></div>
(function(){
  const cards = document.querySelectorAll('.tiltable');
  if (!cards.length) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  cards.forEach(card => {
    const inner = card.querySelector('.tilt-inner') || card;
    const tilt = 6; // deg
    card.addEventListener('mousemove', e => {
      const b = card.getBoundingClientRect();
      const rx = ((e.clientY - b.top) / b.height - .5) * -tilt;
      const ry = ((e.clientX - b.left)/ b.width - .5) *  tilt;
      inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('mouseleave', () => { inner.style.transform = ''; });
  });
})();

// 7) Apply form loading helper (optional)
// Usage: const wrap = document.querySelector('.form-wrap'); wrap.classList.add('is-loading'); ... wrap.classList.remove('is-loading');
