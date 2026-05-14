(function () {
  "use strict";

  const PAGE_SELECTOR = "[data-cavai-page]";
  const BOOTED_ATTR = "data-cavai-booted";

  function getHeaderHeight() {
    const header = document.querySelector(".site-header");
    if (!header) return 72;

    const rect = header.getBoundingClientRect();
    return Math.max(0, Math.ceil(rect.height || 72));
  }

  function syncHeaderHeight() {
    document.documentElement.style.setProperty(
      "--cavai-header-height",
      `${getHeaderHeight()}px`
    );
  }

  function bootCavAi() {
    const page = document.querySelector(PAGE_SELECTOR);
    if (!page || page.getAttribute(BOOTED_ATTR) === "true") return;

    page.setAttribute(BOOTED_ATTR, "true");

    syncHeaderHeight();

    window.addEventListener("resize", syncHeaderHeight, { passive: true });
    window.addEventListener("orientationchange", syncHeaderHeight, { passive: true });
    window.addEventListener("pageshow", syncHeaderHeight, { passive: true });

    window.setTimeout(syncHeaderHeight, 80);
    window.setTimeout(syncHeaderHeight, 320);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootCavAi, { once: true });
  } else {
    bootCavAi();
  }
})();

(function () {
  "use strict";

  const section = document.querySelector(".cavai-workflow-section");
  if (!section) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function syncMotionState() {
    section.classList.toggle("is-paused", prefersReducedMotion.matches);
  }

  syncMotionState();

  if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", syncMotionState);
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          section.classList.toggle("is-visible", entry.isIntersecting);

          if (prefersReducedMotion.matches) {
            section.classList.add("is-paused");
            return;
          }

          section.classList.toggle("is-paused", !entry.isIntersecting);
        });
      },
      { threshold: 0.08 }
    );

    observer.observe(section);
  }
})();

/* CavAi hero logo reveal */
(function () {
  "use strict";

  const stage = document.querySelector(".cavai-logo-stage");
  if (!stage) return;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    stage.classList.add("is-visible");
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      const entry = entries[0];
      stage.classList.toggle("is-visible", Boolean(entry && entry.isIntersecting));
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -2% 0px"
    }
  );

  observer.observe(stage);
})();

(function () {
  "use strict";

  const shell = document.querySelector("[data-cavai-video-shell]");
  const video = document.querySelector("[data-cavai-demo-video]");
  const control = document.querySelector("[data-cavai-video-control]");

  if (!shell || !video || !control) return;

  function syncVideoState() {
    const isPlaying = !video.paused && !video.ended;

    shell.classList.toggle("is-playing", isPlaying);
    control.setAttribute(
      "aria-label",
      isPlaying ? "Pause CavAi demo" : "Play CavAi demo"
    );
  }

  function toggleVideo() {
    if (video.paused || video.ended) {
      video.play().catch(function () {
        syncVideoState();
      });
    } else {
      video.pause();
    }
  }

  control.addEventListener("click", toggleVideo);
  video.addEventListener("click", toggleVideo);
  video.addEventListener("play", syncVideoState);
  video.addEventListener("pause", syncVideoState);
  video.addEventListener("ended", syncVideoState);
  video.addEventListener("loadedmetadata", syncVideoState);

  syncVideoState();
})();
/* ==============================
   CavAi Section 3
   Bulletproof tab switcher
   ============================== */
(function () {
  "use strict";

  function activateCavAiFit(target) {
    const section = document.querySelector("[data-cavai-fit]");
    if (!section || !target) return;

    const tabs = section.querySelectorAll("[data-cavai-fit-tab]");
    const panels = section.querySelectorAll("[data-cavai-fit-panel]");
    const railParent = section.querySelector(".cavai-fit-tabs");
    const rail = section.querySelector(".cavai-fit-rail");

    tabs.forEach(function (tab) {
      const isActive = tab.getAttribute("data-cavai-fit-tab") === target;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    panels.forEach(function (panel) {
      const isActive = panel.getAttribute("data-cavai-fit-panel") === target;
      panel.classList.toggle("is-active", isActive);

      if (isActive) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });

    const activeTab = section.querySelector('[data-cavai-fit-tab="' + target + '"]');

    if (rail && railParent && activeTab) {
      const parentRect = railParent.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();

      railParent.style.setProperty(
        "--cavai-fit-rail-top",
        tabRect.top - parentRect.top + "px"
      );

      railParent.style.setProperty(
        "--cavai-fit-rail-height",
        tabRect.height + "px"
      );
    }
  }

  function bootCavAiFit() {
    const section = document.querySelector("[data-cavai-fit]");
    if (!section) return;

    const tabs = section.querySelectorAll("[data-cavai-fit-tab]");
    if (!tabs.length) return;

    tabs.forEach(function (tab) {
      tab.type = "button";

      tab.addEventListener("click", function () {
        const target = tab.getAttribute("data-cavai-fit-tab");
        activateCavAiFit(target);
      });
    });

    activateCavAiFit("marketing");
  }

  document.addEventListener("click", function (event) {
    const tab = event.target.closest("[data-cavai-fit-tab]");
    if (!tab) return;

    event.preventDefault();

    const target = tab.getAttribute("data-cavai-fit-tab");
    activateCavAiFit(target);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootCavAiFit);
  } else {
    bootCavAiFit();
  }

  window.addEventListener("resize", function () {
    const activeTab = document.querySelector("[data-cavai-fit-tab].is-active");
    if (!activeTab) return;

    activateCavAiFit(activeTab.getAttribute("data-cavai-fit-tab"));
  });
})();
/* CavAi Section 4 reveal */
(function () {
  "use strict";


  const section = document.querySelector("[data-cavai-foundation]");
  if (!section) return;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    section.classList.add("is-visible");
    return;
  }


  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        section.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -10% 0px"
    }
  );


  observer.observe(section);
})();
