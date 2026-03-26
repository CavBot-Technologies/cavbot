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
  let last = performance.now();
  let running = true;

  // px per second (tweak if you want slower/faster)
  const SPEED = 28;

  function step(now) {
    if (!running) {
      last = now;
      raf = requestAnimationFrame(step);
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

  raf = requestAnimationFrame(step);

  // Pause on interaction (feels premium)
  const pause = () => (running = false);
  const play = () => (running = true);

  marquee.addEventListener('mouseenter', pause);
  marquee.addEventListener('mouseleave', play);

  marquee.addEventListener('touchstart', pause, { passive: true });
  marquee.addEventListener('touchend', play, { passive: true });

  // If user scrolls manually, keep loop stable
  track.addEventListener('scroll', () => {
    const half = track.scrollWidth / 2;
    if (track.scrollLeft >= half) track.scrollLeft -= half;
  }, { passive: true });
})();

// Home desktop Chrome fallback:
// Only assist wheel scrolling when native vertical scroll did not move.
(function () {
  const body = document.body;
  if (!body || body.dataset.cavbotPageType !== 'home-page') return;

  const LOCKED_SELECTORS = [
    '.nav-overlay.is-open',
    '.cb-cavguard-overlay[data-open="true"]',
    '.cb-demo-request-overlay[data-open="true"]',
    '.cb-caverify-overlay[data-open="true"]',
    '.topic-modal.is-open',
    '.faq-modal.is-open',
    '.lightbox.is-open',
    '.modal.is-open[aria-hidden="false"]',
    '.cavai-auth-modal.is-open'
  ].join(', ');

  function isPageScrollLocked() {
    const docEl = document.documentElement;
    if (!docEl || !body) return false;
    if (
      docEl.classList.contains('nav-open') ||
      body.classList.contains('nav-open') ||
      docEl.classList.contains('modal-open') ||
      body.classList.contains('modal-open') ||
      docEl.classList.contains('modal-lock') ||
      body.classList.contains('modal-lock')
    ) {
      return true;
    }
    return Boolean(document.querySelector(LOCKED_SELECTORS));
  }

  function canScrollVertically(node, deltaY) {
    if (!(node instanceof HTMLElement)) return false;
    const style = window.getComputedStyle(node);
    if (!style) return false;
    if (!/(auto|scroll|overlay)/.test(style.overflowY)) return false;
    if (node.scrollHeight <= node.clientHeight + 1) return false;
    if (deltaY < 0) return node.scrollTop > 0;
    return node.scrollTop + node.clientHeight < node.scrollHeight - 1;
  }

  function hasNestedVerticalScrollHost(startNode, deltaY) {
    let node = startNode;
    while (node && node !== document.body && node !== document.documentElement) {
      if (canScrollVertically(node, deltaY)) return true;
      node = node.parentElement;
    }
    return false;
  }

  function normalizeWheelDeltaY(event) {
    if (!Number.isFinite(event.deltaY)) return 0;
    if (event.deltaMode === 1) return event.deltaY * 16;
    if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
    return event.deltaY;
  }

  document.addEventListener('wheel', (event) => {
    if (event.defaultPrevented || event.ctrlKey) return;
    if (isPageScrollLocked()) return;

    const deltaY = normalizeWheelDeltaY(event);
    if (Math.abs(deltaY) < 0.5) return;

    const target = event.target instanceof HTMLElement ? event.target : null;
    if (target && hasNestedVerticalScrollHost(target, deltaY)) return;

    const scroller = document.scrollingElement || document.documentElement;
    if (!scroller) return;

    const startY = window.scrollY || window.pageYOffset || scroller.scrollTop || 0;

    window.requestAnimationFrame(() => {
      if (isPageScrollLocked()) return;
      const currentY = window.scrollY || window.pageYOffset || scroller.scrollTop || 0;

      // Native scroll worked: do nothing.
      if (Math.abs(currentY - startY) > 0.75) return;

      const maxY = Math.max(0, scroller.scrollHeight - window.innerHeight);
      if (maxY <= 0) return;

      const nextY = Math.max(0, Math.min(maxY, currentY + deltaY));
      if (Math.abs(nextY - currentY) < 0.5) return;

      window.scrollTo({ top: nextY, left: window.scrollX || window.pageXOffset || 0, behavior: 'auto' });
    });
  }, { passive: true, capture: true });
})();
