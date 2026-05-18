(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }


  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }


  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }


  function initAboutBadge() {
    var body = document.body;
    if (!body) return;


    body.removeAttribute("data-cavbot-disable-floating-badge");


    var fallback = qs("[data-about-cavbot-fallback-badge]");


    function findSdkBadge() {
      var selectors = [
        "[data-cavbot-badge]",
        "[data-cavbot-badge-root]",
        ".cavbot-badge",
        ".cavbot-badge-inline",
        ".cavbot-floating-badge",
        ".cb-floating-badge",
        ".cavai-badge",
        ".cavai-floating-badge"
      ];


      for (var i = 0; i < selectors.length; i += 1) {
        var node = qs(selectors[i]);
        if (node && node !== fallback) return node;
      }


      return null;
    }


    function positionBadge(node) {
      if (!node) return;


      node.style.position = "fixed";
      node.style.right = "max(24px, env(safe-area-inset-right))";
      node.style.bottom = "max(24px, env(safe-area-inset-bottom))";
      node.style.zIndex = "2147483000";
      node.style.visibility = "visible";
      node.style.opacity = "1";
      node.style.pointerEvents = "auto";
    }


    function syncBadge() {
      var sdkBadge = findSdkBadge();


      if (sdkBadge) {
        positionBadge(sdkBadge);


        if (fallback) {
          fallback.setAttribute("hidden", "");
          fallback.style.display = "none";
        }


        return;
      }


      if (fallback) {
        fallback.removeAttribute("hidden");
        fallback.style.display = "inline-flex";
        positionBadge(fallback);
      }
    }


    syncBadge();


    window.setTimeout(syncBadge, 150);
    window.setTimeout(syncBadge, 500);
    window.setTimeout(syncBadge, 1200);
    window.setTimeout(syncBadge, 2500);


    if ("MutationObserver" in window) {
      var observer = new MutationObserver(syncBadge);


      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style", "hidden", "aria-hidden"]
      });
    }


    window.addEventListener("pageshow", syncBadge);
    window.addEventListener("resize", syncBadge);
  }


  function initAboutCleanups() {
    qsa(".mission-dash, .mission-dash-one, .mission-dash-two, .mission-dash-three").forEach(function (node) {
      node.remove();
    });
  }


  function initRotatingWords() {
    var nodes = qsa("[data-about-rotating-word]");
    if (!nodes.length) return;


    nodes.forEach(function (node) {
      var rawWords = node.getAttribute("data-words") || "guides,drives,pushes";
      var words = rawWords
        .split(",")
        .map(function (word) {
          return word.trim();
        })
        .filter(Boolean);


      if (words.length < 2) return;


      var index = 0;


      window.setInterval(function () {
        node.classList.add("is-switching");


        window.setTimeout(function () {
          index = (index + 1) % words.length;
          node.textContent = words[index];
          node.classList.remove("is-switching");
        }, 260);
      }, 1550);
    });
  }


  function initAboutScrollAnimations() {
    var company = qs("[data-about-company-section]");
    var vision = qs("[data-about-vision-section]");
    var belief = qs("[data-about-belief-section]");


    var reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    if (reduceMotion) {
      if (company) {
        company.style.setProperty("--about-company-title-x", "0px");
        company.style.setProperty("--about-company-story-x", "0px");
        company.style.setProperty("--about-company-media-x", "0px");
        company.style.setProperty("--about-company-piece-y", "0px");
        company.style.setProperty("--about-company-piece-opacity", "1");
      }


      if (vision) {
        vision.style.setProperty("--about-vision-y", "0px");
        vision.style.setProperty("--about-vision-opacity", "1");
      }


      if (belief) {
        belief.style.setProperty("--about-belief-y", "0px");
        belief.style.setProperty("--about-belief-opacity", "1");
      }


      return;
    }


    var ticking = false;
    var lastScrollY = window.scrollY || window.pageYOffset || 0;
    var direction = "down";


    function progressFor(section, multiplier) {
      var rect = section.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight || 1;


      return clamp((vh - rect.top) / (vh * multiplier), 0, 1);
    }


    function updateCompany() {
  if (!company) return;


  var progress = progressFor(company, 0.78);


  /*
    Directionless scroll animation:
    - scrolling down: title/story move right into place
    - scrolling up: title/story move left out of place
    - media moves opposite so both sides meet smoothly
    - no jumping because the side never flips suddenly
  */
  var titleX = (1 - progress) * -64;
  var storyX = (1 - progress) * -44;
  var mediaX = (1 - progress) * 44;


  var y = (1 - progress) * 24;
  var opacity = 0.42 + progress * 0.58;


  company.style.setProperty("--about-company-title-x", titleX.toFixed(2) + "px");
  company.style.setProperty("--about-company-story-x", storyX.toFixed(2) + "px");
  company.style.setProperty("--about-company-media-x", mediaX.toFixed(2) + "px");
  company.style.setProperty("--about-company-piece-y", y.toFixed(2) + "px");
  company.style.setProperty("--about-company-piece-opacity", opacity.toFixed(3));
}





    function updateVision() {
      if (!vision) return;


      var progress = progressFor(vision, 0.84);
      var y = (1 - progress) * 44;
      var opacity = 0.42 + progress * 0.58;


      vision.style.setProperty("--about-vision-y", y.toFixed(2) + "px");
      vision.style.setProperty("--about-vision-opacity", opacity.toFixed(3));
    }


    function updateBelief() {
  if (!belief) return;


  var rect = belief.getBoundingClientRect();
  var vh = window.innerHeight || document.documentElement.clientHeight || 1;


  /*
    Smooth scroll motion:
    - no hard direction jump
    - soft easing
    - subtle push instead of rough movement
  */
  var progress = clamp((vh - rect.top) / (vh * 0.9), 0, 1);
  var exit = clamp((0 - rect.top) / (vh * 1.15), 0, 1);


  var eased = progress * progress * (3 - 2 * progress);


  var y = ((1 - eased) * 42) - (exit * 16);
  var opacity = 0.52 + (eased * 0.48);


  belief.style.setProperty("--about-belief-y", y.toFixed(2) + "px");
  belief.style.setProperty("--about-belief-opacity", opacity.toFixed(3));
}



    function update() {
      ticking = false;


      var currentScrollY = window.scrollY || window.pageYOffset || 0;
      direction = currentScrollY >= lastScrollY ? "down" : "up";
      lastScrollY = currentScrollY;


      updateCompany();
      updateVision();
      updateBelief();
    }


    function requestUpdate() {
      if (ticking) return;


      ticking = true;
      window.requestAnimationFrame(update);
    }


    update();


    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("pageshow", requestUpdate);
  }


  function init() {
    initAboutCleanups();
    initAboutBadge();
    initRotatingWords();
    initAboutScrollAnimations();
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
