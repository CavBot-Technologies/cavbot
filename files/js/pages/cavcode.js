(function () {
  function initCavCodeScrollRise() {
    var stage = document.querySelector("[data-cavcode-demo-stage]");
    var frame = document.querySelector("[data-cavcode-demo-frame]");

    if (!stage || !frame) return;

    if (stage.dataset.cavcodeScrollRiseBound === "true") return;
    stage.dataset.cavcodeScrollRiseBound = "true";

    var prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function easeOutCubic(value) {
      return 1 - Math.pow(1 - value, 3);
    }

    function setFramePosition(progress) {
      var eased = easeOutCubic(clamp(progress, 0, 1));

      /*
        0 = normal lower position
        1 = lifted upward position

        Scroll down: moves from 0px to -150px.
        Scroll up: moves back from -150px to 0px.
      */
      var y = eased * -150;
      var scale = 1;

      frame.style.setProperty("--cavcode-rise-y", y.toFixed(2) + "px");
      frame.style.setProperty("--cavcode-rise-scale", scale.toFixed(4));

      frame.style.opacity = "1";
    }

    function updateScrollRise() {
      var rect = stage.getBoundingClientRect();
      var viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;

      /*
        Animation starts when the preview enters the lower viewport.
        Animation finishes when the preview reaches the upper-middle viewport.
      */
      var start = viewportHeight * 0.92;
      var end = viewportHeight * 0.42;

      var rawProgress = (start - rect.top) / (start - end);

      setFramePosition(rawProgress);
    }

    if (prefersReducedMotion) {
      setFramePosition(0);
      return;
    }

    var ticking = false;

    function requestUpdate() {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(function () {
        updateScrollRise();
        ticking = false;
      });
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("pageshow", requestUpdate);
    window.addEventListener("load", requestUpdate);

    requestUpdate();
    setTimeout(requestUpdate, 80);
    setTimeout(requestUpdate, 300);
    setTimeout(requestUpdate, 700);
  }

  function initCavCodePreviewTabs() {
    var triggers = document.querySelectorAll("[data-cavcode-file]");
    var tabs = document.querySelectorAll(".cavcode-demo-tab[data-cavcode-file]");
    var files = document.querySelectorAll(".cavcode-demo-tree-row[data-cavcode-file]");

    if (!triggers.length) return;

    function activate(fileKey) {
      tabs.forEach(function (tab) {
        tab.classList.toggle(
          "is-active",
          tab.getAttribute("data-cavcode-file") === fileKey
        );
      });

      files.forEach(function (file) {
        file.classList.toggle(
          "is-active",
          file.getAttribute("data-cavcode-file") === fileKey
        );
      });
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var fileKey = trigger.getAttribute("data-cavcode-file");
        if (!fileKey) return;

        activate(fileKey);
      });
    });
  }

  function init() {
    initCavCodeScrollRise();
    initCavCodePreviewTabs();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
// CavCode workspace showcase rotation — final smooth loader + clickable tabs + reveal
(function () {
  function initCavCodeWorkspaceShowcase() {
    var section = document.querySelector("[data-cavcode-workspace-showcase]");
    if (!section) return;


    if (section.dataset.cavcodeWorkspaceBound === "true") return;
    section.dataset.cavcodeWorkspaceBound = "true";


    var tabs = Array.prototype.slice.call(
      section.querySelectorAll("[data-cavcode-workspace-tab]")
    );


    var screens = Array.prototype.slice.call(
      section.querySelectorAll("[data-cavcode-workspace-screen]")
    );


    var progressFill = section.querySelector("[data-cavcode-workspace-progress]");


    if (!tabs.length || !screens.length || !progressFill) return;


    var activeIndex = 0;
    var raf = null;
    var trackerStart = 0;
    var isRunning = false;


    var STEP_MS = 5200;
    var TOTAL_MS = STEP_MS * tabs.length;


    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }


    function setProgress(percent) {
      var safe = clamp(percent, 0, 100);
      section.style.setProperty("--cavcode-workspace-progress", safe.toFixed(3) + "%");
      progressFill.style.height = safe.toFixed(3) + "%";
    }


    function setActive(index) {
      activeIndex = ((index % tabs.length) + tabs.length) % tabs.length;


      tabs.forEach(function (tab, tabIndex) {
        var isActive = tabIndex === activeIndex;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
      });


      screens.forEach(function (screen, screenIndex) {
        var isActive = screenIndex === activeIndex;
        screen.classList.toggle("is-active", isActive);
        screen.setAttribute("aria-hidden", isActive ? "false" : "true");
      });
    }


    function stopTracker() {
      isRunning = false;


      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = null;
      }
    }


    function tick(now) {
      if (!isRunning) return;


      var elapsed = (now - trackerStart) % TOTAL_MS;
      var rawProgress = elapsed / TOTAL_MS;
      var progressPercent = rawProgress * 100;


      var nextIndex = Math.min(
        tabs.length - 1,
        Math.floor(rawProgress * tabs.length)
      );


      setProgress(progressPercent);


      if (nextIndex !== activeIndex) {
        setActive(nextIndex);
      }


      raf = window.requestAnimationFrame(tick);
    }


    function startTracker(offsetIndex) {
      if (prefersReduced) {
        setActive(0);
        setProgress(100);
        return;
      }


      stopTracker();


      var index = Number.isFinite(offsetIndex) ? offsetIndex : activeIndex;


      /*
        This is the important part:
        index 0 starts at 0%.
        index 1 starts at 20%.
        index 2 starts at 40%.
        It does NOT jump to the end of the first option anymore.
      */
      trackerStart = performance.now() - (index / tabs.length) * TOTAL_MS;


      isRunning = true;
      raf = window.requestAnimationFrame(tick);
    }


    function activateFromClick(index) {
      var safeIndex = ((index % tabs.length) + tabs.length) % tabs.length;


      setActive(safeIndex);
      setProgress((safeIndex / tabs.length) * 100);
      startTracker(safeIndex);
    }


    tabs.forEach(function (tab, fallbackIndex) {
      tab.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();


        var attrIndex = Number(tab.getAttribute("data-cavcode-workspace-tab"));
        activateFromClick(Number.isFinite(attrIndex) ? attrIndex : fallbackIndex);
      });
    });


    function bindVisibility() {
      if (!("IntersectionObserver" in window)) {
        section.classList.add("is-visible");
        startTracker(0);
        return;
      }


      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var visible = entry.isIntersecting;


            section.classList.toggle("is-visible", visible);


            if (visible) {
              startTracker(activeIndex);
            } else {
              stopTracker();
            }
          });
        },
        {
          threshold: 0.16,
          rootMargin: "0px 0px -8% 0px"
        }
      );


      observer.observe(section);
    }


    setActive(0);
    setProgress(0);
    bindVisibility();


    window.addEventListener("pageshow", function () {
      setActive(activeIndex);
      setProgress((activeIndex / tabs.length) * 100);


      if (section.classList.contains("is-visible")) {
        startTracker(activeIndex);
      }
    });


    window.addEventListener("resize", function () {
      setActive(activeIndex);
    });
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCavCodeWorkspaceShowcase);
  } else {
    initCavCodeWorkspaceShowcase();
  }
})();

// Caven Flow section scroll animation
(function () {
  function initCavenFlowSection() {
    var section = document.querySelector("[data-caven-flow-section]");
    var stage = document.querySelector("[data-caven-flow-stage]");
    var frame = document.querySelector("[data-caven-flow-frame]");
    var title = document.querySelector("[data-caven-flow-title]");
    var subtitle = document.querySelector("[data-caven-flow-subtitle]");


    if (!section || !stage || !frame || !title || !subtitle) return;


    if (section.dataset.cavenFlowBound === "true") return;
    section.dataset.cavenFlowBound = "true";


    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }


    function easeOutCubic(value) {
      return 1 - Math.pow(1 - value, 3);
    }


    function updateCavenFlow() {
      var sectionRect = section.getBoundingClientRect();
      var stageRect = stage.getBoundingClientRect();
      var viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;


      var headerStart = viewportHeight * 0.92;
      var headerEnd = viewportHeight * 0.34;


      var rawHeaderProgress =
        (headerStart - sectionRect.top) / (headerStart - headerEnd);


      var headerProgress = easeOutCubic(clamp(rawHeaderProgress, 0, 1));


      var titleY = -46 + headerProgress * 46;
      var subtitleY = 46 - headerProgress * 46;
      var headerOpacity = 0.14 + headerProgress * 0.86;


      section.style.setProperty("--caven-title-y", titleY.toFixed(2) + "px");
      section.style.setProperty("--caven-subtitle-y", subtitleY.toFixed(2) + "px");
      section.style.setProperty("--caven-title-opacity", headerOpacity.toFixed(4));
      section.style.setProperty("--caven-subtitle-opacity", headerOpacity.toFixed(4));
      section.style.setProperty("--caven-divider-scale", headerProgress.toFixed(4));
      section.style.setProperty("--caven-divider-opacity", headerOpacity.toFixed(4));


      var frameStart = viewportHeight * 0.98;
      var frameEnd = viewportHeight * 0.34;


      var rawFrameProgress =
        (frameStart - stageRect.top) / (frameStart - frameEnd);


      var frameProgress = easeOutCubic(clamp(rawFrameProgress, 0, 1));


      var frameY = 96 - frameProgress * 96;
      var frameScale = 0.925 + frameProgress * 0.075;
      var frameOpacity = 0.20 + frameProgress * 0.80;


      frame.style.setProperty("--caven-frame-y", frameY.toFixed(2) + "px");
      frame.style.setProperty("--caven-frame-scale", frameScale.toFixed(4));
      frame.style.setProperty("--caven-frame-opacity", frameOpacity.toFixed(4));
    }


    if (prefersReduced) {
      section.style.setProperty("--caven-title-y", "0px");
      section.style.setProperty("--caven-subtitle-y", "0px");
      section.style.setProperty("--caven-title-opacity", "1");
      section.style.setProperty("--caven-subtitle-opacity", "1");
      section.style.setProperty("--caven-divider-scale", "1");
      section.style.setProperty("--caven-divider-opacity", "1");


      frame.style.setProperty("--caven-frame-y", "0px");
      frame.style.setProperty("--caven-frame-scale", "1");
      frame.style.setProperty("--caven-frame-opacity", "1");
      return;
    }


    var ticking = false;


    function requestUpdate() {
      if (ticking) return;


      ticking = true;


      window.requestAnimationFrame(function () {
        updateCavenFlow();
        ticking = false;
      });
    }


    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("pageshow", requestUpdate);
    window.addEventListener("load", requestUpdate);


    requestUpdate();


    setTimeout(requestUpdate, 80);
    setTimeout(requestUpdate, 260);
    setTimeout(requestUpdate, 700);
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCavenFlowSection);
  } else {
    initCavenFlowSection();
  }
})();

// CavCode feature cards — scroll motion, reversible
(function () {
  function initCavCodeFeatureCards() {
    var section = document.querySelector("[data-cavcode-feature-cards]");
    if (!section) return;

    if (section.dataset.cavcodeFeatureCardsBound === "true") return;
    section.dataset.cavcodeFeatureCardsBound = "true";
    section.dataset.cavcodeFeatureMotion = "true";

    var shell = section.querySelector(".cavcode-feature-shell");
    var header = section.querySelector(".cavcode-feature-header");
    var cards = Array.prototype.slice.call(
      section.querySelectorAll(".cavcode-feature-card")
    );

    if (!shell || !header || !cards.length) return;

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function easeOutCubic(value) {
      return 1 - Math.pow(1 - value, 3);
    }

    function setCardMotion(card, progress) {
      var eased = easeOutCubic(clamp(progress, 0, 1));
      var y = 34 - eased * 34;
      var opacity = 0.12 + eased * 0.88;

      card.style.setProperty("--cf-card-y", y.toFixed(2) + "px");
      card.style.setProperty("--cf-card-opacity", opacity.toFixed(4));
    }

    function updateFeatureCards() {
      var rect = section.getBoundingClientRect();
      var viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;

      /*
        Scroll down:
        - whole section rises into place
        - cards reveal one by one

        Scroll up:
        - motion reverses cleanly
      */
      var start = viewportHeight * 0.92;
      var end = viewportHeight * 0.18;
      var rawProgress = (start - rect.top) / (start - end);
      var progress = clamp(rawProgress, 0, 1);
      var eased = easeOutCubic(progress);

      var sectionY = 54 - eased * 54;
      var headerY = 30 - eased * 30;
      var sectionOpacity = 0.54 + eased * 0.46;
      var headerOpacity = 0.22 + eased * 0.78;

      section.style.setProperty("--cf-section-y", sectionY.toFixed(2) + "px");
      section.style.setProperty("--cf-header-y", headerY.toFixed(2) + "px");
      section.style.setProperty("--cf-section-opacity", sectionOpacity.toFixed(4));
      section.style.setProperty("--cf-header-opacity", headerOpacity.toFixed(4));

      cards.forEach(function (card, index) {
        var stagger = index * 0.075;
        var cardProgress = (progress - stagger) / 0.54;
        setCardMotion(card, cardProgress);
      });
    }

    if (prefersReduced) {
      section.style.setProperty("--cf-section-y", "0px");
      section.style.setProperty("--cf-header-y", "0px");
      section.style.setProperty("--cf-section-opacity", "1");
      section.style.setProperty("--cf-header-opacity", "1");

      cards.forEach(function (card) {
        card.style.setProperty("--cf-card-y", "0px");
        card.style.setProperty("--cf-card-opacity", "1");
      });

      return;
    }

    var ticking = false;

    function requestUpdate() {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(function () {
        updateFeatureCards();
        ticking = false;
      });
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("pageshow", requestUpdate);
    window.addEventListener("load", requestUpdate);

    requestUpdate();
    setTimeout(requestUpdate, 80);
    setTimeout(requestUpdate, 260);
    setTimeout(requestUpdate, 700);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCavCodeFeatureCards);
  } else {
    initCavCodeFeatureCards();
  }
})();


// CavCode creation examples — true infinite centered carousel, no scroll lock
(function () {
  function initCavCodeCreationExamples() {
    var section = document.querySelector("[data-cavcode-creation-examples]");
    if (!section) return;
    if (section.dataset.cavcodeCreationBound === "true") return;
    section.dataset.cavcodeCreationBound = "true";


    var shell = section.querySelector(".cavcode-creation-shell");
    var header = section.querySelector(".cavcode-creation-header");
    var viewport = section.querySelector("[data-cavcode-creation-viewport]");
    var track = section.querySelector("[data-cavcode-creation-track]");
    var nextButton = section.querySelector("[data-cavcode-creation-next]");
    var prevButton = section.querySelector("[data-cavcode-creation-prev]");
    var dots = Array.prototype.slice.call(
      section.querySelectorAll("[data-cavcode-creation-dot]")
    );


    if (!viewport || !track) return;


    var originalCards = Array.prototype.slice.call(
      track.querySelectorAll("[data-cavcode-creation-card]")
    );


    if (!originalCards.length) return;


    var originalCount = originalCards.length;
    var defaultOriginalIndex = 0;
    var activeLoopIndex = originalCount + defaultOriginalIndex;


    var cards = [];
    var cardStep = 0;
    var centerOffset = 0;
    var x = 0;
    var targetX = 0;
    var raf = null;


    var isDragging = false;
    var pointerStartX = 0;
    var dragStartX = 0;
    var snapTimer = null;
    var resizeTimer = null;


    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    originalCards.forEach(function (card, index) {
      card.dataset.cavcodeCreationOriginalIndex = String(index);
      card.classList.remove("is-active");
    });


    originalCards
      .slice()
      .reverse()
      .forEach(function (card, reverseIndex) {
        var originalIndex = originalCount - 1 - reverseIndex;
        var clone = card.cloneNode(true);


        clone.dataset.cavcodeCreationClone = "before";
        clone.dataset.cavcodeCreationOriginalIndex = String(originalIndex);
        clone.setAttribute("aria-hidden", "true");
        clone.classList.remove("is-active");


        track.insertBefore(clone, track.firstChild);
      });


    originalCards.forEach(function (card, index) {
      var clone = card.cloneNode(true);


      clone.dataset.cavcodeCreationClone = "after";
      clone.dataset.cavcodeCreationOriginalIndex = String(index);
      clone.setAttribute("aria-hidden", "true");
      clone.classList.remove("is-active");


      track.appendChild(clone);
    });


    cards = Array.prototype.slice.call(
      track.querySelectorAll("[data-cavcode-creation-card]")
    );


    function mod(value, size) {
      return ((value % size) + size) % size;
    }


    function getGap() {
      var styles = window.getComputedStyle(track);
      return parseFloat(styles.columnGap || styles.gap || "0") || 0;
    }


    function getXForIndex(index) {
      return centerOffset - index * cardStep;
    }


    function getFloatIndexFromX(value) {
      if (!cardStep) return activeLoopIndex;
      return (centerOffset - value) / cardStep;
    }


    function applyX() {
      track.style.transform = "translate3d(" + x.toFixed(2) + "px, 0, 0)";
    }


    function setActiveFromLoopIndex(loopIndex) {
      activeLoopIndex = loopIndex;


      var originalIndex = mod(loopIndex, originalCount);


      cards.forEach(function (card, index) {
        card.classList.toggle("is-active", index === activeLoopIndex);
      });


      dots.forEach(function (dot, index) {
        var isActive = index === originalIndex;
        dot.classList.toggle("is-active", isActive);


        if (isActive) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    }


    function normalizePosition() {
      if (!cardStep) return 0;


      var shift = 0;
      var floatIndex = getFloatIndexFromX(x);
      var groupWidth = originalCount * cardStep;


      while (floatIndex >= originalCount * 2) {
        x += groupWidth;
        targetX += groupWidth;
        activeLoopIndex -= originalCount;
        shift += groupWidth;
        floatIndex -= originalCount;
      }


      while (floatIndex < originalCount) {
        x -= groupWidth;
        targetX -= groupWidth;
        activeLoopIndex += originalCount;
        shift -= groupWidth;
        floatIndex += originalCount;
      }


      if (shift !== 0) {
        applyX();
      }


      return shift;
    }


    function getNearestLoopIndex() {
      return Math.round(getFloatIndexFromX(x));
    }


    function updateActiveFromPosition() {
      var nearest = getNearestLoopIndex();


      if (nearest < 0) nearest = 0;
      if (nearest > cards.length - 1) nearest = cards.length - 1;


      setActiveFromLoopIndex(nearest);
    }


    function measure() {
      if (!cards.length) return;


      var firstCard = cards[0];
      var cardRect = firstCard.getBoundingClientRect();
      var viewportRect = viewport.getBoundingClientRect();


      cardStep = cardRect.width + getGap();
      centerOffset = (viewportRect.width - cardRect.width) / 2;


      targetX = getXForIndex(activeLoopIndex);
      x = targetX;


      applyX();
      normalizePosition();
      updateActiveFromPosition();
    }


    function stopAnimation() {
      if (!raf) return;
      window.cancelAnimationFrame(raf);
      raf = null;
    }


    function animate() {
      var diff = targetX - x;


      if (Math.abs(diff) < 0.08) {
        x = targetX;
        applyX();
        normalizePosition();
        updateActiveFromPosition();
        raf = null;
        return;
      }


      x += diff * (prefersReduced ? 1 : 0.16);


      applyX();
      normalizePosition();
      updateActiveFromPosition();


      raf = window.requestAnimationFrame(animate);
    }


    function startAnimation() {
      if (raf) return;
      raf = window.requestAnimationFrame(animate);
    }


    function goToLoopIndex(loopIndex, smooth) {
      activeLoopIndex = loopIndex;
      targetX = getXForIndex(loopIndex);


      if (!smooth || prefersReduced) {
        stopAnimation();
        x = targetX;
        applyX();
        normalizePosition();
        updateActiveFromPosition();
        return;
      }


      updateActiveFromPosition();
      startAnimation();
    }


    function snapToNearest() {
      var nearest = getNearestLoopIndex();
      goToLoopIndex(nearest, true);
    }


    function scheduleSnap() {
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(snapToNearest, 120);
    }


    function getNearestDotLoopIndex(originalIndex) {
      var currentFloat = getFloatIndexFromX(x);
      var candidates = [
        originalIndex,
        originalCount + originalIndex,
        originalCount * 2 + originalIndex
      ];


      var best = candidates[0];
      var bestDistance = Infinity;


      candidates.forEach(function (candidate) {
        var distance = Math.abs(candidate - currentFloat);


        if (distance < bestDistance) {
          bestDistance = distance;
          best = candidate;
        }
      });


      return best;
    }


    function onPointerDown(event) {
      isDragging = true;
      pointerStartX = event.clientX || 0;
      dragStartX = targetX;


      viewport.classList.add("is-dragging");
      stopAnimation();


      if (viewport.setPointerCapture) {
        viewport.setPointerCapture(event.pointerId);
      }
    }


    function onPointerMove(event) {
      if (!isDragging) return;


      var currentX = event.clientX || 0;
      var delta = currentX - pointerStartX;


      targetX = dragStartX + delta;
      x = targetX;


      applyX();


      var shift = normalizePosition();


      if (shift !== 0) {
        dragStartX += shift;
      }


      updateActiveFromPosition();
    }


    function onPointerUp(event) {
      if (!isDragging) return;


      isDragging = false;
      viewport.classList.remove("is-dragging");


      if (viewport.releasePointerCapture) {
        viewport.releasePointerCapture(event.pointerId);
      }


      snapToNearest();
    }


    function onWheel(event) {
      var horizontalIntent =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;


      if (!horizontalIntent) return;


      event.preventDefault();


      var delta = event.shiftKey ? event.deltaY : event.deltaX;


      stopAnimation();


      targetX -= delta;
      x = targetX;


      applyX();
      normalizePosition();
      updateActiveFromPosition();
      scheduleSnap();
    }


    function updateScrollMotion() {
      if (prefersReduced) {
        section.style.setProperty("--ccx-section-y", "0px");
        section.style.setProperty("--ccx-header-y", "0px");
        section.style.setProperty("--ccx-section-opacity", "1");
        section.style.setProperty("--ccx-header-opacity", "1");
        return;
      }


      var rect = section.getBoundingClientRect();
      var viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;


      var start = viewportHeight * 0.94;
      var end = viewportHeight * 0.22;
      var rawProgress = (start - rect.top) / (start - end);
      var progress = Math.max(0, Math.min(1, rawProgress));
      var eased = 1 - Math.pow(1 - progress, 3);


      var sectionY = 46 - eased * 46;
      var headerY = 30 - eased * 30;
      var sectionOpacity = 0.62 + eased * 0.38;
      var headerOpacity = 0.18 + eased * 0.82;


      section.style.setProperty("--ccx-section-y", sectionY.toFixed(2) + "px");
      section.style.setProperty("--ccx-header-y", headerY.toFixed(2) + "px");
      section.style.setProperty("--ccx-section-opacity", sectionOpacity.toFixed(4));
      section.style.setProperty("--ccx-header-opacity", headerOpacity.toFixed(4));
    }


    var motionTicking = false;


    function requestMotionUpdate() {
      if (motionTicking) return;


      motionTicking = true;


      window.requestAnimationFrame(function () {
        updateScrollMotion();
        motionTicking = false;
      });
    }


    if (nextButton) {
      nextButton.addEventListener("click", function () {
        goToLoopIndex(activeLoopIndex + 1, true);
      });
    }


    if (prevButton) {
      prevButton.addEventListener("click", function () {
        goToLoopIndex(activeLoopIndex - 1, true);
      });
    }


    dots.forEach(function (dot, fallbackIndex) {
      dot.addEventListener("click", function () {
        var dotIndex = Number(dot.getAttribute("data-cavcode-creation-dot"));
        var originalIndex = Number.isFinite(dotIndex) ? dotIndex : fallbackIndex;


        goToLoopIndex(getNearestDotLoopIndex(originalIndex), true);
      });
    });


    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerUp);
    viewport.addEventListener("lostpointercapture", onPointerUp);
    viewport.addEventListener("wheel", onWheel, { passive: false });


    window.addEventListener("scroll", requestMotionUpdate, { passive: true });
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);


      resizeTimer = window.setTimeout(function () {
        measure();
        goToLoopIndex(activeLoopIndex, false);
        requestMotionUpdate();
      }, 120);
    });


    window.addEventListener("pageshow", function () {
      measure();
      goToLoopIndex(activeLoopIndex, false);
      requestMotionUpdate();
    });


    window.addEventListener("load", requestMotionUpdate);


    measure();
    requestMotionUpdate();


    window.setTimeout(function () {
      measure();
      goToLoopIndex(originalCount + defaultOriginalIndex, false);
      requestMotionUpdate();
    }, 80);


    window.setTimeout(function () {
      measure();
      goToLoopIndex(originalCount + defaultOriginalIndex, false);
      requestMotionUpdate();
    }, 300);
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCavCodeCreationExamples);
  } else {
    initCavCodeCreationExamples();
  }
})();

// CavCode / Caven pricing seal — reversible scroll motion
(function () {
  function initCavCodeCavenPricing() {
    var section = document.querySelector("[data-cavcode-caven-pricing]");
    if (!section) return;


    if (section.dataset.cavcodeCavenPricingBound === "true") return;
    section.dataset.cavcodeCavenPricingBound = "true";


    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }


    function easeOutCubic(value) {
      return 1 - Math.pow(1 - value, 3);
    }


    function setReadyState() {
      section.style.setProperty("--cvp-header-y", "0px");
      section.style.setProperty("--cvp-header-opacity", "1");
      section.style.setProperty("--cvp-left-x", "0px");
      section.style.setProperty("--cvp-right-x", "0px");
      section.style.setProperty("--cvp-card-y", "0px");
      section.style.setProperty("--cvp-card-opacity", "1");
    }


    function updatePricingMotion() {
      if (prefersReduced) {
        setReadyState();
        return;
      }


      var rect = section.getBoundingClientRect();
      var viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;


      /*
        Scroll down:
        - title/subtitle glide upward into place
        - left plan moves right
        - right plan moves left
        - both meet cleanly in the center


        Scroll back up:
        - motion reverses naturally
      */
      var start = viewportHeight * 0.94;
      var end = viewportHeight * 0.26;
      var rawProgress = (start - rect.top) / (start - end);
      var progress = clamp(rawProgress, 0, 1);
      var eased = easeOutCubic(progress);


      var headerY = 34 - eased * 34;
      var headerOpacity = 0.18 + eased * 0.82;


      var cardY = 28 - eased * 28;
      var cardOpacity = 0.22 + eased * 0.78;


      var leftX = -72 + eased * 72;
      var rightX = 72 - eased * 72;


      section.style.setProperty("--cvp-header-y", headerY.toFixed(2) + "px");
      section.style.setProperty("--cvp-header-opacity", headerOpacity.toFixed(4));
      section.style.setProperty("--cvp-left-x", leftX.toFixed(2) + "px");
      section.style.setProperty("--cvp-right-x", rightX.toFixed(2) + "px");
      section.style.setProperty("--cvp-card-y", cardY.toFixed(2) + "px");
      section.style.setProperty("--cvp-card-opacity", cardOpacity.toFixed(4));
    }


    var ticking = false;


    function requestUpdate() {
      if (ticking) return;


      ticking = true;


      window.requestAnimationFrame(function () {
        updatePricingMotion();
        ticking = false;
      });
    }


    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("pageshow", requestUpdate);
    window.addEventListener("load", requestUpdate);


    requestUpdate();
    setTimeout(requestUpdate, 80);
    setTimeout(requestUpdate, 260);
    setTimeout(requestUpdate, 700);
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCavCodeCavenPricing);
  } else {
    initCavCodeCavenPricing();
  }
})();

