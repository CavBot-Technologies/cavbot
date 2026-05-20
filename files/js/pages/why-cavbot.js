(function () {
  const hero = document.querySelector("[data-why-hero]");
  if (!hero) return;


  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  if (prefersReduced) {
    hero.classList.add("is-visible");
    return;
  }


  window.requestAnimationFrame(function () {
    hero.classList.add("is-visible");
  });
})();


(function () {
  const accordions = document.querySelectorAll("[data-why-accordion]");


  accordions.forEach(function (accordion) {
    const rows = Array.from(accordion.querySelectorAll(".why-problem-row"));


    rows.forEach(function (row) {
      const trigger = row.querySelector(".why-problem-trigger");
      const panel = row.querySelector(".why-problem-panel");


      if (!trigger || !panel) return;


      trigger.addEventListener("click", function () {
        const isOpen = row.classList.contains("is-open");


        rows.forEach(function (otherRow) {
          const otherTrigger = otherRow.querySelector(".why-problem-trigger");
          const otherPanel = otherRow.querySelector(".why-problem-panel");


          otherRow.classList.remove("is-open");


          if (otherTrigger) {
            otherTrigger.setAttribute("aria-expanded", "false");
          }


          if (otherPanel) {
            otherPanel.hidden = true;
          }
        });


        if (!isOpen) {
          row.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
          panel.hidden = false;
        }
      });
    });
  });
})();


(function () {
  const problem = document.querySelector("[data-why-problem]");
  if (!problem) return;


  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  if (prefersReduced) {
    problem.classList.add("is-visible");
    return;
  }


  if (!("IntersectionObserver" in window)) {
    problem.classList.add("is-visible");
    return;
  }


  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          problem.classList.add("is-visible");
        } else {
          problem.classList.remove("is-visible");
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "-8% 0px -12% 0px"
    }
  );


  observer.observe(problem);
})();



(function () {
  const solution = document.querySelector("[data-why-solution]");
  if (!solution) return;


  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  if (prefersReduced) {
    solution.classList.add("is-visible");
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            solution.classList.add("is-visible");
          } else {
            solution.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "-8% 0px -12% 0px"
      }
    );


    observer.observe(solution);
  } else {
    solution.classList.add("is-visible");
  }


  const controls = Array.from(solution.querySelectorAll("[data-solution-control]"));
  const signals = Array.from(solution.querySelectorAll("[data-solution-signal]"));
  const panels = Array.from(solution.querySelectorAll("[data-solution-panel]"));


  function scrollToSolutionSignal(key) {
    const target = signals.find(function (signal) {
      return signal.getAttribute("data-solution-signal") === key;
    });


    if (!target || !target.scrollIntoView) return;


    target.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "center"
    });
  }


  function activateSolution(key) {
    controls.forEach(function (control) {
      const isActive = control.getAttribute("data-solution-control") === key;
      control.classList.toggle("is-active", isActive);
      control.setAttribute("aria-selected", isActive ? "true" : "false");
    });


    signals.forEach(function (signal) {
      signal.classList.toggle(
        "is-active",
        signal.getAttribute("data-solution-signal") === key
      );
    });


    panels.forEach(function (panel) {
      const isActive = panel.getAttribute("data-solution-panel") === key;
      panel.hidden = !isActive;
    });
  }


  controls.forEach(function (control) {
    control.addEventListener("click", function () {
      const key = control.getAttribute("data-solution-control");
      if (!key) return;
      activateSolution(key);
      scrollToSolutionSignal(key);
    });
  });


  activateSolution("broken");
})();


(function () {
  const compare = document.querySelector("[data-why-compare]");
  if (!compare) return;


  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  if (prefersReduced) {
    compare.classList.add("is-visible");
    return;
  }


  let lastScrollY = window.scrollY || window.pageYOffset || 0;
  let direction = "down";


  window.addEventListener(
    "scroll",
    function () {
      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      direction = currentScrollY < lastScrollY ? "up" : "down";
      lastScrollY = currentScrollY;
    },
    { passive: true }
  );


  if (!("IntersectionObserver" in window)) {
    compare.classList.add("is-visible");
    return;
  }


  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          compare.classList.add("is-visible");
          compare.classList.remove("is-exiting-up");
          return;
        }


        compare.classList.remove("is-visible");


        if (direction === "up") {
          compare.classList.add("is-exiting-up");
        } else {
          compare.classList.remove("is-exiting-up");
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "-8% 0px -14% 0px"
    }
  );


  observer.observe(compare);
})();



(function () {
  const section = document.querySelector("[data-why-integrations]");
  if (!section) return;


  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  if (prefersReduced) {
    section.classList.add("is-visible");
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          section.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "-8% 0px -12% 0px"
      }
    );


    observer.observe(section);
  } else {
    section.classList.add("is-visible");
  }


  const integrations = {
    cavbot: {
      label: "Native CavBot",
      icon: "assets/logo/cavbot-logomark.svg",
      title: "Connect CavBot to your own workspace.",
      copy: "Use CavBot’s own widgets, intelligence, and recovery surfaces across your site."
    },
    "custom-html": {
      label: "Custom HTML",
      icon: "assets/icons/page/intergrations/html5-badge.svg",
      title: "Drop CavBot into any custom site.",
      copy: "Add the CavBot script once and keep your pages, paths, and recovery moments in sync."
    },
    webflow: {
      label: "Webflow",
      icon: "assets/icons/page/intergrations/webflow-mark-blue.svg",
      title: "Ship CavBot across Webflow projects.",
      copy: "Connect CavBot scripts to CMS-powered pages, landing pages, and marketing sites."
    },
    wix: {
      label: "Wix",
      icon: "assets/icons/page/intergrations/Wix logoB.svg",
      title: "Add CavBot to builder-powered websites.",
      copy: "Watch routes, broken pages, and recovery signals without changing how the site is built."
    },
    shopify: {
      label: "Shopify",
      icon: "assets/icons/page/intergrations/shopify_glyph.svg",
      title: "Layer CavBot into storefront journeys.",
      copy: "See broken storefront paths, repeated product routes, and the fixes that protect conversion."
    },
    wordpress: {
      label: "WordPress",
      icon: "assets/icons/page/intergrations/WordPress-logotype-wmark-white.png",
      title: "Bring CavBot into WordPress pages.",
      copy: "Monitor templates, pages, and recovery moments across content-heavy websites."
    },
    squarespace: {
      label: "Squarespace",
      icon: "assets/icons/page/intergrations/squarespace-svgrepo-com-white.svg",
      title: "Connect CavBot to managed sites.",
      copy: "Give simple sites a cleaner recovery layer for broken pages and unclear paths."
    },
    framer: {
      label: "Framer",
      icon: "assets/icons/page/intergrations/framer.svg",
      title: "Ship CavBot with design-led websites.",
      copy: "Keep prototypes, launches, and live pages connected to operational website intelligence."
    }
  };


  const bubbles = Array.from(section.querySelectorAll("[data-integration-key]"));
  const detailLabel = section.querySelector("[data-integration-detail-label]");
  const detailTitle = section.querySelector("[data-integration-detail-title]");
  const detailCopy = section.querySelector("[data-integration-detail-copy]");


  function activateIntegration(key) {
    const item = integrations[key];
    if (!item || !detailLabel || !detailTitle || !detailCopy) return;


    bubbles.forEach(function (bubble) {
      const isActive = bubble.getAttribute("data-integration-key") === key;
      bubble.classList.toggle("is-active", isActive);
      bubble.setAttribute("aria-pressed", isActive ? "true" : "false");
    });


    detailLabel.textContent = "";

    if (item.icon) {
      const icon = document.createElement("img");
      icon.src = item.icon;
      icon.alt = "";
      icon.setAttribute("aria-hidden", "true");
      icon.decoding = "async";
      detailLabel.appendChild(icon);
    }

    detailTitle.textContent = item.title;
    detailCopy.textContent = item.copy;
  }


  bubbles.forEach(function (bubble) {
    const key = bubble.getAttribute("data-integration-key");


    bubble.addEventListener("mouseenter", function () {
      activateIntegration(key);
    });


    bubble.addEventListener("focus", function () {
      activateIntegration(key);
    });


    bubble.addEventListener("click", function () {
      activateIntegration(key);
    });
  });


  activateIntegration("custom-html");
})();




(function () {
  const marquee = document.querySelector("[data-pilot-logo-marquee]");
  const track = document.querySelector("[data-pilot-logo-track]");
  const group = document.querySelector("[data-pilot-logo-group]");
  const toggle = document.querySelector("[data-pilot-logo-toggle]");


  if (!marquee || !track || !group || !toggle) return;
  if (track.dataset.logoMarqueeReady === "true") return;


  track.dataset.logoMarqueeReady = "true";


  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  let paused = false;
  let raf = null;
  let last = 0;
  let x = 0;
  let loopWidth = 0;
  let rebuildTimer = 0;


  const SPEED = 42;


  function syncButton() {
    marquee.classList.toggle("is-paused", paused);
    toggle.setAttribute("aria-pressed", paused ? "true" : "false");
    toggle.setAttribute(
      "aria-label",
      paused ? "Play logo animation" : "Pause logo animation"
    );
  }


  function clearClones() {
    Array.from(track.children).forEach(function (child) {
      if (child !== group) child.remove();
    });
  }


  function normalizeX() {
    if (!loopWidth) return;


    x = ((x % loopWidth) + loopWidth) % loopWidth;


    if (x > 0) {
      x -= loopWidth;
    }
  }


  function applyTransform() {
    track.style.transform = "translate3d(" + x + "px, 0, 0)";
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
      clone.removeAttribute("data-pilot-logo-group");
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
      currentWidth += baseWidth;
    }


    const firstGroup = track.children[0];
    const secondGroup = track.children[1];


    loopWidth =
      firstGroup && secondGroup
        ? secondGroup.offsetLeft - firstGroup.offsetLeft
        : baseWidth;


    if (!Number.isFinite(loopWidth) || loopWidth <= 0) {
      loopWidth = baseWidth;
    }


    x = -((progress % 1) * loopWidth);
    normalizeX();
    applyTransform();
  }


  function requestRebuild() {
    window.clearTimeout(rebuildTimer);


    rebuildTimer = window.setTimeout(function () {
      buildLoop();
      last = performance.now();
    }, 80);
  }


  function bindImageGuards() {
    const images = Array.from(group.querySelectorAll("img"));


    images.forEach(function (img) {
      img.addEventListener("load", requestRebuild);
      img.addEventListener("error", requestRebuild);


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


  toggle.addEventListener("click", function () {
    paused = !paused;
    syncButton();
    start();
  });


  window.addEventListener("resize", requestRebuild);


  window.addEventListener("load", function () {
    requestRebuild();
  });


  document.addEventListener("visibilitychange", function () {
    last = performance.now();


    if (!document.hidden) {
      start();
    }
  });


  if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(requestRebuild);
    observer.observe(marquee);
    observer.observe(group);
  }


  bindImageGuards();
  syncButton();


  window.setTimeout(function () {
    buildLoop();
    start();
  }, 120);
})();
