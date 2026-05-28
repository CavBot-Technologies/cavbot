(function () {
 "use strict";

 function qs(selector, root) {
   return (root || document).querySelector(selector);
 }

 function qsa(selector, root) {
   return Array.prototype.slice.call((root || document).querySelectorAll(selector));
 }

 function initBlogSearch() {
   var root = qs(".blog-main");
   if (!root) return;

   var input = qs(".blog-search-input", root);
   var note = qs(".blog-search-note", root);
   var items = qsa("[data-blog-item]", root);

   if (!input || !note || !items.length) return;

   input.addEventListener("input", function () {
     var query = input.value.trim().toLowerCase();
     var visibleCount = 0;

     items.forEach(function (item) {
       var value = (
         (item.getAttribute("data-blog-search") || "") +
         " " +
         (item.textContent || "")
       ).toLowerCase();

       var isVisible = !query || value.indexOf(query) !== -1;

       item.classList.toggle("blog-card-hidden", !isVisible);

       if (isVisible) {
         visibleCount += 1;
       }
     });

     if (!query) {
       note.style.display = "none";
       note.textContent = "";
       return;
     }

     note.style.display = "block";
     note.textContent =
       visibleCount === 1
         ? "1 article matches your search."
         : visibleCount + " articles match your search.";
   });
 }

 function initRightColumnScroll() {
   var root = qs(".blog-main");
   if (!root) return;

   var feature = qs("[data-blog-feature]", root);
   var scroller = qs("[data-blog-scroll]", root);

   if (!feature || !scroller) return;

   var desktopQuery = window.matchMedia("(min-width: 1121px)");

   function maxScroll() {
     return Math.max(0, scroller.scrollHeight - scroller.clientHeight);
   }

   function featureActive() {
     if (!desktopQuery.matches) return false;

     var rect = feature.getBoundingClientRect();
     var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;

     return rect.top <= 24 && rect.bottom >= Math.min(viewportHeight * 0.66, viewportHeight - 24);
   }

   function canScrollInside(deltaY) {
     var limit = maxScroll();

     if (limit <= 0) return false;

     if (deltaY > 0) {
       return scroller.scrollTop < limit - 1;
     }

     if (deltaY < 0) {
       return scroller.scrollTop > 1;
     }

     return false;
   }

   window.addEventListener(
     "wheel",
     function (event) {
       if (!featureActive()) return;

       if (canScrollInside(event.deltaY)) {
         event.preventDefault();
         scroller.scrollTop += event.deltaY;
       }
     },
     { passive: false }
   );

   scroller.setAttribute("tabindex", "0");

   scroller.addEventListener("keydown", function (event) {
     var delta = 0;
     var pageStep = Math.max(240, scroller.clientHeight * 0.72);

     if (event.key === "ArrowDown") delta = 78;
     if (event.key === "ArrowUp") delta = -78;
     if (event.key === "PageDown") delta = pageStep;
     if (event.key === "PageUp") delta = -pageStep;

     if (!delta) return;
     if (!canScrollInside(delta)) return;

     event.preventDefault();
     scroller.scrollTop += delta;
   });
 }

 function init() {
   initBlogSearch();
   initRightColumnScroll();
 }

 if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", init);
 } else {
   init();
 }
})();
(function () {
  "use strict";

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initBlogFilters() {
    var root = qs(".blog-main");
    if (!root) return;

    var input = qs(".blog-search-input", root);
    var note = qs(".blog-search-note", root);
    var buttons = qsa("[data-blog-filter]", root);
    var allItems = qsa("[data-blog-item]", root);
    var libraryCards = qsa("[data-blog-library-card]", root);
    var empty = qs("[data-blog-empty]", root);

    if (!allItems.length) return;

    var activeCategory = "all";

    function hasCategory(value) {
      var category = normalize(value);

      return buttons.some(function (button) {
        return normalize(button.getAttribute("data-blog-filter")) === category;
      });
    }

    function categoryFromUrl() {
      var params = new URLSearchParams(window.location.search || "");
      var requested = normalize(params.get("category") || params.get("filter"));
      var hash = normalize((window.location.hash || "").replace(/^#/, ""));

      if (hasCategory(requested)) return requested;
      if (hasCategory(hash)) return hash;

      return "all";
    }

    function cardMatchesSearch(item, query) {
      if (!query) return true;

      var value = normalize(
        (item.getAttribute("data-blog-search") || "") +
          " " +
          (item.textContent || "")
      );

      return value.indexOf(query) !== -1;
    }

    function cardMatchesCategory(item) {
      if (!item.hasAttribute("data-blog-library-card")) return true;
      if (activeCategory === "all") return true;

      return normalize(item.getAttribute("data-blog-category")) === activeCategory;
    }

    function applyFilters() {
      var query = input ? normalize(input.value) : "";
      var visibleTotal = 0;
      var visibleLibrary = 0;

      allItems.forEach(function (item) {
        var visible = cardMatchesSearch(item, query) && cardMatchesCategory(item);

        item.classList.toggle("blog-card-hidden", !visible);

        if (visible) visibleTotal += 1;
        if (visible && item.hasAttribute("data-blog-library-card")) visibleLibrary += 1;
      });

      if (note) {
        if (!query) {
          note.style.display = "none";
          note.textContent = "";
        } else {
          note.style.display = "block";
          note.textContent =
            visibleTotal === 1
              ? "1 article matches your search."
              : visibleTotal + " articles match your search.";
        }
      }

      if (empty) {
        empty.hidden = visibleLibrary !== 0 || !libraryCards.length;
      }
    }

    function setActiveCategory(category) {
      activeCategory = hasCategory(category) ? normalize(category) : "all";

      buttons.forEach(function (item) {
        var isActive = normalize(item.getAttribute("data-blog-filter")) === activeCategory;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        setActiveCategory(button.getAttribute("data-blog-filter"));
        applyFilters();
      });
    });

    if (input) {
      input.addEventListener("input", applyFilters);
    }

    setActiveCategory(categoryFromUrl());
    applyFilters();
  }

  function initRightColumnScroll() {
    var root = qs(".blog-main");
    if (!root) return;

    var feature = qs("[data-blog-feature]", root);
    var scroller = qs("[data-blog-scroll]", root);

    if (!feature || !scroller) return;

    var desktopQuery = window.matchMedia("(min-width: 1121px)");

    function maxScroll() {
      return Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    }

    function featureActive() {
      if (!desktopQuery.matches) return false;

      var rect = feature.getBoundingClientRect();
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;

      return rect.top <= 24 && rect.bottom >= Math.min(viewportHeight * 0.66, viewportHeight - 24);
    }

    function canScrollInside(deltaY) {
      var limit = maxScroll();

      if (limit <= 0) return false;

      if (deltaY > 0) {
        return scroller.scrollTop < limit - 1;
      }

      if (deltaY < 0) {
        return scroller.scrollTop > 1;
      }

      return false;
    }

    window.addEventListener(
      "wheel",
      function (event) {
        if (!featureActive()) return;

        if (canScrollInside(event.deltaY)) {
          event.preventDefault();
          scroller.scrollTop += event.deltaY;
        }
      },
      { passive: false }
    );

    scroller.setAttribute("tabindex", "0");

    scroller.addEventListener("keydown", function (event) {
      var delta = 0;
      var pageStep = Math.max(240, scroller.clientHeight * 0.72);

      if (event.key === "ArrowDown") delta = 78;
      if (event.key === "ArrowUp") delta = -78;
      if (event.key === "PageDown") delta = pageStep;
      if (event.key === "PageUp") delta = -pageStep;

      if (!delta) return;
      if (!canScrollInside(delta)) return;

      event.preventDefault();
      scroller.scrollTop += delta;
    });
  }

  function init() {
    initBlogFilters();
    initRightColumnScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
(function () {
  "use strict";

  function initBlogClosingCtas() {
    var buttons = Array.prototype.slice.call(
      document.querySelectorAll("[data-blog-closing-cta]")
    );

    if (!buttons.length) return;

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var action = button.getAttribute("data-blog-closing-cta") || "unknown";

        if (
          window.cavbotAnalytics &&
          typeof window.cavbotAnalytics.track === "function"
        ) {
          window.cavbotAnalytics.track("blog_closing_cta_click", {
            action: action,
            component: "blog-closing-section"
          });
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBlogClosingCtas);
  } else {
    initBlogClosingCtas();
  }
})();

(function () {
  "use strict";


  function initCavenBlogTracking() {
    var cards = Array.prototype.slice.call(
      document.querySelectorAll('[data-blog-card="caven"]')
    );


    if (!cards.length) return;


    cards.forEach(function (card) {
      if (card.getAttribute("data-caven-tracking-bound") === "1") return;


      card.setAttribute("data-caven-tracking-bound", "1");


      card.addEventListener("click", function () {
        if (
          window.cavbotAnalytics &&
          typeof window.cavbotAnalytics.track === "function"
        ) {
          window.cavbotAnalytics.track("blog_caven_card_click", {
            article: "introducing-caven",
            category: "company",
            component: "blog-index"
          });
        }
      });
    });
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCavenBlogTracking);
  } else {
    initCavenBlogTracking();
  }
})();

