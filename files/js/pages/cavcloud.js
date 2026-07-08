(function () {
  "use strict";

  function initCavCloudHero() {
    var hero = document.querySelector("[data-cavcloud-hero]");
    if (!hero) return;
    if (hero.dataset.cavcloudHeroBound === "true") return;

    hero.dataset.cavcloudHeroBound = "true";

    var folder = hero.querySelector("[data-cavcloud-folder]");
    var stack = hero.querySelector("[data-cavcloud-stack]");
    var status = hero.querySelector("[data-cavcloud-folder-status]");
    var total = hero.querySelector("[data-cavcloud-total]");
    var used = hero.querySelector("[data-cavcloud-used]");
    var trend = hero.querySelector("[data-cavcloud-trend]");
    var ring = hero.querySelector(".cavcloud-ring-fill");
    var lane = hero.querySelector("[data-cavcloud-lane]");
    var track = hero.querySelector("[data-cavcloud-track]");
    var files = Array.prototype.slice.call(
      hero.querySelectorAll("[data-cavcloud-file]")
    );

    if (!folder || !stack || !files.length) return;

    var added = new Map();
    var laneX = 0;
    var isLaneDragging = false;
    var laneStartX = 0;
    var laneStartTranslate = 0;
    var cardStep = 102;
    var originalCount = files.length;

    function getIcon(file) {
      var img = file.querySelector("img");
      return img ? img.getAttribute("src") : "";
    }

    function updateStats() {
      var count = added.size;
      var usedAmount = count === 0 ? "0 MB" : count * 1.5 + " MB";

      folder.classList.toggle("is-filled", count > 0);

      if (status) {
        status.textContent =
          count === 0
            ? "Move files into the folder."
            : count + (count === 1 ? " file added." : " files added.");
      }

      if (total) {
        total.textContent =
          count === 0
            ? "0 files added"
            : count + (count === 1 ? " file added" : " files added");
      }

      if (used) {
        used.textContent = usedAmount;
      }

      if (trend) {
        trend.textContent = usedAmount;
      }

      if (ring) {
        var offset = 340 - count * 34;
        ring.style.setProperty("--cavcloud-ring-offset", String(Math.max(184, offset)));
      }
    }

    function addFile(file) {
      var name = file.getAttribute("data-file-name") || "file";
      var kind = file.getAttribute("data-file-kind") || "FILE";

      if (added.has(name)) return;

      added.set(name, true);

      Array.prototype.slice.call(
        hero.querySelectorAll('[data-cavcloud-file][data-file-name="' + name + '"]')
      ).forEach(function (matchedFile) {
        matchedFile.classList.add("is-added");
        matchedFile.setAttribute("aria-disabled", "true");
      });

      var chip = document.createElement("span");
      chip.setAttribute("data-cavcloud-chip", name);

      var iconSrc = getIcon(file);

      if (iconSrc) {
        var icon = document.createElement("img");
        icon.src = iconSrc;
        icon.alt = "";
        icon.loading = "lazy";
        icon.decoding = "async";
        chip.appendChild(icon);
      }

      chip.appendChild(document.createTextNode(kind));
      stack.appendChild(chip);

      updateStats();
    }

    function bindFile(file) {
      file.addEventListener("dragstart", function (event) {
        var name = file.getAttribute("data-file-name") || "";

        if (file.classList.contains("is-added")) {
          event.preventDefault();
          return;
        }

        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", name);
        hero.dataset.cavcloudDragging = name;
      });

      file.addEventListener("dragend", function () {
        delete hero.dataset.cavcloudDragging;
      });

      file.addEventListener("click", function () {
        if (isLaneDragging) return;
        addFile(file);
      });
    }

    files.forEach(bindFile);

    if (track && files.length) {
      files.forEach(function (file) {
        var clone = file.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.dataset.cavcloudClone = "true";
        track.appendChild(clone);
        bindFile(clone);
      });

      function measureLane() {
        var first = track.querySelector("[data-cavcloud-file]");
        if (!first) return;

        var styles = window.getComputedStyle(track);
        var gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
        cardStep = first.getBoundingClientRect().width + gap;
      }

      function normalizeLane() {
        var groupWidth = cardStep * originalCount;
        if (!groupWidth) return;

        while (laneX <= -groupWidth) {
          laneX += groupWidth;
          laneStartTranslate += groupWidth;
        }

        while (laneX > 0) {
          laneX -= groupWidth;
          laneStartTranslate -= groupWidth;
        }
      }

      function applyLane() {
        normalizeLane();
        track.style.setProperty("--cavcloud-track-x", laneX.toFixed(2) + "px");
      }

      measureLane();
      applyLane();

      if (lane) {
        lane.addEventListener("pointerdown", function (event) {
          if (event.target.closest("[data-cavcloud-file]")) {
            return;
          }

          isLaneDragging = true;
          laneStartX = event.clientX || 0;
          laneStartTranslate = laneX;
          lane.classList.add("is-dragging");

          if (lane.setPointerCapture) {
            lane.setPointerCapture(event.pointerId);
          }
        });

        lane.addEventListener("pointermove", function (event) {
          if (!isLaneDragging) return;

          var delta = (event.clientX || 0) - laneStartX;
          laneX = laneStartTranslate + delta;
          applyLane();
        });

        function endLaneDrag(event) {
          if (!isLaneDragging) return;

          isLaneDragging = false;
          lane.classList.remove("is-dragging");

          if (lane.releasePointerCapture) {
            lane.releasePointerCapture(event.pointerId);
          }
        }

        lane.addEventListener("pointerup", endLaneDrag);
        lane.addEventListener("pointercancel", endLaneDrag);
        lane.addEventListener("lostpointercapture", endLaneDrag);

        lane.addEventListener(
          "wheel",
          function (event) {
            var delta =
              Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey
                ? event.deltaX || event.deltaY
                : event.deltaY;

            event.preventDefault();
            laneX -= delta;
            applyLane();
          },
          { passive: false }
        );
      }

      window.addEventListener("resize", function () {
        measureLane();
        applyLane();
      });
    }

    folder.addEventListener("dragover", function (event) {
      event.preventDefault();
      folder.classList.add("is-over");

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }
    });

    folder.addEventListener("dragleave", function (event) {
      if (folder.contains(event.relatedTarget)) return;
      folder.classList.remove("is-over");
    });

    folder.addEventListener("drop", function (event) {
      event.preventDefault();
      folder.classList.remove("is-over");

      var name =
        event.dataTransfer.getData("text/plain") ||
        hero.dataset.cavcloudDragging ||
        "";

      if (!name) return;

      var file = Array.prototype.slice.call(
        hero.querySelectorAll("[data-cavcloud-file]")
      ).find(function (item) {
        return item.getAttribute("data-file-name") === name;
      });

      if (!file) return;

      addFile(file);
    });

    updateStats();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCavCloudHero);
  } else {
    initCavCloudHero();
  }
})();
// CavBot Cloud storage & capacity — billing toggle + reversible scroll motion
(function () {
  function initCavCloudCapacity() {
    var section = document.querySelector("[data-cavcloud-capacity]");
    if (!section) return;

    if (section.dataset.cavcloudCapacityBound === "true") return;
    section.dataset.cavcloudCapacityBound = "true";

    var billingButtons = Array.prototype.slice.call(
      section.querySelectorAll("[data-cavcloud-billing-option]")
    );

    var planLinks = Array.prototype.slice.call(
      section.querySelectorAll("[data-cavcloud-plan-link]")
    );

    var billingNotes = Array.prototype.slice.call(
      section.querySelectorAll("[data-cavcloud-billing-note]")
    );

    var prices = Array.prototype.slice.call(
      section.querySelectorAll("[data-cavcloud-price]")
    );

    var pricePeriods = Array.prototype.slice.call(
      section.querySelectorAll("[data-cavcloud-price-period]")
    );

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function easeOutCubic(value) {
      return 1 - Math.pow(1 - value, 3);
    }

    function formatPrice(value) {
      var clean = String(value || "").trim();
      if (!clean) return "";
      return clean.charAt(0) === "$" ? clean : "$" + clean;
    }

    function setBilling(mode) {
      var safeMode = mode === "annual" ? "annual" : "monthly";

      section.dataset.cavcloudBilling = safeMode;

      billingButtons.forEach(function (button) {
        var isActive = button.getAttribute("data-cavcloud-billing-option") === safeMode;

        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      planLinks.forEach(function (link) {
        var href =
          safeMode === "annual"
            ? link.getAttribute("data-annual-href")
            : link.getAttribute("data-monthly-href");

        if (href) {
          link.setAttribute("href", href);
        }
      });

      billingNotes.forEach(function (note) {
        var text =
          safeMode === "annual"
            ? note.getAttribute("data-annual-note")
            : note.getAttribute("data-monthly-note");

        if (text) {
          note.textContent = text;
        }
      });

      prices.forEach(function (price) {
        var value =
          safeMode === "annual"
            ? price.getAttribute("data-annual-price")
            : price.getAttribute("data-monthly-price");

        if (value) {
          price.textContent = formatPrice(value);
        }
      });

      pricePeriods.forEach(function (period) {
        var value =
          safeMode === "annual"
            ? period.getAttribute("data-annual-period")
            : period.getAttribute("data-monthly-period");

        if (value) {
          period.textContent = value;
        }
      });
    }

    billingButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var mode = button.getAttribute("data-cavcloud-billing-option");
        setBilling(mode);
      });
    });

    function setReadyState() {
      section.style.setProperty("--ccp-header-y", "0px");
      section.style.setProperty("--ccp-header-opacity", "1");
      section.style.setProperty("--ccp-left-x", "0px");
      section.style.setProperty("--ccp-center-y", "0px");
      section.style.setProperty("--ccp-right-x", "0px");
      section.style.setProperty("--ccp-card-y", "0px");
      section.style.setProperty("--ccp-card-opacity", "1");
    }

    function updateCapacityMotion() {
      if (prefersReduced) {
        setReadyState();
        return;
      }

      var rect = section.getBoundingClientRect();
      var viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;

      var start = viewportHeight * 0.94;
      var end = viewportHeight * 0.26;

      var rawProgress = (start - rect.top) / (start - end);
      var progress = clamp(rawProgress, 0, 1);
      var eased = easeOutCubic(progress);

      var headerY = 34 - eased * 34;
      var headerOpacity = 0.18 + eased * 0.82;

      var cardY = 28 - eased * 28;
      var cardOpacity = 0.22 + eased * 0.78;

      var leftX = -72 + eased * 72;
      var rightX = 72 - eased * 72;
      var centerY = 22 - eased * 22;

      section.style.setProperty("--ccp-header-y", headerY.toFixed(2) + "px");
      section.style.setProperty("--ccp-header-opacity", headerOpacity.toFixed(4));
      section.style.setProperty("--ccp-left-x", leftX.toFixed(2) + "px");
      section.style.setProperty("--ccp-center-y", centerY.toFixed(2) + "px");
      section.style.setProperty("--ccp-right-x", rightX.toFixed(2) + "px");
      section.style.setProperty("--ccp-card-y", cardY.toFixed(2) + "px");
      section.style.setProperty("--ccp-card-opacity", cardOpacity.toFixed(4));
    }

    var ticking = false;

    function requestUpdate() {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(function () {
        updateCapacityMotion();
        ticking = false;
      });
    }

    setBilling("monthly");

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("pageshow", requestUpdate);
    window.addEventListener("load", requestUpdate);

    requestUpdate();
    setTimeout(requestUpdate, 80);
    setTimeout(requestUpdate, 260);
    setTimeout(requestUpdate, 700);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCavCloudCapacity);
  } else {
    initCavCloudCapacity();
  }
})();


// CavBot Cloud support + final CTA — scroll motion and icon animation
(function () {
  function initCavCloudSupportSeal() {
    var support = document.querySelector("[data-cavcloud-support]");
    var finalCta = document.querySelector("[data-cavcloud-final]");

    if (!support && !finalCta) return;

    if (support && support.dataset.cavcloudSupportBound === "true") return;
    if (support) support.dataset.cavcloudSupportBound = "true";

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function easeOutCubic(value) {
      return 1 - Math.pow(1 - value, 3);
    }

    function updateSupportMotion() {
      if (!support) return;

      if (prefersReduced) {
        support.style.setProperty("--ccs-header-y", "0px");
        support.style.setProperty("--ccs-card-y", "0px");
        support.style.setProperty("--ccs-opacity", "1");
        support.classList.add("is-visible");
        return;
      }

      var rect = support.getBoundingClientRect();
      var viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;

      var start = viewportHeight * 0.92;
      var end = viewportHeight * 0.22;
      var rawProgress = (start - rect.top) / (start - end);
      var progress = clamp(rawProgress, 0, 1);
      var eased = easeOutCubic(progress);

      var headerY = 34 - eased * 34;
      var cardY = 38 - eased * 38;
      var opacity = 0.18 + eased * 0.82;

      support.style.setProperty("--ccs-header-y", headerY.toFixed(2) + "px");
      support.style.setProperty("--ccs-card-y", cardY.toFixed(2) + "px");
      support.style.setProperty("--ccs-opacity", opacity.toFixed(4));

      if (progress > 0.12) {
        support.classList.add("is-visible");
      } else {
        support.classList.remove("is-visible");
      }
    }

    function updateFinalMotion() {
      if (!finalCta) return;

      if (prefersReduced) {
        finalCta.style.setProperty("--ccf-y", "0px");
        finalCta.style.setProperty("--ccf-opacity", "1");
        return;
      }

      var rect = finalCta.getBoundingClientRect();
      var viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;

      var start = viewportHeight * 0.94;
      var end = viewportHeight * 0.34;
      var rawProgress = (start - rect.top) / (start - end);
      var progress = clamp(rawProgress, 0, 1);
      var eased = easeOutCubic(progress);

      var y = 34 - eased * 34;
      var opacity = 0.18 + eased * 0.82;

      finalCta.style.setProperty("--ccf-y", y.toFixed(2) + "px");
      finalCta.style.setProperty("--ccf-opacity", opacity.toFixed(4));
    }

    var ticking = false;

    function requestUpdate() {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(function () {
        updateSupportMotion();
        updateFinalMotion();
        ticking = false;
      });
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("pageshow", requestUpdate);
    window.addEventListener("load", requestUpdate);

    requestUpdate();
    setTimeout(requestUpdate, 80);
    setTimeout(requestUpdate, 260);
    setTimeout(requestUpdate, 700);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCavCloudSupportSeal);
  } else {
    initCavCloudSupportSeal();
  }
})();
