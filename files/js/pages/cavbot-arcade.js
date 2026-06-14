(function () {
  var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  function logEvent(name, payload) {
    try {
      console.log("[CavBot Arcade]", name, payload || {});
    } catch (error) {}
  }


  function initArcadeHero() {
    var hero = document.querySelector("[data-arcade-hero]");
    if (!hero) return;


    var video = hero.querySelector(".arcade-hero-video");
    var poster = hero.querySelector(".arcade-hero-poster");
    var toggle = hero.querySelector("[data-arcade-video-toggle]");
    var videoSrc = hero.getAttribute("data-video");
    var posterSrc = hero.getAttribute("data-poster");


    if (!video || !videoSrc) return;


    if (poster && posterSrc) {
      poster.setAttribute("src", posterSrc);
    }


    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("loop", "");


    if (posterSrc) {
      video.setAttribute("poster", posterSrc);
    }


    var userPaused = true;
    var hasStarted = false;
    var wasPlayingBeforeHidden = false;


    function setPausedState() {
      hero.classList.remove("is-playing");
      hero.classList.add("is-paused");


      if (toggle) {
        toggle.setAttribute("aria-label", "Play Arcade preview");
        toggle.setAttribute("aria-pressed", "true");
      }
    }


    function setPlayingState() {
      hero.classList.remove("is-paused");
      hero.classList.add("is-playing");


      if (toggle) {
        toggle.setAttribute("aria-label", "Pause Arcade preview");
        toggle.setAttribute("aria-pressed", "false");
      }
    }


    function loadVideo() {
      if (!video.getAttribute("src")) {
        video.setAttribute("src", videoSrc);
        video.load();
      }
    }


    function playVideo() {
      if (prefersReduced) return;


      userPaused = false;
      loadVideo();


      var playPromise;


      try {
        playPromise = video.play();
      } catch (error) {
        setPausedState();
        return;
      }


      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(function () {
            hasStarted = true;
            setPlayingState();
            logEvent("hero_preview_play", {});
          })
          .catch(function () {
            userPaused = true;
            setPausedState();
            logEvent("hero_preview_play_blocked", {});
          });
      } else {
        hasStarted = true;
        setPlayingState();
      }
    }


    function pauseVideo(markUserPaused) {
      if (markUserPaused) {
        userPaused = true;
      }


      try {
        video.pause();
      } catch (error) {}


      setPausedState();
      logEvent("hero_preview_pause", {});
    }


    function toggleVideo() {
      if (video.paused || hero.classList.contains("is-paused")) {
        playVideo();
      } else {
        pauseVideo(true);
      }
    }


    video.addEventListener("playing", function () {
      hasStarted = true;
      setPlayingState();
    });


    video.addEventListener("pause", function () {
      setPausedState();
    });


    video.addEventListener("error", function () {
      userPaused = true;
      setPausedState();
      logEvent("hero_preview_error", {});
    });


    if (toggle) {
      toggle.addEventListener("click", toggleVideo);
    }


    setPausedState();


    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        wasPlayingBeforeHidden = !video.paused && hero.classList.contains("is-playing");


        if (wasPlayingBeforeHidden) {
          pauseVideo(false);
        }


        return;
      }


      if (hasStarted && wasPlayingBeforeHidden && !userPaused && !prefersReduced) {
        playVideo();
      }


      wasPlayingBeforeHidden = false;
    });
  }


  function initArcadeDownCue() {
    var downCue = document.querySelector(".arcade-down-cue");
    var target = document.getElementById("arcade-experience");


    if (!downCue || !target) return;


    downCue.addEventListener("click", function (event) {
      event.preventDefault();


      target.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start"
      });
    });
  }


  function initArcadeScrollReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-arcade-reveal]"));


    if (!items.length) return;


    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }


    var lastY = window.scrollY || window.pageYOffset || 0;
    var scrollDirection = "down";
    var ticking = false;


    function updateDirection() {
      var currentY = window.scrollY || window.pageYOffset || 0;


      if (Math.abs(currentY - lastY) > 2) {
        scrollDirection = currentY > lastY ? "down" : "up";
        lastY = currentY;
      }


      ticking = false;
    }


    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateDirection);
          ticking = true;
        }
      },
      { passive: true }
    );


    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var element = entry.target;


          if (entry.isIntersecting) {
            element.classList.add("is-visible");
            element.classList.remove("is-hidden-up", "is-hidden-down");
            return;
          }


          element.classList.remove("is-visible");


          if (scrollDirection === "down") {
            element.classList.add("is-hidden-up");
            element.classList.remove("is-hidden-down");
          } else {
            element.classList.add("is-hidden-down");
            element.classList.remove("is-hidden-up");
          }
        });
      },
      {
        threshold: 0.28,
        rootMargin: "-8% 0px -12% 0px"
      }
    );


    items.forEach(function (item) {
      item.classList.add("is-hidden-down");
      observer.observe(item);
    });
  }


  function initArcadePlanCards() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-arcade-card-reveal]"));


    if (!cards.length) return;


    if (prefersReduced || !("IntersectionObserver" in window)) {
      cards.forEach(function (card) {
        card.classList.add("is-visible");
      });
      return;
    }


    var lastY = window.scrollY || window.pageYOffset || 0;
    var scrollDirection = "down";
    var ticking = false;


    function updateDirection() {
      var currentY = window.scrollY || window.pageYOffset || 0;


      if (Math.abs(currentY - lastY) > 2) {
        scrollDirection = currentY > lastY ? "down" : "up";
        lastY = currentY;
      }


      ticking = false;
    }


    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateDirection);
          ticking = true;
        }
      },
      { passive: true }
    );


    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var element = entry.target;


          if (entry.isIntersecting) {
            element.classList.add("is-visible");
            element.classList.remove("is-hidden-up", "is-hidden-down");
            return;
          }


          element.classList.remove("is-visible");


          if (scrollDirection === "down") {
            element.classList.add("is-hidden-up");
            element.classList.remove("is-hidden-down");
          } else {
            element.classList.add("is-hidden-down");
            element.classList.remove("is-hidden-up");
          }
        });
      },
      {
        threshold: 0.22,
        rootMargin: "-6% 0px -10% 0px"
      }
    );


    cards.forEach(function (card, index) {
      card.classList.add("is-hidden-down");
      card.style.transitionDelay = Math.min(index * 90, 240) + "ms";
      observer.observe(card);
    });
  }


  function initArcadeSections() {
    initArcadeHero();
    initArcadeDownCue();
    initArcadeScrollReveal();
    initArcadePlanCards();
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initArcadeSections);
  } else {
    initArcadeSections();
  }
})();


(function () {
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  function initArcadeGalleryReveal() {
    var items = Array.prototype.slice.call(
      document.querySelectorAll("[data-arcade-gallery-reveal]")
    );


    if (!items.length) return;


    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }


    var lastY = window.scrollY || window.pageYOffset || 0;
    var scrollDirection = "down";
    var ticking = false;


    function updateDirection() {
      var currentY = window.scrollY || window.pageYOffset || 0;


      if (Math.abs(currentY - lastY) > 2) {
        scrollDirection = currentY > lastY ? "down" : "up";
        lastY = currentY;
      }


      ticking = false;
    }


    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateDirection);
          ticking = true;
        }
      },
      { passive: true }
    );


    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var element = entry.target;


          if (entry.isIntersecting) {
            element.classList.add("is-visible");
            element.classList.remove("is-hidden-up", "is-hidden-down");
            return;
          }


          element.classList.remove("is-visible");


          if (scrollDirection === "down") {
            element.classList.add("is-hidden-up");
            element.classList.remove("is-hidden-down");
          } else {
            element.classList.add("is-hidden-down");
            element.classList.remove("is-hidden-up");
          }
        });
      },
      {
        threshold: 0.22,
        rootMargin: "-6% 0px -10% 0px"
      }
    );


    items.forEach(function (item, index) {
      item.classList.add("is-hidden-down");
      item.style.transitionDelay = Math.min(index * 90, 180) + "ms";
      observer.observe(item);
    });
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initArcadeGalleryReveal);
  } else {
    initArcadeGalleryReveal();
  }
})();


(function () {
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  function initArcadeMarqueeGallery() {
    var viewport = document.querySelector("[data-arcade-marquee]");
    if (!viewport || prefersReduced) return;


    var track = viewport.querySelector("[data-arcade-marquee-track]");
    if (!track) return;


    var originalCards = Array.prototype.slice.call(track.children);
    if (!originalCards.length) return;


    originalCards.forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");


      clone.querySelectorAll("a, button").forEach(function (focusable) {
        focusable.setAttribute("tabindex", "-1");
      });


      track.appendChild(clone);
    });


    var position = 0;


    var normalSpeed = 0.055;
    var slowSpeed = 0.018;


    var currentSpeed = normalSpeed;
    var targetSpeed = normalSpeed;


    var singleSetWidth = 0;
    var lastTime = null;


    function measure() {
      var width = 0;
      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;


      originalCards.forEach(function (card) {
        width += card.getBoundingClientRect().width + gap;
      });


      singleSetWidth = Math.max(1, width);
    }


    function setSlowMode(isSlow) {
      targetSpeed = isSlow ? slowSpeed : normalSpeed;
    }


    viewport.addEventListener("mouseenter", function () {
      setSlowMode(true);
    });


    viewport.addEventListener("mouseleave", function () {
      setSlowMode(false);
    });


    viewport.addEventListener(
      "touchstart",
      function () {
        setSlowMode(true);
      },
      { passive: true }
    );


    viewport.addEventListener(
      "touchend",
      function () {
        window.setTimeout(function () {
          setSlowMode(false);
        }, 900);
      },
      { passive: true }
    );


    viewport.addEventListener("focusin", function () {
      setSlowMode(true);
    });


    viewport.addEventListener("focusout", function () {
      setSlowMode(false);
    });


    function animate(timestamp) {
      if (!lastTime) lastTime = timestamp;


      var delta = Math.min(32, timestamp - lastTime);
      lastTime = timestamp;


      currentSpeed += (targetSpeed - currentSpeed) * 0.045;
      position -= currentSpeed * delta;


      if (Math.abs(position) >= singleSetWidth) {
        position += singleSetWidth;
      }


      track.style.transform = "translate3d(" + position + "px, 0, 0)";
      window.requestAnimationFrame(animate);
    }


    measure();
    window.addEventListener("resize", measure, { passive: true });
    window.requestAnimationFrame(animate);
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initArcadeMarqueeGallery);
  } else {
    initArcadeMarqueeGallery();
  }
})();
(function () {
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  function initArcadeRuntimeDocsReveal() {
    var items = Array.prototype.slice.call(
      document.querySelectorAll("[data-arcade-runtime-reveal]")
    );


    if (!items.length) return;


    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }


    var lastY = window.scrollY || window.pageYOffset || 0;
    var scrollDirection = "down";
    var ticking = false;


    function updateDirection() {
      var currentY = window.scrollY || window.pageYOffset || 0;


      if (Math.abs(currentY - lastY) > 2) {
        scrollDirection = currentY > lastY ? "down" : "up";
        lastY = currentY;
      }


      ticking = false;
    }


    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateDirection);
          ticking = true;
        }
      },
      { passive: true }
    );


    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var element = entry.target;


          if (entry.isIntersecting) {
            element.classList.add("is-visible");
            element.classList.remove("is-hidden-up", "is-hidden-down");
            return;
          }


          element.classList.remove("is-visible");


          if (scrollDirection === "down") {
            element.classList.add("is-hidden-up");
            element.classList.remove("is-hidden-down");
          } else {
            element.classList.add("is-hidden-down");
            element.classList.remove("is-hidden-up");
          }
        });
      },
      {
        threshold: 0.26,
        rootMargin: "-8% 0px -10% 0px"
      }
    );


    items.forEach(function (item) {
      item.classList.add("is-hidden-down");
      observer.observe(item);
    });
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initArcadeRuntimeDocsReveal);
  } else {
    initArcadeRuntimeDocsReveal();
  }
})();


(function () {
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  function initArcadeDevicesReveal() {
    var items = Array.prototype.slice.call(
      document.querySelectorAll("[data-arcade-devices-reveal]")
    );


    if (!items.length) return;


    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }


    var lastY = window.scrollY || window.pageYOffset || 0;
    var scrollDirection = "down";
    var ticking = false;


    function updateDirection() {
      var currentY = window.scrollY || window.pageYOffset || 0;


      if (Math.abs(currentY - lastY) > 2) {
        scrollDirection = currentY > lastY ? "down" : "up";
        lastY = currentY;
      }


      ticking = false;
    }


    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateDirection);
          ticking = true;
        }
      },
      { passive: true }
    );


    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var element = entry.target;


          if (entry.isIntersecting) {
            element.classList.add("is-visible");
            element.classList.remove("is-hidden-up", "is-hidden-down");
            return;
          }


          element.classList.remove("is-visible");


          if (scrollDirection === "down") {
            element.classList.add("is-hidden-up");
            element.classList.remove("is-hidden-down");
          } else {
            element.classList.add("is-hidden-down");
            element.classList.remove("is-hidden-up");
          }
        });
      },
      {
        threshold: 0.26,
        rootMargin: "-8% 0px -10% 0px"
      }
    );


    items.forEach(function (item, index) {
      item.classList.add("is-hidden-down");
      item.style.transitionDelay = Math.min(index * 85, 260) + "ms";
      observer.observe(item);
    });
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initArcadeDevicesReveal);
  } else {
    initArcadeDevicesReveal();
  }
})();


(function () {
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  function initArcadeFaqReveal() {
    var items = Array.prototype.slice.call(
      document.querySelectorAll("[data-arcade-faq-reveal], .arcade-faq-actions")
    );


    if (!items.length) return;


    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }


    var lastY = window.scrollY || window.pageYOffset || 0;
    var scrollDirection = "down";
    var ticking = false;


    function updateDirection() {
      var currentY = window.scrollY || window.pageYOffset || 0;


      if (Math.abs(currentY - lastY) > 2) {
        scrollDirection = currentY > lastY ? "down" : "up";
        lastY = currentY;
      }


      ticking = false;
    }


    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateDirection);
          ticking = true;
        }
      },
      { passive: true }
    );


    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var element = entry.target;


          if (entry.isIntersecting) {
            element.classList.add("is-visible");
            element.classList.remove("is-hidden-up", "is-hidden-down");
            return;
          }


          element.classList.remove("is-visible");


          if (scrollDirection === "down") {
            element.classList.add("is-hidden-up");
            element.classList.remove("is-hidden-down");
          } else {
            element.classList.add("is-hidden-down");
            element.classList.remove("is-hidden-up");
          }
        });
      },
      {
        threshold: 0.22,
        rootMargin: "-8% 0px -10% 0px"
      }
    );


    items.forEach(function (item, index) {
      item.classList.add("is-hidden-down");
      item.style.transitionDelay = Math.min(index * 90, 180) + "ms";
      observer.observe(item);
    });
  }


  function initArcadeFaqAccordion() {
    var list = document.querySelector("[data-arcade-faq-list]");
    if (!list) return;


    var items = Array.prototype.slice.call(
      list.querySelectorAll(".arcade-faq-item")
    );


    items.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (!item.open) return;


        items.forEach(function (otherItem) {
          if (otherItem !== item) {
            otherItem.removeAttribute("open");
          }
        });
      });
    });
  }


  function initArcadeFaq() {
    initArcadeFaqReveal();
    initArcadeFaqAccordion();
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initArcadeFaq);
  } else {
    initArcadeFaq();
  }
})();

(function () {
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  function initArcadeFinalCtaReveal() {
    var items = Array.prototype.slice.call(
      document.querySelectorAll("[data-arcade-final-cta-reveal]")
    );


    if (!items.length) return;


    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

 
    var lastY = window.scrollY || window.pageYOffset || 0;
    var scrollDirection = "down";
    var ticking = false;


    function updateDirection() {
      var currentY = window.scrollY || window.pageYOffset || 0;


      if (Math.abs(currentY - lastY) > 2) {
        scrollDirection = currentY > lastY ? "down" : "up";
        lastY = currentY;
      }


      ticking = false;
    }


    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateDirection);
          ticking = true;
        }
      },
      { passive: true }
    );


    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var element = entry.target;


          if (entry.isIntersecting) {
            element.classList.add("is-visible");
            element.classList.remove("is-hidden-up", "is-hidden-down");
            return;
          }


          element.classList.remove("is-visible");


          if (scrollDirection === "down") {
            element.classList.add("is-hidden-up");
            element.classList.remove("is-hidden-down");
          } else {
            element.classList.add("is-hidden-down");
            element.classList.remove("is-hidden-up");
          }
        });
      },
      {
        threshold: 0.26,
        rootMargin: "-8% 0px -10% 0px"
      }
    );


    items.forEach(function (item) {
      item.classList.add("is-hidden-down");
      observer.observe(item);
    });
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initArcadeFinalCtaReveal);
  } else {
    initArcadeFinalCtaReveal();
  }
})();



