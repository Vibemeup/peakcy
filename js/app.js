// ===============================
// PeakCY — app.js (Index3 features appended safely)
// ===============================

document.addEventListener('DOMContentLoaded', function () {
  // Typing animation for index3 hero
  (function initTyping(){
    const typedTextSpan = document.querySelector('.typed-text');
    const cursorSpan = document.querySelector('.cursor');
    if (!typedTextSpan || !cursorSpan) return;

    const textArray = ['health', 'wealth', 'mindset'];
    const typingDelay = 100, erasingDelay = 50, newTextDelay = 1500;
    let textArrayIndex = 0, charIndex = 0;

    function type() {
      if (charIndex < textArray[textArrayIndex].length) {
        if (!cursorSpan.classList.contains('typing')) cursorSpan.classList.add('typing');
        typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
        charIndex++; setTimeout(type, typingDelay);
      } else {
        cursorSpan.classList.remove('typing');
        setTimeout(erase, newTextDelay);
      }
    }
    function erase() {
      if (charIndex > 0) {
        if (!cursorSpan.classList.contains('typing')) cursorSpan.classList.add('typing');
        typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
        charIndex--; setTimeout(erase, erasingDelay);
      } else {
        cursorSpan.classList.remove('typing');
        textArrayIndex = (textArrayIndex + 1) % textArray.length;
        setTimeout(type, typingDelay + 1000);
      }
    }
    setTimeout(type, newTextDelay + 250);
  })();

  // Stats counters when visible
  (function initCounters(){
    const bar = document.querySelector('.stats-bar');
    const counters = document.querySelectorAll('.stat-number');
    if (!bar || !counters.length) return;

    const speed = 200;
    function animateCounters() {
      counters.forEach(counter => {
        const target = +counter.getAttribute('data-count');
        const count = +counter.innerText;
        const increment = Math.ceil(target / speed);
        if (count < target) {
          counter.innerText = Math.min(count + increment, target);
        }
      });
      // Continue until all reach target
      const done = Array.from(counters).every(c => +c.innerText >= +c.getAttribute('data-count'));
      if (!done) requestAnimationFrame(animateCounters);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(bar);
  })();

  // Testimonials slider
  (function initTestimonials(){
    const wrap = document.querySelector('.testimonial-slider');
    if (!wrap) return;
    const testimonials = wrap.querySelectorAll('.testimonial');
    const dotsContainer = wrap.querySelector('.testimonial-dots');
    const prev = wrap.querySelector('.testimonial-prev');
    const next = wrap.querySelector('.testimonial-next');
    if (!testimonials.length || !dotsContainer || !prev || !next) return;

    let current = 0;
    function show(i){
      testimonials[current].classList.remove('active');
      dotsContainer.children[current].classList.remove('active');
      current = (i + testimonials.length) % testimonials.length;
      testimonials[current].classList.add('active');
      dotsContainer.children[current].classList.add('active');
    }
    // dots
    dotsContainer.innerHTML = '';
    testimonials.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'testimonial-dot' + (i===0?' active':'');
      dot.addEventListener('click', () => show(i));
      dotsContainer.appendChild(dot);
    });
    prev.addEventListener('click', () => show(current - 1));
    next.addEventListener('click', () => show(current + 1));
    setInterval(() => show(current + 1), 7000);
  })();
});
