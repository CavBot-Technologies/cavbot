(function () {
  "use strict";

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
  }

  function initErrorPreviewRise() {
    var stage = document.querySelector("[data-error-preview-stage]");
    var frame = document.querySelector("[data-error-preview-frame]");

    if (!stage || !frame) return;
    if (stage.dataset.errorPreviewBound === "true") return;

    stage.dataset.errorPreviewBound = "true";

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setReady() {
      frame.style.setProperty("--error-preview-y", "0px");
      frame.style.setProperty("--error-preview-scale", "1");
      frame.style.setProperty("--error-preview-opacity", "1");
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

      frame.style.setProperty("--error-preview-y", y.toFixed(2) + "px");
      frame.style.setProperty("--error-preview-scale", scale.toFixed(4));
      frame.style.setProperty("--error-preview-opacity", opacity.toFixed(4));
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

  function restartErrorHeroAnimations(hero) {
    var animatedItems = hero.querySelectorAll(
      ".error-chart-bars span, .error-impact-chain i, .error-event-row"
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

  function initErrorHeroVisibility() {
    var hero = document.querySelector("[data-error-hero]");

    if (!hero) return;
    if (hero.dataset.errorHeroBound === "true") return;

    hero.dataset.errorHeroBound = "true";

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      hero.classList.add("is-error-visible");
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          hero.classList.add("is-error-visible");
          restartErrorHeroAnimations(hero);
        });
      },
      {
        threshold: 0.28
      }
    );

    observer.observe(hero);
  }

  function initErrorLoopNumbers() {
    var numbers = Array.prototype.slice.call(
      document.querySelectorAll("[data-error-loop-number]")
    );

    if (!numbers.length) return;

    var values = {
      risk: [24, 18, 31, 12, 39, 27, 16, 24],
      repeats: [24, 11, 36, 19, 42, 28, 15, 24]
    };
    var index = 0;

    function setNumbers() {
      numbers.forEach(function (number) {
        var key = number.getAttribute("data-error-loop-number");
        var set = values[key] || values.risk;

        number.textContent = String(set[index % set.length]);
      });

      index += 1;
    }

    setNumbers();
    window.setInterval(setNumbers, 1400);
  }

  function init() {
    initErrorPreviewRise();
    initErrorHeroVisibility();
    initErrorLoopNumbers();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

(function () {
  "use strict";


  function restartErrorFocusAnimations(section) {
    var animatedItems = section.querySelectorAll(
      ".error-pill-row, .error-broken-pill i, .error-stability-bars i"
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


  function initErrorFocusSection() {
    var section = document.querySelector("[data-error-focus-section]");


    if (!section) return;
    if (section.dataset.errorFocusBound === "true") return;


    section.dataset.errorFocusBound = "true";


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
          restartErrorFocusAnimations(section);
        });
      },
      {
        threshold: 0.28
      }
    );


    observer.observe(section);
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initErrorFocusSection);
  } else {
    initErrorFocusSection();
  }
})();

(function () {
  "use strict";


  function initErrorDetailSection() {
    var section = document.querySelector("[data-error-detail-section]");


    if (!section) return;
    if (section.dataset.errorDetailBound === "true") return;


    section.dataset.errorDetailBound = "true";


    var tabs = Array.prototype.slice.call(
      section.querySelectorAll("[data-error-detail-tab]")
    );


    var panels = Array.prototype.slice.call(
      section.querySelectorAll("[data-error-detail-panel]")
    );


    if (!tabs.length || !panels.length) return;


    function setActive(key) {
      tabs.forEach(function (tab) {
        var isActive = tab.getAttribute("data-error-detail-tab") === key;


        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
      });


      panels.forEach(function (panel) {
        var isActive = panel.getAttribute("data-error-detail-panel") === key;


        panel.classList.toggle("is-active", isActive);


        if (isActive) {
          panel.removeAttribute("hidden");
        } else {
          panel.setAttribute("hidden", "");
        }
      });
    }


    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        var key = tab.getAttribute("data-error-detail-tab");
        setActive(key);
      });


      tab.addEventListener("keydown", function (event) {
        var nextIndex = index;


        if (event.key === "ArrowRight") {
          nextIndex = (index + 1) % tabs.length;
        } else if (event.key === "ArrowLeft") {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else {
          return;
        }


        event.preventDefault();


        tabs[nextIndex].focus();
        setActive(tabs[nextIndex].getAttribute("data-error-detail-tab"));
      });
    });


    var firstActive = section.querySelector(".error-detail-pill.is-active");
    setActive(
      firstActive
        ? firstActive.getAttribute("data-error-detail-tab")
        : tabs[0].getAttribute("data-error-detail-tab")
    );


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
    document.addEventListener("DOMContentLoaded", initErrorDetailSection);
  } else {
    initErrorDetailSection();
  }
})();

(function () {
  "use strict";


  function restartErrorWorkAnimations(section) {
    var animatedItems = section.querySelectorAll(
      ".error-work-link-strip i, .error-work-release i"
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


  function initErrorWorkSection() {
    var section = document.querySelector("[data-error-work-section]");


    if (!section) return;
    if (section.dataset.errorWorkBound === "true") return;


    section.dataset.errorWorkBound = "true";


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
          restartErrorWorkAnimations(section);
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
    document.addEventListener("DOMContentLoaded", initErrorWorkSection);
  } else {
    initErrorWorkSection();
  }
})();

(function () {
  "use strict";


  function restartErrorWorkAnimations(section) {
    var animatedItems = section.querySelectorAll(
      ".error-work-link-strip i, .error-work-release i"
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


  function initErrorWorkSection() {
    var section = document.querySelector("[data-error-work-section]");


    if (!section) return;
    if (section.dataset.errorWorkBound === "true") return;


    section.dataset.errorWorkBound = "true";


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
          restartErrorWorkAnimations(section);
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
    document.addEventListener("DOMContentLoaded", initErrorWorkSection);
  } else {
    initErrorWorkSection();
  }
})();

(function () {
  "use strict";


  function initErrorSystemSection() {
    var section = document.querySelector("[data-error-system-section]");


    if (!section) return;
    if (section.dataset.errorSystemBound === "true") return;


    section.dataset.errorSystemBound = "true";


    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    var watchCard = section.querySelector(".error-system-card--watch");


    var issuePills = Array.prototype.slice.call(
      section.querySelectorAll("[data-error-system-issue]")
    );


    var score = section.querySelector("[data-error-system-score]");
    var change = section.querySelector("[data-error-system-change]");


    var watchStates = [
      {
        score: "88%",
        change: "+0.62",
        good: true,
        count: 1
      },
      {
        score: "89%",
        change: "+0.85",
        good: true,
        count: 2
      },
      {
        score: "87%",
        change: "-1.16",
        good: false,
        count: 3
      },
      {
        score: "88%",
        change: "-0.20",
        good: false,
        count: 2
      }
    ];


    var watchIndex = 0;


    function runWatchState() {
      var state = watchStates[watchIndex % watchStates.length];


      if (score) score.textContent = state.score;


      if (change) {
        change.textContent = state.change;
        change.classList.toggle("is-good", state.good);
        change.classList.toggle("is-bad", !state.good);
      }


      issuePills.forEach(function (pill, index) {
        var isVisible = index < state.count;
        var isActive = index === state.count - 1;


        pill.classList.toggle("is-visible", isVisible);
        pill.classList.toggle("is-active", isActive);
      });


      if (watchCard && !prefersReduced) {
        watchCard.classList.remove("is-scanning");


        window.requestAnimationFrame(function () {
          watchCard.classList.add("is-scanning");
        });
      }


      watchIndex += 1;
    }


    var connectCard = section.querySelector(".error-system-card--connect");


    function pulseConnections() {
      if (!connectCard || prefersReduced) return;


      connectCard.classList.remove("is-connect-pulse");


      window.requestAnimationFrame(function () {
        connectCard.classList.add("is-connect-pulse");
      });
    }


    var reviewList = section.querySelector("[data-error-system-review-list]");


    function rotateReviewRows() {
      if (!reviewList) return;


      var rows = Array.prototype.slice.call(
        reviewList.querySelectorAll(".error-system-review-row")
      );


      if (!rows.length) return;


      rows.forEach(function (row) {
        row.classList.remove("is-fixed", "is-fading");
      });


      if (rows[2]) rows[2].classList.add("is-fixed");


      if (prefersReduced) return;


      rows.slice(0, 2).forEach(function (row) {
        row.classList.add("is-fading");
      });


      window.setTimeout(function () {
        rows.slice(0, 2).forEach(function (row) {
          row.classList.remove("is-fading", "is-fixed");
          reviewList.appendChild(row);
        });
      }, 1040);
    }


    function startLoops() {
      runWatchState();
      pulseConnections();
      rotateReviewRows();


      window.setInterval(runWatchState, 1500);
      window.setInterval(pulseConnections, 4800);
      window.setInterval(rotateReviewRows, 1500);
    }


    if (prefersReduced || !("IntersectionObserver" in window)) {
      section.classList.add("is-visible");
      startLoops();
      return;
    }


    var hasStarted = false;


    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;


          section.classList.add("is-visible");


          if (!hasStarted) {
            hasStarted = true;
            startLoops();
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


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initErrorSystemSection);
  } else {
    initErrorSystemSection();
  }
})();

(function () {
  "use strict";

  function initRouteErrorSection() {
    var section = document.querySelector("[data-error-error-section]");

    if (!section) return;
    if (section.dataset.errorErrorBound === "true") return;

    section.dataset.errorErrorBound = "true";

    var numbers = Array.prototype.slice.call(
      section.querySelectorAll(".error-error-metrics strong")
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
    var section = document.querySelector("[data-error-final-section]");

    if (!section) return;
    if (section.dataset.errorFinalBound === "true") return;

    section.dataset.errorFinalBound = "true";

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

