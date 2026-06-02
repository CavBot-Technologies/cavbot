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

  function initSeoPreviewRise() {
    var stage = document.querySelector("[data-seo-preview-stage]");
    var frame = document.querySelector("[data-seo-preview-frame]");

    if (!stage || !frame) return;
    if (stage.dataset.seoPreviewBound === "true") return;

    stage.dataset.seoPreviewBound = "true";

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setReady() {
      frame.style.setProperty("--seo-preview-y", "0px");
      frame.style.setProperty("--seo-preview-scale", "1");
      frame.style.setProperty("--seo-preview-opacity", "1");
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

      frame.style.setProperty("--seo-preview-y", y.toFixed(2) + "px");
      frame.style.setProperty("--seo-preview-scale", scale.toFixed(4));
      frame.style.setProperty("--seo-preview-opacity", opacity.toFixed(4));
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

  function initSeoScanForm() {
    var form = document.querySelector("[data-seo-scan-form]");

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
        window.CAVBOT_SEO_START_URL ||
        "https://app.cavbot.io/seo/start";

      window.location.href =
        base +
        "?origin=" +
        encodeURIComponent(origin) +
        "&source=marketing";
    });
  }

  function restartSeoAnimations() {
    var animatedItems = document.querySelectorAll(
      ".seo-chart-line, .seo-chart-node, .seo-chart-bars rect, .seo-card-system, .seo-system-line, .seo-system-packet, .seo-system-bar, .seo-route-gap"
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

  function initSeoWorkAnimations() {
    var section = document.querySelector(".seo-work-section");

    if (!section) return;
    if (section.dataset.seoWorkBound === "true") return;

    section.dataset.seoWorkBound = "true";

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    if (!("IntersectionObserver" in window)) {
      restartSeoAnimations();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            section.classList.add("is-seo-work-visible");
            restartSeoAnimations();
          }
        });
      },
      {
        threshold: 0.35
      }
    );

    observer.observe(section);
  }

  function init() {
    initSeoPreviewRise();
    initSeoScanForm();
    initSeoWorkAnimations();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();


(function () {
  "use strict";

  function restartSearchPreviewAnimations(section) {
    var animatedItems = section.querySelectorAll(
      ".seo-search-check-row, .seo-search-route-row i, .seo-preview-lines span"
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

  function initSearchPreviewSection() {
    var section = document.querySelector(".seo-search-detail-section");

    if (!section) return;
    if (section.dataset.searchPreviewBound === "true") return;

    section.dataset.searchPreviewBound = "true";

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      section.classList.add("is-visible");
      return;
    }

    if (!("IntersectionObserver" in window)) {
      section.classList.add("is-visible");
      restartSearchPreviewAnimations(section);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          section.classList.add("is-visible");
          restartSearchPreviewAnimations(section);
        });
      },
      {
        threshold: 0.28
      }
    );

    observer.observe(section);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSearchPreviewSection);
  } else {
    initSearchPreviewSection();
  }
})();

(function () {
  "use strict";

  function restartIndexingHealthAnimations(section) {
    var animatedItems = section.querySelectorAll(
      ".seo-index-route-row, .seo-index-flow-line, .seo-index-flow-packet, .seo-index-mini-bars span, .seo-index-url-chain i, .seo-index-access-row"
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

  function initIndexingHealthSection() {
    var section = document.querySelector(".seo-index-detail-section");

    if (!section) return;
    if (section.dataset.indexingHealthBound === "true") return;

    section.dataset.indexingHealthBound = "true";

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      section.classList.add("is-visible");
      return;
    }

    if (!("IntersectionObserver" in window)) {
      section.classList.add("is-visible");
      restartIndexingHealthAnimations(section);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          section.classList.add("is-visible");
          restartIndexingHealthAnimations(section);
        });
      },
      {
        threshold: 0.28
      }
    );

    observer.observe(section);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initIndexingHealthSection);
  } else {
    initIndexingHealthSection();
  }
})();

(function () {
  "use strict";

  function initSeoPageStructureSection() {
    var section = document.querySelector("[data-seo-page-structure]");
    if (!section) return;
    if (section.dataset.seoPageStructureBound === "true") return;

    section.dataset.seoPageStructureBound = "true";

    var tabs = Array.prototype.slice.call(
      section.querySelectorAll("[data-seo-ps-tab]")
    );

    var screens = Array.prototype.slice.call(
      section.querySelectorAll("[data-seo-ps-screen]")
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
        "--seo-ps-step-progress",
        clamp(percent, 0, 100).toFixed(3) + "%"
      );
    }

    function restartActiveVisuals() {
      var screen = screens[activeIndex];
      if (!screen) return;

      var animatedItems = screen.querySelectorAll(
        ".seo-ps-outline-row, .seo-ps-heading-flow i, .seo-ps-link-lane i, .seo-ps-link-packet, .seo-ps-page-stack span, .seo-ps-report-row"
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

        var attrIndex = Number(tab.getAttribute("data-seo-ps-tab"));
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSeoPageStructureSection);
  } else {
    initSeoPageStructureSection();
  }
})();

(function () {
  "use strict";

  function initSeoEndSections() {
    var sections = Array.prototype.slice.call(
      document.querySelectorAll("[data-seo-next-section], [data-seo-final-section]")
    );

    if (!sections.length) return;

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      sections.forEach(function (section) {
        section.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    sections.forEach(function (section) {
      if (section.dataset.seoEndBound === "true") return;
      section.dataset.seoEndBound = "true";
      observer.observe(section);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSeoEndSections);
  } else {
    initSeoEndSections();
  }
})();
