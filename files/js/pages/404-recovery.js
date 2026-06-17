(function () {
  "use strict";

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
  }

  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    );
  }

  /* ==============================
    PREVIEW RISE
  ============================== */

  function initRecoveryPreviewRise() {
    var stage = document.querySelector(
      "[data-recovery-preview-stage]"
    );

    var frame = document.querySelector(
      "[data-recovery-preview-frame]"
    );

    if (!stage || !frame) return;

    if (
      stage.dataset.recoveryPreviewBound ===
      "true"
    ) {
      return;
    }

    stage.dataset.recoveryPreviewBound =
      "true";

    var reduced = prefersReducedMotion();

    function setReady() {
      frame.style.setProperty(
        "--recovery-preview-y",
        "0px"
      );

      frame.style.setProperty(
        "--recovery-preview-scale",
        "1"
      );

      frame.style.setProperty(
        "--recovery-preview-opacity",
        "1"
      );
    }

    function updatePreview() {
      if (reduced) {
        setReady();
        return;
      }

      var rect =
        stage.getBoundingClientRect();

      var viewportHeight =
        window.innerHeight ||
        document.documentElement.clientHeight;

      var start =
        viewportHeight * 0.96;

      var end =
        viewportHeight * 0.34;

      var rawProgress =
        (start - rect.top) /
        (start - end);

      var progress =
        easeOutCubic(
          clamp(rawProgress, 0, 1)
        );

      var y =
        96 -
        progress * 96;

      var scale =
        0.94 +
        progress * 0.06;

      var opacity =
        0.74 +
        progress * 0.26;

      frame.style.setProperty(
        "--recovery-preview-y",
        y.toFixed(2) + "px"
      );

      frame.style.setProperty(
        "--recovery-preview-scale",
        scale.toFixed(4)
      );

      frame.style.setProperty(
        "--recovery-preview-opacity",
        opacity.toFixed(4)
      );
    }

    var ticking = false;

    function requestUpdate() {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(
        function () {
          updatePreview();
          ticking = false;
        }
      );
    }

    window.addEventListener(
      "scroll",
      requestUpdate,
      {
        passive: true
      }
    );

    window.addEventListener(
      "resize",
      requestUpdate,
      {
        passive: true
      }
    );

    window.addEventListener(
      "pageshow",
      requestUpdate
    );

    window.addEventListener(
      "load",
      requestUpdate
    );

    requestUpdate();

    window.setTimeout(
      requestUpdate,
      80
    );

    window.setTimeout(
      requestUpdate,
      260
    );

    window.setTimeout(
      requestUpdate,
      700
    );
  }

  /* ==============================
    HERO VISIBILITY
  ============================== */

  function restartRecoveryAnimations(
    hero
  ) {
    var animatedItems =
      hero.querySelectorAll(
        [
          ".recovery-route-node",
          ".recovery-route-line i",
          ".recovery-priority-row",
          ".recovery-source-bar i",
          ".recovery-result-ring"
        ].join(",")
      );

    animatedItems.forEach(
      function (item) {
        item.style.animation =
          "none";
      }
    );

    window.requestAnimationFrame(
      function () {
        animatedItems.forEach(
          function (item) {
            item.style.animation =
              "";
          }
        );
      }
    );
  }

  function initRecoveryHeroVisibility() {
    var hero =
      document.querySelector(
        "[data-recovery-hero]"
      );

    if (!hero) return;

    if (
      hero.dataset.recoveryHeroBound ===
      "true"
    ) {
      return;
    }

    hero.dataset.recoveryHeroBound =
      "true";

    var reduced =
      prefersReducedMotion();

    if (
      reduced ||
      !(
        "IntersectionObserver" in
        window
      )
    ) {
      hero.classList.add(
        "is-recovery-visible"
      );

      return;
    }

    var observer =
      new IntersectionObserver(
        function (entries) {
          entries.forEach(
            function (entry) {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              hero.classList.add(
                "is-recovery-visible"
              );

              restartRecoveryAnimations(
                hero
              );
            }
          );
        },
        {
          threshold: 0.24
        }
      );

    observer.observe(hero);
  }

  /* ==============================
    LOOPING PREVIEW NUMBERS
  ============================== */

  function initRecoveryLoopNumbers() {
    var numbers =
      Array.prototype.slice.call(
        document.querySelectorAll(
          "[data-recovery-loop-number]"
        )
      );

    if (!numbers.length) return;

    var values = {
      views: [
        94,
        88,
        102,
        91,
        97,
        84,
        94
      ],

      routes: [
        12,
        9,
        14,
        11,
        13,
        10,
        12
      ],

      recovery: [
        "74%",
        "68%",
        "71%",
        "77%",
        "73%",
        "70%",
        "74%"
      ]
    };

    var index = 0;

    function setNumbers() {
      numbers.forEach(
        function (number) {
          var key =
            number.getAttribute(
              "data-recovery-loop-number"
            );

          var set =
            values[key] ||
            values.views;

          number.textContent =
            String(
              set[
                index %
                set.length
              ]
            );
        }
      );

      index += 1;
    }

    setNumbers();

    window.setInterval(
      setNumbers,
      1600
    );
  }

  /* ==============================
    ACTIVE BROKEN ROUTE
  ============================== */

  function initRecoveryRouteRows() {
    var rows =
      Array.prototype.slice.call(
        document.querySelectorAll(
          "[data-recovery-priority-row]"
        )
      );

    if (!rows.length) return;

    var reduced =
      prefersReducedMotion();

    if (reduced) {
      rows[0].classList.add(
        "is-hot"
      );

      return;
    }

    var activeIndex = 0;

    function setActiveRow(index) {
      activeIndex =
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
            "is-hot",
            rowIndex === activeIndex
          );
        }
      );
    }

    setActiveRow(0);

    window.setInterval(
      function () {
        setActiveRow(
          activeIndex + 1
        );
      },
      1800
    );
  }

  /* ==============================
    FINAL CTA REVEAL
  ============================== */

  function initRecoveryFinalSection() {
    var section =
      document.querySelector(
        "[data-recovery-final-section]"
      );

    if (!section) return;

    if (
      section.dataset.recoveryFinalBound ===
      "true"
    ) {
      return;
    }

    section.dataset.recoveryFinalBound =
      "true";

    var reduced =
      prefersReducedMotion();

    if (
      reduced ||
      !(
        "IntersectionObserver" in
        window
      )
    ) {
      section.classList.add(
        "is-visible"
      );

      return;
    }

    var observer =
      new IntersectionObserver(
        function (entries) {
          entries.forEach(
            function (entry) {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              section.classList.add(
                "is-visible"
              );
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
  }

  /* ==============================
    SUPPORTING SECTION REVEAL
  ============================== */

  function initRecoverySupportingSections() {
    var sections =
      Array.prototype.slice.call(
        document.querySelectorAll(
          [
            "[data-recovery-diff-section]",
            "[data-recovery-setup-section]"
          ].join(",")
        )
      );

    if (!sections.length) return;

    var reduced =
      prefersReducedMotion();

    if (
      reduced ||
      !(
        "IntersectionObserver" in
        window
      )
    ) {
      sections.forEach(
        function (section) {
          section.classList.add(
            "is-visible"
          );
        }
      );

      return;
    }

    var observer =
      new IntersectionObserver(
        function (entries) {
          entries.forEach(
            function (entry) {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              entry.target.classList.add(
                "is-visible"
              );
            }
          );
        },
        {
          threshold: 0.16,
          rootMargin:
            "0px 0px -8% 0px"
        }
      );

    sections.forEach(
      function (section) {
        observer.observe(section);
      }
    );
  }

  /* ==============================
    DIFFERENCE ROUTE COUNT LOOP
  ============================== */

  function initRecoveryDiffRouteCount() {
    var number =
      document.querySelector(
        "[data-recovery-diff-route-count]"
      );

    if (!number) return;

    if (
      number.dataset.recoveryDiffRouteCountBound ===
      "true"
    ) {
      return;
    }

    number.dataset.recoveryDiffRouteCountBound =
      "true";

    if (prefersReducedMotion()) {
      number.textContent = "20";
      return;
    }

    var values = [20, 35, 46, 18, 3];
    var index = 0;
    var frame = null;
    var timeout = null;
    var duration = 820;
    var hold = 1320;

    function easeInOutCubic(value) {
      return value < 0.5
        ? 4 * value * value * value
        : 1 - Math.pow(-2 * value + 2, 3) / 2;
    }

    function setValue(value) {
      number.textContent = String(
        Math.round(value)
      );
    }

    function animateTo(nextValue) {
      var fromValue =
        Number(number.textContent) ||
        values[index];

      var start = performance.now();

      number.classList.add(
        "is-updating"
      );

      function tick(now) {
        var progress =
          Math.min(
            1,
            (now - start) / duration
          );

        var eased =
          easeInOutCubic(progress);

        setValue(
          fromValue +
            (nextValue - fromValue) *
              eased
        );

        if (progress < 1) {
          frame =
            window.requestAnimationFrame(
              tick
            );
          return;
        }

        setValue(nextValue);

        window.setTimeout(
          function () {
            number.classList.remove(
              "is-updating"
            );
          },
          80
        );

        timeout =
          window.setTimeout(
            advance,
            hold
          );
      }

      frame =
        window.requestAnimationFrame(tick);
    }

    function advance() {
      index =
        (index + 1) %
        values.length;

      animateTo(values[index]);
    }

    setValue(values[0]);

    timeout =
      window.setTimeout(
        advance,
        hold
      );

    window.addEventListener(
      "pagehide",
      function () {
        if (frame) {
          window.cancelAnimationFrame(
            frame
          );
        }

        if (timeout) {
          window.clearTimeout(
            timeout
          );
        }
      }
    );
  }

  /* ==============================
    INIT
  ============================== */

  function initRecoveryPage() {
    initRecoveryPreviewRise();
    initRecoveryHeroVisibility();
    initRecoveryLoopNumbers();
    initRecoveryRouteRows();
    initRecoverySupportingSections();
    initRecoveryDiffRouteCount();
    initRecoveryFinalSection();
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initRecoveryPage
    );
  } else {
    initRecoveryPage();
  }
})();


(function () {
  "use strict";

  function initRecoveryWebSection() {
    var section = document.querySelector(
      "[data-recovery-web-section]"
    );

    if (!section) return;

    if (
      section.dataset.recoveryWebSectionBound ===
      "true"
    ) {
      return;
    }

    section.dataset.recoveryWebSectionBound =
      "true";

    var tabs = Array.prototype.slice.call(
      section.querySelectorAll(
        "[data-recovery-wa-tab]"
      )
    );

    var screens = Array.prototype.slice.call(
      section.querySelectorAll(
        "[data-recovery-wa-screen]"
      )
    );

    if (!tabs.length || !screens.length) {
      return;
    }

    var activeIndex = 0;
    var animationFrame = null;
    var startedAt = 0;
    var isRunning = false;
    var isVisible = false;

    var STEP_MS = 5200;
    var TOTAL_MS = STEP_MS * tabs.length;

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    function clamp(value, min, max) {
      return Math.max(
        min,
        Math.min(max, value)
      );
    }

    function setStepProgress(percent) {
      section.style.setProperty(
        "--recovery-wa-step-progress",
        clamp(percent, 0, 100).toFixed(3) +
          "%"
      );
    }

    function setActive(index) {
      activeIndex =
        ((index % tabs.length) +
          tabs.length) %
        tabs.length;

      tabs.forEach(function (
        tab,
        tabIndex
      ) {
        var isActive =
          tabIndex === activeIndex;

        tab.classList.toggle(
          "is-active",
          isActive
        );

        tab.setAttribute(
          "aria-selected",
          isActive ? "true" : "false"
        );

        tab.setAttribute(
          "tabindex",
          isActive ? "0" : "-1"
        );
      });

      screens.forEach(function (
        screen,
        screenIndex
      ) {
        var isActive =
          screenIndex === activeIndex;

        screen.classList.toggle(
          "is-active",
          isActive
        );

        screen.setAttribute(
          "aria-hidden",
          isActive ? "false" : "true"
        );
      });
    }

    function stopRotation() {
      isRunning = false;

      if (animationFrame) {
        window.cancelAnimationFrame(
          animationFrame
        );

        animationFrame = null;
      }
    }

    function tick(now) {
      if (!isRunning) return;

      var elapsed =
        (now - startedAt) % TOTAL_MS;

      var nextIndex = Math.min(
        tabs.length - 1,
        Math.floor(elapsed / STEP_MS)
      );

      var stepElapsed =
        elapsed % STEP_MS;

      var progress =
        (stepElapsed / STEP_MS) * 100;

      setStepProgress(progress);

      if (nextIndex !== activeIndex) {
        setActive(nextIndex);
        setStepProgress(0);
      }

      animationFrame =
        window.requestAnimationFrame(tick);
    }

    function startRotation(index) {
      if (prefersReduced) {
        setStepProgress(100);
        return;
      }

      stopRotation();

      var safeIndex =
        Number.isFinite(index)
          ? index
          : activeIndex;

      startedAt =
        performance.now() -
        safeIndex * STEP_MS;

      isRunning = true;

      animationFrame =
        window.requestAnimationFrame(tick);
    }

    function activate(index, focusTab) {
      var safeIndex =
        ((index % tabs.length) +
          tabs.length) %
        tabs.length;

      setActive(safeIndex);
      setStepProgress(0);

      if (focusTab && tabs[safeIndex]) {
        tabs[safeIndex].focus();
      }

      if (isVisible) {
        startRotation(safeIndex);
      }
    }

    tabs.forEach(function (
      tab,
      fallbackIndex
    ) {
      tab.addEventListener(
        "click",
        function (event) {
          event.preventDefault();

          var attrIndex = Number(
            tab.getAttribute(
              "data-recovery-wa-tab"
            )
          );

          activate(
            Number.isFinite(attrIndex)
              ? attrIndex
              : fallbackIndex,
            false
          );
        }
      );

      tab.addEventListener(
        "keydown",
        function (event) {
          var nextIndex = activeIndex;

          if (
            event.key === "ArrowDown" ||
            event.key === "ArrowRight"
          ) {
            nextIndex = activeIndex + 1;
          } else if (
            event.key === "ArrowUp" ||
            event.key === "ArrowLeft"
          ) {
            nextIndex = activeIndex - 1;
          } else if (event.key === "Home") {
            nextIndex = 0;
          } else if (event.key === "End") {
            nextIndex = tabs.length - 1;
          } else {
            return;
          }

          event.preventDefault();
          activate(nextIndex, true);
        }
      );
    });

    function showSection() {
      isVisible = true;

      section.classList.add(
        "is-visible"
      );

      startRotation(activeIndex);
    }

    function hideSection() {
      isVisible = false;
      stopRotation();
    }

    function bindVisibility() {
      if (
        prefersReduced ||
        !(
          "IntersectionObserver" in
          window
        )
      ) {
        showSection();
        setStepProgress(100);
        return;
      }

      var observer =
        new IntersectionObserver(
          function (entries) {
            entries.forEach(
              function (entry) {
                if (entry.isIntersecting) {
                  showSection();
                } else {
                  hideSection();
                }
              }
            );
          },
          {
            threshold: 0.16,
            rootMargin:
              "0px 0px -8% 0px"
          }
        );

      observer.observe(section);
    }

    setActive(0);
    setStepProgress(0);
    bindVisibility();

    window.addEventListener(
      "pageshow",
      function () {
        setActive(activeIndex);
        setStepProgress(0);

        if (isVisible) {
          startRotation(activeIndex);
        }
      }
    );

    window.addEventListener(
      "resize",
      function () {
        setActive(activeIndex);
      },
      {
        passive: true
      }
    );

    window.addEventListener(
      "pagehide",
      stopRotation
    );
  }

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initRecoveryWebSection
    );
  } else {
    initRecoveryWebSection();
  }
})();
