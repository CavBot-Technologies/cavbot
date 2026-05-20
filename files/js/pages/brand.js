(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }


  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }


  function setNavGroupOpen(group, isOpen) {
    if (!group) return;


    var toggle = qs("[data-brand-nav-toggle]", group);
    var panel = qs(".brand-nav-sub", group);


    group.classList.toggle("is-open", isOpen);


    if (toggle) {
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }


    if (!panel) return;


    if (isOpen) {
      panel.removeAttribute("hidden");
      panel.style.display = "grid";
    } else {
      panel.setAttribute("hidden", "");
      panel.style.display = "none";
    }
  }


  function initBrandBadge() {
    var body = document.body;
    var assetOrigin = "https://cdn.cavbot.io";
    var snippetUrls = [
      assetOrigin + "/sdk/badge-snippet",
      assetOrigin + "/sdk/badge-snippet.html"
    ];


    if (!body) return;


    body.removeAttribute("data-cavbot-disable-floating-badge");


    function ensureBadgeCss() {
      var href = assetOrigin + "/sdk/ui/v1/cavbot-badge-inline.css";


      if (qs('link[href="' + href + '"]')) return;


      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }


    function ensureFloatingBadgeHost() {
      var host = qs("[data-brand-floating-badge]");


      if (host) return host;


      host = document.createElement("div");
      host.className = "brand-floating-cdn-badge";
      host.setAttribute("data-brand-floating-badge", "");
      host.setAttribute("data-cavbot-cdn-floating-badge", "1");
      host.setAttribute("data-cavbot-cdn-slot", "badge");
      host.setAttribute("aria-hidden", "true");
      body.appendChild(host);


      return host;
    }


    function mountBadgeFromHtml(host, html) {
      if (!host || !html) return false;


      host.innerHTML = html;
      host.setAttribute("data-cavbot-cdn-ready", "1");
      return true;
    }


    function fetchBadgeSnippet(host, index) {
      if (!host || host.getAttribute("data-cavbot-cdn-ready") === "1") return;
      if (index >= snippetUrls.length) return;


      window.fetch(snippetUrls[index], { credentials: "omit" })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Badge snippet failed");
          }


          return response.text();
        })
        .then(function (html) {
          if (!mountBadgeFromHtml(host, html)) {
            throw new Error("Badge snippet empty");
          }
        })
        .catch(function () {
          fetchBadgeSnippet(host, index + 1);
        });
    }


    function initBadgeTracking(host) {
      var pupilSelector = ".cavbot-eye-pupil, .cavbot-dm-eye-pupil";
      var started = false;
      var rafId = 0;
      var lastMoveTs = 0;
      var pointer = {
        x: Math.max(window.innerWidth / 2, 0),
        y: Math.max(window.innerHeight / 2, 0)
      };


      function normalizeVector(dx, dy) {
        var mag = Math.hypot(dx, dy) || 1;


        return {
          x: dx / mag,
          y: dy / mag,
          mag: mag
        };
      }


      function applyPupilTracking(now) {
        var pupils = qsa(pupilSelector, host);
        var idle = now - lastMoveTs > 1200;
        var idleX = idle ? Math.sin(now / 920) * 0.42 : 0;
        var idleY = idle ? Math.cos(now / 780) * 0.34 : 0;


        pupils.forEach(function (pupil) {
          var eye = pupil.closest(".cavbot-eye, .cavbot-dm-eye");
          var box = (eye || pupil).getBoundingClientRect();


          if (!box.width || !box.height) return;


          var cx = box.left + box.width * 0.5;
          var cy = box.top + box.height * 0.5;
          var vector = normalizeVector(pointer.x - cx, pointer.y - cy);
          var maxShift = Math.min(4.8, Math.max(2.4, box.width * 0.12));
          var distFactor = Math.min(1, vector.mag / 180);
          var shiftX = vector.x * maxShift * distFactor + idleX;
          var shiftY = vector.y * maxShift * distFactor + idleY;


          pupil.style.transform = "translate3d(" + shiftX.toFixed(2) + "px, " + shiftY.toFixed(2) + "px, 0)";
        });
      }


      function applyBadgeTracking(now) {
        var box = host.getBoundingClientRect();


        if (!box.width || !box.height) return;


        var idle = now - lastMoveTs > 1200;
        var idlePitch = idle ? Math.cos(now / 1300) * 0.75 : 0;
        var idleYaw = idle ? Math.sin(now / 1400) * 0.85 : 0;
        var cx = box.left + box.width * 0.5;
        var cy = box.top + box.height * 0.5;
        var vector = normalizeVector(pointer.x - cx, pointer.y - cy);
        var distFactor = Math.min(1, vector.mag / 260);
        var tx = vector.x * 2.2 * distFactor;
        var ty = vector.y * 2.2 * distFactor;
        var yaw = vector.x * 6.8 * distFactor + idleYaw;
        var pitch = -vector.y * 6.8 * 0.75 * distFactor + idlePitch;


        host.style.transform =
          "translate3d(" + tx.toFixed(2) + "px, " + ty.toFixed(2) + "px, 0) " +
          "rotateX(" + pitch.toFixed(2) + "deg) rotateY(" + yaw.toFixed(2) + "deg)";
        host.style.transformStyle = "preserve-3d";
        host.style.willChange = "transform";
      }


      function render(ts) {
        var now = Number(ts || performance.now());


        applyPupilTracking(now);
        applyBadgeTracking(now);
        rafId = window.requestAnimationFrame(render);
      }


      function markPointer(x, y) {
        pointer.x = x;
        pointer.y = y;
        lastMoveTs = performance.now();
      }


      function start() {
        if (started) return;


        started = true;
        lastMoveTs = performance.now();


        document.addEventListener("pointermove", function (event) {
          markPointer(event.clientX, event.clientY);
        }, { passive: true });


        document.addEventListener("touchmove", function (event) {
          var touch = event.touches && event.touches[0];


          if (!touch) return;


          markPointer(touch.clientX, touch.clientY);
        }, { passive: true });


        window.addEventListener("resize", function () {
          if (performance.now() - lastMoveTs > 1500) {
            markPointer(Math.max(window.innerWidth / 2, 0), Math.max(window.innerHeight / 2, 0));
          }
        });


        if (!rafId) {
          rafId = window.requestAnimationFrame(render);
        }
      }


      start();
    }


    ensureBadgeCss();


    var host = ensureFloatingBadgeHost();


    if (typeof window.__cavbotMountCdnSlot === "function") {
      Promise.resolve(window.__cavbotMountCdnSlot(host))
        .then(function () {
          initBadgeTracking(host);
        })
        .catch(function () {
          fetchBadgeSnippet(host, 0);
          initBadgeTracking(host);
        });
    } else {
      fetchBadgeSnippet(host, 0);
      initBadgeTracking(host);
    }
  }


  function initSidebarCollapse() {
    var shell = qs("[data-brand-shell]");
    var button = qs("[data-brand-collapse]");


    if (!shell || !button) return;


    button.addEventListener("click", function () {
      var collapsed = shell.classList.toggle("is-collapsed");


      button.setAttribute("aria-expanded", collapsed ? "false" : "true");
      button.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
    });
  }


  function initNavGroups() {
    qsa("[data-brand-nav-group]").forEach(function (group) {
      var toggle = qs("[data-brand-nav-toggle]", group);
      var panel = qs(".brand-nav-sub", group);


      if (!toggle || !panel) return;


      setNavGroupOpen(group, group.classList.contains("is-open"));


      toggle.addEventListener("click", function () {
        setNavGroupOpen(group, !group.classList.contains("is-open"));
      });
    });
  }


  function initActiveNavState() {
    var links = qsa(".brand-nav-sub a");
    var titleLinks = qsa(".brand-nav-title-link");
    var navLinks = titleLinks.concat(links);


    if (!links.length && !titleLinks.length) return;


    function clearActive() {
      links.forEach(function (link) {
        link.classList.remove("is-active");
        link.removeAttribute("aria-current");
      });


      titleLinks.forEach(function (link) {
        link.removeAttribute("aria-current");
      });


      qsa("[data-brand-nav-group]").forEach(function (group) {
        group.classList.remove("has-active");
      });
    }


    window.setActiveBrandNavByHref = function (href) {
      var activeHref = href || window.location.hash || "#brand-home";
      var activeLink = null;
      var activeTitleLink = null;


      if (activeHref === "#brand-home" || activeHref === "#brand-home-explore" || activeHref === "" || activeHref === "#") {
        clearActive();
        return;
      }


      links.forEach(function (link) {
        if (link.getAttribute("href") === activeHref) {
          activeLink = link;
        }
      });


      titleLinks.forEach(function (link) {
        if (link.getAttribute("href") === activeHref) {
          activeTitleLink = link;
        }
      });


      if (!activeLink && !activeTitleLink && (activeHref === "#logo-assets" || activeHref === "")) {
        activeLink = qs('.brand-nav-sub a[href="#logos"]');
      }


      if (!activeLink && !activeTitleLink) return;


      clearActive();


      if (activeLink) {
        activeLink.classList.add("is-active");
        activeLink.setAttribute("aria-current", "true");


        var group = activeLink.closest("[data-brand-nav-group]");


        if (group) {
          group.classList.add("has-active");
          setNavGroupOpen(group, true);
        }


        return;
      }


      if (activeTitleLink) {
        activeTitleLink.setAttribute("aria-current", "true");


        var titleGroup = activeTitleLink.closest("[data-brand-nav-group]");


        if (titleGroup) {
          titleGroup.classList.add("has-active");
          setNavGroupOpen(titleGroup, true);
        }
      }
    };


    function isVisibleTarget(target) {
      if (!target) return false;
      if (target.closest("[hidden]")) return false;
      return Boolean(target.getClientRects().length);
    }


    function getScrollSpyItems() {
      var seen = {};


      return navLinks.map(function (link) {
        var href = link.getAttribute("href");
        var target = href ? qs(href) : null;


        if (!href || !target || seen[href] || !isVisibleTarget(target)) {
          return null;
        }


        seen[href] = true;


        return {
          href: href,
          target: target,
          top: target.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || 0)
        };
      }).filter(Boolean).sort(function (a, b) {
        return a.top - b.top;
      });
    }


    function syncActiveNavFromScroll() {
      var homePanel = qs('[data-brand-panel="home"]');


      if (homePanel && !homePanel.hasAttribute("hidden")) {
        clearActive();
        return;
      }


      var items = getScrollSpyItems();
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      var activationOffset = Math.min(260, Math.max(120, (window.innerHeight || 0) * 0.28));
      var activeItem = items[0];


      items.forEach(function (item) {
        if (item.top <= scrollTop + activationOffset) {
          activeItem = item;
        }
      });


      if (activeItem) {
        window.setActiveBrandNavByHref(activeItem.href);
      }
    }


    var scrollSpyTicking = false;


    function requestScrollSpySync() {
      if (scrollSpyTicking) return;


      scrollSpyTicking = true;


      window.requestAnimationFrame(function () {
        scrollSpyTicking = false;
        syncActiveNavFromScroll();
      });
    }


    links.forEach(function (link) {
      link.addEventListener("click", function () {
        window.setActiveBrandNavByHref(link.getAttribute("href"));
      });
    });


    titleLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        window.setActiveBrandNavByHref(link.getAttribute("href"));
      });
    });


    window.setActiveBrandNavByHref(window.location.hash || "#brand-home");


    window.addEventListener("hashchange", function () {
      window.setActiveBrandNavByHref(window.location.hash || "#brand-home");
      window.setTimeout(syncActiveNavFromScroll, 80);
    });


    window.addEventListener("scroll", requestScrollSpySync, { passive: true });
    window.addEventListener("resize", requestScrollSpySync);
    window.addEventListener("pageshow", requestScrollSpySync);
    window.setTimeout(syncActiveNavFromScroll, 120);
  }


  function syncSidebarLogo(theme) {
    var logo = qs(".brand-sidebar-mark");


    if (!logo) return;


    var darkSrc = logo.getAttribute("data-brand-logo-dark");
    var lightSrc = logo.getAttribute("data-brand-logo-light");


    if (theme === "light" && lightSrc) {
      logo.setAttribute("src", lightSrc);
      return;
    }


    if (darkSrc) {
      logo.setAttribute("src", darkSrc);
    }
  }


  function syncBrandThemeImages(theme) {
    qsa("[data-brand-theme-image]").forEach(function (image) {
      var darkSrc = image.getAttribute("data-dark-src");
      var lightSrc = image.getAttribute("data-light-src");
      var nextSrc = theme === "light" ? lightSrc : darkSrc;


      if (nextSrc) {
        image.setAttribute("src", nextSrc);
      }
    });
  }


  function initThemeToggle() {
    var body = document.body;
    var button = qs("[data-brand-theme-toggle]");


    if (!body || !button) return;


    var savedTheme = window.localStorage.getItem("cavbot_brand_theme");


    if (savedTheme === "light" || savedTheme === "dark") {
      body.setAttribute("data-brand-theme", savedTheme);
    }


    syncSidebarLogo(body.getAttribute("data-brand-theme") || "dark");
    syncBrandThemeImages(body.getAttribute("data-brand-theme") || "dark");


    button.addEventListener("click", function () {
      var current = body.getAttribute("data-brand-theme") || "dark";
      var next = current === "dark" ? "light" : "dark";


      body.setAttribute("data-brand-theme", next);
      window.localStorage.setItem("cavbot_brand_theme", next);


      syncSidebarLogo(next);
      syncBrandThemeImages(next);
    });
  }


  function setLogoCardBackground(preview, mode) {
    if (!preview) return;


    if (mode === "light") {
      preview.classList.add("is-light-bg");
    } else {
      preview.classList.remove("is-light-bg");
    }
  }


  function initLogoTabs() {
    qsa("[data-logo-card]").forEach(function (card) {
      var preview = qs("[data-logo-preview]", card);
      var image = preview ? qs("img", preview) : null;
      var download = preview ? qs(".brand-logo-download", preview) : null;
      var buttons = qsa("[data-logo-tab]", card);


      if (!preview || !image || !buttons.length) return;


      var activeButton = qs("[data-logo-tab].is-active", card) || buttons[0];


      if (activeButton) {
        setLogoCardBackground(preview, activeButton.getAttribute("data-bg") || "dark");
      }


      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var nextSrc = button.getAttribute("data-src");
          var nextBg = button.getAttribute("data-bg") || "dark";


          if (!nextSrc) return;


          buttons.forEach(function (item) {
            item.classList.remove("is-active");
          });


          button.classList.add("is-active");
          image.setAttribute("src", nextSrc);


          setLogoCardBackground(preview, nextBg);


          if (download) {
            download.setAttribute("href", "/" + nextSrc.replace(/^\/+/, ""));
          }
        });
      });
    });
  }


  function initColorCopy() {
    var buttons = qsa("[data-color]");
    var toast = qs("[data-brand-copy-toast]");
    var toastSwatch = qs("[data-brand-copy-toast-swatch]");
    var toastCode = qs("[data-brand-copy-toast-code]");
    var toastTimer = null;


    if (!buttons.length || !toast || !toastSwatch || !toastCode) return;


    function normalizeHex(hex) {
      return String(hex || "").trim().toUpperCase();
    }


    function showToast(hex) {
      var cleanHex = normalizeHex(hex);


      toastSwatch.style.background = cleanHex;
      toastCode.textContent = cleanHex;
      toast.classList.add("is-visible");
      toast.setAttribute("aria-hidden", "false");


      if (toastTimer) {
        window.clearTimeout(toastTimer);
      }


      toastTimer = window.setTimeout(function () {
        toast.classList.remove("is-visible");
        toast.setAttribute("aria-hidden", "true");
      }, 1900);
    }


    function copyColor(hex) {
      var cleanHex = normalizeHex(hex);


      if (!cleanHex) return;


      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cleanHex).then(function () {
          showToast(cleanHex);
        }).catch(function () {
          showToast(cleanHex);
        });
        return;
      }


      showToast(cleanHex);
    }


    buttons.forEach(function (button) {
      button.removeAttribute("title");


      button.addEventListener("click", function () {
        copyColor(button.getAttribute("data-color"));
      });
    });
  }


  function initTypographyMotion() {
    var section = qs("[data-brand-typography-motion]");


    if (!section) return;


    var topRow = qs(".brand-type-motion-row--top", section);
    var middleRow = qs(".brand-type-motion-row--middle", section);
    var bottomRow = qs(".brand-type-motion-row--bottom", section);
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }


    function lerp(start, end, progress) {
      return start + ((end - start) * progress);
    }


    function focalWeight(row, focalPoint) {
      if (!row) return 320;


      var rect = row.getBoundingClientRect();
      var viewport = window.innerHeight || document.documentElement.clientHeight || 1;
      var rowCenter = rect.top + (rect.height / 2);
      var distance = Math.abs(rowCenter - (viewport * focalPoint));
      var range = viewport * 0.42;
      var proximity = 1 - clamp(distance / range, 0, 1);
      var eased = proximity * proximity * (3 - (2 * proximity));


      return Math.round(lerp(300, 900, eased));
    }


    function render() {
      var rect = section.getBoundingClientRect();
      var viewport = window.innerHeight || document.documentElement.clientHeight || 1;
      var progress = clamp((viewport - rect.top) / (viewport + rect.height), 0, 1);
      var eased = progress * progress * (3 - (2 * progress));


      section.style.setProperty("--type-shift-top", lerp(-6, 34, eased).toFixed(2) + "vw");
      section.style.setProperty("--type-shift-middle", lerp(12, -28, eased).toFixed(2) + "vw");
      section.style.setProperty("--type-shift-bottom", lerp(-8, 38, eased).toFixed(2) + "vw");
      section.style.setProperty("--type-weight-top", focalWeight(topRow, 0.42));
      section.style.setProperty("--type-weight-middle", focalWeight(middleRow, 0.52));
      section.style.setProperty("--type-weight-bottom", focalWeight(bottomRow, 0.62));
    }


    if (reduceMotion) {
      section.style.setProperty("--type-shift-top", "10vw");
      section.style.setProperty("--type-shift-middle", "-8vw");
      section.style.setProperty("--type-shift-bottom", "12vw");
      section.style.setProperty("--type-weight-top", "760");
      section.style.setProperty("--type-weight-middle", "420");
      section.style.setProperty("--type-weight-bottom", "760");
      return;
    }


    var ticking = false;


    function requestRender() {
      if (ticking) return;


      ticking = true;


      window.requestAnimationFrame(function () {
        ticking = false;
        render();
      });
    }


    render();
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);
  }


  function getPanelForTarget(target) {
    var panel = target ? target.closest("[data-brand-panel]") : null;
    return panel ? panel.getAttribute("data-brand-panel") : "assets";
  }


  function setBrandPanel(activePanel) {
    if (document.body) {
      document.body.classList.toggle("is-brand-home-panel", activePanel === "home");
    }


    qsa("[data-brand-panel]").forEach(function (panel) {
      var isActive = panel.getAttribute("data-brand-panel") === activePanel;


      if (isActive) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });
  }


  function initBrandPanels() {
    var hashTarget = window.location.hash ? qs(window.location.hash) : null;
    var startTarget = hashTarget || qs("#brand-home");


    setBrandPanel(getPanelForTarget(startTarget));
  }


  function initSmoothInternalLinks() {
    qsa('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        var targetId = link.getAttribute("href");
        var target = targetId ? qs(targetId) : null;
        var panelName = link.getAttribute("data-brand-page-trigger");


        if (!target) return;


        event.preventDefault();


        setBrandPanel(panelName || getPanelForTarget(target));


        if (window.history && window.history.pushState) {
          window.history.pushState(null, "", targetId);
        }


        if (typeof window.setActiveBrandNavByHref === "function") {
          window.setActiveBrandNavByHref(targetId);
        }


        window.requestAnimationFrame(function () {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        });
      });
    });


    window.addEventListener("hashchange", function () {
      var target = window.location.hash ? qs(window.location.hash) : null;


      if (!target) return;


      setBrandPanel(getPanelForTarget(target));
    });
  }


  function init() {
    initBrandBadge();
    initSidebarCollapse();
    initNavGroups();
    initActiveNavState();
    initThemeToggle();
    initLogoTabs();
    initColorCopy();
    initTypographyMotion();
    initBrandPanels();
    initSmoothInternalLinks();
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }


  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }


  function copyText(value) {
    var cleanValue = String(value || "").trim().replace(/\s+/g, " ");


    if (!cleanValue) return Promise.resolve();


    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(cleanValue).catch(function () {});
    }


    return Promise.resolve();
  }


  function copyText(value) {
    var cleanValue = String(value || "").trim();
    if (!cleanValue) return Promise.resolve();


    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(cleanValue).catch(function () {});
    }


    return Promise.resolve();
  }


  function initPaletteCopyIcons() {
    var cards = qsa(".brand-guidelines-palette-block .brand-palette-card[data-color]");


    cards.forEach(function (card) {
      var timer = null;


      card.addEventListener("click", function () {
        var value = card.getAttribute("data-color");


        copyText(value).then(function () {
          card.classList.add("is-copied");


          if (timer) {
            window.clearTimeout(timer);
          }


          timer = window.setTimeout(function () {
            card.classList.remove("is-copied");
          }, 1100);
        });
      });
    });
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPaletteCopyIcons);
  } else {
    initPaletteCopyIcons();
  }
})();
(function () {
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }


  function lerp(start, end, progress) {
    return start + ((end - start) * progress);
  }


  function initColorUsageMotion() {
    var mosaic = document.querySelector("[data-brand-usage-mosaic]");
    if (!mosaic) return;


    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    function render() {
      var rect = mosaic.getBoundingClientRect();
      var viewport = window.innerHeight || document.documentElement.clientHeight || 1;
      var progress = clamp((viewport - rect.top) / (viewport + rect.height), 0, 1);
      var eased = progress * progress * (3 - (2 * progress));


      mosaic.style.setProperty("--usage-top-x", lerp(-16, 12, eased).toFixed(2) + "vw");
      mosaic.style.setProperty("--usage-top-y", lerp(18, -22, eased).toFixed(2) + "px");


      mosaic.style.setProperty("--usage-bottom-x", lerp(8, -22, eased).toFixed(2) + "vw");
      mosaic.style.setProperty("--usage-bottom-y", lerp(-14, 20, eased).toFixed(2) + "px");
    }


    if (reduceMotion) {
      mosaic.style.setProperty("--usage-top-x", "-5vw");
      mosaic.style.setProperty("--usage-top-y", "0px");
      mosaic.style.setProperty("--usage-bottom-x", "-12vw");
      mosaic.style.setProperty("--usage-bottom-y", "0px");
      return;
    }


    var ticking = false;


    function requestRender() {
      if (ticking) return;


      ticking = true;


      window.requestAnimationFrame(function () {
        ticking = false;
        render();
      });
    }


    render();


    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initColorUsageMotion);
  } else {
    initColorUsageMotion();
  }
})();

(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }


  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }


  function getPanelForTarget(target) {
    var panel = target ? target.closest("[data-brand-panel]") : null;
    return panel ? panel.getAttribute("data-brand-panel") : "assets";
  }


  function setBrandPanel(activePanel) {
    if (document.body) {
      document.body.classList.toggle("is-brand-home-panel", activePanel === "home");
    }


    qsa("[data-brand-panel]").forEach(function (panel) {
      if (panel.getAttribute("data-brand-panel") === activePanel) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });
  }


  function initGuidelinesSealNav() {
    qsa(".brand-guidelines-seal-card[href^='#']").forEach(function (link) {
      link.addEventListener("click", function (event) {
        var targetId = link.getAttribute("href");
        var target = targetId ? qs(targetId) : null;


        if (!target) return;


        event.preventDefault();


        setBrandPanel(getPanelForTarget(target));


        if (window.history && window.history.pushState) {
          window.history.pushState(null, "", targetId);
        }


        if (typeof window.setActiveBrandNavByHref === "function") {
          window.setActiveBrandNavByHref(targetId);
        }


        window.requestAnimationFrame(function () {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        });
      });
    });
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGuidelinesSealNav);
  } else {
    initGuidelinesSealNav();
  }
})();

// ===========================
// VOICE AND TONE JS START
// ===========================

(function () {
  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }


  function initVoiceToneCards() {
    var cards = qsa(".brand-voice-dimension-card");


    if (!cards.length) return;


    if (!("IntersectionObserver" in window)) {
      cards.forEach(function (card) {
        card.classList.add("is-visible");
      });
      return;
    }


    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;


        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.16
    });


    cards.forEach(function (card) {
      observer.observe(card);
    });
  }


  function initVoiceBoilerplateCopy() {
    qsa("[data-brand-copy-text]").forEach(function (button) {
      var label = qs("span", button);
      var defaultText = label ? label.textContent : button.textContent;
      var timer = null;


      button.addEventListener("click", function () {
        var selector = button.getAttribute("data-brand-copy-text");
        var source = selector ? qs(selector) : null;
        var text = source ? source.textContent : "";


        copyText(text).then(function () {
          button.classList.add("is-copied");


          if (label) {
            label.textContent = "Copied";
          }


          if (timer) {
            window.clearTimeout(timer);
          }


          timer = window.setTimeout(function () {
            button.classList.remove("is-copied");


            if (label) {
              label.textContent = defaultText;
            }
          }, 1200);
        });
      });
    });
  }


  function initVoiceTone() {
    initVoiceToneCards();
    initVoiceBoilerplateCopy();
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initVoiceTone);
  } else {
    initVoiceTone();
  }
})();

// ===========================
// VOICE AND TONE JS END
// ===========================
