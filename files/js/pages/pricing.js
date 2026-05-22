(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }


    callback();
  }


  ready(function () {
    var page = document.querySelector("[data-pricing-page]");
    if (!page) return;


    var toggle = page.querySelector("[data-pricing-toggle]");
    var billingButtons = Array.prototype.slice.call(
      page.querySelectorAll("[data-pricing-billing-choice]")
    );
    var prices = Array.prototype.slice.call(page.querySelectorAll("[data-price-plan]"));
    var notes = Array.prototype.slice.call(page.querySelectorAll("[data-price-note]"));
    var links = Array.prototype.slice.call(page.querySelectorAll("[data-price-href]"));
    var featureToggles = Array.prototype.slice.call(
      page.querySelectorAll("[data-pricing-feature-toggle]")
    );


    function getInitialBilling() {
      var params = new URLSearchParams(window.location.search);
      return params.get("billing") === "annual" ? "annual" : "monthly";
    }


    function updateUrl(billing) {
      if (!window.history || !window.history.replaceState) return;


      var url = new URL(window.location.href);
      url.searchParams.set("billing", billing);
      window.history.replaceState(null, "", url.toString());
    }


    function formatPrice(value) {
      var clean = String(value || "").trim();
      if (!clean) return "";
      if (clean.charAt(0) === "$") return clean;
      return "$" + clean;
    }


    function setBilling(billing, shouldUpdateUrl) {
      var safeBilling = billing === "annual" ? "annual" : "monthly";
      var isAnnual = safeBilling === "annual";
      var priceAttr = isAnnual ? "data-annual" : "data-monthly";


      if (toggle) {
        toggle.setAttribute("aria-checked", isAnnual ? "true" : "false");
      }


      billingButtons.forEach(function (button) {
        var active = button.getAttribute("data-pricing-billing-choice") === safeBilling;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });


      prices.forEach(function (price) {
        var value = price.getAttribute(priceAttr);
        if (value) price.textContent = formatPrice(value);
      });


      notes.forEach(function (note) {
        var value = note.getAttribute(priceAttr);
        if (value) note.textContent = value;
      });


      links.forEach(function (link) {
        var plan = link.getAttribute("data-price-href");
        if (!plan) return;


        link.setAttribute(
          "href",
          "https://app.cavbot.io/settings/upgrade?plan=" +
            encodeURIComponent(plan) +
            "&billing=" +
            encodeURIComponent(safeBilling)
        );
      });


      if (shouldUpdateUrl) updateUrl(safeBilling);
    }


    if (toggle) {
      toggle.addEventListener("click", function () {
        var current = toggle.getAttribute("aria-checked") === "true" ? "annual" : "monthly";
        var next = current === "annual" ? "monthly" : "annual";
        setBilling(next, true);
      });
    }


    billingButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var billing = button.getAttribute("data-pricing-billing-choice");
        setBilling(billing, true);
      });
    });


    featureToggles.forEach(function (button) {
      button.addEventListener("click", function () {
        var panel = button.closest(".pricing-card-pricing-included");
        if (!panel) return;


        var collapsed = panel.classList.toggle("is-collapsed");
        button.setAttribute("aria-expanded", collapsed ? "false" : "true");
      });
    });


    setBilling(getInitialBilling(), false);
  });
})();
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }


    callback();
  }


  ready(function () {
    var section = document.querySelector("[data-pricing-platforms]");
    if (!section) return;


    var title = section.querySelector("[data-platforms-title]");
    var cards = Array.prototype.slice.call(
      section.querySelectorAll(".pricing-platform-card")
    );


    if (title && !title.getAttribute("data-title-split")) {
      var text = title.textContent || "";
      var html = "";
      var index = 0;


      for (var i = 0; i < text.length; i += 1) {
        var char = text.charAt(i);


        if (char === " ") {
          html += '<span class="pricing-platforms-space"> </span>';
          continue;
        }


        html +=
          '<span class="pricing-platforms-letter" style="--letter-index:' +
          index +
          '">' +
          char +
          "</span>";


        index += 1;
      }


      title.innerHTML = html;
      title.setAttribute("data-title-split", "true");
    }


    cards.forEach(function (card, index) {
      card.style.setProperty("--platform-index", index);
    });


    var observer = null;


    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              section.classList.add("is-visible");
              observer.unobserve(section);
            }
          });
        },
        {
          threshold: 0.22
        }
      );


      observer.observe(section);
    } else {
      section.classList.add("is-visible");
    }


    var lastY = window.scrollY || window.pageYOffset || 0;
    var ticking = false;


    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }


    function updateScrollMotion() {
      var currentY = window.scrollY || window.pageYOffset || 0;
      var rect = section.getBoundingClientRect();
      var viewport = window.innerHeight || document.documentElement.clientHeight || 1;
      var total = viewport + rect.height;
      var progress = clamp((viewport - rect.top) / total, 0, 1);
      var direction = currentY > lastY ? "down" : "up";


      section.setAttribute("data-scroll-dir", direction);
      section.style.setProperty("--platform-shift", progress.toFixed(4));


      lastY = currentY;
      ticking = false;
    }


    function requestScrollMotion() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateScrollMotion);
    }


    updateScrollMotion();


    window.addEventListener("scroll", requestScrollMotion, { passive: true });
    window.addEventListener("resize", requestScrollMotion);
  });
})();
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }


    callback();
  }


  ready(function () {
    var section = document.querySelector("[data-pricing-compare]");
    if (!section) return;


    var animatedItems = Array.prototype.slice.call(
      section.querySelectorAll(".pricing-compare-row, .pricing-compare-group")
    );


    animatedItems.forEach(function (item, index) {
      item.style.setProperty("--compare-row-index", index);
    });


    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              section.classList.add("is-visible");
              observer.unobserve(section);
            }
          });
        },
        {
          threshold: 0.12
        }
      );


      observer.observe(section);
    } else {
      section.classList.add("is-visible");
    }
  });
})();


(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }


    callback();
  }


  ready(function () {
    var section = document.querySelector("[data-pricing-faq]");
    if (!section) return;


    var items = Array.prototype.slice.call(
      section.querySelectorAll(".pricing-faq-item")
    );


    items.forEach(function (item, index) {
      item.style.setProperty("--faq-index", index);


      var button = item.querySelector(".pricing-faq-question");
      if (!button) return;


      button.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");


        items.forEach(function (otherItem) {
          var otherButton = otherItem.querySelector(".pricing-faq-question");
          otherItem.classList.remove("is-open");
          if (otherButton) otherButton.setAttribute("aria-expanded", "false");
        });


        if (!isOpen) {
          item.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
        }
      });
    });


    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              section.classList.add("is-visible");
              observer.unobserve(section);
            }
          });
        },
        {
          threshold: 0.18
        }
      );


      observer.observe(section);
    } else {
      section.classList.add("is-visible");
    }
  });
})();
