(function () {
  "use strict";


  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }


  function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
  }


  function initA11yPreviewRise() {
    var stage = document.querySelector("[data-a11y-preview-stage]");
    var frame = document.querySelector("[data-a11y-preview-frame]");


    if (!stage || !frame) return;
    if (stage.dataset.a11yPreviewBound === "true") return;


    stage.dataset.a11yPreviewBound = "true";


    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    function setReady() {
      frame.style.setProperty("--a11y-preview-y", "0px");
      frame.style.setProperty("--a11y-preview-scale", "1");
      frame.style.setProperty("--a11y-preview-opacity", "1");
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


      frame.style.setProperty("--a11y-preview-y", y.toFixed(2) + "px");
      frame.style.setProperty("--a11y-preview-scale", scale.toFixed(4));
      frame.style.setProperty("--a11y-preview-opacity", opacity.toFixed(4));
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


  function restartA11yHeroAnimations(hero) {
    var animatedItems = hero.querySelectorAll(
      ".a11y-issue-pin, .a11y-focus-path span, .a11y-keyboard-map i, .a11y-priority-row"
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


  function initA11yHeroVisibility() {
    var hero = document.querySelector("[data-a11y-hero]");


    if (!hero) return;
    if (hero.dataset.a11yHeroBound === "true") return;


    hero.dataset.a11yHeroBound = "true";


    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    if (prefersReduced || !("IntersectionObserver" in window)) {
      hero.classList.add("is-a11y-visible");
      return;
    }


    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;


          hero.classList.add("is-a11y-visible");
          restartA11yHeroAnimations(hero);
        });
      },
      {
        threshold: 0.28
      }
    );


    observer.observe(hero);
  }


  function initA11yLoopNumbers() {
    var numbers = Array.prototype.slice.call(
      document.querySelectorAll("[data-a11y-loop-number]")
    );


    if (!numbers.length) return;


    var values = {
      risk: [31, 24, 42, 18, 37, 29, 21, 31],
      pages: [18, 14, 27, 11, 22, 19, 16, 18],
      coverage: ["76%", "94%", "70%", "66%", "82%"]
    };


    var index = 0;


    function setNumbers() {
      numbers.forEach(function (number) {
        var key = number.getAttribute("data-a11y-loop-number");
        var set = values[key] || values.risk;


        number.textContent = String(set[index % set.length]);
      });


      index += 1;
    }


    setNumbers();
    window.setInterval(setNumbers, 1400);
  }


  function init() {
    initA11yPreviewRise();
    initA11yHeroVisibility();
    initA11yLoopNumbers();
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

(function () {
  "use strict";

  function initA11yInsightIcons() {
    var icons = Array.prototype.slice.call(
      document.querySelectorAll(".a11y-insight-icon")
    );

    icons.forEach(function (icon) {
      var image = icon.querySelector(".a11y-insight-icon-img");

      if (!image) return;

      var src = image.getAttribute("src");

      if (!src) return;

      icon.style.setProperty("--a11y-icon-src", "url('" + src + "')");
    });
  }

  function initA11yInsightSection() {
    var section = document.querySelector("[data-a11y-insight-section]");

    if (!section) return;
    if (section.dataset.a11yInsightBound === "true") return;

    section.dataset.a11yInsightBound = "true";

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

  function init() {
    initA11yInsightIcons();
    initA11yInsightSection();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
(function () {
  "use strict";

  function paintA11ySvgIcon(image, index) {
    var src = image.getAttribute("src");

    if (!src) return;

    fetch(src)
      .then(function (response) {
        if (!response.ok) throw new Error("SVG not found");
        return response.text();
      })
      .then(function (svgText) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(svgText, "image/svg+xml");
        var svg = doc.querySelector("svg");

        if (!svg) return;

        var gradientId = "a11y-icon-gradient-" + index;

        svg.classList.add("a11y-insight-inline-svg");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");

        svg.removeAttribute("width");
        svg.removeAttribute("height");

        if (!svg.getAttribute("viewBox")) {
          svg.setAttribute("viewBox", "0 0 24 24");
        }

        var unsafeItems = svg.querySelectorAll("script, foreignObject");

        unsafeItems.forEach(function (item) {
          item.remove();
        });

        var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        var gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        var stopOne = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        var stopTwo = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        var stopThree = document.createElementNS("http://www.w3.org/2000/svg", "stop");

        gradient.setAttribute("id", gradientId);
        gradient.setAttribute("x1", "0%");
        gradient.setAttribute("y1", "0%");
        gradient.setAttribute("x2", "100%");
        gradient.setAttribute("y2", "100%");

        stopOne.setAttribute("offset", "0%");
        stopOne.setAttribute("stop-color", "#b9c85a");

        stopTwo.setAttribute("offset", "58%");
        stopTwo.setAttribute("stop-color", "#4ea8ff");

        stopThree.setAttribute("offset", "100%");
        stopThree.setAttribute("stop-color", "#9a86e8");

        gradient.appendChild(stopOne);
        gradient.appendChild(stopTwo);
        gradient.appendChild(stopThree);
        defs.appendChild(gradient);
        svg.insertBefore(defs, svg.firstChild);

        var paint = "url(#" + gradientId + ")";
        var parts = svg.querySelectorAll(
          "path, circle, rect, line, polyline, polygon, ellipse"
        );

        parts.forEach(function (part) {
          var tag = part.tagName.toLowerCase();
          var fill = (part.getAttribute("fill") || "").toLowerCase();
          var stroke = (part.getAttribute("stroke") || "").toLowerCase();

          part.removeAttribute("style");

          if (tag === "line" || tag === "polyline") {
            part.setAttribute("fill", "none");
            part.setAttribute("stroke", paint);

            if (!part.getAttribute("stroke-width")) {
              part.setAttribute("stroke-width", "2");
            }

            return;
          }

          if (stroke && stroke !== "none" && stroke !== "transparent") {
            part.setAttribute("stroke", paint);
          }

          if (fill === "none") {
            if (!stroke || stroke === "none" || stroke === "transparent") {
              part.setAttribute("stroke", paint);

              if (!part.getAttribute("stroke-width")) {
                part.setAttribute("stroke-width", "2");
              }
            }

            return;
          }

          part.setAttribute("fill", paint);
        });

        image.replaceWith(svg);
      })
      .catch(function () {
        image.style.display = "block";
      });
  }

  function initA11yInsightIcons() {
    var images = Array.prototype.slice.call(
      document.querySelectorAll(".a11y-insight-icon-img")
    );

    if (!images.length) return;

    images.forEach(function (image, index) {
      paintA11ySvgIcon(image, index);
    });
  }

  function initA11yInsightSection() {
    var section = document.querySelector("[data-a11y-insight-section]");

    if (!section) return;
    if (section.dataset.a11yInsightBound === "true") return;

    section.dataset.a11yInsightBound = "true";

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

  function init() {
    initA11yInsightIcons();
    initA11yInsightSection();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

(function () {
  "use strict";

  function initA11yProofSection() {
    var section = document.querySelector("[data-a11y-proof-section]");

    if (!section) return;
    if (section.dataset.a11yProofBound === "true") return;

    section.dataset.a11yProofBound = "true";

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
    document.addEventListener("DOMContentLoaded", initA11yProofSection);
  } else {
    initA11yProofSection();
  }
})();

(function () {
  "use strict";

  function initA11yLabelsSection() {
    var section = document.querySelector("[data-a11y-labels-section]");

    if (!section) return;
    if (section.dataset.a11yLabelsBound === "true") return;

    section.dataset.a11yLabelsBound = "true";

    var tabs = Array.prototype.slice.call(
      section.querySelectorAll("[data-a11y-labels-tab]")
    );

    var screens = Array.prototype.slice.call(
      section.querySelectorAll("[data-a11y-labels-screen]")
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
        "--a11y-labels-step-progress",
        clamp(percent, 0, 100).toFixed(3) + "%"
      );
    }

    function restartActiveVisuals() {
      var screen = screens[activeIndex];

      if (!screen) return;

      var animatedItems = screen.querySelectorAll(
        ".a11y-labels-form-row, .a11y-labels-button-card, .a11y-labels-image-card, .a11y-labels-report-row"
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

        var attrIndex = Number(tab.getAttribute("data-a11y-labels-tab"));

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
    document.addEventListener("DOMContentLoaded", initA11yLabelsSection);
  } else {
    initA11yLabelsSection();
  }
})();


(function () {
  "use strict";

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function mix(start, end, progress) {
    return Math.round(start + (end - start) * progress);
  }

  function rgbToHex(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map(function (value) {
          return value.toString(16).padStart(2, "0");
        })
        .join("")
    );
  }

  function getButtonColor(value) {
    var progress = clamp((value - 24) / 72, 0, 1);

    var stops = [
      { point: 0, color: [46, 29, 119] },
      { point: 0.35, color: [76, 54, 176] },
      { point: 0.62, color: [78, 168, 255] },
      { point: 0.82, color: [141, 204, 255] },
      { point: 1, color: [185, 200, 90] }
    ];

    for (var index = 0; index < stops.length - 1; index += 1) {
      var current = stops[index];
      var next = stops[index + 1];

      if (progress >= current.point && progress <= next.point) {
        var local = (progress - current.point) / (next.point - current.point);

        return rgbToHex(
          mix(current.color[0], next.color[0], local),
          mix(current.color[1], next.color[1], local),
          mix(current.color[2], next.color[2], local)
        );
      }
    }

    return "#b9c85a";
  }

  function setContrastState(section, value) {
    var safeValue = clamp(Number(value) || 82, 24, 96);
    var fill = ((safeValue - 24) / 72) * 100;
    var buttonColor = getButtonColor(safeValue);

    var score = section.querySelector("[data-a11y-contrast-v2-score]");
    var percent = section.querySelector("[data-a11y-contrast-v2-percent]");
    var message = section.querySelector("[data-a11y-contrast-v2-message]");
    var button = section.querySelector("[data-a11y-contrast-v2-button]");

    section.style.setProperty("--a11y-contrast-v2-fill", fill.toFixed(2) + "%");
    section.style.setProperty("--a11y-contrast-v2-live-bg", buttonColor);

    if (score) score.textContent = Math.round(safeValue) + "%";
    if (percent) percent.textContent = Math.round(safeValue) + "%";

    if (!message || !button) return;

    message.classList.remove("is-low", "is-mid", "is-good");

    if (safeValue < 48) {
      section.style.setProperty("--a11y-contrast-v2-live-ink", "rgba(247, 251, 255, 0.48)");
      message.classList.add("is-low");
      message.textContent = "Too low. The button gets lost.";
      return;
    }

    if (safeValue < 72) {
      section.style.setProperty("--a11y-contrast-v2-live-ink", "#f7fbff");
      message.classList.add("is-mid");
      message.textContent = "Almost. Raise it so the button stands out.";
      return;
    }

    section.style.setProperty("--a11y-contrast-v2-live-ink", "#050711");
    message.classList.add("is-good");
    message.textContent = "Perfect. The button stands out.";
  }

  function initA11yContrastV2() {
    var section = document.querySelector("[data-a11y-contrast-v2]");

    if (!section) return;
    if (section.dataset.a11yContrastV2Bound === "true") return;

    section.dataset.a11yContrastV2Bound = "true";

    var range = section.querySelector("[data-a11y-contrast-v2-range]");

    if (range) {
      setContrastState(section, range.value);

      range.addEventListener("input", function () {
        setContrastState(section, range.value);
      });
    }

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
        threshold: 0.22,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    observer.observe(section);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initA11yContrastV2);
  } else {
    initA11yContrastV2();
  }
})();


(function () {
  "use strict";

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function mix(start, end, progress) {
    return Math.round(start + (end - start) * progress);
  }

  function rgbToHex(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map(function (value) {
          return value.toString(16).padStart(2, "0");
        })
        .join("")
    ).toUpperCase();
  }

  function normalizeHex(value) {
    var raw = String(value || "").trim();

    if (!raw) return "";

    if (raw.charAt(0) !== "#") {
      raw = "#" + raw;
    }

    raw = raw.toUpperCase();

    if (/^#[0-9A-F]{3}$/.test(raw)) {
      return (
        "#" +
        raw.charAt(1) +
        raw.charAt(1) +
        raw.charAt(2) +
        raw.charAt(2) +
        raw.charAt(3) +
        raw.charAt(3)
      );
    }

    if (/^#[0-9A-F]{6}$/.test(raw)) {
      return raw;
    }

    return "";
  }

  function hexToRgb(hex) {
    var safeHex = normalizeHex(hex);

    if (!safeHex) return null;

    return {
      r: parseInt(safeHex.slice(1, 3), 16),
      g: parseInt(safeHex.slice(3, 5), 16),
      b: parseInt(safeHex.slice(5, 7), 16)
    };
  }

  function rgbToRgba(rgb, alpha) {
    return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + alpha + ")";
  }

  function mixRgb(start, end, progress) {
    return {
      r: mix(start.r, end.r, progress),
      g: mix(start.g, end.g, progress),
      b: mix(start.b, end.b, progress)
    };
  }

  function mixHex(startHex, endHex, progress) {
    var start = hexToRgb(startHex);
    var end = hexToRgb(endHex);

    if (!start || !end) return endHex;

    var mixed = mixRgb(start, end, progress);

    return rgbToHex(mixed.r, mixed.g, mixed.b);
  }

  function channelToLinear(value) {
    var channel = value / 255;

    if (channel <= 0.03928) {
      return channel / 12.92;
    }

    return Math.pow((channel + 0.055) / 1.055, 2.4);
  }

  function getLuminance(rgb) {
    return (
      0.2126 * channelToLinear(rgb.r) +
      0.7152 * channelToLinear(rgb.g) +
      0.0722 * channelToLinear(rgb.b)
    );
  }

  function getContrastRatio(hexOne, hexTwo) {
    var rgbOne = hexToRgb(hexOne);
    var rgbTwo = hexToRgb(hexTwo);

    if (!rgbOne || !rgbTwo) return 1;

    var lumOne = getLuminance(rgbOne);
    var lumTwo = getLuminance(rgbTwo);

    var light = Math.max(lumOne, lumTwo);
    var dark = Math.min(lumOne, lumTwo);

    return (light + 0.05) / (dark + 0.05);
  }

  function ratioToScore(ratio) {
    if (ratio < 3) {
      return clamp(24 + ((ratio - 1) / 2) * 24, 24, 47);
    }

    if (ratio < 4.5) {
      return clamp(48 + ((ratio - 3) / 1.5) * 24, 48, 71);
    }

    return clamp(72 + ((Math.min(ratio, 7) - 4.5) / 2.5) * 24, 72, 96);
  }

  function getDefaultButtonColor(value) {
    var progress = clamp((value - 24) / 72, 0, 1);

    var stops = [
      { point: 0, color: [46, 29, 119] },
      { point: 0.35, color: [76, 54, 176] },
      { point: 0.62, color: [78, 168, 255] },
      { point: 0.82, color: [141, 204, 255] },
      { point: 1, color: [185, 200, 90] }
    ];

    for (var index = 0; index < stops.length - 1; index += 1) {
      var current = stops[index];
      var next = stops[index + 1];

      if (progress >= current.point && progress <= next.point) {
        var local = (progress - current.point) / (next.point - current.point);

        return rgbToHex(
          mix(current.color[0], next.color[0], local),
          mix(current.color[1], next.color[1], local),
          mix(current.color[2], next.color[2], local)
        );
      }
    }

    return "#B9C85A";
  }

  function getCustomButtonColor(section, value) {
    var progress = clamp((value - 24) / 72, 0, 1);
    var chosenHex = section.dataset.a11yButtonHex || "#B9C85A";
    var chosenRgb = hexToRgb(chosenHex);

    if (!chosenRgb) return "#B9C85A";

    var alpha = clamp(0.22 + progress * 0.78, 0.22, 1);

    return rgbToRgba(chosenRgb, alpha.toFixed(2));
  }

  function getEffectiveCustomButtonHex(section, value) {
    var progress = clamp((value - 24) / 72, 0, 1);
    var chosenHex = section.dataset.a11yButtonHex || "#B9C85A";
    var stageHex = "#2B1B74";

    return mixHex(stageHex, chosenHex, progress);
  }

  function setColorValues(section, hex) {
    var rgb = hexToRgb(hex);
    var rgbText = section.querySelector("[data-a11y-contrast-v2-rgb]");
    var rgbaText = section.querySelector("[data-a11y-contrast-v2-rgba]");

    if (!rgb || !rgbText || !rgbaText) return;

    rgbText.textContent = "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
    rgbaText.textContent = "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 1)";
  }

  function setPickerColor(section, hex) {
    var colorInput = section.querySelector("[data-a11y-contrast-v2-color-input]");
    var hexInput = section.querySelector("[data-a11y-contrast-v2-hex-input]");
    var safeHex = normalizeHex(hex);

    if (!safeHex) return;

    if (colorInput) {
      colorInput.value = safeHex.toLowerCase();
    }

    if (hexInput) {
      hexInput.value = safeHex.toUpperCase();
    }

    setColorValues(section, safeHex);
  }

  function updateMessage(section, ratio) {
    var message = section.querySelector("[data-a11y-contrast-v2-message]");

    if (!message) return;

    message.classList.remove("is-low", "is-mid", "is-good");

    if (ratio < 3) {
      message.classList.add("is-low");
      message.textContent = "Too low. The button gets lost.";
      return;
    }

    if (ratio < 4.5) {
      message.classList.add("is-mid");
      message.textContent = "Almost. Raise contrast so the button stands out.";
      return;
    }

    message.classList.add("is-good");
    message.textContent = "Perfect. The button stands out.";
  }

  function updateContrastPreview(section) {
    var range = section.querySelector("[data-a11y-contrast-v2-range]");
    var score = section.querySelector("[data-a11y-contrast-v2-score]");
    var percent = section.querySelector("[data-a11y-contrast-v2-percent]");

    var value = range ? clamp(Number(range.value) || 82, 24, 96) : 82;
    var hasCustomButton = section.dataset.a11yHasCustomButton === "true";

    var visibleButtonColor = hasCustomButton
      ? getCustomButtonColor(section, value)
      : getDefaultButtonColor(value);

    var contrastButtonHex = hasCustomButton
      ? getEffectiveCustomButtonHex(section, value)
      : visibleButtonColor;

    var textHex = section.dataset.a11yTextHex || "#050711";
    var ratio = getContrastRatio(contrastButtonHex, textHex);
    var scoreValue = Math.round(ratioToScore(ratio));

    section.style.setProperty("--a11y-contrast-v2-live-bg", visibleButtonColor);
    section.style.setProperty("--a11y-contrast-v2-live-ink", textHex);
    section.style.setProperty("--a11y-contrast-v2-fill", scoreValue + "%");

    if (score) {
      score.textContent = scoreValue + "%";
    }

    if (percent) {
      percent.textContent = scoreValue + "%";
    }

    updateMessage(section, ratio);
  }

  function applyColor(section, target, hex) {
    var safeHex = normalizeHex(hex);

    if (!safeHex) return;

    if (target === "text") {
      section.dataset.a11yTextHex = safeHex;
      section.dataset.a11yHasCustomText = "true";
    } else {
      section.dataset.a11yButtonHex = safeHex;
      section.dataset.a11yHasCustomButton = "true";
    }

    setPickerColor(section, safeHex);
    updateContrastPreview(section);
  }

  function setTarget(section, target) {
    var buttons = Array.prototype.slice.call(
      section.querySelectorAll("[data-a11y-contrast-v2-target]")
    );

    var note = section.querySelector("[data-a11y-contrast-v2-color-note]");
    var nextTarget = target === "text" ? "text" : "button";

    var currentHex =
      nextTarget === "text"
        ? section.dataset.a11yTextHex || "#050711"
        : section.dataset.a11yButtonHex || "#B9C85A";

    section.dataset.a11yActiveColorTarget = nextTarget;

    buttons.forEach(function (button) {
      var isActive =
        button.getAttribute("data-a11y-contrast-v2-target") === nextTarget;

      button.classList.toggle("is-active", isActive);
    });

    if (note) {
      note.textContent =
        nextTarget === "text"
          ? "Editing text color."
          : "Editing button color.";
    }

    setPickerColor(section, currentHex);
  }

  function initContrastColorTool(section) {
    var tool = section.querySelector("[data-a11y-contrast-v2-color-tool]");
var openButton = section.querySelector("[data-a11y-contrast-v2-color-open]");
var demoButton = section.querySelector("[data-a11y-contrast-v2-button]");
var closeButton = section.querySelector("[data-a11y-contrast-v2-color-close]");

    var colorInput = section.querySelector("[data-a11y-contrast-v2-color-input]");
    var hexInput = section.querySelector("[data-a11y-contrast-v2-hex-input]");
    var targetButtons = Array.prototype.slice.call(
      section.querySelectorAll("[data-a11y-contrast-v2-target]")
    );

    if (!tool || !openButton || !colorInput || !hexInput) return;

    section.dataset.a11yButtonHex = section.dataset.a11yButtonHex || "#B9C85A";
    section.dataset.a11yTextHex = section.dataset.a11yTextHex || "#050711";
    section.dataset.a11yHasCustomButton = section.dataset.a11yHasCustomButton || "false";
    section.dataset.a11yHasCustomText = section.dataset.a11yHasCustomText || "false";
    section.dataset.a11yActiveColorTarget = section.dataset.a11yActiveColorTarget || "button";

    function openTool() {
      tool.classList.add("is-open");
      openButton.setAttribute("aria-expanded", "true");
      setTarget(section, section.dataset.a11yActiveColorTarget || "button");
    }

    function closeTool() {
      tool.classList.remove("is-open");
      openButton.setAttribute("aria-expanded", "false");
    }

    openButton.setAttribute("aria-expanded", "false");

    openButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (tool.classList.contains("is-open")) {
        closeTool();
        return;
      }

      openTool();
    });


if (demoButton) {
  demoButton.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    section.dataset.a11yActiveColorTarget = "button";
    openTool();
  });
}



    if (closeButton) {
      closeButton.addEventListener("click", function (event) {
        event.preventDefault();
        closeTool();
      });
    }

    targetButtons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        setTarget(section, button.getAttribute("data-a11y-contrast-v2-target"));
      });
    });

    colorInput.addEventListener("input", function () {
      applyColor(
        section,
        section.dataset.a11yActiveColorTarget || "button",
        colorInput.value
      );
    });

    hexInput.addEventListener("input", function () {
      var safeHex = normalizeHex(hexInput.value);

      if (!safeHex) return;

      applyColor(
        section,
        section.dataset.a11yActiveColorTarget || "button",
        safeHex
      );
    });

    document.addEventListener("click", function (event) {
      if (!tool.classList.contains("is-open")) return;
      if (tool.contains(event.target)) return;

      closeTool();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeTool();
      }
    });

    setTarget(section, "button");
  }

  function initA11yContrastV2() {
    var section = document.querySelector("[data-a11y-contrast-v2]");

    if (!section) return;
    if (section.dataset.a11yContrastV2FinalBound === "true") return;

    section.dataset.a11yContrastV2FinalBound = "true";

    var range = section.querySelector("[data-a11y-contrast-v2-range]");

    initContrastColorTool(section);
    updateContrastPreview(section);

    if (range) {
      range.addEventListener("input", function () {
        updateContrastPreview(section);
      });
    }

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
        threshold: 0.22,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    observer.observe(section);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initA11yContrastV2);
  } else {
    initA11yContrastV2();
  }
})();


(function () {
  "use strict";

  function initA11yKeyboardSection() {
    var section = document.querySelector("[data-a11y-keyboard]");

    if (!section) return;
    if (section.dataset.a11yKeyboardBound === "true") return;

    section.dataset.a11yKeyboardBound = "true";

    var slides = Array.prototype.slice.call(
      section.querySelectorAll("[data-a11y-keyboard-slide]")
    );

    var dots = Array.prototype.slice.call(
      section.querySelectorAll("[data-a11y-keyboard-dot]")
    );

    var prevButton = section.querySelector("[data-a11y-keyboard-prev]");
    var nextButton = section.querySelector("[data-a11y-keyboard-next]");
    var toggleButton = section.querySelector("[data-a11y-keyboard-toggle]");

    if (!slides.length || !dots.length) return;

    var activeIndex = 0;
    var raf = null;
    var startedAt = 0;
    var paused = false;
    var visible = false;

    var STEP_MS = 5600;
    var TOTAL_MS = STEP_MS * slides.length;

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function setLoader(percent) {
      section.style.setProperty(
        "--a11y-keyboard-loader-progress",
        clamp(percent, 0, 100).toFixed(3) + "%"
      );
    }

    function setToggleLabel() {
      if (!toggleButton) return;

      toggleButton.setAttribute(
        "aria-label",
        paused ? "Play keyboard preview" : "Pause keyboard preview"
      );
    }

    function setActive(index) {
      activeIndex = ((index % slides.length) + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        var isActive = slideIndex === activeIndex;

        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", isActive ? "false" : "true");
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function stopLoop() {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = null;
      }
    }

    function tick(now) {
      if (!visible || paused || prefersReduced) return;

      var elapsed = (now - startedAt) % TOTAL_MS;
      var nextIndex = Math.floor(elapsed / STEP_MS);
      var stepElapsed = elapsed % STEP_MS;
      var progress = (stepElapsed / STEP_MS) * 100;

      setLoader(progress);

      if (nextIndex !== activeIndex) {
        setActive(nextIndex);
        setLoader(0);
      }

      raf = window.requestAnimationFrame(tick);
    }

    function startLoop(index) {
      stopLoop();

      if (prefersReduced) {
        setActive(index || 0);
        setLoader(100);
        return;
      }

      startedAt = performance.now() - (index || activeIndex) * STEP_MS;
      raf = window.requestAnimationFrame(tick);
    }

    function goTo(index) {
      setActive(index);
      setLoader(0);

      if (!paused && visible) {
        startLoop(activeIndex);
      }
    }

    dots.forEach(function (dot, fallbackIndex) {
      dot.addEventListener("click", function (event) {
        event.preventDefault();

        var attrIndex = Number(dot.getAttribute("data-a11y-keyboard-dot"));

        goTo(Number.isFinite(attrIndex) ? attrIndex : fallbackIndex);
      });
    });

    if (prevButton) {
      prevButton.addEventListener("click", function (event) {
        event.preventDefault();
        goTo(activeIndex - 1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function (event) {
        event.preventDefault();
        goTo(activeIndex + 1);
      });
    }

    if (toggleButton) {
      toggleButton.addEventListener("click", function (event) {
        event.preventDefault();

        paused = !paused;
        section.classList.toggle("is-paused", paused);
        setToggleLabel();

        if (paused) {
          stopLoop();
          return;
        }

        if (visible) {
          startLoop(activeIndex);
        }
      });
    }

    function showSection() {
      visible = true;
      section.classList.add("is-visible");

      if (!paused) {
        startLoop(activeIndex);
      }
    }

    function hideSection() {
      visible = false;
      stopLoop();
    }

    setActive(0);
    setLoader(0);
    setToggleLabel();

    if (prefersReduced || !("IntersectionObserver" in window)) {
      showSection();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            showSection();
          } else {
            hideSection();
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    observer.observe(section);

    window.addEventListener("pageshow", function () {
      setActive(activeIndex);
      setLoader(0);

      if (visible && !paused) {
        startLoop(activeIndex);
      }
    });

    window.addEventListener("resize", function () {
      setActive(activeIndex);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initA11yKeyboardSection);
  } else {
    initA11yKeyboardSection();
  }
})();

(function () {
  "use strict";

  function initA11yEndSections() {
    var sections = Array.prototype.slice.call(
      document.querySelectorAll("[data-a11y-next-section], [data-a11y-final-section]")
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
      if (section.dataset.a11yEndBound === "true") return;

      section.dataset.a11yEndBound = "true";
      observer.observe(section);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initA11yEndSections);
  } else {
    initA11yEndSections();
  }
})();
