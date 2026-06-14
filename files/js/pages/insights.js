(function () {
  "use strict";

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(start, end, progress) {
    return start + (end - start) * progress;
  }

  function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
  }

  function easeOutQuint(value) {
    return 1 - Math.pow(1 - value, 5);
  }

  function easeInOutCubic(value) {
    return value < 0.5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;
  }

  function easeInOutSine(value) {
    return -(Math.cos(Math.PI * value) - 1) / 2;
  }

  function prefersReducedMotion() {
    return Boolean(
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  /* ==============================
    PREVIEW SCROLL RISE
  ============================== */

  function initInsightsPreviewRise() {
    var stage = document.querySelector(
      "[data-insights-preview-stage]"
    );

    var frame = document.querySelector(
      "[data-insights-preview-frame]"
    );

    if (!stage || !frame) return;
    if (stage.dataset.insightsPreviewBound === "true") return;

    stage.dataset.insightsPreviewBound = "true";

    var reduced = prefersReducedMotion();
    var animationFrame = null;

    var current = {
      y: 96,
      scale: 0.94,
      opacity: 0.74
    };

    var target = {
      y: 96,
      scale: 0.94,
      opacity: 0.74
    };

    function paint() {
      frame.style.setProperty(
        "--insights-preview-y",
        current.y.toFixed(2) + "px"
      );

      frame.style.setProperty(
        "--insights-preview-scale",
        current.scale.toFixed(4)
      );

      frame.style.setProperty(
        "--insights-preview-opacity",
        current.opacity.toFixed(4)
      );
    }

    function setReady() {
      current.y = 0;
      current.scale = 1;
      current.opacity = 1;

      target.y = 0;
      target.scale = 1;
      target.opacity = 1;

      paint();
    }

    function calculateTarget() {
      if (reduced) {
        setReady();
        return;
      }

      var rect = stage.getBoundingClientRect();

      var viewportHeight =
        window.innerHeight ||
        document.documentElement.clientHeight;

      var start = viewportHeight * 0.96;
      var end = viewportHeight * 0.34;

      var rawProgress =
        (start - rect.top) /
        (start - end);

      var progress = easeOutCubic(
        clamp(rawProgress, 0, 1)
      );

      target.y = 96 - progress * 96;
      target.scale = 0.94 + progress * 0.06;
      target.opacity = 0.74 + progress * 0.26;

      startAnimation();
    }

    function render() {
      current.y = lerp(
        current.y,
        target.y,
        0.14
      );

      current.scale = lerp(
        current.scale,
        target.scale,
        0.14
      );

      current.opacity = lerp(
        current.opacity,
        target.opacity,
        0.14
      );

      paint();

      var stillMoving =
        Math.abs(current.y - target.y) > 0.05 ||
        Math.abs(current.scale - target.scale) > 0.0002 ||
        Math.abs(current.opacity - target.opacity) > 0.0002;

      if (stillMoving) {
        animationFrame =
          window.requestAnimationFrame(render);
      } else {
        current.y = target.y;
        current.scale = target.scale;
        current.opacity = target.opacity;

        paint();
        animationFrame = null;
      }
    }

    function startAnimation() {
      if (animationFrame) return;

      animationFrame =
        window.requestAnimationFrame(render);
    }

    window.addEventListener(
      "scroll",
      calculateTarget,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      calculateTarget,
      { passive: true }
    );

    window.addEventListener(
      "pageshow",
      calculateTarget
    );

    window.addEventListener(
      "load",
      calculateTarget
    );

    calculateTarget();

    window.setTimeout(calculateTarget, 80);
    window.setTimeout(calculateTarget, 260);
    window.setTimeout(calculateTarget, 700);
  }

  /* ==============================
    ONE-TIME COUNTERS
  ============================== */

  function animateInsightsCounters(hero) {
    if (!hero) return;

    if (
      hero.dataset.insightsCountersPlayed ===
      "true"
    ) {
      return;
    }

    hero.dataset.insightsCountersPlayed = "true";

    var counters = Array.prototype.slice.call(
      hero.querySelectorAll(
        "[data-insights-count]"
      )
    );

    if (!counters.length) return;

    if (prefersReducedMotion()) {
      counters.forEach(function (counter) {
        var value =
          counter.getAttribute(
            "data-insights-count"
          ) || "0";

        var suffix =
          counter.getAttribute(
            "data-insights-suffix"
          ) || "";

        counter.textContent = value + suffix;
      });

      return;
    }

    var duration = 1400;
    var startedAt = performance.now();

    function tick(now) {
      var progress = clamp(
        (now - startedAt) / duration,
        0,
        1
      );

      var eased = easeOutQuint(progress);

      counters.forEach(function (counter) {
        var target =
          parseInt(
            counter.getAttribute(
              "data-insights-count"
            ),
            10
          ) || 0;

        var suffix =
          counter.getAttribute(
            "data-insights-suffix"
          ) || "";

        var current =
          Math.round(target * eased);

        counter.textContent =
          current + suffix;
      });

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      }
    }

    window.requestAnimationFrame(tick);
  }

  /* ==============================
    PRIORITY PAGE NUMBER LOOP
  ============================== */

  function createPriorityPagesLoop(hero) {
    var numberNodes =
      Array.prototype.slice.call(
        hero.querySelectorAll(
          '[data-insights-loop="priority-pages"]'
        )
      );

    var totalNodes =
      Array.prototype.slice.call(
        hero.querySelectorAll(
          '[data-insights-loop-total="priority-pages"]'
        )
      );

    var values = [
      18,
      24,
      15,
      31,
      22,
      13,
      27,
      19,
      18
    ];

    var activeIndex = 0;
    var animationFrame = null;
    var startedAt = 0;
    var running = false;

    var HOLD_DURATION = 1450;
    var CHANGE_DURATION = 950;
    var CYCLE_DURATION =
      HOLD_DURATION + CHANGE_DURATION;

    function paint(value) {
      var rounded = Math.round(value);

      numberNodes.forEach(function (node) {
        node.textContent = String(rounded);
      });

      totalNodes.forEach(function (node) {
        node.textContent =
          rounded + " total";
      });
    }

    function tick(now) {
      if (!running) return;

      if (!startedAt) {
        startedAt = now;
      }

      var elapsed = now - startedAt;

      var currentValue =
        values[activeIndex];

      var nextIndex =
        (activeIndex + 1) %
        values.length;

      var nextValue =
        values[nextIndex];

      if (elapsed <= HOLD_DURATION) {
        paint(currentValue);
      } else {
        var transitionProgress = clamp(
          (
            elapsed -
            HOLD_DURATION
          ) /
          CHANGE_DURATION,
          0,
          1
        );

        var eased =
          easeInOutSine(
            transitionProgress
          );

        paint(
          lerp(
            currentValue,
            nextValue,
            eased
          )
        );
      }

      if (elapsed >= CYCLE_DURATION) {
        activeIndex = nextIndex;
        startedAt = now;

        paint(values[activeIndex]);
      }

      animationFrame =
        window.requestAnimationFrame(tick);
    }

    function start() {
      stop();

      paint(values[activeIndex]);

      if (prefersReducedMotion()) {
        return;
      }

      running = true;
      startedAt = 0;

      animationFrame =
        window.requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      startedAt = 0;

      if (animationFrame) {
        window.cancelAnimationFrame(
          animationFrame
        );

        animationFrame = null;
      }
    }

    paint(values[activeIndex]);

    return {
      start: start,
      stop: stop
    };
  }

  /* ==============================
    COVERAGE RING LOOP
  ============================== */

  function createCoverageRingLoop(hero) {
    var ring = hero.querySelector(
      "[data-insights-coverage-ring]"
    );

    if (!ring) {
      return {
        start: function () {},
        stop: function () {}
      };
    }

    var animationFrame = null;
    var startedAt = 0;
    var running = false;

    var targetPercent = 86;
    var targetDegrees =
      360 * (targetPercent / 100);

    var DRAW_DURATION = 2800;
    var HOLD_DURATION = 1100;
    var RETURN_DURATION = 950;
    var REST_DURATION = 500;

    var TOTAL_DURATION =
      DRAW_DURATION +
      HOLD_DURATION +
      RETURN_DURATION +
      REST_DURATION;

    function setDegrees(degrees) {
      ring.style.setProperty(
        "--insights-coverage-deg",
        clamp(
          degrees,
          0,
          targetDegrees
        ).toFixed(2) + "deg"
      );
    }

    function tick(now) {
      if (!running) return;

      if (!startedAt) {
        startedAt = now;
      }

      var elapsed =
        (now - startedAt) %
        TOTAL_DURATION;

      if (elapsed <= DRAW_DURATION) {
        var drawProgress =
          elapsed /
          DRAW_DURATION;

        setDegrees(
          targetDegrees *
          easeInOutCubic(
            clamp(drawProgress, 0, 1)
          )
        );
      } else if (
        elapsed <=
        DRAW_DURATION +
        HOLD_DURATION
      ) {
        setDegrees(targetDegrees);
      } else if (
        elapsed <=
        DRAW_DURATION +
        HOLD_DURATION +
        RETURN_DURATION
      ) {
        var returnProgress =
          (
            elapsed -
            DRAW_DURATION -
            HOLD_DURATION
          ) /
          RETURN_DURATION;

        setDegrees(
          targetDegrees *
          (
            1 -
            easeInOutCubic(
              clamp(returnProgress, 0, 1)
            )
          )
        );
      } else {
        setDegrees(0);
      }

      animationFrame =
        window.requestAnimationFrame(tick);
    }

    function start() {
      stop();

      if (prefersReducedMotion()) {
        setDegrees(targetDegrees);
        return;
      }

      setDegrees(0);

      running = true;
      startedAt = 0;

      animationFrame =
        window.requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      startedAt = 0;

      if (animationFrame) {
        window.cancelAnimationFrame(
          animationFrame
        );

        animationFrame = null;
      }
    }

    return {
      start: start,
      stop: stop
    };
  }

  /* ==============================
    GRAPH LINE LOOP
  ============================== */

  function createInsightsGraphLoop(hero) {
    var line = hero.querySelector(
      ".insights-chart-line"
    );

    var area = hero.querySelector(
      ".insights-chart-area"
    );

    var dots =
      Array.prototype.slice.call(
        hero.querySelectorAll(
          ".insights-chart-dots circle"
        )
      );

    if (!line || !dots.length) {
      return {
        start: function () {},
        stop: function () {}
      };
    }

    var animationFrame = null;
    var startedAt = 0;
    var running = false;

    var pathLength = 0;

    try {
      pathLength =
        line.getTotalLength();
    } catch (error) {
      pathLength = 820;
    }

    if (!pathLength) {
      pathLength = 820;
    }

    var SEGMENT_DURATION = 1050;

    var DRAW_DURATION =
      SEGMENT_DURATION *
      Math.max(1, dots.length - 1);

    var HOLD_DURATION = 1050;
    var FADE_DURATION = 750;
    var REST_DURATION = 420;

    var TOTAL_DURATION =
      DRAW_DURATION +
      HOLD_DURATION +
      FADE_DURATION +
      REST_DURATION;

    line.style.transition = "none";
    line.style.strokeDasharray =
      String(pathLength);

    line.style.strokeDashoffset =
      String(pathLength);

    line.style.opacity = "0";

    if (area) {
      area.style.transition = "none";
      area.style.opacity = "0";
    }

    dots.forEach(function (dot) {
      dot.style.transition = "none";
      dot.style.transformBox = "fill-box";
      dot.style.transformOrigin = "center";
      dot.style.opacity = "0";
      dot.style.transform = "scale(0.45)";
    });

    function setGraphState(
      progress,
      opacity
    ) {
      var safeProgress =
        clamp(progress, 0, 1);

      var safeOpacity =
        clamp(opacity, 0, 1);

      line.style.strokeDashoffset =
        String(
          pathLength *
          (1 - safeProgress)
        );

      line.style.opacity =
        safeOpacity.toFixed(3);

      if (area) {
        area.style.opacity =
          (
            safeOpacity *
            (
              0.03 +
              safeProgress * 0.24
            )
          ).toFixed(3);
      }

      var finalDotIndex =
        dots.length - 1;

      var activeDotIndex =
        Math.min(
          finalDotIndex,
          Math.floor(
            safeProgress *
            finalDotIndex +
            0.0001
          )
        );

      dots.forEach(function (dot, index) {
        var threshold =
          finalDotIndex === 0
            ? 0
            : index / finalDotIndex;

        var dotProgress;

        if (index === 0) {
          dotProgress = clamp(
            safeProgress * 7,
            0,
            1
          );
        } else {
          dotProgress = clamp(
            (
              safeProgress -
              threshold
            ) *
            finalDotIndex *
            5,
            0,
            1
          );
        }

        var easedDot =
          easeOutCubic(dotProgress);

        var revealed =
          safeProgress >= threshold;

        var dotOpacity =
          revealed
            ? safeOpacity * easedDot
            : 0;

        var scale =
          0.45 +
          easedDot * 0.55;

        var isActive =
          index === activeDotIndex &&
          revealed &&
          safeOpacity > 0.05;

        if (isActive) {
          scale *= 1.14;

          dot.style.filter =
            "drop-shadow(0 0 7px rgba(78, 168, 255, 0.72))";
        } else {
          dot.style.filter = "none";
        }

        dot.style.opacity =
          dotOpacity.toFixed(3);

        dot.style.transform =
          "scale(" +
          scale.toFixed(3) +
          ")";
      });
    }

    function tick(now) {
      if (!running) return;

      if (!startedAt) {
        startedAt = now;
      }

      var elapsed =
        (now - startedAt) %
        TOTAL_DURATION;

      var progress = 0;
      var opacity = 0;

      if (elapsed <= DRAW_DURATION) {
        var rawDrawProgress =
          elapsed /
          DRAW_DURATION;

        /*
          This preserves the dot-to-dot timing while
          smoothing movement within every segment.
        */
        var segmentCount =
          Math.max(1, dots.length - 1);

        var rawSegmentPosition =
          rawDrawProgress *
          segmentCount;

        var segmentIndex =
          Math.min(
            segmentCount - 1,
            Math.floor(
              rawSegmentPosition
            )
          );

        var segmentProgress =
          rawSegmentPosition -
          segmentIndex;

        var easedSegmentProgress =
          easeInOutSine(
            clamp(
              segmentProgress,
              0,
              1
            )
          );

        progress =
          (
            segmentIndex +
            easedSegmentProgress
          ) /
          segmentCount;

        opacity = clamp(
          rawDrawProgress * 5,
          0,
          1
        );
      } else if (
        elapsed <=
        DRAW_DURATION +
        HOLD_DURATION
      ) {
        progress = 1;
        opacity = 1;
      } else if (
        elapsed <=
        DRAW_DURATION +
        HOLD_DURATION +
        FADE_DURATION
      ) {
        var fadeProgress =
          (
            elapsed -
            DRAW_DURATION -
            HOLD_DURATION
          ) /
          FADE_DURATION;

        progress = 1;

        opacity =
          1 -
          easeInOutCubic(
            clamp(fadeProgress, 0, 1)
          );
      } else {
        progress = 0;
        opacity = 0;
      }

      setGraphState(
        progress,
        opacity
      );

      animationFrame =
        window.requestAnimationFrame(tick);
    }

    function start() {
      stop();

      if (prefersReducedMotion()) {
        setGraphState(1, 1);
        return;
      }

      setGraphState(0, 0);

      running = true;
      startedAt = 0;

      animationFrame =
        window.requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      startedAt = 0;

      if (animationFrame) {
        window.cancelAnimationFrame(
          animationFrame
        );

        animationFrame = null;
      }
    }

    return {
      start: start,
      stop: stop
    };
  }

  /* ==============================
    PRIORITY ROW LOOP
  ============================== */

  function createPriorityRowLoop(hero) {
    var rows =
      Array.prototype.slice.call(
        hero.querySelectorAll(
          ".insights-priority-row"
        )
      );

    if (!rows.length) {
      return {
        start: function () {},
        stop: function () {}
      };
    }

    var activeIndex = 0;
    var timer = null;

    rows.forEach(function (row) {
      row.style.transition =
        "background 680ms cubic-bezier(0.16, 1, 0.3, 1), " +
        "transform 680ms cubic-bezier(0.16, 1, 0.3, 1)";
    });

    function setActive(index) {
      activeIndex =
        (
          (
            index %
            rows.length
          ) +
          rows.length
        ) %
        rows.length;

      rows.forEach(function (row, rowIndex) {
        row.classList.toggle(
          "is-active",
          rowIndex === activeIndex
        );
      });
    }

    function scheduleNext() {
      timer = window.setTimeout(
        function () {
          setActive(activeIndex + 1);
          scheduleNext();
        },
        2700
      );
    }

    function start() {
      stop();

      setActive(activeIndex);

      if (prefersReducedMotion()) {
        return;
      }

      scheduleNext();
    }

    function stop() {
      if (timer) {
        window.clearTimeout(timer);
        timer = null;
      }
    }

    setActive(0);

    return {
      start: start,
      stop: stop
    };
  }

  /* ==============================
    HERO VISIBILITY
  ============================== */

  function initInsightsHeroVisibility() {
    var hero =
      document.querySelector(
        "[data-insights-hero]"
      );

    if (!hero) return;

    if (
      hero.dataset.insightsHeroBound ===
      "true"
    ) {
      return;
    }

    hero.dataset.insightsHeroBound = "true";

    var rowLoop =
      createPriorityRowLoop(hero);

    var pagesLoop =
      createPriorityPagesLoop(hero);

    var coverageLoop =
      createCoverageRingLoop(hero);

    var graphLoop =
      createInsightsGraphLoop(hero);

    var visible = false;

    function showHero() {
      if (visible) return;

      visible = true;

      hero.classList.add(
        "is-insights-visible"
      );

      animateInsightsCounters(hero);

      rowLoop.start();
      pagesLoop.start();
      coverageLoop.start();
      graphLoop.start();
    }

    function hideHero() {
      if (!visible) return;

      visible = false;

      rowLoop.stop();
      pagesLoop.stop();
      coverageLoop.stop();
      graphLoop.stop();
    }

    if (
      prefersReducedMotion() ||
      !("IntersectionObserver" in window)
    ) {
      showHero();
      return;
    }

    var observer =
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              showHero();
            } else {
              hideHero();
            }
          });
        },
        {
          threshold: 0.18,
          rootMargin:
            "0px 0px -8% 0px"
        }
      );

    observer.observe(hero);

    document.addEventListener(
      "visibilitychange",
      function () {
        if (document.hidden) {
          rowLoop.stop();
          pagesLoop.stop();
          coverageLoop.stop();
          graphLoop.stop();
          return;
        }

        if (visible) {
          rowLoop.start();
          pagesLoop.start();
          coverageLoop.start();
          graphLoop.start();
        }
      }
    );

    window.addEventListener(
      "pageshow",
      function () {
        if (!visible) return;

        rowLoop.start();
        pagesLoop.start();
        coverageLoop.start();
        graphLoop.start();
      }
    );
  }

  /* ==============================
    INIT
  ============================== */

  function initInsightsPage() {
    initInsightsPreviewRise();
    initInsightsHeroVisibility();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initInsightsPage
    );
  } else {
    initInsightsPage();
  }
})();


(function () {
  "use strict";

  function clamp(value, min, max) {
    return Math.max(
      min,
      Math.min(max, value)
    );
  }

  function prefersReducedMotion() {
    return Boolean(
      window.matchMedia &&
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    );
  }

  function initInsightsGoogleSection() {
    var section =
      document.querySelector(
        "[data-insights-google-section]"
      );

    if (!section) return;

    if (
      section.dataset.insightsGoogleBound ===
      "true"
    ) {
      return;
    }

    section.dataset.insightsGoogleBound =
      "true";

    var tabs =
      Array.prototype.slice.call(
        section.querySelectorAll(
          "[data-insights-google-tab]"
        )
      );

    var screens =
      Array.prototype.slice.call(
        section.querySelectorAll(
          "[data-insights-google-screen]"
        )
      );

    if (
      !tabs.length ||
      !screens.length
    ) {
      return;
    }

    var reduced =
      prefersReducedMotion();

    var activeIndex = 0;
    var activeRowIndex = 0;

    var rotationFrame = null;
    var rowTimer = null;

    var rotationStartedAt = 0;

    var running = false;
    var visible = false;

    var STEP_DURATION = 5600;

    var TOTAL_DURATION =
      STEP_DURATION *
      tabs.length;

    function setProgress(percent) {
      section.style.setProperty(
        "--insights-google-progress",
        clamp(
          percent,
          0,
          100
        ).toFixed(3) + "%"
      );
    }

    function getActiveScreen() {
      return screens[activeIndex] || null;
    }

    function getActiveRows() {
      var screen = getActiveScreen();

      if (!screen) return [];

      return Array.prototype.slice.call(
        screen.querySelectorAll(
          "[data-insights-google-row-loop]"
        )
      );
    }

    function restartScreenAnimations() {
      var screen = getActiveScreen();

      if (!screen) return;

      screen.classList.remove(
        "is-animation-ready"
      );

      var animatedItems =
        Array.prototype.slice.call(
          screen.querySelectorAll(
            [
              ".insights-google-pulse-card",
              ".insights-google-flow-step",
              ".insights-google-action-details article"
            ].join(",")
          )
        );

      animatedItems.forEach(
        function (item) {
          item.style.animation = "none";
        }
      );

      void screen.offsetWidth;

      screen.classList.add(
        "is-animation-ready"
      );

      window.requestAnimationFrame(
        function () {
          animatedItems.forEach(
            function (item) {
              item.style.animation = "";
            }
          );
        }
      );
    }

    function setActive(index) {
      activeIndex =
        (
          (
            index %
            tabs.length
          ) +
          tabs.length
        ) %
        tabs.length;

      tabs.forEach(
        function (tab, tabIndex) {
          var isActive =
            tabIndex === activeIndex;

          tab.classList.toggle(
            "is-active",
            isActive
          );

          tab.setAttribute(
            "aria-selected",
            isActive
              ? "true"
              : "false"
          );

          tab.setAttribute(
            "tabindex",
            isActive
              ? "0"
              : "-1"
          );
        }
      );

      screens.forEach(
        function (screen, screenIndex) {
          var isActive =
            screenIndex === activeIndex;

          screen.classList.toggle(
            "is-active",
            isActive
          );

          screen.setAttribute(
            "aria-hidden",
            isActive
              ? "false"
              : "true"
          );

          if (!isActive) {
            screen.classList.remove(
              "is-animation-ready"
            );
          }
        }
      );

      activeRowIndex = 0;

      restartScreenAnimations();
      startActiveRowLoop();
    }

    function setActiveRow(index) {
      var rows = getActiveRows();

      if (!rows.length) return;

      activeRowIndex =
        (
          (
            index %
            rows.length
          ) +
          rows.length
        ) %
        rows.length;

      rows.forEach(
        function (row, rowIndex) {
          row.classList.toggle(
            "is-current",
            rowIndex === activeRowIndex
          );
        }
      );
    }

    function stopActiveRowLoop() {
      if (!rowTimer) return;

      window.clearTimeout(rowTimer);
      rowTimer = null;
    }

    function scheduleActiveRowStep() {
      stopActiveRowLoop();

      var rows = getActiveRows();

      if (
        reduced ||
        !visible ||
        document.hidden ||
        !rows.length
      ) {
        return;
      }

      rowTimer =
        window.setTimeout(
          function () {
            setActiveRow(
              activeRowIndex + 1
            );

            scheduleActiveRowStep();
          },
          1700
        );
    }

    function startActiveRowLoop() {
      stopActiveRowLoop();

      var rows = getActiveRows();

      if (!rows.length) return;

      setActiveRow(activeRowIndex);
      scheduleActiveRowStep();
    }

    function stopRotation() {
      running = false;

      if (rotationFrame) {
        window.cancelAnimationFrame(
          rotationFrame
        );

        rotationFrame = null;
      }
    }

    function rotationTick(now) {
      if (!running) return;

      var elapsed =
        (
          now -
          rotationStartedAt
        ) %
        TOTAL_DURATION;

      var nextIndex =
        Math.floor(
          elapsed /
          STEP_DURATION
        );

      var stepElapsed =
        elapsed %
        STEP_DURATION;

      var progress =
        (
          stepElapsed /
          STEP_DURATION
        ) *
        100;

      setProgress(progress);

      if (
        nextIndex !==
        activeIndex
      ) {
        setActive(nextIndex);
        setProgress(0);
      }

      rotationFrame =
        window.requestAnimationFrame(
          rotationTick
        );
    }

    function startRotation(index) {
      stopRotation();

      if (
        reduced ||
        !visible ||
        document.hidden
      ) {
        setProgress(
          reduced
            ? 100
            : 0
        );

        return;
      }

      var safeIndex =
        Number.isFinite(index)
          ? index
          : activeIndex;

      rotationStartedAt =
        performance.now() -
        safeIndex *
        STEP_DURATION;

      running = true;

      rotationFrame =
        window.requestAnimationFrame(
          rotationTick
        );
    }

    function activateFromUser(index) {
      setActive(index);
      setProgress(0);

      if (visible) {
        startRotation(
          activeIndex
        );
      }
    }

    tabs.forEach(
      function (
        tab,
        fallbackIndex
      ) {
        tab.addEventListener(
          "click",
          function (event) {
            event.preventDefault();

            var requestedIndex =
              Number(
                tab.getAttribute(
                  "data-insights-google-tab"
                )
              );

            activateFromUser(
              Number.isFinite(
                requestedIndex
              )
                ? requestedIndex
                : fallbackIndex
            );
          }
        );

        tab.addEventListener(
          "keydown",
          function (event) {
            var nextIndex =
              activeIndex;

            if (
              event.key ===
              "ArrowDown"
            ) {
              nextIndex =
                activeIndex + 1;
            } else if (
              event.key ===
              "ArrowUp"
            ) {
              nextIndex =
                activeIndex - 1;
            } else if (
              event.key ===
              "Home"
            ) {
              nextIndex = 0;
            } else if (
              event.key ===
              "End"
            ) {
              nextIndex =
                tabs.length - 1;
            } else {
              return;
            }

            event.preventDefault();

            activateFromUser(
              nextIndex
            );

            tabs[
              activeIndex
            ].focus();
          }
        );
      }
    );

    function showSection() {
      if (visible) return;

      visible = true;

      section.classList.add(
        "is-visible"
      );

      setActive(
        activeIndex
      );

      startRotation(
        activeIndex
      );

      startActiveRowLoop();
    }

    function hideSection() {
      if (!visible) return;

      visible = false;

      stopRotation();
      stopActiveRowLoop();
    }

    setActive(0);
    setProgress(0);

    if (
      reduced ||
      !(
        "IntersectionObserver" in
        window
      )
    ) {
      visible = true;

      section.classList.add(
        "is-visible"
      );

      setActive(0);
      setProgress(100);

      return;
    }

    var observer =
      new IntersectionObserver(
        function (entries) {
          entries.forEach(
            function (entry) {
              if (
                entry.isIntersecting
              ) {
                showSection();
              } else {
                hideSection();
              }
            }
          );
        },
        {
          threshold: 0.18,
          rootMargin:
            "0px 0px -8% 0px"
        }
      );

    observer.observe(section);

    document.addEventListener(
      "visibilitychange",
      function () {
        if (document.hidden) {
          stopRotation();
          stopActiveRowLoop();
          return;
        }

        if (visible) {
          startRotation(
            activeIndex
          );

          startActiveRowLoop();
        }
      }
    );

    window.addEventListener(
      "pageshow",
      function () {
        setActive(
          activeIndex
        );

        setProgress(0);

        if (visible) {
          startRotation(
            activeIndex
          );

          startActiveRowLoop();
        }
      }
    );

    window.addEventListener(
      "resize",
      function () {
        setActive(
          activeIndex
        );
      },
      {
        passive: true
      }
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initInsightsGoogleSection
    );
  } else {
    initInsightsGoogleSection();
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

  var prefersReduced =
    window.matchMedia &&
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  function initInsightsFaqReveal() {
    var items =
      Array.prototype.slice.call(
        document.querySelectorAll(
          [
            "[data-insights-faq-heading-reveal]",
            "[data-insights-faq-reveal]",
            "[data-insights-faq-contact-reveal]"
          ].join(",")
        )
      );

    if (!items.length) return;

    if (
      prefersReduced ||
      !(
        "IntersectionObserver" in
        window
      )
    ) {
      items.forEach(
        function (item) {
          item.classList.add(
            "is-visible"
          );
        }
      );

      return;
    }

    var lastY =
      window.scrollY ||
      window.pageYOffset ||
      0;

    var scrollDirection = "down";
    var ticking = false;

    function updateDirection() {
      var currentY =
        window.scrollY ||
        window.pageYOffset ||
        0;

      if (
        Math.abs(
          currentY - lastY
        ) > 2
      ) {
        scrollDirection =
          currentY > lastY
            ? "down"
            : "up";

        lastY = currentY;
      }

      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;

        window.requestAnimationFrame(
          updateDirection
        );

        ticking = true;
      },
      {
        passive: true
      }
    );

    var observer =
      new IntersectionObserver(
        function (entries) {
          entries.forEach(
            function (entry) {
              var element =
                entry.target;

              if (
                entry.isIntersecting
              ) {
                element.classList.add(
                  "is-visible"
                );

                element.classList.remove(
                  "is-hidden-up",
                  "is-hidden-down"
                );

                return;
              }

              element.classList.remove(
                "is-visible"
              );

              if (
                scrollDirection ===
                "down"
              ) {
                element.classList.add(
                  "is-hidden-up"
                );

                element.classList.remove(
                  "is-hidden-down"
                );
              } else {
                element.classList.add(
                  "is-hidden-down"
                );

                element.classList.remove(
                  "is-hidden-up"
                );
              }
            }
          );
        },
        {
          threshold: 0.22,
          rootMargin:
            "-8% 0px -10% 0px"
        }
      );

    items.forEach(
      function (item, index) {
        item.classList.add(
          "is-hidden-down"
        );

        item.style.transitionDelay =
          Math.min(
            index * 90,
            180
          ) + "ms";

        observer.observe(item);
      }
    );
  }

  function initInsightsFaqAccordion() {
    var list =
      document.querySelector(
        "[data-insights-faq-list]"
      );

    if (!list) return;

    var items =
      Array.prototype.slice.call(
        list.querySelectorAll(
          ".insights-faq-item"
        )
      );

    items.forEach(
      function (item) {
        item.addEventListener(
          "toggle",
          function () {
            if (!item.open) return;

            items.forEach(
              function (otherItem) {
                if (
                  otherItem !== item
                ) {
                  otherItem.removeAttribute(
                    "open"
                  );
                }
              }
            );
          }
        );
      }
    );
  }

  function initInsightsFaqLinks() {
    var localLinks =
      Array.prototype.slice.call(
        document.querySelectorAll(
          '.insights-faq-answer a[href^="#"]'
        )
      );

    localLinks.forEach(
      function (link) {
        link.addEventListener(
          "click",
          function (event) {
            var targetSelector =
              link.getAttribute("href");

            if (
              !targetSelector ||
              targetSelector === "#"
            ) {
              return;
            }

            var target =
              document.querySelector(
                targetSelector
              );

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
              behavior:
                prefersReduced
                  ? "auto"
                  : "smooth",
              block: "start"
            });
          }
        );
      }
    );
  }

  function initInsightsFaq() {
    initInsightsFaqReveal();
    initInsightsFaqAccordion();
    initInsightsFaqLinks();
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initInsightsFaq
    );
  } else {
    initInsightsFaq();
  }
})();

(function () {
  "use strict";

  function initInsightsFinalSection() {
    var section = document.querySelector("[data-insights-final-section]");

    if (!section) return;
    if (section.dataset.insightsFinalBound === "true") return;

    section.dataset.insightsFinalBound = "true";

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
    document.addEventListener("DOMContentLoaded", initInsightsFinalSection);
  } else {
    initInsightsFinalSection();
  }
})();
