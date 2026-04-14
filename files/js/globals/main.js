// Simple brand gallery scroll (no extra UI/controls)
      const track = document.querySelector('.brand-gallery-track');
      const cards = track ? track.querySelectorAll('.brand-gallery-card') : [];
      const prevBtn = document.querySelector('.brand-gallery-nav--prev');
      const nextBtn = document.querySelector('.brand-gallery-nav--next');

      if (track && cards.length && prevBtn && nextBtn) {
        let index = 0;
        const cardWidth = cards[0].offsetWidth + 14;

        function scrollToIndex() {
          track.scrollTo({
            left: index * cardWidth,
            behavior: 'smooth'
          });
        }

        prevBtn.addEventListener('click', function () {
          index = Math.max(0, index - 1);
          scrollToIndex();
        });

        nextBtn.addEventListener('click', function () {
          index = Math.min(cards.length - 1, index + 1);
          scrollToIndex();
        });
      }
      // 404 Explainer FAQ Accordion (single-open)
(function () {
  const root = document.querySelector('[data-cavbot-accordion="single"]');
  if (!root) return;

  const items = Array.from(root.querySelectorAll('.faq-item'));

  function closeItem(item) {
    item.classList.remove('is-open');
    const btn = item.querySelector('.faq-q');
    const panel = item.querySelector('.faq-a');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (panel) panel.hidden = true;
  }

  function openItem(item) {
    item.classList.add('is-open');
    const btn = item.querySelector('.faq-q');
    const panel = item.querySelector('.faq-a');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    if (panel) panel.hidden = false;
  }

  items.forEach((item) => {
    const btn = item.querySelector('.faq-q');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // close all first (single-open behavior)
      items.forEach(closeItem);

      // if it was closed, open it; if it was open, leave all closed
      if (!isOpen) openItem(item);
    });
  });
})();
// Pilot marquee (infinite auto-glide + still swipeable)
(function () {
  const marquee = document.querySelector('[data-pilot-marquee]');
  const track = marquee ? marquee.querySelector('[data-pilot-track]') : null;
  if (!marquee || !track) return;

  // Clone items once for seamless looping
  const originalCards = Array.from(track.children);
  if (!originalCards.length) return;

  const cloneWrap = document.createDocumentFragment();
  originalCards.forEach((card) => cloneWrap.appendChild(card.cloneNode(true)));
  track.appendChild(cloneWrap);

  // Start the loop at 0
  track.scrollLeft = 0;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let raf = null;
  let last = 0;
  let running = true;
  let inView = false;
  let scrollPaused = false;
  let scrollResumeTimer = 0;

  // px per second (tweak if you want slower/faster)
  const SPEED = 28;

  function shouldAnimate() {
    return running && inView && !scrollPaused && !document.hidden;
  }

  function stopLoop() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  function ensureLoop() {
    if (raf || !shouldAnimate()) return;
    last = performance.now();
    raf = requestAnimationFrame(step);
  }

  function step(now) {
    raf = null;
    if (!shouldAnimate()) {
      last = now;
      return;
    }

    const dt = Math.min(48, now - last);
    last = now;

    track.scrollLeft += (SPEED * dt) / 1000;

    // When we pass the original width, snap back seamlessly
    const half = track.scrollWidth / 2;
    if (track.scrollLeft >= half) track.scrollLeft -= half;

    raf = requestAnimationFrame(step);
  }

  // Pause on interaction (feels premium)
  const pause = () => {
    running = false;
    stopLoop();
  };
  const play = () => {
    running = true;
    ensureLoop();
  };

  const pauseForScroll = () => {
    scrollPaused = true;
    stopLoop();
    clearTimeout(scrollResumeTimer);
    scrollResumeTimer = window.setTimeout(() => {
      scrollPaused = false;
      ensureLoop();
    }, 220);
  };

  marquee.addEventListener('mouseenter', pause);
  marquee.addEventListener('mouseleave', play);

  marquee.addEventListener('touchstart', pause, { passive: true });
  marquee.addEventListener('touchend', play, { passive: true });
  window.addEventListener('wheel', pauseForScroll, { passive: true });
  window.addEventListener('scroll', pauseForScroll, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopLoop();
      return;
    }
    ensureLoop();
  });

  if (typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      inView = Boolean(entry && entry.isIntersecting);
      if (inView) ensureLoop();
      else stopLoop();
    }, { rootMargin: '240px 0px' });
    observer.observe(marquee);
  } else {
    inView = true;
    ensureLoop();
  }

  // If user scrolls manually, keep loop stable
  track.addEventListener('scroll', () => {
    const half = track.scrollWidth / 2;
    if (track.scrollLeft >= half) track.scrollLeft -= half;
  }, { passive: true });
})();
