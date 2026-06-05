(function () {
  "use strict";


  var hero = document.querySelector("[data-team-hero]");
  if (!hero) return;


  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  if (prefersReduced) return;


  window.requestAnimationFrame(function () {
    hero.classList.add("is-ready");
  });
})();

(function () {
  "use strict";


  var section = document.querySelector("[data-team-founder-section]");
  if (!section) return;


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
})();

(function () {
  "use strict";


  var section = document.querySelector("[data-team-values-section]");
  if (!section) return;


  var items = Array.prototype.slice.call(
    section.querySelectorAll("[data-team-values-item]")
  );


  if (!items.length) return;


  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  var activeIndex = 0;
  var raf = null;
  var start = 0;
  var stepMs = 3600;
  var totalMs = stepMs * items.length;
  var hasUserClicked = false;


  function setActive(index) {
    activeIndex = ((index % items.length) + items.length) % items.length;


    items.forEach(function (item, itemIndex) {
      var isActive = itemIndex === activeIndex;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-expanded", isActive ? "true" : "false");
    });
  }


  function setProgress(value) {
    var safeValue = Math.max(0, Math.min(1, value));
    section.style.setProperty("--team-values-progress", safeValue * 100 + "%");
  }


  function stopLoop() {
    if (!raf) return;
    window.cancelAnimationFrame(raf);
    raf = null;
  }


  function tick(now) {
    var elapsed = (now - start) % totalMs;
    var progress = elapsed / totalMs;
    var nextIndex = Math.min(items.length - 1, Math.floor(progress * items.length));


    setProgress(progress);


    if (nextIndex !== activeIndex) {
      setActive(nextIndex);
    }


    raf = window.requestAnimationFrame(tick);
  }


  function startLoop(offsetIndex) {
    if (prefersReduced) {
      setProgress(1);
      setActive(activeIndex);
      return;
    }


    stopLoop();


    var index = Number.isFinite(offsetIndex) ? offsetIndex : activeIndex;
    start = performance.now() - (index / items.length) * totalMs;
    raf = window.requestAnimationFrame(tick);
  }


  function showSection() {
    section.classList.add("is-visible");
    startLoop(activeIndex);
  }


  items.forEach(function (item, index) {
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-expanded", index === 0 ? "true" : "false");


    item.addEventListener("click", function () {
      hasUserClicked = true;
      setActive(index);
      setProgress(index / items.length);
      startLoop(index);
    });


    item.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      hasUserClicked = true;
      setActive(index);
      setProgress(index / items.length);
      startLoop(index);
    });
  });


  setActive(0);
  setProgress(0);


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
          stopLoop();
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px"
    }
  );


  observer.observe(section);
})();

(function () {
  "use strict";


  var section = document.querySelector("[data-team-final]");
  if (!section) return;


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
        observer.unobserve(section);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px"
    }
  );


  observer.observe(section);
})();
