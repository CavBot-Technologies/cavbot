(function () {
  "use strict";

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
  }

  function normalizeOrigin(value) {
    var raw = String(value || "").trim();

    if (!raw) {
      return "";
    }

    if (!/^https?:\/\//i.test(raw)) {
      raw = "https://" + raw;
    }

    try {
      var url = new URL(raw);

      if (!url.hostname || url.username || url.password) {
        return "";
      }

      return url.origin;
    } catch (error) {
      return "";
    }
  }

  function initRouteStartForm() {
    var form = document.querySelector("[data-route-scan-form]");

    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var input = form.querySelector('input[name="origin"]');
      var origin = normalizeOrigin(input ? input.value : "");

      if (!origin) {
        if (input) {
          input.setAttribute("aria-invalid", "true");
          input.focus();
        }

        return;
      }

      if (input) {
        input.setAttribute("aria-invalid", "false");
      }

      var base =
        window.CAVBOT_ROUTES_START_URL ||
        "https://app.cavbot.io/routes/start";

      window.location.href =
        base +
        "?origin=" +
        encodeURIComponent(origin) +
        "&source=marketing";
    });
  }

  function initRoutePreviewRise() {
    var stage = document.querySelector("[data-route-preview-stage]");
    var frame = document.querySelector("[data-route-preview-frame]");

    if (!stage || !frame) return;
    if (stage.dataset.routePreviewBound === "true") return;

    stage.dataset.routePreviewBound = "true";

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setReady() {
      frame.style.setProperty("--route-preview-y", "0px");
      frame.style.setProperty("--route-preview-scale", "1");
      frame.style.setProperty("--route-preview-opacity", "1");
    }

    function updatePreview() {
      if (prefersReduced) {
        setReady();
        return;
      }

      var rect = stage.getBoundingClientRect();
      var viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;

      var start = viewportHeight * 0.96;
      var end = viewportHeight * 0.34;

      var rawProgress = (start - rect.top) / (start - end);
      var progress = easeOutCubic(clamp(rawProgress, 0, 1));

      var y = 96 - progress * 96;
      var scale = 0.94 + progress * 0.06;
      var opacity = 0.74 + progress * 0.26;

      frame.style.setProperty("--route-preview-y", y.toFixed(2) + "px");
      frame.style.setProperty("--route-preview-scale", scale.toFixed(4));
      frame.style.setProperty("--route-preview-opacity", opacity.toFixed(4));
    }

    var ticking = false;

    function requestUpdate() {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(function () {
        updatePreview();
        ticking = false;
      });
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("pageshow", requestUpdate);
    window.addEventListener("load", requestUpdate);

    requestUpdate();
    window.setTimeout(requestUpdate, 80);
    window.setTimeout(requestUpdate, 260);
    window.setTimeout(requestUpdate, 700);
  }

  function restartRouteHeroAnimations(hero) {
    var animatedItems = hero.querySelectorAll(
      ".route-flow-map i, .route-issue-row"
    );

    animatedItems.forEach(function (item) {
      item.style.animation = "none";
    });

    window.requestAnimationFrame(function () {
      animatedItems.forEach(function (item) {
        item.style.animation = "";
      });
    });
  }

  function initRouteHeroVisibility() {
    var hero = document.querySelector("[data-route-hero]");

    if (!hero) return;
    if (hero.dataset.routeHeroBound === "true") return;

    hero.dataset.routeHeroBound = "true";

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      hero.classList.add("is-route-visible");
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          hero.classList.add("is-route-visible");
          restartRouteHeroAnimations(hero);
        });
      },
      {
        threshold: 0.28
      }
    );

    observer.observe(hero);
  }

  function init() {
    initRoutePreviewRise();
    initRouteStartForm();
    initRouteHeroVisibility();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();


(function () {
  "use strict";

  function getRouteCount(section) {
    return section.querySelector(".route-diff-line-chart p strong");
  }

  function clearRouteCount(count) {
    if (!count) return;

    if (count._routeCountRaf) {
      window.cancelAnimationFrame(count._routeCountRaf);
      count._routeCountRaf = null;
    }

    if (count._routeCountTimer) {
      window.clearTimeout(count._routeCountTimer);
      count._routeCountTimer = null;
    }

    count._routeCountRunning = false;
  }

  function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
  }

  function animateNumber(count, from, to, duration, onDone) {
    var startTime = null;

    function tick(now) {
      if (!startTime) startTime = now;

      var progress = Math.min((now - startTime) / duration, 1);
      var eased = easeOutCubic(progress);
      var value = Math.round(from + (to - from) * eased);

      count.textContent = String(value);

      if (progress < 1) {
        count._routeCountRaf = window.requestAnimationFrame(tick);
        return;
      }

      count.textContent = String(to);
      count._routeCountRaf = null;

      if (typeof onDone === "function") {
        onDone();
      }
    }

    count._routeCountRaf = window.requestAnimationFrame(tick);
  }

  function startRouteCount(section) {
    var count = getRouteCount(section);
    if (!count) return;

    if (count._routeCountRunning === true) return;

    clearRouteCount(count);

    count._routeCountRunning = true;

    var values = [42, 57, 80, 111, 64, 20, 70, 42];
    var index = 0;

    var holdTime = 1800;
    var animationTime = 950;

    count.textContent = String(values[index]);

    function moveToNextValue() {
      if (count._routeCountRunning !== true) return;

      var from = values[index];
      index = (index + 1) % values.length;
      var to = values[index];

      animateNumber(count, from, to, animationTime, function () {
        if (count._routeCountRunning !== true) return;

        count._routeCountTimer = window.setTimeout(moveToNextValue, holdTime);
      });
    }

    count._routeCountTimer = window.setTimeout(moveToNextValue, holdTime);
  }

  function restartRouteDiffAnimations(section) {
    section.querySelectorAll(
      ".route-diff-donut, .route-diff-signal-bars i, .route-diff-chart-line"
    ).forEach(function (item) {
      item.style.animation = "none";
    });

    window.requestAnimationFrame(function () {
      section.querySelectorAll(
        ".route-diff-donut, .route-diff-signal-bars i, .route-diff-chart-line"
      ).forEach(function (item) {
        item.style.animation = "";
      });
    });

    startRouteCount(section);
  }

  function initRouteDiffSection() {
    var section = document.querySelector("[data-route-diff-section]");

    if (!section) return;
    if (section.dataset.routeDiffBound === "true") return;

    section.dataset.routeDiffBound = "true";

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var count = getRouteCount(section);

    if (prefersReduced) {
      section.classList.add("is-visible");
      if (count) count.textContent = "42";
      return;
    }

    if (!("IntersectionObserver" in window)) {
      section.classList.add("is-visible");
      restartRouteDiffAnimations(section);
      return;
    }

    var hasStartedOnce = false;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          section.classList.add("is-visible");

          if (!hasStartedOnce) {
            hasStartedOnce = true;
            restartRouteDiffAnimations(section);
          } else {
            startRouteCount(section);
          }
        });
      },
      {
        threshold: 0.28
      }
    );

    observer.observe(section);

    window.addEventListener("pagehide", function () {
      clearRouteCount(getRouteCount(section));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRouteDiffSection);
  } else {
    initRouteDiffSection();
  }
})();


(function () {
  "use strict";

  function initVerifiedOwnershipPopover() {
    var marks = Array.prototype.slice.call(
      document.querySelectorAll(".route-diff-small-mark, .route-verify-trigger")
    );

    if (!marks.length) return;

    marks.forEach(function (mark) {
      if (mark.dataset.routeVerifyBound === "true") return;

      mark.dataset.routeVerifyBound = "true";

      var button = mark.querySelector(".route-diff-small-button, .route-verify-info-button");
      var closeTimer = null;

      function clearCloseTimer() {
        if (!closeTimer) return;
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }

      function openPopover() {
        clearCloseTimer();
        mark.classList.add("is-open");
      }

      function closePopover() {
        clearCloseTimer();
        mark.classList.remove("is-open");
      }

      mark.addEventListener("mouseenter", openPopover);
      mark.addEventListener("focusin", openPopover);

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          mark.classList.toggle("is-open");
        });
      }

      document.addEventListener("pointermove", function (event) {
        if (!mark.classList.contains("is-open")) return;
        if (mark.contains(event.target)) {
          clearCloseTimer();
          return;
        }

        if (!closeTimer) {
          closeTimer = window.setTimeout(closePopover, 420);
        }
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") closePopover();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initVerifiedOwnershipPopover);
  } else {
    initVerifiedOwnershipPopover();
  }
})();

(function () {
  "use strict";

  function initRouteWebAnalyticsSection() {
    var section = document.querySelector("[data-route-web-analytics]");
    if (!section) return;
    if (section.dataset.routeWebAnalyticsBound === "true") return;

    section.dataset.routeWebAnalyticsBound = "true";

    var tabs = Array.prototype.slice.call(
      section.querySelectorAll("[data-route-wa-tab]")
    );

    var screens = Array.prototype.slice.call(
      section.querySelectorAll("[data-route-wa-screen]")
    );

    if (!tabs.length || !screens.length) return;

    var activeIndex = 0;
    var raf = null;
    var startTime = 0;
    var isRunning = false;

    var STEP_MS = 5200;
    var TOTAL_MS = STEP_MS * tabs.length;

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function setStepProgress(percent) {
      section.style.setProperty(
        "--route-wa-step-progress",
        clamp(percent, 0, 100).toFixed(3) + "%"
      );
    }

    function restartActiveVisuals() {
      var screen = screens[activeIndex];
      if (!screen) return;

      var animatedItems = screen.querySelectorAll(
        ".route-wa-traffic-row em, .route-wa-speed-card em, .route-wa-path-flow i, .route-wa-path-packet, .route-wa-broken-row, .route-wa-report-row"
      );

      animatedItems.forEach(function (item) {
        item.style.animation = "none";
      });

      window.requestAnimationFrame(function () {
        animatedItems.forEach(function (item) {
          item.style.animation = "";
        });
      });
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

      restartActiveVisuals();
    }

    function stopRotation() {
      isRunning = false;

      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = null;
      }
    }

    function tick(now) {
      if (!isRunning) return;

      var elapsed = (now - startTime) % TOTAL_MS;
      var raw = elapsed / TOTAL_MS;

      var nextIndex = Math.min(
        tabs.length - 1,
        Math.floor(raw * tabs.length)
      );

      var stepElapsed = elapsed % STEP_MS;
      var stepProgress = (stepElapsed / STEP_MS) * 100;

      setStepProgress(stepProgress);

      if (nextIndex !== activeIndex) {
        setActive(nextIndex);
        setStepProgress(0);
      }

      raf = window.requestAnimationFrame(tick);
    }

    function startRotation(offsetIndex) {
      if (prefersReduced) {
        setActive(0);
        setStepProgress(100);
        return;
      }

      stopRotation();

      var index = Number.isFinite(offsetIndex) ? offsetIndex : activeIndex;
      startTime = performance.now() - index * STEP_MS;

      isRunning = true;
      raf = window.requestAnimationFrame(tick);
    }

    function activateFromClick(index) {
      var safeIndex = ((index % tabs.length) + tabs.length) % tabs.length;

      setActive(safeIndex);
      setStepProgress(0);
      startRotation(safeIndex);
    }

    tabs.forEach(function (tab, fallbackIndex) {
      tab.addEventListener("click", function (event) {
        event.preventDefault();

        var attrIndex = Number(tab.getAttribute("data-route-wa-tab"));
        activateFromClick(Number.isFinite(attrIndex) ? attrIndex : fallbackIndex);
      });
    });

    function bindVisibility() {
      if (!("IntersectionObserver" in window)) {
        section.classList.add("is-visible");
        startRotation(0);
        return;
      }

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var visible = entry.isIntersecting;
            section.classList.toggle("is-visible", visible);

            if (visible) {
              startRotation(activeIndex);
            } else {
              stopRotation();
            }
          });
        },
        {
          threshold: 0.18,
          rootMargin: "0px 0px -8% 0px"
        }
      );

      observer.observe(section);
    }

    setActive(0);
    setStepProgress(0);
    bindVisibility();

    window.addEventListener("pageshow", function () {
      setActive(activeIndex);
      setStepProgress(0);

      if (section.classList.contains("is-visible")) {
        startRotation(activeIndex);
      }
    });

    window.addEventListener("resize", function () {
      setActive(activeIndex);
    });

    window.addEventListener("pagehide", stopRotation);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRouteWebAnalyticsSection);
  } else {
    initRouteWebAnalyticsSection();
  }
})();

(function () {
  "use strict";

  function initRouteSetupSection() {
    var section = document.querySelector("[data-route-setup-section]");

    if (!section) return;
    if (section.dataset.routeSetupBound === "true") return;

    section.dataset.routeSetupBound = "true";

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      section.classList.add("is-visible");
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          section.classList.add("is-visible");
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    observer.observe(section);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRouteSetupSection);
  } else {
    initRouteSetupSection();
  }
})();

(function () {
  "use strict";

  function initRouteCompareSection() {
    var section = document.querySelector("[data-route-compare-section]");

    if (!section) return;
    if (section.dataset.routeCompareBound === "true") return;

    section.dataset.routeCompareBound = "true";

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      section.classList.add("is-visible");
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          section.classList.add("is-visible");
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    observer.observe(section);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRouteCompareSection);
  } else {
    initRouteCompareSection();
  }
})();



(function () {
  "use strict";

  function initRouteErrorSection() {
    var section = document.querySelector("[data-route-error-section]");

    if (!section) return;
    if (section.dataset.routeErrorBound === "true") return;

    section.dataset.routeErrorBound = "true";

    var numbers = Array.prototype.slice.call(
      section.querySelectorAll(".route-error-metrics strong")
    );

    var metricSets = [
      ["12", "3", "42"],
      ["18", "5", "57"],
      ["9", "2", "31"],
      ["24", "6", "68"],
      ["15", "4", "44"],
      ["7", "1", "20"]
    ];

    var activeIndex = 0;
    var timer = null;

    function setNumbers(values) {
      numbers.forEach(function (number, index) {
        number.textContent = values[index] || number.textContent;
      });
    }

    function startNumberLoop() {
      if (!numbers.length) return;
      if (timer) return;

      setNumbers(metricSets[activeIndex]);

      timer = window.setInterval(function () {
        activeIndex = (activeIndex + 1) % metricSets.length;
        setNumbers(metricSets[activeIndex]);
      }, 1400);
    }

    function stopNumberLoop() {
      if (!timer) return;

      window.clearInterval(timer);
      timer = null;
    }

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      section.classList.add("is-visible");
      setNumbers(metricSets[0]);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            section.classList.add("is-visible");
            startNumberLoop();
          } else {
            stopNumberLoop();
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    observer.observe(section);

    window.addEventListener("pagehide", stopNumberLoop);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRouteErrorSection);
  } else {
    initRouteErrorSection();
  }
})();
(function () {
  "use strict";

  function initRouteFinalSection() {
    var section = document.querySelector("[data-route-final-section]");

    if (!section) return;
    if (section.dataset.routeFinalBound === "true") return;

    section.dataset.routeFinalBound = "true";

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      section.classList.add("is-visible");
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          section.classList.add("is-visible");
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    observer.observe(section);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRouteFinalSection);
  } else {
    initRouteFinalSection();
  }
})();
