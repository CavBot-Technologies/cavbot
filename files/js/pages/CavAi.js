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
          if (entry.isIntersecting) {
  section.classList.add("is-visible");
  observer.unobserve(section);
}


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
document.addEventListener("DOMContentLoaded", () => {
  const sections = Array.from(document.querySelectorAll("[data-cavai-flow]"));
  if (!sections.length) return;


  sections.forEach((section) => {
    if (section.dataset.cavaiFlowReady === "true") return;
    section.dataset.cavaiFlowReady = "true";


    const tabs = Array.from(section.querySelectorAll("[data-cavai-flow-tab]"));
    const panels = Array.from(section.querySelectorAll("[data-cavai-flow-panel]"));


    if (!tabs.length || !panels.length) return;


    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    const STEP_MS = 7200;
    let activeIndex = 0;
    let timer = null;
    let isVisible = true;


    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }


    function setActive(index) {
      const nextIndex = ((index % tabs.length) + tabs.length) % tabs.length;
      activeIndex = nextIndex;


      section.style.setProperty("--cavai-flow-index", String(nextIndex));


      tabs.forEach((tab, tabIndex) => {
        const isActive = tabIndex === nextIndex;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
        tab.setAttribute("tabindex", isActive ? "0" : "-1");
      });


      panels.forEach((panel, panelIndex) => {
        const isActive = panelIndex === nextIndex;
        panel.classList.toggle("is-active", isActive);
        panel.setAttribute("aria-hidden", isActive ? "false" : "true");
      });
    }


    function startTimer() {
      if (prefersReduced || !isVisible) return;


      stopTimer();


      timer = window.setInterval(() => {
        setActive(activeIndex + 1);
      }, STEP_MS);
    }


    tabs.forEach((tab, tabIndex) => {
      tab.addEventListener("click", () => {
        setActive(tabIndex);
        startTimer();
      });


      tab.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;


        event.preventDefault();


        const direction = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = ((activeIndex + direction) % tabs.length + tabs.length) % tabs.length;


        setActive(nextIndex);


        const nextTab = tabs[nextIndex];
        if (nextTab && typeof nextTab.focus === "function") {
          nextTab.focus({ preventScroll: true });
        }


        startTimer();
      });
    });


    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;


          isVisible = entry.isIntersecting;


          if (isVisible) {
            startTimer();
          } else {
            stopTimer();
          }
        },
        { threshold: 0.18 }
      );


      observer.observe(section);
    }


    setActive(0);
    startTimer();
  });
});


/* Caven intro reveal */
(function () {
  "use strict";


  const section = document.querySelector("[data-caven-intro]");
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
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    }
  );


  observer.observe(section);
})();

/* From signal to action section reveal */
(function () {
  "use strict";


  const section = document.querySelector("[data-cavai-flow]");
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
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    }
  );


  observer.observe(section);
})();

/* CavAi agents toggle + card expansion + directional reveal */
(function () {
  "use strict";


  const section = document.querySelector("[data-cavai-agents]");
  if (!section) return;


  const tabs = Array.from(section.querySelectorAll("[data-cavai-agent-tab]"));
  const panels = Array.from(section.querySelectorAll("[data-cavai-agent-panel]"));
  const expandButtons = Array.from(section.querySelectorAll(".cavai-agent-expand"));


  function activateAgentPanel(target) {
    tabs.forEach(function (tab) {
      const isActive = tab.getAttribute("data-cavai-agent-tab") === target;


      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
      tab.setAttribute("tabindex", isActive ? "0" : "-1");
    });


    panels.forEach(function (panel) {
      const isActive = panel.getAttribute("data-cavai-agent-panel") === target;


      panel.classList.toggle("is-active", isActive);


      if (isActive) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });
  }


  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activateAgentPanel(tab.getAttribute("data-cavai-agent-tab"));
    });


    tab.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;


      event.preventDefault();


      const currentIndex = tabs.indexOf(tab);
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
      const nextTab = tabs[nextIndex];


      if (!nextTab) return;


      activateAgentPanel(nextTab.getAttribute("data-cavai-agent-tab"));
      nextTab.focus({ preventScroll: true });
    });
  });


  expandButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const tile = button.closest(".cavai-agent-tile");
      if (!tile) return;


      const isOpen = tile.classList.toggle("is-open");
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");


      const title = tile.querySelector("h3");
      if (title) {
        button.setAttribute(
          "aria-label",
          (isOpen ? "Collapse " : "Expand ") + title.textContent.trim()
        );
      }
    });
  });


  activateAgentPanel("library");


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
      threshold: 0.14,
      rootMargin: "0px 0px -10% 0px"
    }
  );


  observer.observe(section);
})();


/* CavAi intelligence band bounce reveal */
(function () {
  "use strict";


  const section = document.querySelector("[data-cavai-intelligence-band]");
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
      rootMargin: "0px 0px -8% 0px"
    }
  );


  observer.observe(section);
})();
/* Section 7 + Section 8 reveal */
(function () {
  "use strict";

  const sections = Array.from(
    document.querySelectorAll("[data-cavai-more], [data-cavai-final]")
  );

  if (!sections.length) return;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    sections.forEach(function (section) {
      section.classList.add("is-visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
})();

