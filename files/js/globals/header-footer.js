document.addEventListener("DOMContentLoaded", () => {
  const LOGOTYPE_SRC = "/assets/logo/official-logotype-light.svg";
  const LOGOMARK_SRC = "/assets/logo/cavbot-logomark.svg";
  const HEADER_SCROLL_SWITCH_Y = 12;
  const WORKSPACE_HOME_PATH = "/";
  const TRY_CAVAI_URL = "https://app.cavbot.io/cavai";
  const LOGIN_URL = "https://app.cavbot.io/auth?mode=login";
  const SIGNUP_URL = "https://app.cavbot.io/auth?mode=signup";
  const TRY_CAVAI_PRODUCT_LINKS = [
    { label: "CavAi", href: "/cavai-info.html" },
    { label: "Caven", href: "/caven.html" },
    { label: "CavBot Companion", href: "/cavbot-companion.html" },
    { label: "Image Studio", href: "/image-studio.html" },
    { label: "Image Edit", href: "/image-edit.html" },
  ];
  const TRY_CAVAI_FRONTEND_MODEL_LINKS = [
    { id: "deepseek-chat", label: "DeepSeek Chat" },
    { id: "qwen3.5-flash", label: "Qwen3.5-Flash" },
    { id: "qwen-plus-character", label: "Qwen-Plus-Character" },
    { id: "deepseek-reasoner", label: "DeepSeek Reasoner" },
    { id: "qwen3.5-plus", label: "Qwen3.5-Plus" },
    { id: "qwen3-max", label: "Qwen3-Max" },
  ];

  const navToggle = document.querySelector(".nav-menu-toggle");
  const navOverlay = document.querySelector(".nav-overlay");
  const navCloseBtn = document.querySelector(".nav-overlay-close");
  const pageScrollLockState = {
    depth: 0,
    scrollX: 0,
    scrollY: 0,
    htmlOverflow: "",
    bodyOverflow: "",
    bodyPosition: "",
    bodyTop: "",
    bodyLeft: "",
    bodyRight: "",
    bodyWidth: "",
  };

  function lockPageScroll() {
    if (pageScrollLockState.depth === 0) {
      const docEl = document.documentElement;
      const body = document.body;
      pageScrollLockState.scrollX = window.scrollX || window.pageXOffset || 0;
      pageScrollLockState.scrollY = window.scrollY || window.pageYOffset || 0;
      pageScrollLockState.htmlOverflow = docEl.style.overflow;
      pageScrollLockState.bodyOverflow = body.style.overflow;
      pageScrollLockState.bodyPosition = body.style.position;
      pageScrollLockState.bodyTop = body.style.top;
      pageScrollLockState.bodyLeft = body.style.left;
      pageScrollLockState.bodyRight = body.style.right;
      pageScrollLockState.bodyWidth = body.style.width;

      docEl.style.overflow = "hidden";
      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${pageScrollLockState.scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
    }
    pageScrollLockState.depth += 1;
  }

  function unlockPageScroll() {
    if (pageScrollLockState.depth <= 0) return;
    pageScrollLockState.depth -= 1;
    if (pageScrollLockState.depth > 0) return;

    const docEl = document.documentElement;
    const body = document.body;
    docEl.style.overflow = pageScrollLockState.htmlOverflow;
    body.style.overflow = pageScrollLockState.bodyOverflow;
    body.style.position = pageScrollLockState.bodyPosition;
    body.style.top = pageScrollLockState.bodyTop;
    body.style.left = pageScrollLockState.bodyLeft;
    body.style.right = pageScrollLockState.bodyRight;
    body.style.width = pageScrollLockState.bodyWidth;
    window.scrollTo(pageScrollLockState.scrollX, pageScrollLockState.scrollY);
  }

  function clamp(value, min, max) {
    if (max < min) return (min + max) * 0.5;
    return Math.min(max, Math.max(min, value));
  }

  function positionModalCard(overlay, card) {
    if (!overlay || !card) return;
    const rect = card.getBoundingClientRect();
    const halfW = Math.min(rect.width * 0.5 || 280, Math.max(0, window.innerWidth * 0.5 - 12));
    const halfH = Math.min(rect.height * 0.5 || 220, Math.max(0, window.innerHeight * 0.5 - 12));
    const x = clamp(window.innerWidth * 0.5, 12 + halfW, window.innerWidth - 12 - halfW);
    const topInset = clamp(Math.round(window.innerHeight * 0.08), 18, 76);
    const y = clamp(topInset + halfH, 12 + halfH, window.innerHeight - 12 - halfH);
    overlay.style.setProperty("--cb-modal-left", `${x}px`);
    overlay.style.setProperty("--cb-modal-top", `${y}px`);
  }

  function installStudioMarketingSystem() {
    const STYLE_ID = "cb-studio-marketing-style";
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        .cb-studio-reveal {
          opacity: 0;
          transition: opacity 260ms cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--cb-reveal-delay, 0ms);
          will-change: opacity;
        }

        .cb-studio-reveal.is-visible {
          opacity: 1;
        }

        .cb-studio-card {
          opacity: 0;
          transition: opacity 320ms cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--cb-card-stagger, 0ms);
          will-change: opacity;
        }

        .cb-studio-card.is-visible {
          opacity: 1;
        }

        @media (prefers-reduced-motion: reduce) {
          .cb-studio-reveal,
          .cb-studio-reveal.is-visible,
          .cb-studio-card,
          .cb-studio-card.is-visible {
            opacity: 1;
            transition: none;
          }
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mainEl = document.querySelector("main");
    if (!mainEl) return;

    const state = {
      sections: [],
      cards: [],
      lastY: window.scrollY || window.pageYOffset || 0,
      ticking: false,
      refreshTimer: 0,
    };

    const sectionSelector = [
      "main > section",
      "main > article",
      "main section[data-section]",
      "main [class*='hero']",
      "main [class*='section']",
      "main [class*='surface']",
      "main [class*='feature-grid']",
      "main [class*='panel-group']",
      "main [class*='ethics-section']",
      "main [class*='privacy-intro']",
      "main [class*='policy-section']",
    ].join(",");

    const cardSelector = [
      "main .card",
      "main [class*='card']",
      "main [class*='panel']",
      "main [class*='tile']",
      "main [class*='surface']",
      "main [class*='module']",
      "main [class*='feature']",
      "main [class*='metric']",
      "main [class*='faq']",
      "main [class*='pricing']",
      "main [class*='pill']",
      "main [class*='box']",
    ].join(",");

    const scrollHostSelector = [
      ".ethics-scroll-sections",
      ".guide-page",
      ".topic-modal-content",
      ".cb-guide-scroll",
      "[data-cb-scroll-host='true']",
    ].join(",");

    const blockedAncestorSelector = [
      ".cb-cavguard-overlay",
      ".cb-demo-overlay",
      ".nav-overlay",
      ".topic-modal",
      ".topic-modal-shell",
      ".guide-overlay",
      ".lightbox",
      ".modal",
      "[role='dialog']",
    ].join(",");

    const asUniqueElements = (nodes) =>
      Array.from(new Set(nodes)).filter((node) => node instanceof HTMLElement);

    const isMotionEligible = (node, minWidth, minHeight) => {
      if (!(node instanceof HTMLElement)) return false;
      if (node.dataset.cbNoMotion === "true") return false;
      if (node.closest(blockedAncestorSelector)) return false;
      const tag = node.tagName.toLowerCase();
      if (tag === "script" || tag === "style" || tag === "svg" || tag === "path") return false;
      const computed = window.getComputedStyle(node);
      if (computed.display === "none" || computed.visibility === "hidden") return false;
      if (node.offsetWidth < minWidth || node.offsetHeight < minHeight) return false;
      return true;
    };

    const collectTargets = () => {
      let sectionTargets = asUniqueElements(Array.from(document.querySelectorAll(sectionSelector))).filter(
        (node) => isMotionEligible(node, 220, 84)
      );

      if (!sectionTargets.length) {
        sectionTargets = asUniqueElements(Array.from(mainEl.children)).filter((node) =>
          isMotionEligible(node, 220, 84)
        );
      }

      state.sections = sectionTargets.slice(0, 120);
      const sectionSet = new Set(state.sections);

      state.cards = asUniqueElements(Array.from(document.querySelectorAll(cardSelector)))
        .filter((node) => {
          if (!isMotionEligible(node, 130, 56)) return false;
          if (sectionSet.has(node)) return false;
          const tag = node.tagName.toLowerCase();
          if (tag === "section" || tag === "article" || tag === "main") return false;
          return true;
        })
        .slice(0, 260);

      state.sections.forEach((node, index) => {
        node.classList.add("cb-studio-reveal");
        node.style.setProperty("--cb-reveal-delay", `${Math.min(index * 22, 280)}ms`);
      });

      state.cards.forEach((node, index) => {
        node.classList.add("cb-studio-card");
        node.style.setProperty("--cb-card-stagger", `${Math.min((index % 10) * 32, 240)}ms`);
      });
    };

    const bindScrollHosts = () => {
      asUniqueElements(Array.from(document.querySelectorAll(scrollHostSelector))).forEach((host) => {
        if (host.dataset.cbStudioScrollBound === "true") return;
        host.dataset.cbStudioScrollBound = "true";
        host.addEventListener("scroll", scheduleRender, { passive: true });
      });
    };

    const getProgress = (rect, viewportH) =>
      clamp((viewportH - rect.top) / (viewportH + Math.max(rect.height, 1)), 0, 1);

    const updateSectionMotion = (node, index, viewportH, direction) => {
      const rect = node.getBoundingClientRect();
      const onStage = rect.bottom > -viewportH * 0.16 && rect.top < viewportH * 1.12;
      const visible = rect.bottom > viewportH * 0.05 && rect.top < viewportH * 0.95;
      const active = rect.bottom > viewportH * 0.28 && rect.top < viewportH * 0.72;

      node.classList.toggle("is-visible", visible);
      node.classList.toggle("is-active", active);

      if (!onStage) return;

      const progress = getProgress(rect, viewportH);
      node.style.setProperty("--cb-section-progress", progress.toFixed(4));
      node.style.setProperty("--cb-section-index", String(index));
      node.style.setProperty("--cb-section-direction", String(direction));
    };

    const updateCardMotion = (node, index, viewportH, direction) => {
      const rect = node.getBoundingClientRect();
      const inRange = rect.bottom > -viewportH * 0.1 && rect.top < viewportH * 1.08;
      const visible = rect.bottom > viewportH * 0.02 && rect.top < viewportH * 0.98;
      const active = rect.bottom > viewportH * 0.22 && rect.top < viewportH * 0.78;

      node.classList.toggle("is-visible", visible);
      node.classList.toggle("is-active", active);

      if (!inRange) return;

      const progress = getProgress(rect, viewportH);
      node.style.setProperty("--cb-card-progress", progress.toFixed(4));
      node.style.setProperty("--cb-card-index", String(index));
      node.style.setProperty("--cb-card-direction", String(direction));
    };

    const renderFrame = () => {
      state.ticking = false;
      const currentY = window.scrollY || window.pageYOffset || 0;
      const delta = currentY - state.lastY;
      const direction = delta === 0 ? 0 : delta > 0 ? 1 : -1;
      state.lastY = currentY;

      document.documentElement.dataset.cbScrollDirection =
        direction > 0 ? "down" : direction < 0 ? "up" : "idle";

      const viewportH = Math.max(window.innerHeight || 0, 1);
      state.sections.forEach((node, index) => updateSectionMotion(node, index, viewportH, direction));
      state.cards.forEach((node, index) => updateCardMotion(node, index, viewportH, direction));
    };

    function scheduleRender() {
      if (state.ticking) return;
      state.ticking = true;
      window.requestAnimationFrame(renderFrame);
    }

    const refreshTargets = () => {
      window.clearTimeout(state.refreshTimer);
      state.refreshTimer = window.setTimeout(() => {
        collectTargets();
        bindScrollHosts();
        scheduleRender();
      }, 90);
    };

    collectTargets();
    bindScrollHosts();

    if (reduceMotion) {
      state.sections.forEach((node) => node.classList.add("is-visible"));
      state.cards.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    document.body.classList.add("cb-studio-motion");
    scheduleRender();
    window.addEventListener("scroll", scheduleRender, { passive: true });
    window.addEventListener("resize", refreshTargets, { passive: true });
    window.addEventListener("orientationchange", refreshTargets, { passive: true });
    window.addEventListener("pageshow", scheduleRender, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) scheduleRender();
    });

    if (typeof MutationObserver === "function") {
      const observer = new MutationObserver((entries) => {
        let shouldRefresh = false;
        for (const entry of entries) {
          if (entry.type !== "childList") continue;
          if ((entry.addedNodes && entry.addedNodes.length) || (entry.removedNodes && entry.removedNodes.length)) {
            shouldRefresh = true;
            break;
          }
        }
        if (shouldRefresh) refreshTargets();
      });
      observer.observe(mainEl, { childList: true, subtree: true });
    }

    window.setTimeout(scheduleRender, 140);
    window.setTimeout(refreshTargets, 640);
  }

  function applyBrandLogotype() {
    document.querySelectorAll(".brand-logo-img").forEach((img) => {
      const currentSrc = String(img.getAttribute("src") || "").trim();
      const currentSrcLower = currentSrc.toLowerCase();
      let logotypeSrc = currentSrc;
      if (!currentSrcLower || currentSrcLower.includes("wordmark") || currentSrcLower.includes("official-logotype")) {
        logotypeSrc = LOGOTYPE_SRC;
        img.setAttribute("src", LOGOTYPE_SRC);
      }
      if (!logotypeSrc) logotypeSrc = LOGOTYPE_SRC;
      img.dataset.logotypeSrc = logotypeSrc;
      img.dataset.logomarkSrc = LOGOMARK_SRC;
      if (!img.getAttribute("alt")) img.setAttribute("alt", "CavBot");
      img.setAttribute("decoding", "async");
      img.classList.remove("is-logomark");
    });
  }

  function installStickyHeaderBrandSwap() {
    const header = document.querySelector(".site-header");
    if (!(header instanceof HTMLElement)) return;

    const brandImages = Array.from(document.querySelectorAll(".brand-logo-img"));
    if (!brandImages.length) return;

    let rafId = 0;
    let lastCompact = null;

    const syncHeaderOffset = () => {
      const headerHeight = Math.max(0, Math.ceil(header.getBoundingClientRect().height || 0));
      document.documentElement.style.setProperty("--cb-header-offset", `${headerHeight}px`);
      document.body.classList.add("cb-has-fixed-header");
    };

    const setBrandState = (compact) => {
      if (lastCompact === compact) return;
      lastCompact = compact;
      header.classList.toggle("is-scrolled", compact);
      brandImages.forEach((img) => {
        if (!(img instanceof HTMLImageElement)) return;
        const logotypeSrc = String(img.dataset.logotypeSrc || LOGOTYPE_SRC);
        const logomarkSrc = String(img.dataset.logomarkSrc || LOGOMARK_SRC);
        const nextSrc = compact ? logomarkSrc : logotypeSrc;
        if (String(img.getAttribute("src") || "") !== nextSrc) {
          img.setAttribute("src", nextSrc);
        }
        img.classList.toggle("is-logomark", compact);
      });
      syncHeaderOffset();
    };

    const run = () => {
      rafId = 0;
      const y = window.scrollY || window.pageYOffset || 0;
      setBrandState(y > HEADER_SCROLL_SWITCH_Y);
    };

    const schedule = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(run);
    };

    syncHeaderOffset();
    run();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", () => {
      syncHeaderOffset();
      schedule();
    }, { passive: true });
    window.addEventListener("orientationchange", () => {
      syncHeaderOffset();
      schedule();
    }, { passive: true });
    window.addEventListener("pageshow", () => {
      syncHeaderOffset();
      schedule();
    }, { passive: true });
  }

  function firstInitialChar(value) {
    const hit = String(value || "").match(/[A-Za-z0-9]/);
    return hit ? hit[0].toUpperCase() : "";
  }

  function deriveInitials(displayName, username, fallbackInitials) {
    const fallback = String(fallbackInitials || "").trim().toUpperCase();
    if (fallback) return fallback.slice(0, 3);

    const name = String(displayName || "").trim();
    if (name) {
      const parts = name.split(/\s+/g).filter(Boolean);
      if (parts.length >= 2) {
        const duo = `${firstInitialChar(parts[0])}${firstInitialChar(parts[1])}`.trim();
        if (duo) return duo;
      }
      const one = firstInitialChar(parts[0] || "");
      if (one) return one;
    }

    const userInitial = firstInitialChar(String(username || "").trim().replace(/^@+/, ""));
    if (userInitial) return userInitial;

    return "C";
  }

  function resolveProfileName(profile) {
    const displayName = String(profile?.displayName || "").trim();
    if (displayName) return displayName;

    const username = String(profile?.username || "").trim().replace(/^@+/, "");
    if (username) return username;

    const email = String(profile?.email || "").trim();
    if (email && email.includes("@")) {
      return email.split("@")[0] || "Account";
    }

    return "Account";
  }

  function sanitizeTone(rawTone) {
    const tone = String(rawTone || "").trim().toLowerCase();
    if (["lime", "violet", "blue", "white", "navy", "transparent"].includes(tone)) return tone;
    return "lime";
  }

  function buildAccountLink(profile) {
    const name = resolveProfileName(profile);
    const initials = deriveInitials(profile?.displayName, profile?.username, profile?.initials);
    const tone = sanitizeTone(profile?.avatarTone);

    const link = document.createElement("a");
    link.className = "cb-site-account";
    link.href = WORKSPACE_HOME_PATH;
    link.setAttribute("data-cb-site-account", "true");
    link.setAttribute("aria-label", "Open your CavBot workspace");
    link.setAttribute("title", `Signed in as ${name}`);

    const chip = document.createElement("span");
    chip.className = "cb-site-account-chip";
    chip.setAttribute("data-tone", tone);

    const initialsEl = document.createElement("span");
    initialsEl.className = "cb-site-account-initials";
    initialsEl.textContent = initials || "C";

    const nameEl = document.createElement("span");
    nameEl.className = "cb-site-account-name";
    nameEl.textContent = name;

    chip.appendChild(initialsEl);
    link.appendChild(chip);
    link.appendChild(nameEl);
    return link;
  }

  async function fetchAuthProfile() {
    try {
      const meRes = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { accept: "application/json" },
      });

      if (meRes.ok) {
        const me = await meRes.json().catch(() => null);
        if (me && me.authenticated && me.user) {
          return {
            displayName: me.user.displayName,
            username: me.user.username,
            email: me.user.email,
            initials: me.user.initials,
            avatarTone: me.user.avatarTone,
          };
        }
      }
    } catch {
      // no-op
    }

    try {
      const sessionRes = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { accept: "application/json" },
      });

      if (!sessionRes.ok) return null;
      const session = await sessionRes.json().catch(() => null);
      if (!session || !session.authed) return null;

      return {
        displayName: session?.session?.displayName || "",
        username: "",
        email: session?.session?.email || "",
        initials: "",
        avatarTone: "lime",
      };
    } catch {
      return null;
    }
  }

  function findAuthCtaRows() {
    return Array.from(document.querySelectorAll(".nav-cta-row")).filter((row) => {
      const links = Array.from(row.querySelectorAll("a[href]"));
      const hasLogin = links.some((a) => String(a.getAttribute("href") || "").toLowerCase().includes(LOGIN_URL));
      const hasSignup = links.some((a) => String(a.getAttribute("href") || "").toLowerCase().includes(SIGNUP_URL));
      return hasLogin && hasSignup;
    });
  }

  function buildTryCavaiControl() {
    const toModelShowcaseRow = (entry) => {
      return `
        <div class="cb-try-cavai-menu-link is-model is-static" ${entry.id ? `data-model-id="${entry.id}"` : ""}>
          <span class="cb-try-cavai-menu-link-label">${entry.label}</span>
        </div>
      `;
    };

    const shell = document.createElement("div");
    shell.className = "cb-try-cavai";
    shell.setAttribute("data-cb-try-cavai", "true");

    const primaryLink = document.createElement("a");
    primaryLink.className = "cb-try-cavai-link";
    primaryLink.href = TRY_CAVAI_URL;
    primaryLink.target = "_blank";
    primaryLink.rel = "noopener noreferrer";
    primaryLink.textContent = "Try CavAi";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "cb-try-cavai-toggle";
    toggle.setAttribute("aria-label", "Open CavBot models and access");
    toggle.setAttribute("aria-haspopup", "dialog");
    toggle.setAttribute("aria-expanded", "false");

    const caret = document.createElement("span");
    caret.className = "cb-try-cavai-caret";
    caret.setAttribute("aria-hidden", "true");

    const caretClosed = document.createElement("img");
    caretClosed.className = "cb-try-cavai-caret-icon cb-try-cavai-caret-icon-closed";
    caretClosed.src = "/assets/icons/page/down-arrow-backup-2-svgrepo-com.svg";
    caretClosed.alt = "";
    caretClosed.decoding = "async";

    const caretOpen = document.createElement("img");
    caretOpen.className = "cb-try-cavai-caret-icon cb-try-cavai-caret-icon-open";
    caretOpen.src = "/assets/icons/page/down-arrow-backup-3-svgrepo-com.svg";
    caretOpen.alt = "";
    caretOpen.decoding = "async";

    caret.append(caretClosed, caretOpen);
    toggle.appendChild(caret);

    const menu = document.createElement("div");
    menu.className = "cb-try-cavai-menu";
    menu.setAttribute("role", "dialog");
    menu.setAttribute("aria-label", "CavBot quick actions");
    menu.innerHTML = `
      <section class="cb-try-cavai-menu-section">
        <h2 class="cb-try-cavai-menu-label">Products</h2>
        ${TRY_CAVAI_PRODUCT_LINKS
          .map((entry) => `
            <a class="cb-try-cavai-menu-link" href="${entry.href}">
              <span class="cb-try-cavai-menu-link-label">${entry.label}</span>
            </a>
          `)
          .join("")}
      </section>
      <div class="cb-try-cavai-menu-divider"></div>
      <section class="cb-try-cavai-menu-section">
        <h2 class="cb-try-cavai-menu-label">Models</h2>
        ${TRY_CAVAI_FRONTEND_MODEL_LINKS.map((entry) => toModelShowcaseRow(entry)).join("")}
      </section>
      <div class="cb-try-cavai-menu-divider"></div>
      <section class="cb-try-cavai-menu-section">
        <h2 class="cb-try-cavai-menu-label">Log in</h2>
        <a class="cb-try-cavai-menu-link" href="${SIGNUP_URL}">Sign up</a>
        <a class="cb-try-cavai-menu-link" href="${LOGIN_URL}">Log in</a>
      </section>
    `;

    const closeMenu = () => {
      shell.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const nextOpen = !shell.classList.contains("is-open");
      shell.classList.toggle("is-open", nextOpen);
      toggle.setAttribute("aria-expanded", nextOpen ? "true" : "false");
    });

    document.addEventListener("click", (event) => {
      if (!shell.contains(event.target)) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    menu.querySelectorAll("a").forEach((anchor) => {
      anchor.addEventListener("click", closeMenu);
    });

    shell.appendChild(primaryLink);
    shell.appendChild(toggle);
    shell.appendChild(menu);
    return shell;
  }

  function hydrateTryCavaiRows() {
    const rows = findAuthCtaRows();
    if (!rows.length) return;

    rows.forEach((row) => {
      row.classList.add("cb-try-cavai-row");
      row.replaceChildren(buildTryCavaiControl());
    });
  }

  function swapAuthCtasForAccount(profile) {
    const rows = findAuthCtaRows();
    if (!rows.length) return;

    rows.forEach((row) => {
      row.querySelectorAll("a[href]").forEach((anchor) => {
        const href = String(anchor.getAttribute("href") || "").toLowerCase();
        if (href.includes(LOGIN_URL) || href.includes(SIGNUP_URL)) {
          anchor.remove();
        }
      });

      if (!row.querySelector('[data-cb-site-account="true"]')) {
        row.appendChild(buildAccountLink(profile));
      }

      row.classList.add("is-authenticated");
    });
  }

  async function hydrateAuthCtaRows() {
    const rows = findAuthCtaRows();
    if (!rows.length) return;

    const profile = await fetchAuthProfile();
    if (!profile) return;

    swapAuthCtasForAccount(profile);
  }

  function installCavGuardForAppLinks() {
    const APP_HOST = "app.cavbot.io";
    const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
    const STYLE_ID = "cb-cavguard-style";
    const MODAL_ID = "cb-cavguard-overlay";
    let modalOverlay = null;
    let dismissButton = null;
    let lastFocusedElement = null;

    const resolveGuardBrand = (anchor) => {
      if (!(anchor instanceof HTMLAnchorElement)) return "CavBot";
      const rawHref = String(anchor.getAttribute("href") || "").trim();
      const anchorText = String(anchor.textContent || "").toLowerCase();

      try {
        const targetUrl = new URL(rawHref, window.location.href);
        const path = String(targetUrl.pathname || "").toLowerCase();
        const host = String(targetUrl.hostname || "").toLowerCase();
        if (path.startsWith("/cavai") || path.includes("cavai")) return "CavAi";
        if (host.includes("cavai")) return "CavAi";
      } catch {
        // no-op
      }

      if (anchorText.includes("cavai")) return "CavAi";
      return "CavBot";
    };

    const isCareersLink = (anchor) => {
      if (!(anchor instanceof HTMLAnchorElement)) return false;
      const rawHref = String(anchor.getAttribute("href") || "").trim();
      if (!rawHref) return false;

      let targetUrl = null;
      try {
        targetUrl = new URL(rawHref, window.location.href);
      } catch {
        return false;
      }

      const pathname = String(targetUrl.pathname || "")
        .toLowerCase()
        .replace(/\/+$/, "");
      return pathname === "/careers" || pathname === "/careers.html";
    };

    const resolveGuardCopy = (anchor) => {
      if (isCareersLink(anchor)) {
        return {
          headline: "CavBot careers are not open yet.",
          copy: "We are not hiring yet. Stay on cavbot.io for updates.",
        };
      }

      const brand = resolveGuardBrand(anchor);
      return {
        headline: `${brand} is in pre-launch.`,
        copy: "The app is not live yet. Stay on cavbot.io and request a demo.",
      };
    };

    const ensureStyle = () => {
      if (document.getElementById(STYLE_ID)) return;
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        .cb-cavguard-overlay {
          position: fixed;
          inset: 0;
          z-index: 1250;
          display: block;
          background: rgba(2, 6, 22, 0.62);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 90ms ease-out, visibility 0s linear 90ms;
        }

        .cb-cavguard-overlay[data-open="true"] {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          transition: opacity 90ms ease-out;
        }

        @supports ((-webkit-backdrop-filter: blur(3px)) or (backdrop-filter: blur(3px))) {
          .cb-cavguard-overlay {
            -webkit-backdrop-filter: blur(3px);
            backdrop-filter: blur(3px);
          }
        }

        .cb-cavguard-card {
          position: fixed;
          left: var(--cb-modal-left, 50vw);
          top: var(--cb-modal-top, 50vh);
          isolation: isolate;
          overflow: hidden;
          width: min(620px, 96vw);
          max-height: min(90vh, 560px);
          overflow-y: auto;
          font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.13);
          background:
            radial-gradient(360px 170px at 96% -42%, rgba(78, 168, 255, 0.16), transparent 64%),
            rgba(1, 4, 16, 0.9);
          box-shadow: none;
          color: #d4dff8;
          display: grid;
          gap: 14px;
          padding: 22px 20px 18px;
          opacity: 0;
          transform: translate3d(-50%, calc(-50% + 8px), 0) scale(0.988);
          transition: opacity 90ms ease-out, transform 110ms ease-out;
          will-change: opacity, transform;
        }

        .cb-cavguard-card::before,
        .cb-cavguard-card::after {
          content: "";
          position: absolute;
          top: 14px;
          bottom: 14px;
          width: 3px;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(185, 200, 90, 0.98), rgba(185, 200, 90, 0.36));
          box-shadow: 0 0 16px rgba(185, 200, 90, 0.28);
          pointer-events: none;
          z-index: 0;
        }

        .cb-cavguard-card::before {
          left: 10px;
        }

        .cb-cavguard-card::after {
          right: 10px;
        }

        .cb-cavguard-card > * {
          position: relative;
          z-index: 1;
        }

        .cb-cavguard-overlay[data-open="true"] .cb-cavguard-card {
          opacity: 1;
          transform: translate3d(-50%, -50%, 0) scale(1);
        }

        .cb-cavguard-glow-top,
        .cb-cavguard-glow-bottom {
          display: none;
        }

        .cb-cavguard-glow-top {
          width: 280px;
          height: 180px;
          top: -110px;
          right: -88px;
          background: rgba(78, 168, 255, 0.22);
        }

        .cb-cavguard-glow-bottom {
          width: 260px;
          height: 170px;
          left: -78px;
          bottom: -108px;
          background: rgba(185, 200, 90, 0.18);
        }

        .cb-cavguard-header {
          display: grid;
          justify-items: center;
          align-items: center;
          gap: 14px;
          padding-top: 10px;
        }

        .cb-cavguard-br-spacer {
          height: 32px;
        }

        .cb-cavguard-brand {
          min-width: 0;
          display: grid;
          grid-template-columns: 1fr;
          justify-items: center;
          align-items: center;
          row-gap: 24px;
          text-align: center;
        }

        .cb-cavguard-emblem {
          position: relative;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(6, 12, 28, 0.92);
          display: grid;
          place-items: center;
          box-shadow: inset 0 0 0 1px rgba(78, 168, 255, 0.15);
        }

        .cb-cavguard-mark {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }

        .cb-cavguard-shield {
          position: absolute;
          right: -4px;
          bottom: -4px;
          width: 17px;
          height: 17px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: rgba(1, 8, 20, 0.98);
          display: grid;
          place-items: center;
        }

        .cb-cavguard-shield-icon {
          width: 10px;
          height: 10px;
          background: rgba(185, 200, 90, 0.96);
          -webkit-mask: url("/icons/app/security-protection-hand-shield-svgrepo-com.svg") center / contain no-repeat;
          mask: url("/icons/app/security-protection-hand-shield-svgrepo-com.svg") center / contain no-repeat;
        }

        .cb-cavguard-brand-meta {
          min-width: 0;
          display: grid;
          justify-items: center;
          text-align: center;
        }

        .cb-cavguard-title {
          margin: 0;
          font-size: 23px;
          letter-spacing: 0.03em;
          color: #f7fbff;
        }

        .cb-cavguard-body {
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 14px;
          background: rgba(1, 4, 16, 0.58);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
          padding: 14px 14px 13px;
          display: grid;
          gap: 14px;
          min-height: 208px;
          align-content: center;
          justify-items: center;
          text-align: center;
        }

        .cb-cavguard-headline {
          margin: 0 auto;
          width: min(52ch, 100%);
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
          color: #f7fbff;
        }

        .cb-cavguard-copy-block {
          width: min(52ch, 100%);
          margin: 0 auto;
          display: grid;
          gap: 12px;
          justify-items: center;
        }

        .cb-cavguard-copy-line {
          margin: 0;
          font-size: 12px;
          line-height: 1.72;
          letter-spacing: 0.012em;
          text-align: center;
          color: rgba(224, 234, 252, 0.92);
          max-width: 46ch;
        }

        .cb-cavguard-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 32px;
        }

        .cb-cavguard-action-btn {
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 12px;
          border: 0;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          color: rgba(247, 251, 255, 0.92);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          white-space: nowrap;
          cursor: pointer;
          box-shadow: none;
          transition: background 120ms ease, color 120ms ease, opacity 120ms ease;
        }

        .cb-cavguard-action-btn:hover {
          background: rgba(78, 168, 255, 0.12);
          color: rgba(247, 251, 255, 0.96);
        }

        .cb-cavguard-action-btn:active {
          opacity: 0.92;
        }

        .cb-cavguard-action-btn:focus-visible {
          outline: 0;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.18);
        }

        @media (prefers-reduced-motion: reduce) {
          .cb-cavguard-overlay,
          .cb-cavguard-card {
            transition: none;
          }

          .cb-cavguard-card {
            opacity: 1;
            transform: none;
          }
        }

        @media (max-width: 620px) {
          .cb-cavguard-card {
            border-radius: 16px;
            padding: 18px 15px 14px;
          }

          .cb-cavguard-header {
            padding-top: 8px;
          }

          .cb-cavguard-brand {
            row-gap: 18px;
          }

          .cb-cavguard-br-spacer {
            height: 24px;
          }

          .cb-cavguard-title {
            font-size: 20px;
          }

          .cb-cavguard-copy-line {
            font-size: 11px;
          }

          .cb-cavguard-body {
            min-height: 190px;
          }

          .cb-cavguard-footer {
            margin-top: 24px;
          }
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    };

    const closeModal = () => {
      if (!modalOverlay) return;
      const wasOpen = modalOverlay.getAttribute("data-open") === "true";
      modalOverlay.setAttribute("data-open", "false");
      modalOverlay.setAttribute("aria-hidden", "true");
      if (wasOpen) unlockPageScroll();
      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus({ preventScroll: true });
      }
      lastFocusedElement = null;
    };

    const ensureModal = () => {
      if (modalOverlay) return modalOverlay;
      ensureStyle();

      modalOverlay = document.getElementById(MODAL_ID);
      if (!modalOverlay) {
        modalOverlay = document.createElement("div");
        modalOverlay.id = MODAL_ID;
        modalOverlay.className = "cb-cavguard-overlay";
        modalOverlay.setAttribute("data-open", "false");
        modalOverlay.setAttribute("role", "presentation");
        modalOverlay.setAttribute("aria-hidden", "true");
        modalOverlay.innerHTML = `
          <div class="cb-cavguard-card" role="dialog" aria-modal="true" aria-labelledby="cb-cavguard-title">
            <span class="cb-cavguard-glow-top" aria-hidden="true"></span>
            <span class="cb-cavguard-glow-bottom" aria-hidden="true"></span>
            <div class="cb-cavguard-header">
              <div class="cb-cavguard-brand">
                <div class="cb-cavguard-emblem" aria-hidden="true">
                  <img src="/logo/cavbot-logomark.svg" alt="" width="38" height="38" class="cb-cavguard-mark" decoding="async">
                  <span class="cb-cavguard-shield">
                    <span class="cb-cavguard-shield-icon"></span>
                  </span>
                </div>
                <div class="cb-cavguard-brand-meta">
                  <h2 class="cb-cavguard-title" id="cb-cavguard-title">CavGuard</h2>
                </div>
              </div>
            </div>
            <div class="cb-cavguard-br-spacer" aria-hidden="true"></div>
            <div class="cb-cavguard-body">
              <h3 class="cb-cavguard-headline" data-cb-cavguard-headline>CavBot is in pre-launch.</h3>
              <div class="cb-cavguard-copy-block">
                <p class="cb-cavguard-copy-line" data-cb-cavguard-copy>The app is not live yet. Stay on cavbot.io and request a demo.</p>
              </div>
            </div>
            <div class="cb-cavguard-footer">
              <button type="button" class="cb-cavguard-action-btn" data-cb-cavguard-dismiss>Dismiss</button>
            </div>
          </div>
        `;
        document.documentElement.appendChild(modalOverlay);
      }

      dismissButton = modalOverlay.querySelector("[data-cb-cavguard-dismiss]");
      if (dismissButton && !dismissButton.hasAttribute("data-cb-cavguard-bound")) {
        dismissButton.setAttribute("data-cb-cavguard-bound", "1");
        dismissButton.addEventListener("click", closeModal);
      }

      if (!modalOverlay.hasAttribute("data-cb-cavguard-bound")) {
        modalOverlay.setAttribute("data-cb-cavguard-bound", "1");
        modalOverlay.addEventListener("click", (event) => {
          if (event.target === modalOverlay) closeModal();
        });
        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape" && modalOverlay?.getAttribute("data-open") === "true") {
            event.preventDefault();
            closeModal();
          }
        });
      }

      return modalOverlay;
    };

    const openModal = (anchor) => {
      const overlay = ensureModal();
      if (!overlay) return;
      const card = overlay.querySelector(".cb-cavguard-card");
      const headlineEl = overlay.querySelector("[data-cb-cavguard-headline]");
      const copyEl = overlay.querySelector("[data-cb-cavguard-copy]");
      const copy = resolveGuardCopy(anchor);
      if (headlineEl) headlineEl.textContent = copy.headline;
      if (copyEl) copyEl.textContent = copy.copy;
      lastFocusedElement = document.activeElement;
      positionModalCard(overlay, card, window.innerWidth * 0.5, window.innerHeight * 0.5, null);
      if (overlay.getAttribute("data-open") !== "true") lockPageScroll();
      overlay.setAttribute("data-open", "true");
      overlay.setAttribute("aria-hidden", "false");
      if (dismissButton && typeof dismissButton.focus === "function") {
        dismissButton.focus({ preventScroll: true });
      }
    };

    const closeNavOverlayIfOpen = () => {
      if (!navOverlay || !navToggle) return;
      if (!navOverlay.classList.contains("is-open")) return;
      navOverlay.classList.remove("is-open");
      document.documentElement.classList.remove("nav-open");
      document.body.classList.remove("nav-open");
      navOverlay.setAttribute("aria-hidden", "true");
      navToggle.setAttribute("aria-expanded", "false");
    };

    const shouldGuardAnchor = (anchor) => {
      if (!(anchor instanceof HTMLAnchorElement)) return false;
      if (anchor.hasAttribute("data-cavguard-ignore")) return false;

      const rawHref = String(anchor.getAttribute("href") || "").trim();
      if (!rawHref) return false;
      const hasExplicitHost = /^([a-z][a-z0-9+.-]*:)?\/\//i.test(rawHref);
      if (
        rawHref.startsWith("#") ||
        /^mailto:/i.test(rawHref) ||
        /^tel:/i.test(rawHref) ||
        /^javascript:/i.test(rawHref)
      ) {
        return false;
      }

      let targetUrl = null;
      try {
        targetUrl = new URL(rawHref, window.location.href);
      } catch {
        return false;
      }

      if (isCareersLink(anchor)) return true;

      const hostname = String(targetUrl.hostname || "").toLowerCase();
      if (hostname === APP_HOST) return true;
      if (hasExplicitHost && LOOPBACK_HOSTS.has(hostname)) return true;
      if (hasExplicitHost && hostname.endsWith(".localhost")) return true;
      return false;
    };

    const maybeGuardNavigation = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!anchor || !shouldGuardAnchor(anchor)) return;
      event.preventDefault();
      event.stopPropagation();
      closeNavOverlayIfOpen();
      openModal(anchor);
    };

    window.__cavbotOpenCavGuardModal = () => openModal(null);
    document.addEventListener("click", maybeGuardNavigation, true);
    document.addEventListener("auxclick", maybeGuardNavigation, true);
  }

  function installDemoRequestModal() {
    const triggerSelector = "[data-demo-request-open]";
    if (!document.querySelector(triggerSelector)) return;

    const DEMO_STYLE_ID = "cb-demo-request-style";
    const DEMO_MODAL_ID = "cb-demo-request-overlay";
    const VERIFY_MODAL_ID = "cb-caverify-overlay";
    const VERIFY_ACTION_TYPE = "invite";
    const VERIFY_ROUTE = "/request-demo";
    const VERIFY_GRANT_HEADER = "x-cavbot-verify-grant";
    const VERIFY_SESSION_HEADER = "x-cavbot-verify-session";

    const cleanValue = (value) => String(value || "").trim();
    const parseIsoMs = (value) => {
      const time = Date.parse(cleanValue(value));
      return Number.isFinite(time) ? time : 0;
    };
    const escapeAttr = (value) =>
      cleanValue(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const dedupeList = (items) => {
      const seen = new Set();
      return (items || []).filter((item) => {
        const value = cleanValue(item);
        if (!value || seen.has(value)) return false;
        seen.add(value);
        return true;
      });
    };

    const buildVerifyEndpoint = (base, operation) => {
      const op = cleanValue(operation);
      const raw = cleanValue(base);
      if (!op) return "";
      if (!raw) return `/api/verify/${op}`;
      const trimmed = raw.replace(/\/+$/, "");
      if (/\/api\/verify\/(challenge|submit)$/i.test(trimmed)) return trimmed;
      if (/\/api\/verify\/otp\/(start|confirm)$/i.test(trimmed)) return trimmed;
      if (/\/api\/verify$/i.test(trimmed)) return `${trimmed}/${op}`;
      return `${trimmed}/api/verify/${op}`;
    };

    const verifyBaseCandidates = dedupeList([
      window.CAVBOT_VERIFY_API_BASE,
      window.CAVBOT_APP_ORIGIN,
      "",
      "https://www.cavbot.io",
      "https://cavbot.io",
      "https://app.cavbot.io",
    ]);

    const demoEndpoints = dedupeList([
      window.CAVBOT_DEMO_REQUEST_ENDPOINT,
      "/api/public/demo-request",
      "https://www.cavbot.io/api/public/demo-request",
      "https://cavbot.io/api/public/demo-request",
      "https://app.cavbot.io/api/public/demo-request",
    ]);

    const verifyChallengeEndpoints = dedupeList([
      window.CAVBOT_VERIFY_CHALLENGE_ENDPOINT,
      ...verifyBaseCandidates.map((base) => buildVerifyEndpoint(base, "challenge")),
    ]);
    const verifySubmitEndpoints = dedupeList([
      window.CAVBOT_VERIFY_SUBMIT_ENDPOINT,
      ...verifyBaseCandidates.map((base) => buildVerifyEndpoint(base, "submit")),
    ]);
    const verifyOtpStartEndpoints = dedupeList([
      window.CAVBOT_VERIFY_OTP_START_ENDPOINT,
      ...verifyBaseCandidates.map((base) => buildVerifyEndpoint(base, "otp/start")),
    ]);
    const verifyOtpConfirmEndpoints = dedupeList([
      window.CAVBOT_VERIFY_OTP_CONFIRM_ENDPOINT,
      ...verifyBaseCandidates.map((base) => buildVerifyEndpoint(base, "otp/confirm")),
    ]);

    let modalOverlay = null;
    let formEl = null;
    let closeBtn = null;
    let submitBtn = null;
    let statusEl = null;
    let lastFocusedElement = null;
    let submitting = false;

    let verifyOverlay = null;
    let verifyCloseBtn = null;
    let verifyBodyEl = null;
    let verifyErrorEl = null;

    const verifyState = {
      mode: "challenge",
      loading: false,
      submitting: false,
      otpBusy: false,
      otpStarted: false,
      otpIdentifier: "",
      otpCode: "",
      otpChallengeId: "",
      challenge: null,
      sessionId: "",
      failedAttempts: 0,
      error: "",
      drag: null,
      resolve: null,
      reject: null,
      pendingPromise: null,
      lastFocusedElement: null,
      grantToken: "",
      grantExpiresAtMs: 0,
    };

    const challengeTileMap = new Map();

    const hasValidVerifyGrant = () =>
      Boolean(verifyState.grantToken) &&
      (verifyState.grantExpiresAtMs <= 0 || Date.now() < verifyState.grantExpiresAtMs - 3000);

    const clearVerifyGrant = () => {
      verifyState.grantToken = "";
      verifyState.grantExpiresAtMs = 0;
    };

    const rememberVerifyGrant = (payload) => {
      verifyState.grantToken = cleanValue(payload?.verificationGrantToken);
      const expiresAtMs = parseIsoMs(payload?.expiresAt);
      verifyState.grantExpiresAtMs = expiresAtMs > 0 ? expiresAtMs : Date.now() + 110_000;
      const sid = cleanValue(payload?.sessionId);
      if (sid) verifyState.sessionId = sid;
    };

    const ensureStyle = () => {
      if (document.getElementById(DEMO_STYLE_ID)) return;
      const style = document.createElement("style");
      style.id = DEMO_STYLE_ID;
      style.textContent = `
        .cb-demo-request-overlay,
        .cb-caverify-overlay {
          position: fixed;
          inset: 0;
          display: block;
          background: rgba(2, 6, 22, 0.62);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 90ms ease-out, visibility 0s linear 90ms;
        }

        .cb-demo-request-overlay {
          z-index: 1260;
        }

        .cb-caverify-overlay {
          z-index: 1280;
        }

        .cb-demo-request-overlay[data-open="true"],
        .cb-caverify-overlay[data-open="true"] {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          transition: opacity 90ms ease-out;
        }

        @supports ((-webkit-backdrop-filter: blur(3px)) or (backdrop-filter: blur(3px))) {
          .cb-demo-request-overlay,
          .cb-caverify-overlay {
            -webkit-backdrop-filter: blur(3px);
            backdrop-filter: blur(3px);
          }
        }

        .cb-demo-request-card {
          position: fixed;
          left: var(--cb-modal-left, 50vw);
          top: var(--cb-modal-top, 50vh);
          isolation: isolate;
          overflow: hidden;
          width: min(720px, 96vw);
          max-height: min(90vh, 760px);
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.13);
          background:
            radial-gradient(360px 170px at 96% -42%, rgba(78, 168, 255, 0.16), transparent 64%),
            rgba(1, 4, 16, 0.9);
          color: #d4dff8;
          display: grid;
          gap: 14px;
          padding: 22px 20px 18px;
          opacity: 0;
          transform: translate3d(-50%, calc(-50% + 8px), 0) scale(0.988);
          transition: opacity 90ms ease-out, transform 110ms ease-out;
          will-change: opacity, transform;
        }

        .cb-demo-request-card::-webkit-scrollbar {
          width: 0;
          height: 0;
          background: transparent;
        }

        .cb-demo-request-overlay[data-open="true"] .cb-demo-request-card {
          opacity: 1;
          transform: translate3d(-50%, -50%, 0) scale(1);
        }

        .cb-demo-request-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          border: 0;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          color: rgba(247, 251, 255, 0.92);
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          transition: background 120ms ease, color 120ms ease, opacity 120ms ease;
        }

        .cb-demo-request-close:hover {
          background: rgba(78, 168, 255, 0.14);
        }

        .cb-demo-request-header {
          display: grid;
          justify-items: center;
          align-items: center;
          gap: 12px;
          padding-top: 8px;
          text-align: center;
        }

        .cb-demo-request-header-badge {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          margin-bottom: 2px;
        }

        .cb-demo-request-header-badge .cavbot-cdn-slot {
          width: 46px;
          height: 46px;
          min-width: 46px;
          min-height: 46px;
          display: grid;
          place-items: center;
        }

        .cb-demo-request-header-badge .cavbot-cdn-slot[data-cavbot-cdn-slot="badge"] {
          width: 46px;
          height: 46px;
          min-width: 46px;
          min-height: 46px;
        }

        .cb-demo-request-header-badge .cavbot-cdn-slot [id^="cavbot-widget-root-"] {
          transform: scale(0.52);
          transform-origin: center;
        }

        .cb-demo-request-emblem,
        .cb-caverify-emblem {
          position: relative;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(6, 12, 28, 0.92);
          display: grid;
          place-items: center;
          box-shadow: inset 0 0 0 1px rgba(78, 168, 255, 0.15);
        }

        .cb-demo-request-mark,
        .cb-caverify-mark {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }

        .cb-demo-request-shield,
        .cb-caverify-shield {
          position: absolute;
          right: -4px;
          bottom: -4px;
          width: 17px;
          height: 17px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: rgba(1, 8, 20, 0.98);
          display: grid;
          place-items: center;
        }

        .cb-demo-request-shield-icon,
        .cb-caverify-shield-icon {
          width: 10px;
          height: 10px;
          background: rgba(185, 200, 90, 0.96);
          -webkit-mask: url("/icons/app/security-protection-hand-shield-svgrepo-com.svg") center / contain no-repeat;
          mask: url("/icons/app/security-protection-hand-shield-svgrepo-com.svg") center / contain no-repeat;
        }

        .cb-demo-request-title {
          margin: 0;
          font-size: 24px;
          letter-spacing: 0.03em;
          color: #f7fbff;
          font-weight: 600;
        }

        .cb-demo-request-copy {
          margin: 0;
          width: min(52ch, 100%);
          font-size: 12px;
          line-height: 1.72;
          letter-spacing: 0.012em;
          text-align: center;
          color: rgba(224, 234, 252, 0.92);
        }

        .cb-demo-request-form-shell {
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 14px;
          background: rgba(1, 4, 16, 0.58);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
          padding: 14px 14px 13px;
          display: grid;
          gap: 16px;
          margin-top: 14px;
        }

        .cb-demo-request-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          column-gap: 12px;
          row-gap: 22px;
        }

        .cb-demo-request-field {
          display: grid;
          gap: 7px;
        }

        .cb-demo-request-field[data-span="2"] {
          grid-column: span 2;
        }

        .cb-demo-request-label {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(197, 206, 231, 0.84);
        }

        .cb-demo-request-input {
          width: 100%;
          height: 40px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(4, 9, 26, 0.9);
          color: #f7fbff;
          padding: 0 12px;
          font-size: 13px;
          outline: 0;
          line-height: 1.3;
          transition: border-color 120ms ease, box-shadow 120ms ease, background 120ms ease;
        }

        .cb-demo-request-input::placeholder {
          color: rgba(197, 206, 231, 0.56);
        }

        .cb-demo-request-input:hover {
          border-color: rgba(185, 200, 90, 0.34);
        }

        .cb-demo-request-input:focus {
          border-color: rgba(185, 200, 90, 0.52);
          box-shadow: none;
          background: rgba(5, 11, 30, 0.95);
        }

        .cb-demo-request-input[aria-invalid="true"] {
          border-color: rgba(235, 92, 92, 0.84);
          box-shadow: 0 0 0 2px rgba(235, 92, 92, 0.2);
        }

        .cb-demo-request-input::-webkit-contacts-auto-fill-button,
        .cb-demo-request-input::-webkit-credentials-auto-fill-button,
        .cb-demo-request-input::-webkit-calendar-picker-indicator {
          filter: invert(84%) sepia(6%) saturate(240%) hue-rotate(186deg) brightness(90%) contrast(88%);
          opacity: 0.64;
        }

        .cb-demo-request-input:hover::-webkit-contacts-auto-fill-button,
        .cb-demo-request-input:hover::-webkit-credentials-auto-fill-button,
        .cb-demo-request-input:hover::-webkit-calendar-picker-indicator,
        .cb-demo-request-input:focus::-webkit-contacts-auto-fill-button,
        .cb-demo-request-input:focus::-webkit-credentials-auto-fill-button,
        .cb-demo-request-input:focus::-webkit-calendar-picker-indicator {
          opacity: 0.8;
        }

        .cb-demo-request-protection {
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          gap: 10px;
          width: fit-content;
          max-width: 100%;
          align-self: end;
          justify-self: end;
          margin-left: auto;
          border-radius: 11px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.04);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
          padding: 10px 12px;
          margin-top: 12px;
        }

        .cb-demo-request-protection-brand {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cb-demo-request-protection-emblem {
          position: relative;
          flex: 0 0 auto;
          order: 2;
          width: 30px;
          height: 30px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.04);
          display: grid;
          place-items: center;
        }

        .cb-demo-request-protection-mark {
          width: 17px;
          height: 17px;
          object-fit: contain;
        }

        .cb-demo-request-protection-shield {
          position: absolute;
          right: -4px;
          bottom: -4px;
          width: 13px;
          height: 13px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: rgba(255, 255, 255, 0.08);
          display: grid;
          place-items: center;
        }

        .cb-demo-request-protection-shield::before {
          content: "";
          width: 8px;
          height: 8px;
          background: rgba(247, 251, 255, 0.92);
          -webkit-mask: url("/icons/app/security-protection-hand-shield-svgrepo-com.svg") center / contain no-repeat;
          mask: url("/icons/app/security-protection-hand-shield-svgrepo-com.svg") center / contain no-repeat;
        }

        .cb-demo-request-protection-copy {
          min-width: 0;
          display: grid;
          order: 1;
          gap: 4px;
        }

        .cb-demo-request-protection-title {
          margin: 0;
          font-size: 10.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(197, 206, 231, 0.74);
          line-height: 1.3;
          white-space: nowrap;
        }

        .cb-demo-request-protection-title strong {
          color: rgba(224, 234, 252, 0.82);
          font-weight: 700;
        }

        .cb-demo-request-protection-sub {
          margin: 0;
          font-size: 10px;
          letter-spacing: 0.02em;
          color: rgba(197, 206, 231, 0.84);
          line-height: 1.35;
        }

        .cb-demo-request-protection-links {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 1px;
          font-size: 10px;
          line-height: 1.35;
          letter-spacing: 0.02em;
          color: rgba(197, 206, 231, 0.66);
          white-space: nowrap;
        }

        .cb-demo-request-protection-links a {
          color: rgba(197, 206, 231, 0.66);
          text-decoration: none;
        }

        .cb-demo-request-protection-links a:hover {
          color: rgba(224, 234, 252, 0.84);
          text-decoration: none;
        }

        .cb-demo-request-protection-chip {
          display: none;
        }

        .cb-demo-request-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
        }

        .cb-demo-request-submit {
          min-width: 148px;
          height: 36px;
          border: 1px solid rgba(0, 0, 0, 0.72);
          border-radius: 10px;
          padding: 0 18px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-family: var(--font-sans, "Sora", "Inter", sans-serif);
          color: #050509;
          background-image: none;
          background-color: #b9c85a;
          box-shadow: none;
          cursor: pointer;
          transition: transform 120ms ease, opacity 120ms ease;
        }

        .cb-demo-request-submit:hover {
          transform: translateY(-1px);
        }

        .cb-demo-request-submit:active {
          transform: translateY(0);
        }

        .cb-demo-request-submit:disabled {
          opacity: 0.56;
          cursor: not-allowed;
          transform: none;
        }

        .cb-demo-request-status {
          margin: 0;
          min-height: 18px;
          font-size: 12px;
          line-height: 1.5;
          color: rgba(224, 234, 252, 0.84);
        }

        .cb-demo-request-status[data-tone="error"] {
          color: #ff8d8d;
        }

        .cb-demo-request-status[data-tone="success"] {
          color: #c8f07f;
        }

        .cb-demo-request-honeypot {
          position: absolute !important;
          left: -9999px !important;
          top: auto !important;
          width: 1px !important;
          height: 1px !important;
          opacity: 0 !important;
          pointer-events: none !important;
          overflow: hidden !important;
          white-space: nowrap !important;
        }

        .cb-demo-request-honeypot > span {
          display: none !important;
        }

        .cb-caverify-card {
          position: fixed;
          left: 50vw;
          top: 50vh;
          transform: translate3d(-50%, -50%, 0);
          width: min(560px, 96vw);
          max-height: min(90vh, 760px);
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(1, 3, 15, 0.94);
          color: #c5cee7;
          display: grid;
          gap: 14px;
          padding: 18px 16px 14px;
          box-shadow: none;
          font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .cb-caverify-card::-webkit-scrollbar {
          width: 0;
          height: 0;
          background: transparent;
        }

        .cb-caverify-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }

        .cb-caverify-brand {
          min-width: 0;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: center;
          column-gap: 10px;
        }

        .cb-caverify-meta {
          min-width: 0;
        }

        .cb-caverify-title {
          margin: 0;
          font-size: 16px;
          letter-spacing: 0.04em;
          color: #f7fbff;
        }

        .cb-caverify-sub {
          margin: 6px 0 0;
          font-size: 12px;
          color: rgba(197, 206, 231, 0.76);
        }

        .cb-caverify-close {
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.2);
          color: #c5cee7;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          border-radius: 10px;
          padding: 8px 10px;
          cursor: pointer;
        }

        .cb-caverify-close:hover {
          border-color: rgba(78, 168, 255, 0.42);
          color: #f7fbff;
        }

        .cb-caverify-close:disabled {
          opacity: 0.55;
          cursor: default;
        }

        .cb-caverify-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          width: calc(100% + 32px);
          margin-inline: -16px;
        }

        .cb-caverify-loading {
          min-height: 120px;
          display: grid;
          place-items: center;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: rgba(197, 206, 231, 0.82);
        }

        .cb-caverify-challenge-wrap {
          position: relative;
          display: grid;
          gap: 22px;
          padding-top: 6px;
          padding-bottom: 10px;
          min-height: 286px;
        }

        .cb-caverify-wordmark {
          position: relative;
          width: min(100%, 228px);
          margin: 2px auto 0;
        }

        .cb-caverify-wordmark-image {
          width: 100%;
          height: auto;
          display: block;
          user-select: none;
          pointer-events: none;
          opacity: 0.96;
        }

        .cb-caverify-slot {
          position: absolute;
          transform: translate(-50%, -50%);
          border-radius: 10px;
          border: 1px dashed rgba(78, 168, 255, 0.55);
          background: rgba(78, 168, 255, 0.1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: rgba(78, 168, 255, 0.88);
          margin: 0;
        }

        .cb-caverify-slot svg {
          width: 24px;
          height: 24px;
          display: block;
        }

        .cb-caverify-tiles {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 9px;
          width: min(100%, 328px);
          margin: 4px auto 0;
        }

        .cb-caverify-tile {
          height: 52px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: linear-gradient(135deg, rgba(185, 200, 90, 0.2), rgba(78, 168, 255, 0.18));
          color: #f7fbff;
          display: grid;
          place-items: center;
          cursor: grab;
          user-select: none;
          touch-action: none;
          transition: transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
        }

        .cb-caverify-tile:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .cb-caverify-tile svg {
          width: 34px;
          height: 34px;
          display: block;
          pointer-events: none;
        }

        .cb-caverify-tile-dragging {
          border-color: rgba(78, 168, 255, 0.66);
          box-shadow: 0 8px 24px rgba(78, 168, 255, 0.28);
          cursor: grabbing;
        }

        .cb-caverify-hint-row {
          display: flex;
          justify-content: flex-end;
          width: 100%;
          margin: 28px 0 0;
        }

        .cb-caverify-link-btn {
          border: 0;
          padding: 0;
          margin-top: 0;
          background: transparent;
          color: #4ea8ff;
          font-size: 11px;
          line-height: 1.1;
          letter-spacing: 0.08em;
          justify-self: end;
          cursor: pointer;
        }

        .cb-caverify-otp-wrap {
          display: grid;
          gap: 16px;
          padding-top: 46px;
          padding-bottom: 0;
          align-content: start;
        }

        .cb-caverify-input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.24);
          color: #f7fbff;
          padding: 11px 12px;
          font-size: 14px;
          outline: none;
        }

        .cb-caverify-input:focus {
          border-color: rgba(78, 168, 255, 0.62);
        }

        .cb-caverify-code {
          letter-spacing: 0.22em;
          font-size: 17px;
          text-align: center;
        }

        .cb-caverify-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 16px;
          margin-bottom: 10px;
        }

        .cb-caverify-btn {
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.22);
          color: #f7fbff;
          border-radius: 12px;
          padding: 11px 12px;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .cb-caverify-btn:disabled {
          opacity: 0.55;
          cursor: default;
        }

        .cb-caverify-btn-primary {
          background: linear-gradient(135deg, rgba(185, 200, 90, 0.28), rgba(78, 168, 255, 0.26));
        }

        .cb-caverify-error {
          min-height: 16px;
          color: rgba(255, 150, 150, 0.95);
          font-size: 12px;
          margin: 0;
        }

        @media (max-width: 760px) {
          .cb-demo-request-card {
            border-radius: 16px;
            padding: 20px 14px 14px;
          }

          .cb-demo-request-header-badge {
            width: 42px;
            height: 42px;
          }

          .cb-demo-request-header-badge .cavbot-cdn-slot,
          .cb-demo-request-header-badge .cavbot-cdn-slot[data-cavbot-cdn-slot="badge"] {
            width: 42px;
            height: 42px;
            min-width: 42px;
            min-height: 42px;
          }

          .cb-demo-request-header-badge .cavbot-cdn-slot [id^="cavbot-widget-root-"] {
            transform: scale(0.47);
          }

          .cb-demo-request-title {
            font-size: 21px;
          }

          .cb-demo-request-copy {
            font-size: 11.5px;
          }

          .cb-demo-request-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .cb-demo-request-field[data-span="2"] {
            grid-column: auto;
          }

          .cb-demo-request-protection {
            padding: 9px 10px;
            margin-top: 10px;
          }

          .cb-demo-request-protection-sub {
            white-space: normal;
          }

          .cb-demo-request-actions {
            justify-content: stretch;
          }

          .cb-demo-request-submit {
            width: 100%;
            min-width: 0;
          }

          .cb-demo-request-close {
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
          }
        }

        @media (max-width: 540px) {
          .cb-caverify-top {
            gap: 10px;
          }

          .cb-caverify-title {
            font-size: 15px;
          }

          .cb-caverify-tiles {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            width: min(100%, 256px);
          }

          .cb-caverify-actions {
            grid-template-columns: 1fr;
          }
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    };

    const closeNavOverlayIfOpen = () => {
      if (!navOverlay || !navToggle) return;
      if (!navOverlay.classList.contains("is-open")) return;
      navOverlay.classList.remove("is-open");
      document.documentElement.classList.remove("nav-open");
      document.body.classList.remove("nav-open");
      navOverlay.setAttribute("aria-hidden", "true");
      navToggle.setAttribute("aria-expanded", "false");
    };

    const setStatus = (message, tone) => {
      if (!statusEl) return;
      statusEl.textContent = cleanValue(message);
      if (!tone) {
        statusEl.removeAttribute("data-tone");
      } else {
        statusEl.setAttribute("data-tone", tone);
      }
    };

    const setSubmitting = (nextSubmitting) => {
      submitting = Boolean(nextSubmitting);
      if (submitBtn) {
        submitBtn.disabled = submitting;
        submitBtn.textContent = submitting ? "Sending..." : "Send Request";
      }
    };

    const mountDemoHeaderBadge = () => {
      if (!modalOverlay) return;
      const badgeSlot = modalOverlay.querySelector(
        '[data-cavbot-cdn-slot="badge"][data-cavbot-cdn-modal-badge="1"]',
      );
      if (!(badgeSlot instanceof HTMLElement)) return;
      try {
        if (typeof window.__cavbotMountCdnSlot === "function") {
          void Promise.resolve(window.__cavbotMountCdnSlot(badgeSlot));
          return;
        }
        if (typeof window.__cavbotMountCdnSlots === "function") {
          void Promise.resolve(window.__cavbotMountCdnSlots());
        }
      } catch {
        // no-op
      }
    };

    const fieldsFromForm = () => {
      if (!formEl) return null;
      const data = new FormData(formEl);
      return {
        firstName: cleanValue(data.get("firstName")),
        lastName: cleanValue(data.get("lastName")),
        businessEmail: cleanValue(data.get("businessEmail")),
        jobTitle: cleanValue(data.get("jobTitle")),
        company: cleanValue(data.get("company")),
        phoneNumber: cleanValue(data.get("phoneNumber")),
        website: cleanValue(data.get("website")),
      };
    };

    const clearInvalids = () => {
      if (!formEl) return;
      formEl.querySelectorAll(".cb-demo-request-input[aria-invalid='true']").forEach((el) => {
        el.removeAttribute("aria-invalid");
      });
    };

    const markInvalid = (name) => {
      if (!formEl) return;
      const field = formEl.querySelector(`.cb-demo-request-input[name="${name}"]`);
      if (field) field.setAttribute("aria-invalid", "true");
    };

    const looksLikeEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const validateFields = (fields) => {
      clearInvalids();

      if (!fields.firstName) {
        markInvalid("firstName");
        return "First Name is required.";
      }
      if (!fields.lastName) {
        markInvalid("lastName");
        return "Last Name is required.";
      }
      if (!fields.businessEmail) {
        markInvalid("businessEmail");
        return "Business Email is required.";
      }
      if (!looksLikeEmail(fields.businessEmail)) {
        markInvalid("businessEmail");
        return "Please enter a valid Business Email.";
      }
      if (!fields.company) {
        markInvalid("company");
        return "Company is required.";
      }
      if (!fields.phoneNumber) {
        markInvalid("phoneNumber");
        return "Phone Number is required.";
      }
      return "";
    };

    const postJsonAcrossEndpoints = async (endpoints, payload, options = {}) => {
      const fallbackMessage = cleanValue(options.fallbackMessage) || "Request failed.";
      const continueStatuses = new Set(options.continueStatuses || []);
      const credentialsOrder = dedupeList(options.credentialsOrder || ["include", "omit"]);
      let lastMessage = "";

      for (let i = 0; i < endpoints.length; i += 1) {
        const endpoint = endpoints[i];
        let moveNextEndpoint = false;

        for (let j = 0; j < credentialsOrder.length; j += 1) {
          const credentials = credentialsOrder[j];
          try {
            const response = await fetch(endpoint, {
              method: "POST",
              mode: "cors",
              credentials: credentials || "include",
              cache: "no-store",
              headers: {
                "Content-Type": "application/json",
                accept: "application/json",
                ...(options.headers || {}),
              },
              body: JSON.stringify(payload || {}),
            });

            const body = await response.json().catch(() => ({}));
            const bodyMessage = cleanValue(body?.message || body?.error || body?.code);

            if (response.status === 404 || response.status === 405) {
              lastMessage = bodyMessage || lastMessage;
              moveNextEndpoint = true;
              break;
            }

            if (!response.ok || body?.ok === false) {
              if (continueStatuses.has(response.status)) {
                lastMessage = bodyMessage || lastMessage;
                continue;
              }
              return {
                ok: false,
                status: response.status,
                body,
                message: bodyMessage || fallbackMessage,
                endpoint,
              };
            }

            return { ok: true, status: response.status, body, endpoint };
          } catch (error) {
            lastMessage = error instanceof Error ? cleanValue(error.message) : "Network request failed.";
          }
        }

        if (moveNextEndpoint) continue;
      }

      return {
        ok: false,
        status: 0,
        body: null,
        message: lastMessage || fallbackMessage,
        endpoint: "",
      };
    };

    const submitDemoRequest = async (payload, verification) => {
      const requestBody = {
        ...(payload || {}),
        verificationGrantToken: cleanValue(verification?.token),
        verificationSessionId: cleanValue(verification?.sessionId || verifyState.sessionId),
      };

      const headers = {
        "x-cavbot-csrf": "1",
      };
      if (requestBody.verificationGrantToken) {
        headers[VERIFY_GRANT_HEADER] = requestBody.verificationGrantToken;
      }
      if (requestBody.verificationSessionId) {
        headers[VERIFY_SESSION_HEADER] = requestBody.verificationSessionId;
      }

      const result = await postJsonAcrossEndpoints(demoEndpoints, requestBody, {
        fallbackMessage: "Unable to send request right now. Please email support@cavbot.io.",
        continueStatuses: [403, 500],
        headers,
        credentialsOrder: ["omit", "include"],
      });

      if (!result.ok) {
        const errorCode = cleanValue(result?.body?.error || result?.body?.code).toUpperCase();
        const requiresVerification =
          result.status === 403 &&
          (errorCode.startsWith("VERIFY_") || errorCode.startsWith("CAVERIFY_") || errorCode.includes("VERIFY"));
        return {
          ok: false,
          message: result.message || "Demo request failed. Please try again.",
          requiresVerification,
        };
      }

      return {
        ok: true,
        message: cleanValue(result?.body?.message) || "Thanks. Your request has been received.",
      };
    };

    const parseFillRule = (value) => {
      const rule = cleanValue(value).toLowerCase();
      if (rule === "evenodd" || rule === "nonzero") return rule;
      return "";
    };

    const parseNumber = (value, fallback = 0) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    };

    const parseShape = (raw, fallback) => {
      const shape = raw && typeof raw === "object" ? raw : {};
      return {
        svgPath: cleanValue(shape.svgPath || shape.glyphPath || fallback.svgPath),
        svgViewBox: cleanValue(shape.svgViewBox || shape.glyphViewBox || fallback.svgViewBox),
        svgFill: cleanValue(shape.svgFill || fallback.svgFill),
        svgFillRule: parseFillRule(shape.svgFillRule || shape.glyphFillRule || fallback.svgFillRule),
        svgClipRule: parseFillRule(shape.svgClipRule || shape.glyphClipRule || fallback.svgClipRule),
      };
    };

    const parseChallengePayload = (raw) => {
      const fallbackShape = {
        svgPath: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2.7 7.6h8.6v2.8H7.7Z",
        svgViewBox: "0 0 24 24",
        svgFill: "",
        svgFillRule: "",
        svgClipRule: "",
      };

      const payload = raw && typeof raw === "object" ? raw : {};
      const render = payload.render && typeof payload.render === "object" ? payload.render : {};
      const slot = render.slot && typeof render.slot === "object" ? render.slot : {};
      const slotGlyph = parseShape(render.slotGlyph, fallbackShape);
      const wordmarkGlyphs = Array.isArray(render.wordmarkGlyphs)
        ? render.wordmarkGlyphs.map((glyph, index) => {
            const parsed = parseShape(glyph, {
              svgPath: "",
              svgViewBox: cleanValue(render.viewBox) || "0 0 1000 500",
              svgFill: "#fff",
              svgFillRule: "",
              svgClipRule: "",
            });
            return {
              shapeId: cleanValue(glyph?.shapeId) || `shape_${index}`,
              ...parsed,
            };
          })
        : [];

      const tiles = Array.isArray(payload.tiles)
        ? payload.tiles.map((tile, index) => {
            const parsed = parseShape(tile, fallbackShape);
            return {
              tileId: cleanValue(tile?.tileId || tile?.id) || `tile_${index}`,
              ...parsed,
              jitterY: parseNumber(tile?.jitterY, 0),
              rotationDeg: parseNumber(tile?.rotationDeg, 0),
            };
          })
        : [];

      return {
        challengeId: cleanValue(payload.challengeId),
        challengeToken: cleanValue(payload.challengeToken),
        nonce: cleanValue(payload.nonce),
        sessionId: cleanValue(payload.sessionId),
        expiresAt: cleanValue(payload.expiresAt),
        prompt: cleanValue(payload.prompt),
        render: {
          viewBox: cleanValue(render.viewBox) || "0 0 1000 500",
          wordmarkGlyphs,
          slot: {
            x: parseNumber(slot.x, 714),
            y: parseNumber(slot.y, 186),
            width: Math.max(1, parseNumber(slot.width, 185)),
            height: Math.max(1, parseNumber(slot.height, 183)),
          },
          slotGlyph,
        },
        tiles,
      };
    };

    const parseViewBoxMetrics = (viewBox) => {
      const parts = cleanValue(viewBox)
        .split(/\s+/)
        .map((part) => Number(part))
        .filter((part) => Number.isFinite(part));
      if (parts.length !== 4) {
        return { minX: 0, minY: 0, width: 1000, height: 500 };
      }
      return {
        minX: parts[0],
        minY: parts[1],
        width: parts[2] > 0 ? parts[2] : 1000,
        height: parts[3] > 0 ? parts[3] : 500,
      };
    };

    const shouldPreferOtpMode = () => {
      if (typeof window.matchMedia !== "function") return false;
      const checks = ["(prefers-reduced-motion: reduce)", "(forced-colors: active)", "(prefers-contrast: more)"];
      return checks.some((query) => {
        try {
          return window.matchMedia(query).matches;
        } catch {
          return false;
        }
      });
    };

    const setVerifyError = (message) => {
      verifyState.error = cleanValue(message);
      if (verifyErrorEl) verifyErrorEl.textContent = verifyState.error;
    };

    const setVerifyBusyUi = () => {
      if (!verifyCloseBtn) return;
      verifyCloseBtn.disabled = Boolean(verifyState.submitting || verifyState.otpBusy);
    };

    const resetTileTransform = (tileEl, tile) => {
      if (!tileEl || !tile) return;
      tileEl.style.transform = `translate(0px, ${tile.jitterY}px) rotate(${tile.rotationDeg}deg)`;
      tileEl.classList.remove("cb-caverify-tile-dragging");
    };

    const closeVerifyModal = (result, message) => {
      if (!verifyOverlay) return;
      const wasOpen = verifyOverlay.getAttribute("data-open") === "true";
      verifyOverlay.setAttribute("data-open", "false");
      verifyOverlay.setAttribute("aria-hidden", "true");
      if (wasOpen) unlockPageScroll();

      const resolve = verifyState.resolve;
      const reject = verifyState.reject;
      verifyState.resolve = null;
      verifyState.reject = null;
      verifyState.pendingPromise = null;
      verifyState.loading = false;
      verifyState.submitting = false;
      verifyState.otpBusy = false;
      verifyState.challenge = null;
      verifyState.drag = null;
      challengeTileMap.clear();

      const focusTarget = verifyState.lastFocusedElement;
      verifyState.lastFocusedElement = null;
      if (focusTarget && typeof focusTarget.focus === "function") {
        focusTarget.focus({ preventScroll: true });
      }

      if (result && typeof resolve === "function") {
        resolve(result);
        return;
      }
      if (typeof reject === "function") {
        reject(new Error(cleanValue(message) || "Verification canceled."));
      }
    };

    const submitVerifyChallenge = async (tile, gestureSummary) => {
      if (!verifyState.challenge || verifyState.submitting) return;
      verifyState.submitting = true;
      setVerifyBusyUi();
      setVerifyError("");

      const submitResult = await postJsonAcrossEndpoints(
        verifySubmitEndpoints,
        {
          challengeId: verifyState.challenge.challengeId,
          challengeToken: verifyState.challenge.challengeToken,
          nonce: verifyState.challenge.nonce,
          chosenTileId: cleanValue(tile?.tileId),
          gestureSummary,
          sessionId: cleanValue(verifyState.sessionId || verifyState.challenge.sessionId),
        },
        {
          fallbackMessage: "Unable to verify right now.",
          continueStatuses: [403, 500],
          headers: { "x-cavbot-csrf": "1" },
          credentialsOrder: ["include", "omit"],
        },
      );

      verifyState.submitting = false;
      setVerifyBusyUi();
      if (!submitResult.ok) {
        setVerifyError(submitResult.message || "Verification failed.");
        return;
      }

      const payload = submitResult.body && typeof submitResult.body === "object" ? submitResult.body : {};
      if (payload.ok === true && cleanValue(payload.verificationGrantToken)) {
        rememberVerifyGrant(payload);
        closeVerifyModal(
          {
            verificationGrantToken: cleanValue(payload.verificationGrantToken),
            sessionId: cleanValue(payload.sessionId || verifyState.sessionId),
            expiresAt: cleanValue(payload.expiresAt),
          },
          "",
        );
        return;
      }

      const failMessage = cleanValue(payload?.message || payload?.error || "Verification failed.");
      const remaining = Number(payload?.attemptsRemaining ?? 0);
      const usedAttempts = Math.max(0, 3 - remaining);
      verifyState.failedAttempts = Math.max(verifyState.failedAttempts + 1, usedAttempts);
      if (verifyState.failedAttempts >= 2) verifyState.mode = "otp";
      const sid = cleanValue(payload?.sessionId);
      if (sid) verifyState.sessionId = sid;
      setVerifyError(failMessage);
      renderVerifyBody();
    };

    const startVerifyOtp = async () => {
      if (verifyState.otpBusy) return;
      verifyState.otpBusy = true;
      setVerifyBusyUi();
      setVerifyError("");

      const challenge = verifyState.challenge;
      const identifier = cleanValue(verifyState.otpIdentifier);
      const result = await postJsonAcrossEndpoints(
        verifyOtpStartEndpoints,
        {
          actionType: VERIFY_ACTION_TYPE,
          challengeId: cleanValue(challenge?.challengeId),
          challengeToken: cleanValue(challenge?.challengeToken),
          sessionId: cleanValue(verifyState.sessionId || challenge?.sessionId),
          identifier,
          email: identifier.includes("@") ? identifier : "",
        },
        {
          fallbackMessage: "Could not send code.",
          continueStatuses: [403, 500],
          headers: { "x-cavbot-csrf": "1" },
          credentialsOrder: ["include", "omit"],
        },
      );

      verifyState.otpBusy = false;
      setVerifyBusyUi();
      if (!result.ok) {
        setVerifyError(result.message || "Could not send code.");
        return;
      }

      const payload = result.body && typeof result.body === "object" ? result.body : {};
      if (!payload.ok || !cleanValue(payload.otpChallengeId)) {
        setVerifyError(cleanValue(payload?.message || payload?.error) || "Could not send code.");
        return;
      }

      verifyState.otpChallengeId = cleanValue(payload.otpChallengeId);
      verifyState.otpStarted = true;
      const sid = cleanValue(payload.sessionId || verifyState.sessionId || challenge?.sessionId);
      if (sid) verifyState.sessionId = sid;
      setVerifyError("");
      renderVerifyBody();
    };

    const confirmVerifyOtp = async () => {
      if (verifyState.otpBusy) return;
      if (!cleanValue(verifyState.otpChallengeId)) {
        setVerifyError("Send a code first.");
        return;
      }

      verifyState.otpBusy = true;
      setVerifyBusyUi();
      setVerifyError("");

      const challenge = verifyState.challenge;
      const result = await postJsonAcrossEndpoints(
        verifyOtpConfirmEndpoints,
        {
          otpChallengeId: cleanValue(verifyState.otpChallengeId),
          code: cleanValue(verifyState.otpCode),
          actionType: VERIFY_ACTION_TYPE,
          sessionId: cleanValue(verifyState.sessionId || challenge?.sessionId),
        },
        {
          fallbackMessage: "Code verification failed.",
          continueStatuses: [403, 500],
          headers: { "x-cavbot-csrf": "1" },
          credentialsOrder: ["include", "omit"],
        },
      );

      verifyState.otpBusy = false;
      setVerifyBusyUi();
      if (!result.ok) {
        setVerifyError(result.message || "Code verification failed.");
        return;
      }

      const payload = result.body && typeof result.body === "object" ? result.body : {};
      if (!payload.ok || !cleanValue(payload.verificationGrantToken)) {
        setVerifyError(cleanValue(payload?.message || payload?.error) || "Code verification failed.");
        return;
      }

      rememberVerifyGrant(payload);
      closeVerifyModal(
        {
          verificationGrantToken: cleanValue(payload.verificationGrantToken),
          sessionId: cleanValue(payload.sessionId || verifyState.sessionId || challenge?.sessionId),
          expiresAt: cleanValue(payload.expiresAt),
        },
        "",
      );
    };

    const loadVerifyChallenge = async (sessionHint) => {
      verifyState.loading = true;
      verifyState.challenge = null;
      challengeTileMap.clear();
      setVerifyError("");
      renderVerifyBody();

      const result = await postJsonAcrossEndpoints(
        verifyChallengeEndpoints,
        {
          actionType: VERIFY_ACTION_TYPE,
          route: VERIFY_ROUTE,
          sessionId: cleanValue(sessionHint || verifyState.sessionId),
        },
        {
          fallbackMessage: "Unable to load verification challenge.",
          continueStatuses: [403, 500],
          headers: { "x-cavbot-csrf": "1" },
          credentialsOrder: ["include", "omit"],
        },
      );

      verifyState.loading = false;
      if (!result.ok) {
        setVerifyError(result.message || "Unable to load verification challenge.");
        renderVerifyBody();
        return;
      }

      const parsed = parseChallengePayload(result.body);
      if (!parsed.challengeId) {
        setVerifyError("Unable to load verification challenge.");
        renderVerifyBody();
        return;
      }

      verifyState.challenge = parsed;
      const sid = cleanValue(parsed.sessionId || sessionHint || verifyState.sessionId);
      if (sid) verifyState.sessionId = sid;
      renderVerifyBody();
    };

    const renderVerifyBody = () => {
      if (!verifyBodyEl) return;

      setVerifyBusyUi();
      if (verifyState.loading) {
        verifyBodyEl.innerHTML = `<div class="cb-caverify-loading">Loading challenge…</div>`;
        setVerifyError(verifyState.error);
        return;
      }

      if (verifyState.mode === "otp") {
        verifyBodyEl.innerHTML = `
          <div class="cb-caverify-otp-wrap">
            <p class="cb-caverify-sub">Use a one-time email code instead.</p>
            <input
              class="cb-caverify-input"
              type="text"
              data-caverify-identifier
              value="${escapeAttr(verifyState.otpIdentifier)}"
              placeholder="Email or username"
              autocomplete="username"
            >
            <div class="cb-caverify-actions">
              <button type="button" class="cb-caverify-btn cb-caverify-btn-primary" data-caverify-send-otp>
                ${verifyState.otpBusy ? "Sending…" : "Send code"}
              </button>
              <button type="button" class="cb-caverify-btn" data-caverify-return-challenge>Return to challenge</button>
            </div>
            ${
              verifyState.otpStarted
                ? `
              <input
                class="cb-caverify-input cb-caverify-code"
                type="text"
                data-caverify-code
                inputmode="numeric"
                maxlength="6"
                placeholder="••••••"
                autocomplete="one-time-code"
                value="${escapeAttr(verifyState.otpCode)}"
              >
              <button
                type="button"
                class="cb-caverify-btn cb-caverify-btn-primary"
                data-caverify-confirm-otp
                ${verifyState.otpCode.length === 6 ? "" : "disabled"}
              >
                ${verifyState.otpBusy ? "Verifying…" : "Verify code"}
              </button>
            `
                : ""
            }
          </div>
        `;

        const identifierInput = verifyBodyEl.querySelector("[data-caverify-identifier]");
        const sendBtn = verifyBodyEl.querySelector("[data-caverify-send-otp]");
        const returnBtn = verifyBodyEl.querySelector("[data-caverify-return-challenge]");
        const codeInput = verifyBodyEl.querySelector("[data-caverify-code]");
        const confirmBtn = verifyBodyEl.querySelector("[data-caverify-confirm-otp]");

        if (identifierInput) {
          identifierInput.addEventListener("input", (event) => {
            verifyState.otpIdentifier = cleanValue(event.target?.value);
          });
        }
        if (sendBtn) {
          sendBtn.disabled = verifyState.otpBusy;
          sendBtn.addEventListener("click", () => void startVerifyOtp());
        }
        if (returnBtn) {
          returnBtn.disabled = verifyState.otpBusy;
          returnBtn.addEventListener("click", () => {
            verifyState.mode = "challenge";
            renderVerifyBody();
          });
        }
        if (codeInput) {
          codeInput.addEventListener("input", (event) => {
            verifyState.otpCode = cleanValue(event.target?.value).replace(/[^0-9]/g, "").slice(0, 6);
            if (confirmBtn) confirmBtn.disabled = verifyState.otpCode.length !== 6 || verifyState.otpBusy;
          });
        }
        if (confirmBtn) {
          confirmBtn.disabled = verifyState.otpBusy || verifyState.otpCode.length !== 6;
          confirmBtn.addEventListener("click", () => void confirmVerifyOtp());
        }

        setVerifyError(verifyState.error);
        return;
      }

      const challenge = verifyState.challenge;
      if (!challenge) {
        verifyBodyEl.innerHTML = `
          <div class="cb-caverify-challenge-wrap">
            <p class="cb-caverify-sub">Unable to load Caverify right now.</p>
            <div class="cb-caverify-actions">
              <button type="button" class="cb-caverify-btn cb-caverify-btn-primary" data-caverify-retry>Try again</button>
              <button type="button" class="cb-caverify-btn" data-caverify-use-otp>Use email code</button>
            </div>
          </div>
        `;
        const retryBtn = verifyBodyEl.querySelector("[data-caverify-retry]");
        const otpBtn = verifyBodyEl.querySelector("[data-caverify-use-otp]");
        if (retryBtn) retryBtn.addEventListener("click", () => void loadVerifyChallenge(verifyState.sessionId));
        if (otpBtn) {
          otpBtn.addEventListener("click", () => {
            verifyState.mode = "otp";
            renderVerifyBody();
          });
        }
        setVerifyError(verifyState.error || "Unable to load verification challenge.");
        return;
      }

      challengeTileMap.clear();
      (challenge.tiles || []).forEach((tile) => challengeTileMap.set(tile.tileId, tile));

      const viewBox = cleanValue(challenge.render?.viewBox) || "0 0 1000 500";
      const metrics = parseViewBoxMetrics(viewBox);
      const slot = challenge.render?.slot || { x: 714, y: 186, width: 185, height: 183 };
      const slotLeftPct = (((slot.x + slot.width / 2 - metrics.minX) / metrics.width) * 100).toFixed(3);
      const slotTopPct = (((slot.y + slot.height / 2 - metrics.minY) / metrics.height) * 100).toFixed(3);
      const slotWidthPct = Math.max(8, (slot.width / metrics.width) * 100).toFixed(3);
      const slotHeightPct = Math.max(8, (slot.height / metrics.height) * 100).toFixed(3);

      const glyphPaths = (challenge.render?.wordmarkGlyphs || [])
        .map((glyph) => {
          const fillRule = cleanValue(glyph.svgFillRule);
          const clipRule = cleanValue(glyph.svgClipRule);
          return `<path d="${escapeAttr(glyph.svgPath)}" fill="${escapeAttr(glyph.svgFill || "#fff")}"${
            fillRule ? ` fill-rule="${fillRule}"` : ""
          }${clipRule ? ` clip-rule="${clipRule}"` : ""} />`;
        })
        .join("");

      const slotGlyph = challenge.render?.slotGlyph || {};
      const slotGlyphFillRule = cleanValue(slotGlyph.svgFillRule);
      const slotGlyphClipRule = cleanValue(slotGlyph.svgClipRule);
      const slotGlyphMarkup = `
        <svg viewBox="${escapeAttr(slotGlyph.svgViewBox || "0 0 24 24")}" aria-hidden="true" focusable="false">
          <path d="${escapeAttr(slotGlyph.svgPath)}" fill="${escapeAttr(slotGlyph.svgFill || "currentColor")}"${
            slotGlyphFillRule ? ` fill-rule="${slotGlyphFillRule}"` : ""
          }${slotGlyphClipRule ? ` clip-rule="${slotGlyphClipRule}"` : ""}></path>
        </svg>
      `;

      const tilesMarkup = (challenge.tiles || [])
        .map((tile, index) => {
          const fillRule = cleanValue(tile.svgFillRule);
          const clipRule = cleanValue(tile.svgClipRule);
          return `
            <button type="button" class="cb-caverify-tile" data-caverify-tile="${escapeAttr(tile.tileId)}" ${
              verifyState.submitting ? "disabled" : ""
            } style="transform: translate(0px, ${tile.jitterY}px) rotate(${tile.rotationDeg}deg);">
              <svg viewBox="${escapeAttr(tile.svgViewBox || "0 0 24 24")}" aria-hidden="true" focusable="false">
                <path d="${escapeAttr(tile.svgPath)}" fill="${escapeAttr(tile.svgFill || "currentColor")}"${
                  fillRule ? ` fill-rule="${fillRule}"` : ""
                }${clipRule ? ` clip-rule="${clipRule}"` : ""}></path>
              </svg>
              <span class="sr-only">Drag tile ${index + 1}</span>
            </button>
          `;
        })
        .join("");

      const prompt = cleanValue(challenge.prompt);
      const showPrompt = prompt && prompt !== "Quick check to protect CavBot.";

      verifyBodyEl.innerHTML = `
        <div class="cb-caverify-challenge-wrap">
          ${showPrompt ? `<p class="cb-caverify-sub">${escapeAttr(prompt)}</p>` : ""}
          <div class="cb-caverify-wordmark" aria-label="CavBot wordmark challenge">
            <svg class="cb-caverify-wordmark-image" viewBox="${escapeAttr(viewBox)}" aria-hidden="true" focusable="false">
              ${glyphPaths}
            </svg>
            <div class="cb-caverify-slot" data-caverify-slot style="left:${slotLeftPct}%;top:${slotTopPct}%;width:${slotWidthPct}%;height:${slotHeightPct}%;">
              ${slotGlyphMarkup}
            </div>
          </div>
          <div class="cb-caverify-tiles">
            ${tilesMarkup}
          </div>
          <div class="cb-caverify-hint-row">
            <button type="button" class="cb-caverify-link-btn" data-caverify-use-otp ${verifyState.submitting ? "disabled" : ""}>
              Use email code instead
            </button>
          </div>
        </div>
      `;

      const useOtpBtn = verifyBodyEl.querySelector("[data-caverify-use-otp]");
      if (useOtpBtn) {
        useOtpBtn.addEventListener("click", () => {
          if (verifyState.submitting) return;
          verifyState.mode = "otp";
          renderVerifyBody();
        });
      }

      const slotEl = verifyBodyEl.querySelector("[data-caverify-slot]");
      const tileEls = Array.from(verifyBodyEl.querySelectorAll("[data-caverify-tile]"));

      tileEls.forEach((tileEl) => {
        const tileId = cleanValue(tileEl.getAttribute("data-caverify-tile"));
        const tile = challengeTileMap.get(tileId);
        if (!tile) return;

        const onPointerDown = (event) => {
          if (verifyState.submitting || verifyState.loading) return;
          event.preventDefault();
          const startTs = typeof performance !== "undefined" ? performance.now() : Date.now();
          verifyState.drag = {
            tileId,
            pointerId: event.pointerId,
            pointerType: cleanValue(event.pointerType || "mouse").toLowerCase() || "mouse",
            startX: event.clientX,
            startY: event.clientY,
            lastX: event.clientX,
            lastY: event.clientY,
            moves: 0,
            distance: 0,
            startTs,
          };
          tileEl.classList.add("cb-caverify-tile-dragging");
          try {
            tileEl.setPointerCapture(event.pointerId);
          } catch {
            // no-op
          }
        };

        const onPointerMove = (event) => {
          const drag = verifyState.drag;
          if (!drag || drag.tileId !== tileId || drag.pointerId !== event.pointerId) return;
          const dx = event.clientX - drag.startX;
          const dy = event.clientY - drag.startY;
          const stepDistance = Math.hypot(event.clientX - drag.lastX, event.clientY - drag.lastY);
          drag.moves += 1;
          drag.distance += stepDistance;
          drag.lastX = event.clientX;
          drag.lastY = event.clientY;
          verifyState.drag = drag;
          tileEl.style.transform = `translate(${dx}px, ${tile.jitterY + dy}px) rotate(${tile.rotationDeg}deg)`;
        };

        const finishDrag = (event) => {
          const drag = verifyState.drag;
          if (!drag || drag.tileId !== tileId || drag.pointerId !== event.pointerId) return;

          const slotRect = slotEl ? slotEl.getBoundingClientRect() : null;
          const droppedInSlot = Boolean(
            slotRect &&
              event.clientX >= slotRect.left &&
              event.clientX <= slotRect.right &&
              event.clientY >= slotRect.top &&
              event.clientY <= slotRect.bottom,
          );
          const endTs = typeof performance !== "undefined" ? performance.now() : Date.now();
          const gestureSummary = {
            pointerDown: true,
            pointerType: drag.pointerType,
            moveEventsCount: drag.moves,
            pointerMoves: drag.moves,
            distancePx: Number(drag.distance.toFixed(2)),
            durationMs: Math.max(0, Math.round(endTs - drag.startTs)),
            droppedInSlot,
          };

          verifyState.drag = null;
          resetTileTransform(tileEl, tile);
          try {
            tileEl.releasePointerCapture(event.pointerId);
          } catch {
            // no-op
          }

          if (droppedInSlot) {
            void submitVerifyChallenge(tile, gestureSummary);
          }
        };

        tileEl.addEventListener("pointerdown", onPointerDown);
        tileEl.addEventListener("pointermove", onPointerMove);
        tileEl.addEventListener("pointerup", finishDrag);
        tileEl.addEventListener("pointercancel", () => {
          verifyState.drag = null;
          resetTileTransform(tileEl, tile);
        });
      });

      setVerifyError(verifyState.error);
    };

    const ensureVerifyModal = () => {
      if (verifyOverlay) return;
      ensureStyle();

      verifyOverlay = document.getElementById(VERIFY_MODAL_ID);
      if (!verifyOverlay) {
        verifyOverlay = document.createElement("div");
        verifyOverlay.id = VERIFY_MODAL_ID;
        verifyOverlay.className = "cb-caverify-overlay";
        verifyOverlay.setAttribute("data-open", "false");
        verifyOverlay.setAttribute("role", "presentation");
        verifyOverlay.setAttribute("aria-hidden", "true");
        verifyOverlay.innerHTML = `
          <div class="cb-caverify-card" role="dialog" aria-modal="true" aria-labelledby="cb-caverify-title">
            <div class="cb-caverify-top">
              <div class="cb-caverify-brand">
                <div class="cb-caverify-emblem" aria-hidden="true">
                  <img src="/logo/cavbot-logomark.svg" alt="" width="38" height="38" class="cb-caverify-mark" decoding="async">
                  <span class="cb-caverify-shield">
                    <span class="cb-caverify-shield-icon"></span>
                  </span>
                </div>
                <div class="cb-caverify-meta">
                  <h2 class="cb-caverify-title" id="cb-caverify-title">Caverify</h2>
                  <p class="cb-caverify-sub">Drag the correct tile to complete the CavBot wordmark.</p>
                </div>
              </div>
              <button type="button" class="cb-caverify-close" data-caverify-close>Cancel</button>
            </div>
            <div class="cb-caverify-divider"></div>
            <div data-caverify-body></div>
            <p class="cb-caverify-error" data-caverify-error aria-live="polite"></p>
          </div>
        `;
        document.documentElement.appendChild(verifyOverlay);
      }

      verifyCloseBtn = verifyOverlay.querySelector("[data-caverify-close]");
      verifyBodyEl = verifyOverlay.querySelector("[data-caverify-body]");
      verifyErrorEl = verifyOverlay.querySelector("[data-caverify-error]");

      if (verifyCloseBtn && !verifyCloseBtn.hasAttribute("data-caverify-bound")) {
        verifyCloseBtn.setAttribute("data-caverify-bound", "1");
        verifyCloseBtn.addEventListener("click", () => {
          if (verifyState.submitting || verifyState.otpBusy) return;
          closeVerifyModal(null, "Verification canceled.");
        });
      }

      if (verifyOverlay && !verifyOverlay.hasAttribute("data-caverify-overlay-bound")) {
        verifyOverlay.setAttribute("data-caverify-overlay-bound", "1");
        verifyOverlay.addEventListener("click", (event) => {
          if (event.target !== verifyOverlay) return;
          if (verifyState.submitting || verifyState.otpBusy) return;
          closeVerifyModal(null, "Verification canceled.");
        });
        document.addEventListener("keydown", (event) => {
          if (event.key !== "Escape") return;
          if (verifyOverlay?.getAttribute("data-open") !== "true") return;
          if (verifyState.submitting || verifyState.otpBusy) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          closeVerifyModal(null, "Verification canceled.");
        });
      }
    };

    const openVerifyModal = (identifierHint) => {
      ensureVerifyModal();
      if (!verifyOverlay) return Promise.reject(new Error("Unable to open Caverify."));
      if (verifyState.pendingPromise) return verifyState.pendingPromise;

      verifyState.mode = shouldPreferOtpMode() ? "otp" : "challenge";
      verifyState.loading = false;
      verifyState.submitting = false;
      verifyState.otpBusy = false;
      verifyState.otpStarted = false;
      verifyState.otpCode = "";
      verifyState.otpChallengeId = "";
      verifyState.failedAttempts = 0;
      verifyState.error = "";
      verifyState.challenge = null;
      verifyState.drag = null;
      verifyState.otpIdentifier = cleanValue(identifierHint || "");
      verifyState.lastFocusedElement = document.activeElement;

      if (verifyOverlay.getAttribute("data-open") !== "true") lockPageScroll();
      verifyOverlay.setAttribute("data-open", "true");
      verifyOverlay.setAttribute("aria-hidden", "false");
      renderVerifyBody();
      void loadVerifyChallenge(verifyState.sessionId);

      verifyState.pendingPromise = new Promise((resolve, reject) => {
        verifyState.resolve = resolve;
        verifyState.reject = reject;
      });
      return verifyState.pendingPromise;
    };

    const ensureCaverify = async (identifierHint) => {
      if (hasValidVerifyGrant()) {
        return {
          ok: true,
          token: verifyState.grantToken,
          sessionId: cleanValue(verifyState.sessionId),
        };
      }

      try {
        const verified = await openVerifyModal(identifierHint);
        const token = cleanValue(verified?.verificationGrantToken);
        if (!token) return { ok: false, message: "Verification was not completed." };
        rememberVerifyGrant(verified);
        return {
          ok: true,
          token: verifyState.grantToken,
          sessionId: cleanValue(verifyState.sessionId),
        };
      } catch (error) {
        const message = error instanceof Error ? cleanValue(error.message) : "";
        return { ok: false, message: message || "Verification was canceled." };
      }
    };

    const closeModal = () => {
      if (!modalOverlay) return;
      const wasOpen = modalOverlay.getAttribute("data-open") === "true";
      modalOverlay.setAttribute("data-open", "false");
      modalOverlay.setAttribute("aria-hidden", "true");
      if (wasOpen) unlockPageScroll();
      setStatus("", "");
      clearInvalids();
      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus({ preventScroll: true });
      }
      lastFocusedElement = null;
    };

    const onSubmit = async (event) => {
      event.preventDefault();
      if (submitting) return;
      const fields = fieldsFromForm();
      if (!fields) return;

      if (fields.website) {
        setStatus("Thanks. Your request has been received.", "success");
        if (formEl) formEl.reset();
        return;
      }

      const validationError = validateFields(fields);
      if (validationError) {
        setStatus(validationError, "error");
        return;
      }

      setSubmitting(true);
      setStatus("Running Caverify…", "");
      const verifyResult = await ensureCaverify(fields.businessEmail);
      if (!verifyResult.ok) {
        setSubmitting(false);
        setStatus(verifyResult.message || "Complete Caverify to send this request.", "error");
        return;
      }

      setStatus("Sending your demo request...", "");
      const result = await submitDemoRequest(
        {
          firstName: fields.firstName,
          lastName: fields.lastName,
          businessEmail: fields.businessEmail,
          jobTitle: fields.jobTitle,
          company: fields.company,
          phoneNumber: fields.phoneNumber,
          sourcePath: String(window.location.pathname || "/"),
          sourceOrigin: String(window.location.origin || ""),
          sourceHref: String(window.location.href || ""),
          userAgent: String(window.navigator?.userAgent || ""),
        },
        verifyResult,
      );
      setSubmitting(false);

      if (!result.ok) {
        if (result.requiresVerification) {
          clearVerifyGrant();
          setStatus("Verification expired. Complete Caverify again and retry.", "error");
          return;
        }
        setStatus(result.message, "error");
        return;
      }

      setStatus(result.message || "Thanks. Your request has been received.", "success");
      if (formEl) formEl.reset();
      clearVerifyGrant();
      if (window.cavbotAnalytics && typeof window.cavbotAnalytics.track === "function") {
        try {
          window.cavbotAnalytics.track("demo_request_submitted", {
            source: "website_modal",
            path: window.location.pathname || "/",
          });
        } catch {
          // no-op
        }
      }
    };

    const ensureModal = () => {
      if (modalOverlay) return;
      ensureStyle();

      modalOverlay = document.getElementById(DEMO_MODAL_ID);
      if (!modalOverlay) {
        modalOverlay = document.createElement("div");
        modalOverlay.id = DEMO_MODAL_ID;
        modalOverlay.className = "cb-demo-request-overlay";
        modalOverlay.setAttribute("data-open", "false");
        modalOverlay.setAttribute("role", "presentation");
        modalOverlay.setAttribute("aria-hidden", "true");
        modalOverlay.innerHTML = `
          <div class="cb-demo-request-card" role="dialog" aria-modal="true" aria-labelledby="cb-demo-request-title">
            <button type="button" class="cb-demo-request-close" data-demo-request-close aria-label="Close demo request modal">×</button>
            <div class="cb-demo-request-header">
              <span class="cb-demo-request-header-badge" aria-hidden="true">
                <span class="cavbot-cdn-slot" data-cavbot-cdn-slot="badge" data-cavbot-cdn-modal-badge="1" aria-hidden="true"></span>
              </span>
              <h2 class="cb-demo-request-title" id="cb-demo-request-title">Request a Demo</h2>
              <p class="cb-demo-request-copy">
                Tell us about your team and we will reach out with a guided CavBot walkthrough.
              </p>
            </div>
            <form class="cb-demo-request-form-shell" data-demo-request-form novalidate>
              <div class="cb-demo-request-grid">
                <label class="cb-demo-request-field">
                  <span class="cb-demo-request-label">First Name*</span>
                  <input class="cb-demo-request-input" type="text" name="firstName" autocomplete="given-name" maxlength="80" required>
                </label>
                <label class="cb-demo-request-field">
                  <span class="cb-demo-request-label">Last Name*</span>
                  <input class="cb-demo-request-input" type="text" name="lastName" autocomplete="family-name" maxlength="80" required>
                </label>
                <label class="cb-demo-request-field" data-span="2">
                  <span class="cb-demo-request-label">Business Email*</span>
                  <input class="cb-demo-request-input" type="email" name="businessEmail" autocomplete="email" maxlength="160" required>
                </label>
                <label class="cb-demo-request-field">
                  <span class="cb-demo-request-label">Job Title</span>
                  <input class="cb-demo-request-input" type="text" name="jobTitle" autocomplete="organization-title" maxlength="120">
                </label>
                <label class="cb-demo-request-field">
                  <span class="cb-demo-request-label">Company*</span>
                  <input class="cb-demo-request-input" type="text" name="company" autocomplete="organization" maxlength="160" required>
                </label>
                <label class="cb-demo-request-field" data-span="2">
                  <span class="cb-demo-request-label">Phone Number*</span>
                  <input class="cb-demo-request-input" type="tel" name="phoneNumber" autocomplete="tel" maxlength="60" required>
                </label>
              </div>
              <label class="cb-demo-request-honeypot" aria-hidden="true">
                <span>Website</span>
                <input class="cb-demo-request-input" type="text" name="website" tabindex="-1" autocomplete="off">
              </label>
              <div class="cb-demo-request-protection" aria-label="Secured by Caverify">
                <div class="cb-demo-request-protection-brand">
                  <span class="cb-demo-request-protection-emblem" aria-hidden="true">
                    <img src="/logo/cavbot-logomark.svg" alt="" class="cb-demo-request-protection-mark" decoding="async">
                    <span class="cb-demo-request-protection-shield"></span>
                  </span>
                  <span class="cb-demo-request-protection-copy">
                    <span class="cb-demo-request-protection-title">Secured by <strong>Caverify</strong></span>
                    <span class="cb-demo-request-protection-links">
                      <a href="/privacy-policy.html">Privacy</a>
                      <span aria-hidden="true">•</span>
                      <a href="/terms-of-use.html">Terms</a>
                      <span aria-hidden="true">•</span>
                      <a href="/data-security.html">Security</a>
                    </span>
                  </span>
                </div>
              </div>
              <div class="cb-demo-request-actions">
                <button type="submit" class="cb-demo-request-submit" data-demo-request-submit>Send Request</button>
              </div>
              <p class="cb-demo-request-status" data-demo-request-status aria-live="polite"></p>
            </form>
          </div>
        `;
        document.documentElement.appendChild(modalOverlay);
      }

      mountDemoHeaderBadge();

      closeBtn = modalOverlay.querySelector("[data-demo-request-close]");
      formEl = modalOverlay.querySelector("[data-demo-request-form]");
      submitBtn = modalOverlay.querySelector("[data-demo-request-submit]");
      statusEl = modalOverlay.querySelector("[data-demo-request-status]");

      if (closeBtn && !closeBtn.hasAttribute("data-demo-request-bound")) {
        closeBtn.setAttribute("data-demo-request-bound", "1");
        closeBtn.addEventListener("click", closeModal);
      }

      if (formEl && !formEl.hasAttribute("data-demo-request-bound")) {
        formEl.setAttribute("data-demo-request-bound", "1");
        formEl.addEventListener("submit", onSubmit);
      }

      if (!modalOverlay.hasAttribute("data-demo-request-overlay-bound")) {
        modalOverlay.setAttribute("data-demo-request-overlay-bound", "1");
        modalOverlay.addEventListener("click", (event) => {
          if (event.target === modalOverlay) closeModal();
        });
        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape" && modalOverlay?.getAttribute("data-open") === "true") {
            if (verifyOverlay?.getAttribute("data-open") === "true") return;
            event.preventDefault();
            closeModal();
          }
        });
      }
    };

    const openModal = (triggerEl) => {
      ensureModal();
      if (!modalOverlay) return;
      closeNavOverlayIfOpen();
      const card = modalOverlay.querySelector(".cb-demo-request-card");
      lastFocusedElement = triggerEl || document.activeElement;
      positionModalCard(modalOverlay, card);
      if (modalOverlay.getAttribute("data-open") !== "true") lockPageScroll();
      modalOverlay.setAttribute("data-open", "true");
      modalOverlay.setAttribute("aria-hidden", "false");
      mountDemoHeaderBadge();
      setStatus("", "");
      clearInvalids();
      if (formEl) {
        const firstNameInput = formEl.querySelector('.cb-demo-request-input[name="firstName"]');
        if (firstNameInput && typeof firstNameInput.focus === "function") {
          firstNameInput.focus({ preventScroll: true });
        }
      }
    };

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const trigger = target.closest(triggerSelector);
      if (!trigger) return;
      event.preventDefault();
      event.stopPropagation();
      openModal(trigger);
    });
  }

  // ============================
  // HEADER / MOBILE NAV
  // ============================
  if (navToggle && navOverlay) {
    const openNav = () => {
      navOverlay.classList.add("is-open");
      document.documentElement.classList.add("nav-open");
      document.body.classList.add("nav-open");

      navOverlay.setAttribute("aria-hidden", "false");
      navToggle.setAttribute("aria-expanded", "true");
    };

    const closeNav = () => {
      navOverlay.classList.remove("is-open");
      document.documentElement.classList.remove("nav-open");
      document.body.classList.remove("nav-open");

      navOverlay.setAttribute("aria-hidden", "true");
      navToggle.setAttribute("aria-expanded", "false");
    };

    navToggle.addEventListener("click", () => {
      const isOpen = navOverlay.classList.contains("is-open");
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    if (navCloseBtn) {
      navCloseBtn.addEventListener("click", closeNav);
    }

    navOverlay.addEventListener("click", (event) => {
      if (event.target.classList.contains("nav-overlay-backdrop")) {
        closeNav();
      }
    });

    navOverlay.querySelectorAll("a").forEach((anchor) => {
      anchor.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navOverlay.classList.contains("is-open")) {
        closeNav();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 960 && navOverlay.classList.contains("is-open")) {
        closeNav();
      }
    });

    navOverlay.setAttribute("aria-hidden", "true");
    navToggle.setAttribute("aria-expanded", "false");
  }

  // ============================
  // HEADER ACTIVE PAGE STATE
  // ============================
  (() => {
    const normalizePath = (rawPath) => {
      const path = String(rawPath || "/").trim().toLowerCase();
      if (!path || path === "/") return "/";
      const clean = path.split("#")[0].split("?")[0] || "/";
      if (clean === "/index.html") return "/";
      return clean.endsWith("/") ? clean.slice(0, -1) : clean;
    };

    const currentPath = normalizePath(window.location.pathname || "/");
    const selector = [
      ".site-header .nav-main .nav-links a[href]",
      ".nav-overlay .nav-overlay-body a.nav-overlay-link[href]",
    ].join(", ");

    document.querySelectorAll(selector).forEach((node) => {
      if (!(node instanceof HTMLAnchorElement)) return;
      const rawHref = String(node.getAttribute("href") || "").trim();
      if (
        !rawHref ||
        rawHref.startsWith("#") ||
        /^mailto:/i.test(rawHref) ||
        /^tel:/i.test(rawHref) ||
        /^javascript:/i.test(rawHref)
      ) {
        return;
      }

      let targetUrl = null;
      try {
        targetUrl = new URL(rawHref, window.location.href);
      } catch {
        return;
      }

      if (targetUrl.origin !== window.location.origin) return;
      const targetPath = normalizePath(targetUrl.pathname || "/");
      if (targetPath === currentPath) {
        node.classList.add("is-current");
      } else {
        node.classList.remove("is-current");
      }
    });
  })();

  // ============================
  // FOOTER ACCORDION (mobile)
  // ============================
  (() => {
    const toggles = document.querySelectorAll(".footer-column-toggle");
    if (!toggles.length) return;

    toggles.forEach((button) => {
      button.addEventListener("click", () => {
        const col = button.closest(".footer-column");
        if (!col) return;
        col.classList.toggle("is-open");
      });
    });
  })();

  // ============================
  // Hosted embed snippets
  // ============================
  (() => {
    const ASSET_ORIGIN = "https://cdn.cavbot.io";
    const arcadeLoaderSrc = `${ASSET_ORIGIN}/sdk/arcade/v1/loader.min.js`;
    const slotSelector = "[data-cavbot-cdn-slot]";
    const snippetUrlsBySlot = {
      badge: [`${ASSET_ORIGIN}/sdk/badge-snippet`, `${ASSET_ORIGIN}/sdk/badge-snippet.html`],
      head: [`${ASSET_ORIGIN}/sdk/head-snippet`, `${ASSET_ORIGIN}/sdk/head-snippet.html`],
      body: [`${ASSET_ORIGIN}/sdk/body-snippet`, `${ASSET_ORIGIN}/sdk/body-snippet.html`],
    };
    const cssBySlot = {
      badge: [`${ASSET_ORIGIN}/sdk/ui/v1/cavbot-badge-inline.css`],
      head: [`${ASSET_ORIGIN}/sdk/ui/v1/cavbot-head-orbit.css`],
      body: [
        `${ASSET_ORIGIN}/sdk/ui/v1/cavbot-head-orbit.css`,
        `${ASSET_ORIGIN}/sdk/ui/v1/cavbot-full-body.css`,
      ],
    };
    const projectKey = String(window.CAVBOT_PROJECT_KEY || "").trim();
    const siteId =
      String(window.CAVBOT_SITE_ID || window.CAVBOT_SITE || "cavbot.io").trim() || "cavbot.io";
    const disableFloatingBadge =
      String(document.body?.getAttribute("data-cavbot-disable-floating-badge") || "").trim() === "1";

    const ensureScript = (src, attrs = {}) => {
      if (!src) return null;
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) return existing;
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      Object.entries(attrs).forEach(([key, value]) => {
        if (value == null || value === "") return;
        script.setAttribute(key, String(value));
      });
      document.body.appendChild(script);
      return script;
    };

    const ensureCss = (href) => {
      if (!href) return;
      const loaded = window.__cavbotCdnSlotCssLoaded || (window.__cavbotCdnSlotCssLoaded = new Set());
      if (loaded.has(href)) return;
      loaded.add(href);
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.crossOrigin = "anonymous";
      (document.head || document.documentElement).appendChild(link);
    };

    const fetchSnippet = async (slotType) => {
      const urls = snippetUrlsBySlot[slotType] || [];
      for (let i = 0; i < urls.length; i += 1) {
        try {
          const response = await fetch(urls[i], {
            method: "GET",
            mode: "cors",
            cache: "no-store",
          });
          if (!response.ok) continue;
          const html = await response.text();
          if (String(html || "").trim()) return html;
        } catch {
          // continue
        }
      }
      return "";
    };

    const refreshTracking = () => {
      try {
        if (window.cavai && typeof window.cavai.enableHeadTracking === "function") {
          window.cavai.enableHeadTracking();
        }
        if (window.cavai && typeof window.cavai.enableEyeTracking === "function") {
          window.cavai.enableEyeTracking();
        }
        if (typeof window.__cavaiHeadTrackingRefresh === "function") {
          window.__cavaiHeadTrackingRefresh();
        }
        if (typeof window.__cavaiEyeTrackingRefresh === "function") {
          window.__cavaiEyeTrackingRefresh();
        }
        if (typeof window.__cavbotFallbackTrackingEnsure === "function") {
          window.__cavbotFallbackTrackingEnsure();
        }
      } catch {
        // no-op
      }
    };

    const mountSnippetIntoSlot = async (slot) => {
      if (!slot) return false;
      const slotType = String(slot.getAttribute("data-cavbot-cdn-slot") || "")
        .trim()
        .toLowerCase();
      if (slot.getAttribute("data-cavbot-cdn-ready") === "1" && slot.childElementCount > 0) {
        return true;
      }
      const cssList = cssBySlot[slotType];
      if (!cssList || !cssList.length) return false;

      cssList.forEach((href) => ensureCss(href));
      slot.setAttribute("data-cavbot-cdn-ready", "0");
      const html = await fetchSnippet(slotType);
      if (!html) return false;

      slot.innerHTML = html;
      slot.setAttribute("data-cavbot-cdn-ready", "1");
      refreshTracking();
      return true;
    };

    const mountCdnSlots = async () => {
      const slots = Array.from(document.querySelectorAll(slotSelector));
      if (!slots.length) return false;

      let mounted = false;
      for (let i = 0; i < slots.length; i += 1) {
        const ok = await mountSnippetIntoSlot(slots[i]);
        mounted = mounted || ok;
      }
      return mounted;
    };

    window.__cavbotMountCdnSlots = mountCdnSlots;
    window.__cavbotMountCdnSlot = mountSnippetIntoSlot;

    const hasInlineBadgeHost = () =>
      !!document.querySelector(
        '[data-cavbot-cdn-slot="badge"]:not([data-cavbot-cdn-floating-badge])',
      );

    const mountFloatingBadgeFallback = async () => {
      if (document.querySelector("[data-cavbot-cdn-floating-badge]")) return;
      if (hasInlineBadgeHost()) return;
      const host = document.createElement("div");
      host.setAttribute("data-cavbot-cdn-floating-badge", "1");
      host.setAttribute("data-cavbot-cdn-slot", "badge");
      host.style.position = "fixed";
      host.style.right = "24px";
      host.style.bottom = "24px";
      host.style.zIndex = "9999";
      document.body.appendChild(host);
      await mountSnippetIntoSlot(host);
    };

    void mountCdnSlots().then(() => {
      if (!disableFloatingBadge) {
        void mountFloatingBadgeFallback();
      }
    });

    // Dogfood arcade loader install path on arcade/play surfaces.
    const disableArcadeLoader =
      String(document.body?.getAttribute("data-cavbot-disable-arcade-loader") || "").trim() === "1";
    const arcadeCandidate =
      !disableArcadeLoader &&
      (
        !!document.querySelector("[data-play], [data-play-url], .arcade-card, .arcade-grid") ||
        /cavbot-arcade|404/i.test(String(window.location.pathname || ""))
      );
    if (arcadeCandidate) {
      const hasArcadeLoader = document.querySelector('script[src*="/sdk/arcade/"]');
      if (!hasArcadeLoader) {
        ensureScript(arcadeLoaderSrc, {
          "data-config-origin": "https://app.cavbot.io",
          "data-project-key": projectKey,
          "data-site-id": siteId,
          "data-site": siteId,
          "data-env": "404",
        });
      }
    }
  })();

  // ============================
  // CAVBOT FALLBACK TRACKING
  // ============================
  (() => {
    const slotSelector = "[data-cavbot-cdn-slot][data-cavbot-cdn-ready='1']";
    const pupilSelector = ".cavbot-eye-pupil, .cavbot-dm-eye-pupil";
    let started = false;
    let rafId = 0;
    let lastMoveTs = 0;
    const pointer = {
      x: Math.max(window.innerWidth / 2, 0),
      y: Math.max(window.innerHeight / 2, 0),
    };

    const slotMotionByType = {
      badge: { move: 2.2, rotate: 6.8 },
      head: { move: 3.6, rotate: 8.5 },
      body: { move: 2.1, rotate: 5.8 },
    };

    const normalizeVector = (dx, dy) => {
      const mag = Math.hypot(dx, dy) || 1;
      return { x: dx / mag, y: dy / mag, mag };
    };

    const applyPupilTracking = (now) => {
      const pupils = document.querySelectorAll(pupilSelector);
      if (!pupils.length) return;

      const idle = now - lastMoveTs > 1200;
      const idleX = idle ? Math.sin(now / 920) * 0.42 : 0;
      const idleY = idle ? Math.cos(now / 780) * 0.34 : 0;

      pupils.forEach((pupil) => {
        const eye = pupil.closest(".cavbot-eye, .cavbot-dm-eye");
        const box = (eye || pupil).getBoundingClientRect();
        if (!box.width || !box.height) return;

        const cx = box.left + box.width * 0.5;
        const cy = box.top + box.height * 0.5;
        const vector = normalizeVector(pointer.x - cx, pointer.y - cy);
        const maxShift = Math.min(4.8, Math.max(2.4, box.width * 0.12));
        const distFactor = Math.min(1, vector.mag / 180);
        const shiftX = vector.x * maxShift * distFactor + idleX;
        const shiftY = vector.y * maxShift * distFactor + idleY;
        pupil.style.transform = `translate3d(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px, 0)`;
      });
    };

    const applyHeadTracking = (now) => {
      const slots = document.querySelectorAll(slotSelector);
      if (!slots.length) return;

      const idle = now - lastMoveTs > 1200;
      const idlePitch = idle ? Math.cos(now / 1300) * 0.75 : 0;
      const idleYaw = idle ? Math.sin(now / 1400) * 0.85 : 0;

      slots.forEach((slot) => {
        const slotType = String(slot.getAttribute("data-cavbot-cdn-slot") || "").trim().toLowerCase();
        const motion = slotMotionByType[slotType] || slotMotionByType.head;
        const box = slot.getBoundingClientRect();
        if (!box.width || !box.height) return;

        const cx = box.left + box.width * 0.5;
        const cy = box.top + box.height * 0.5;
        const dx = pointer.x - cx;
        const dy = pointer.y - cy;
        const vector = normalizeVector(dx, dy);
        const distFactor = Math.min(1, vector.mag / 260);

        const tx = vector.x * motion.move * distFactor;
        const ty = vector.y * motion.move * distFactor;
        const yaw = vector.x * motion.rotate * distFactor + idleYaw;
        const pitch = -vector.y * motion.rotate * 0.75 * distFactor + idlePitch;

        slot.style.transform =
          `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) ` +
          `rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg)`;
        slot.style.transformStyle = "preserve-3d";
        slot.style.willChange = "transform";
      });
    };

    const render = (ts) => {
      const now = Number(ts || performance.now());
      applyPupilTracking(now);
      applyHeadTracking(now);
      rafId = window.requestAnimationFrame(render);
    };

    const markPointer = (x, y) => {
      pointer.x = x;
      pointer.y = y;
      lastMoveTs = performance.now();
    };

    const start = () => {
      if (started) return;
      started = true;
      lastMoveTs = performance.now();

      document.addEventListener("pointermove", (event) => {
        markPointer(event.clientX, event.clientY);
      }, { passive: true });

      document.addEventListener("touchmove", (event) => {
        const touch = event.touches && event.touches[0];
        if (!touch) return;
        markPointer(touch.clientX, touch.clientY);
      }, { passive: true });

      window.addEventListener("resize", () => {
        if (performance.now() - lastMoveTs > 1500) {
          markPointer(Math.max(window.innerWidth / 2, 0), Math.max(window.innerHeight / 2, 0));
        }
      });

      if (!rafId) {
        rafId = window.requestAnimationFrame(render);
      }
    };

    window.__cavbotFallbackTrackingEnsure = () => {
      if (!document.querySelector(slotSelector)) return;
      start();
    };
  })();

  // ============================
  // CAVAI TRACKING BOOTSTRAP
  // ============================
  (() => {
    const hasCdnSlots = () =>
      !!document.querySelector("[data-cavbot-cdn-slot]");

    const hasRenderedHeads = () =>
      !!document.querySelector("[data-cavbot-head], .cavbot-dm-avatar");

    const startTracking = () => {
      try {
        if (window.cavai && typeof window.cavai.enableHeadTracking === "function") {
          window.cavai.enableHeadTracking();
        }
        if (window.cavai && typeof window.cavai.enableEyeTracking === "function") {
          window.cavai.enableEyeTracking();
        }
        if (typeof window.__cavaiHeadTrackingRefresh === "function") {
          window.__cavaiHeadTrackingRefresh();
        }
        if (typeof window.__cavaiEyeTrackingRefresh === "function") {
          window.__cavaiEyeTrackingRefresh();
        }
        if (typeof window.__cavbotFallbackTrackingEnsure === "function") {
          window.__cavbotFallbackTrackingEnsure();
        }
      } catch {
        // no-op
      }
    };

    const bootWithRetry = (attempt = 0) => {
      if (!hasCdnSlots() && !hasRenderedHeads()) return;

      const cavReady =
        (window.cavai && typeof window.cavai.enableHeadTracking === "function") ||
        typeof window.__cavaiEyeTrackingStart === "function";

      if (cavReady && hasRenderedHeads()) {
        startTracking();
        return;
      }

      if (attempt >= 40) return;
      window.setTimeout(() => bootWithRetry(attempt + 1), 120);
    };

    bootWithRetry();
  })();

  // ============================
  // FOOTER YEAR
  // ============================
  const yearEl = document.getElementById("footerYear");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  installCavGuardForAppLinks();
  installDemoRequestModal();
  installStudioMarketingSystem();
  applyBrandLogotype();
  installStickyHeaderBrandSwap();
  hydrateTryCavaiRows();
});
