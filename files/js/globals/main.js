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
// Pilot logo marquee — seamless left motion with pause/play
(function () {
  const marquee = document.querySelector('[data-pilot-logo-marquee]');
  const track = document.querySelector('[data-pilot-logo-track]');
  const group = document.querySelector('[data-pilot-logo-group]');
  const toggle = document.querySelector('[data-pilot-logo-toggle]');

  if (!marquee || !track || !group || !toggle) return;

  if (track.dataset.logoMarqueeReady === 'true') return;
  track.dataset.logoMarqueeReady = 'true';

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let paused = false;
  let raf = null;
  let last = 0;
  let x = 0;
  let loopWidth = 0;
  let rebuildTimer = 0;

  const SPEED = 42;

  function syncButton() {
    marquee.classList.toggle('is-paused', paused);
    toggle.setAttribute('aria-pressed', paused ? 'true' : 'false');
    toggle.setAttribute(
      'aria-label',
      paused ? 'Play logo animation' : 'Pause logo animation'
    );
  }

  function clearClones() {
    Array.from(track.children).forEach((child) => {
      if (child !== group) child.remove();
    });
  }

  function normalizeX() {
    if (!loopWidth) return;
    x = ((x % loopWidth) + loopWidth) % loopWidth;
    if (x > 0) x -= loopWidth;
  }

  function applyTransform() {
    track.style.transform = `translate3d(${x}px, 0, 0)`;
  }

  function buildLoop() {
    const previousLoopWidth = loopWidth || 1;
    const progress = previousLoopWidth ? Math.abs(x / previousLoopWidth) : 0;

    clearClones();

    const baseWidth = group.getBoundingClientRect().width;
    if (!baseWidth) return;

    const neededWidth = marquee.clientWidth + baseWidth * 4;
    let currentWidth = baseWidth;

    while (currentWidth < neededWidth) {
      const clone = group.cloneNode(true);
      clone.removeAttribute('data-pilot-logo-group');
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
      currentWidth += baseWidth;
    }

    const firstGroup = track.children[0];
    const secondGroup = track.children[1];

    if (firstGroup && secondGroup) {
      loopWidth = secondGroup.offsetLeft - firstGroup.offsetLeft;
    } else {
      loopWidth = baseWidth;
    }

    if (!Number.isFinite(loopWidth) || loopWidth <= 0) {
      loopWidth = baseWidth;
    }

    x = -((progress % 1) * loopWidth);
    normalizeX();
    applyTransform();
  }

  function requestRebuild() {
    window.clearTimeout(rebuildTimer);
    rebuildTimer = window.setTimeout(() => {
      buildLoop();
      last = performance.now();
    }, 80);
  }

  function bindImageGuards() {
    const images = Array.from(group.querySelectorAll('img'));

    images.forEach((img) => {
      img.addEventListener('load', requestRebuild);
      img.addEventListener('error', requestRebuild);

      if (img.decode) {
        img.decode().then(requestRebuild).catch(requestRebuild);
      }
    });
  }

  function step(now) {
    raf = null;
    if (paused || document.hidden) return;

    if (!last) last = now;

    const dt = Math.min(48, now - last);
    last = now;

    if (loopWidth > 0) {
      x -= (SPEED * dt) / 1000;
      normalizeX();
      applyTransform();
    }

    raf = window.requestAnimationFrame(step);
  }

  function start() {
    if (prefersReduced) {
      syncButton();
      buildLoop();
      return;
    }

    if (!paused && !raf) {
      last = performance.now();
      raf = window.requestAnimationFrame(step);
    }
  }

  toggle.addEventListener('click', function () {
    paused = !paused;
    syncButton();
    start();
  });

  window.addEventListener('resize', requestRebuild);

  window.addEventListener('load', function () {
    requestRebuild();
  });

  document.addEventListener('visibilitychange', function () {
    last = performance.now();
  });

  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(requestRebuild);
    observer.observe(marquee);
    observer.observe(group);
  }

  bindImageGuards();
  syncButton();

  window.setTimeout(() => {
    buildLoop();
    start();
  }, 120);
})();


// CavBot collaboration accordion + visual card switcher
(function () {
  const root = document.querySelector('[data-collab-accordion]');
  if (!root) return;


  const items = Array.from(root.querySelectorAll('.collab-feature'));
  const cards = Array.from(document.querySelectorAll('[data-card-panel]'));
  const progress = root.querySelector('[data-collab-progress]');
  if (!items.length || !cards.length) return;

  const COLLAB_STEP_MS = 9000;
  const COLLAB_TOTAL_MS = COLLAB_STEP_MS * items.length;
  let activeIndex = 0;
  let progressRaf = null;
  let trackerStart = 0;

  function closeItem(item) {
    const trigger = item.querySelector('.collab-feature-trigger');
    item.classList.remove('is-active');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    }
  }


  function openItem(item) {
    const trigger = item.querySelector('.collab-feature-trigger');
    item.classList.add('is-active');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
    }
  }


  function showCard(cardName) {
    cards.forEach((card) => {
      const isMatch = card.getAttribute('data-card-panel') === cardName;
      card.classList.toggle('is-active', isMatch);
      card.setAttribute('aria-hidden', isMatch ? 'false' : 'true');
    });
  }


  function activateItem(item) {
    if (item.classList.contains('is-active')) return;
    activeIndex = Math.max(0, items.indexOf(item));
    const cardName = item.getAttribute('data-card');
    items.forEach(closeItem);
    openItem(item);
    showCard(cardName);
    setProgress(activeIndex / items.length);
    startTracker(activeIndex);
  }


  function setProgress(value) {
    if (progress) {
      progress.style.height = `${Math.max(0, Math.min(1, value)) * 100}%`;
    }
  }


  function stopTimers() {
    if (progressRaf) {
      window.cancelAnimationFrame(progressRaf);
      progressRaf = null;
    }
  }


  function tickProgress(now) {
    const elapsed = (now - trackerStart) % COLLAB_TOTAL_MS;
    const rawProgress = elapsed / COLLAB_TOTAL_MS;
    const nextIndex = Math.min(items.length - 1, Math.floor(rawProgress * items.length));

    setProgress(rawProgress);

    if (nextIndex !== activeIndex) {
      activateByIndex(nextIndex);
    }

    progressRaf = window.requestAnimationFrame(tickProgress);
  }


  function activateByIndex(index) {
    const nextIndex = ((index % items.length) + items.length) % items.length;
    activeIndex = nextIndex;
    const item = items[nextIndex];
    const cardName = item.getAttribute('data-card');

    items.forEach(closeItem);
    openItem(item);
    showCard(cardName);
  }


  function startTracker(offsetIndex) {
    stopTimers();
    const index = Number.isFinite(offsetIndex) ? offsetIndex : activeIndex;
    trackerStart = performance.now() - (index / items.length) * COLLAB_TOTAL_MS;
    progressRaf = window.requestAnimationFrame(tickProgress);
  }


  function bindTrackerVisibility() {
    const section = root.closest('.cavbot-collab') || root;

    if (!('IntersectionObserver' in window)) {
      startTracker(activeIndex);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      if (entry.isIntersecting) {
        startTracker(activeIndex);
      } else {
        stopTimers();
      }
    }, { threshold: 0.12 });

    observer.observe(section);
  }


  items.forEach((item) => {
    const trigger = item.querySelector('.collab-feature-trigger');
    if (!trigger) return;


    trigger.addEventListener('click', () => {
      activateItem(item);
    });
  });


  const activeItem = items.find((item) => item.classList.contains('is-active')) || items[0];
  const activeCard = activeItem.getAttribute('data-card');
  activeIndex = Math.max(0, items.indexOf(activeItem));


  items.forEach(closeItem);
  openItem(activeItem);
  showCard(activeCard);
  setProgress(activeIndex / items.length);
  bindTrackerVisibility();
})();










// CavBot security switcher
(function () {
  const root = document.querySelector('[data-security-switcher]');
  if (!root) return;


  const items = Array.from(root.querySelectorAll('.security-feature'));
  const cards = Array.from(document.querySelectorAll('[data-security-panel]'));
  const progress = root.querySelector('[data-security-progress]');


  if (!items.length || !cards.length) return;

  const SECURITY_STEP_MS = 9000;
  const SECURITY_TOTAL_MS = SECURITY_STEP_MS * items.length;
  let activeIndex = 0;
  let progressRaf = null;
  let trackerStart = 0;

  const hashToCard = {
    '#security-cavverify': 'cavverify',
    '#cavverify': 'cavverify',
    '#security-cavguard': 'cavguard',
    '#cavguard': 'cavguard',
    '#vault': 'cavsafe',
    '#vault': 'cavsafe'
  };


  function closeItem(item) {
    const trigger = item.querySelector('.security-feature-trigger');


    item.classList.remove('is-active');


    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    }
  }


  function openItem(item) {
    const trigger = item.querySelector('.security-feature-trigger');


    item.classList.add('is-active');


    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
    }
  }


  function showCard(cardName) {
    cards.forEach((card) => {
      const isMatch = card.getAttribute('data-security-panel') === cardName;


      card.classList.toggle('is-active', isMatch);
      card.setAttribute('aria-hidden', isMatch ? 'false' : 'true');
    });
  }

  function setProgress(value) {
    if (progress) {
      progress.style.height = `${Math.max(0, Math.min(1, value)) * 100}%`;
    }
  }


  function stopTracker() {
    if (progressRaf) {
      window.cancelAnimationFrame(progressRaf);
      progressRaf = null;
    }
  }


  function activateByIndex(index) {
    const nextIndex = ((index % items.length) + items.length) % items.length;
    activeIndex = nextIndex;
    const item = items[nextIndex];
    const cardName = item.getAttribute('data-security-card');

    items.forEach(closeItem);
    openItem(item);
    showCard(cardName);
  }


  function tickTracker(now) {
    const elapsed = (now - trackerStart) % SECURITY_TOTAL_MS;
    const rawProgress = elapsed / SECURITY_TOTAL_MS;
    const nextIndex = Math.min(items.length - 1, Math.floor(rawProgress * items.length));

    setProgress(rawProgress);

    if (nextIndex !== activeIndex) {
      activateByIndex(nextIndex);
    }

    progressRaf = window.requestAnimationFrame(tickTracker);
  }


  function startTracker(offsetIndex) {
    stopTracker();
    const index = Number.isFinite(offsetIndex) ? offsetIndex : activeIndex;
    trackerStart = performance.now() - (index / items.length) * SECURITY_TOTAL_MS;
    progressRaf = window.requestAnimationFrame(tickTracker);
  }


  function bindTrackerVisibility() {
    const section = root.closest('.cavbot-security') || root;

    if (!('IntersectionObserver' in window)) {
      startTracker(activeIndex);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      if (entry.isIntersecting) {
        startTracker(activeIndex);
      } else {
        stopTracker();
      }
    }, { threshold: 0.12 });

    observer.observe(section);
  }


  function activateItem(item) {
    if (item.classList.contains('is-active')) return;

    activeIndex = Math.max(0, items.indexOf(item));
    activateByIndex(activeIndex);
    setProgress(activeIndex / items.length);
    startTracker(activeIndex);
  }

  function activateCard(cardName) {
    const item = items.find((candidate) => candidate.getAttribute('data-security-card') === cardName);
    if (!item) return false;

    activeIndex = Math.max(0, items.indexOf(item));
    activateByIndex(activeIndex);
    setProgress(activeIndex / items.length);
    startTracker(activeIndex);
    return true;
  }

  function scrollToSecurity(target) {
    const section = root.closest('.cavbot-security') || root;
    const scrollTarget = target || section;
    const header = document.querySelector('[data-header]') || document.querySelector('.site-header') || document.querySelector('header');
    const headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
    const top = Math.max(0, scrollTarget.getBoundingClientRect().top + window.pageYOffset - headerHeight - 18);

    window.scrollTo({
      top,
      behavior: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  }

  function openFromHash(hash, shouldScroll) {
    const normalizedHash = String(hash || '').toLowerCase();
    if (normalizedHash === '#security') {
      if (shouldScroll) scrollToSecurity(root.closest('.cavbot-security') || root);
      return true;
    }

    const cardName = hashToCard[normalizedHash];
    if (!cardName || !activateCard(cardName)) return false;

    if (shouldScroll) {
      const item = items.find((candidate) => candidate.getAttribute('data-security-card') === cardName);
      scrollToSecurity(item || root);
    }

    return true;
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest && event.target.closest('a[href^="#security"], a[href="#cavverify"], a[href="#cavguard"], a[href="#vault"]');
    if (!link) return;

    const hash = link.getAttribute('href');
    if (!openFromHash(hash, true)) return;

    event.preventDefault();
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', hash);
    } else {
      window.location.hash = hash;
    }
  });

  window.addEventListener('hashchange', () => {
    openFromHash(window.location.hash, true);
  });


  items.forEach((item) => {
    const trigger = item.querySelector('.security-feature-trigger');
    if (!trigger) return;


    trigger.addEventListener('click', () => {
      activateItem(item);
    });
  });


  const activeItem = items.find((item) => item.classList.contains('is-active')) || items[0];
  const activeCard = activeItem.getAttribute('data-security-card');
  activeIndex = Math.max(0, items.indexOf(activeItem));


  items.forEach(closeItem);
  openItem(activeItem);
  showCard(activeCard);
  setProgress(activeIndex / items.length);
  bindTrackerVisibility();
  if (window.location.hash) {
    openFromHash(window.location.hash, true);
  }
})();



// CavBot latest releases card click behavior
(function () {
  const cards = Array.from(document.querySelectorAll('[data-release-card]'));
  if (!cards.length) return;


  cards.forEach((card) => {
    const primaryLink = card.querySelector('.release-button');


    if (!primaryLink) return;


    card.setAttribute('tabindex', '0');


    card.addEventListener('click', (event) => {
      const clickedLink = event.target.closest('a');
      const clickedButton = event.target.closest('button');


      if (clickedLink || clickedButton) return;


      primaryLink.click();
    });


    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;


      const activeElement = document.activeElement;
      const isInsideLink = activeElement && activeElement.closest && activeElement.closest('a');


      if (isInsideLink) return;


      event.preventDefault();
      primaryLink.click();
    });
  });
})();


// CavBot final seal count
(function () {
  const root = document.querySelector('[data-cavbot-seal]');
  if (!root) return;


  const counter = root.querySelector('[data-seal-count]');
  if (!counter) return;

  if (counter.hasAttribute('data-cavbot-signup-count')) return;


  const finalValue = Number(counter.getAttribute('data-seal-count')) || 7;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  function setFinal() {
    counter.textContent = String(finalValue);
  }


  if (reduceMotion || !('IntersectionObserver' in window)) {
    setFinal();
    return;
  }


  let hasRun = false;
  counter.textContent = '0';


  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry || !entry.isIntersecting || hasRun) return;


      hasRun = true;


      const duration = 720;
      const start = performance.now();


      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(eased * finalValue);


        counter.textContent = String(value);


        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          setFinal();
        }
      }


      requestAnimationFrame(tick);
      observer.disconnect();
    },
    { threshold: 0.35 }
  );


  observer.observe(root);
})();


// Brain title rotating word
(function () {
  const word = document.querySelector('[data-brain-word]');
  if (!word) return;
  word.classList.remove('is-changing');
})();
// CavBot product showcase rotation
(function () {
  function initCavBotProductShowcase() {
    const section = document.querySelector("[data-cavbot-product-showcase]");
    if (!section) return;


    const tabs = Array.from(section.querySelectorAll("[data-cavbot-showcase-tab]"));
    const screens = Array.from(section.querySelectorAll("[data-cavbot-showcase-screen]"));
    const word = section.querySelector("[data-cavbot-showcase-word]");


    const words = ["Clarity", "Control", "Visibility"];


    let activeIndex = 0;
    let wordIndex = 0;
    let showcaseRaf = null;
    let showcaseStart = 0;
    const SHOWCASE_STEP_MS = 4800;
    const SHOWCASE_TOTAL_MS = SHOWCASE_STEP_MS * tabs.length;


    function updateWord(index) {
      if (!word) return;

      wordIndex = ((index % words.length) + words.length) % words.length;
      word.classList.add("is-changing");

      window.setTimeout(function () {
        word.textContent = words[wordIndex];
        word.classList.remove("is-changing");
      }, 180);
    }


    function setActive(index) {
      activeIndex = ((index % tabs.length) + tabs.length) % tabs.length;


      tabs.forEach((tab, tabIndex) => {
        const isActive = tabIndex === activeIndex;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
      });


      screens.forEach((screen, screenIndex) => {
        screen.classList.toggle("is-active", screenIndex === activeIndex);
      });

    }


    function stopShowcaseTimer() {
      if (showcaseRaf) {
        window.cancelAnimationFrame(showcaseRaf);
        showcaseRaf = null;
      }
    }


    function tickShowcaseTracker(now) {
      const elapsed = (now - showcaseStart) % SHOWCASE_TOTAL_MS;
      const rawProgress = elapsed / SHOWCASE_TOTAL_MS;
      const progressPercent = rawProgress * 100;
      const nextIndex = Math.min(tabs.length - 1, Math.floor(rawProgress * tabs.length));

      section.style.setProperty("--cavbot-product-progress", `${progressPercent}%`);

      if (nextIndex !== activeIndex) {
        setActive(nextIndex);
      }

      showcaseRaf = window.requestAnimationFrame(tickShowcaseTracker);
    }


    function startShowcaseTracker(offsetIndex) {
      stopShowcaseTimer();
      const index = Number.isFinite(offsetIndex) ? offsetIndex : activeIndex;
      showcaseStart = performance.now() - (index / tabs.length) * SHOWCASE_TOTAL_MS;
      showcaseRaf = window.requestAnimationFrame(tickShowcaseTracker);
    }


    function bindShowcaseVisibility() {
      if (!('IntersectionObserver' in window)) {
        startShowcaseTracker(activeIndex);
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          startShowcaseTracker(activeIndex);
        } else {
          stopShowcaseTimer();
        }
      }, { threshold: 0.12 });

      observer.observe(section);
    }


    tabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        const nextIndex = Number(tab.getAttribute("data-cavbot-showcase-tab"));
        if (Number.isFinite(nextIndex)) {
          setActive(nextIndex);
          section.style.setProperty("--cavbot-product-progress", `${(nextIndex / tabs.length) * 100}%`);
          startShowcaseTracker(nextIndex);
        }
      });
    });

    setActive(0);
    section.style.setProperty("--cavbot-product-progress", "0%");
    bindShowcaseVisibility();
    updateWord(0);

    if (word) {
      window.setInterval(function () {
        updateWord(wordIndex + 1);
      }, 2200);
    }
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCavBotProductShowcase);
  } else {
    initCavBotProductShowcase();
  }
})();

// PFF section entrance reveal
(function () {
  const section = document.querySelector('.pff-museum');
  if (!section) return;

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    section.classList.add('is-pff-visible');
    return;
  }

  if (typeof IntersectionObserver !== 'function') {
    section.classList.add('is-pff-visible');
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];

      if (entry && entry.isIntersecting) {
        section.classList.add('is-pff-visible');
        observer.disconnect();
      }
    },
    {
      threshold: 0.35,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  observer.observe(section);
})();


// System stack cards entrance animation
(function () {
  const section = document.querySelector('.system-role');
  if (!section) return;

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  section.classList.add('is-ready');

  if (prefersReduced) {
    section.classList.add('is-visible');
    return;
  }

  if (typeof IntersectionObserver !== 'function') {
    section.classList.add('is-visible');
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];

      if (entry && entry.isIntersecting) {
        section.classList.add('is-visible');
      } else {
        section.classList.remove('is-visible');
      }
    },
    {
      threshold: 0.28,
      rootMargin: '0px 0px -10% 0px'
    }
  );

  observer.observe(section);
})();

// Reversible reveal animations for collaboration and security sections
(function () {
  const sections = [
    document.querySelector('.cavbot-collab'),
    document.querySelector('.collab-showcase'),
    document.querySelector('.cavbot-security'),
    document.querySelector('.security-grid'),
    document.querySelector('.cavbot-seal')
  ].filter(Boolean);

  if (!sections.length) return;

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced || typeof IntersectionObserver !== 'function') {
    sections.forEach((section) => section.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px'
    }
  );

  sections.forEach((section) => observer.observe(section));
})();
// Start/setup cards entrance animation
(function () {
  const section = document.querySelector('.pricing-docs');
  if (!section) return;


  const prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  section.classList.add('is-ready');


  if (prefersReduced) {
    section.classList.add('is-visible');
    return;
  }


  if (typeof IntersectionObserver !== 'function') {
    section.classList.add('is-visible');
    return;
  }


  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];


      if (entry && entry.isIntersecting) {
        section.classList.add('is-visible');
      } else {
        section.classList.remove('is-visible');
      }
    },
    {
      threshold: 0.28,
      rootMargin: '0px 0px -10% 0px'
    }
  );


  observer.observe(section);
})();


// CavAi video expansion on scroll
(function () {
  const stage = document.querySelector('[data-cavai-video-stage]');
  const shell = document.querySelector('[data-cavai-video-shell]');

  if (!stage || !shell) return;

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) return;

  let ticking = false;
  let expanded = false;

  function updateExpansion() {
    const rect = stage.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const center = rect.top + rect.height / 2;

    const enterTop = viewportHeight * 0.28;
    const enterBottom = viewportHeight * 0.72;

    const stayTop = viewportHeight * 0.16;
    const stayBottom = viewportHeight * 0.84;

    const shouldExpand = expanded
      ? center > stayTop && center < stayBottom
      : center > enterTop && center < enterBottom;

    if (shouldExpand !== expanded) {
      expanded = shouldExpand;
      shell.classList.toggle('is-expanded', expanded);
    }

    ticking = false;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateExpansion);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);

  requestUpdate();
})();

// CavBot home hero demo pinned rise animation
(function () {
  function initHeroDemoRise() {
    const hero = document.querySelector('.hero-home-surface');
    const stage = document.querySelector('[data-hero-demo-stage]');
    const frame = document.querySelector('[data-hero-demo-frame]');

    if (!hero || !stage || !frame) return;

    const prefersReduced =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      hero.style.setProperty('--hero-demo-progress', '1');
      hero.style.setProperty('--hero-video-focus', '0');
      hero.style.setProperty('--hero-demo-opacity', '1');
      hero.style.setProperty('--hero-demo-y', '0px');
      hero.style.setProperty('--hero-demo-scale', '1');
      return;
    }

    let ticking = false;

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function easeOutCubic(value) {
      return 1 - Math.pow(1 - value, 3);
    }

    function updateHeroDemoRise() {
      const rect = stage.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      const headerOffset =
        parseFloat(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--cb-header-offset')
        ) || 0;

      /*
        Start when the demo frame is still lower on the page.
        Finish when it reaches the header zone.
      */
      const start = viewportHeight * 0.92;
      const end = headerOffset + 18;

      const rawProgress = (start - rect.top) / (start - end);
      const progress = easeOutCubic(clamp(rawProgress, 0, 1));

      /*
        Focus fades the intro text back only after the video has begun rising.
      */
      const rawFocus = (progress - 0.34) / 0.50;
      const focus = clamp(rawFocus, 0, 1);

      /*
        This is the actual pull-up motion.
        Bigger first number = starts lower.
        Bigger multiplier = travels higher.
      */
      const y = 220 - progress * 220;
      const scale = 0.90 + progress * 0.10;
      const opacity = 0.08 + progress * 0.92;

      hero.style.setProperty('--hero-demo-progress', progress.toFixed(4));
      hero.style.setProperty('--hero-video-focus', focus.toFixed(4));
      hero.style.setProperty('--hero-demo-opacity', opacity.toFixed(4));
      hero.style.setProperty('--hero-demo-y', `${y.toFixed(2)}px`);
      hero.style.setProperty('--hero-demo-scale', scale.toFixed(4));

      ticking = false;
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateHeroDemoRise);
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    window.addEventListener('pageshow', requestUpdate, { passive: true });

    requestUpdate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroDemoRise);
  } else {
    initHeroDemoRise();
  }
})();
