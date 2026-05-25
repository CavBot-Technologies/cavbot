(function () {
  "use strict";


  var hero = document.querySelector("[data-help-hero]");
  var title = document.querySelector("[data-help-title]");


  if (!hero || !title) return;


  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  var scrollFrame = null;
  var lastScrollY = window.scrollY || window.pageYOffset || 0;
  var hasPassedHero = false;
  var titleAnimationTimer = null;


  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }


  function clearTitleAnimationTimer() {
    if (titleAnimationTimer) {
      window.clearTimeout(titleAnimationTimer);
      titleAnimationTimer = null;
    }
  }


  function animateTitleDrop() {
    if (prefersReducedMotion) {
      hero.classList.add("is-title-ready");
      return;
    }


    clearTitleAnimationTimer();


    hero.classList.remove("is-title-ready");


    titleAnimationTimer = window.setTimeout(function () {
      hero.classList.add("is-title-ready");
      titleAnimationTimer = null;
    }, 90);
  }


  function updateHeroScroll() {
    scrollFrame = null;


    if (prefersReducedMotion) {
      hero.style.setProperty("--help-spread", "0");
      return;
    }


    var currentScrollY = window.scrollY || window.pageYOffset || 0;
    var isScrollingUp = currentScrollY < lastScrollY;


    var rect = hero.getBoundingClientRect();
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;


    var scrollableDistance = Math.max(1, rect.height - viewportHeight);
    var progress = clamp(Math.abs(rect.top) / scrollableDistance, 0, 1);


    var slowedProgress = clamp(progress * 0.46, 0, 0.46);
    var easedProgress = 1 - Math.pow(1 - slowedProgress, 3);


    hero.style.setProperty("--help-spread", easedProgress.toFixed(4));


    if (rect.bottom < viewportHeight * 0.38) {
      hasPassedHero = true;
    }


    if (
      hasPassedHero &&
      isScrollingUp &&
      rect.top < viewportHeight * 0.38 &&
      rect.bottom > viewportHeight * 0.58
    ) {
      hasPassedHero = false;
      animateTitleDrop();
    }


    lastScrollY = currentScrollY;
  }


  function onScroll() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateHeroScroll);
  }


  function boot() {
    animateTitleDrop();
    updateHeroScroll();
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }


  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateHeroScroll);


  window.addEventListener("pagehide", function () {
    clearTitleAnimationTimer();


    if (scrollFrame) {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = null;
    }
  });
})();


(function () {
  "use strict";


  var supportSection = document.querySelector("[data-help-support]");


  if (!supportSection) return;


  var supportObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          supportSection.classList.add("is-visible");
        } else {
          supportSection.classList.remove("is-visible");
        }
      });
    },
    {
      threshold: 0.22
    }
  );


  supportObserver.observe(supportSection);
})();
