(function () {
  "use strict";


  var page = document.querySelector(".ethics-book-page");
  if (!page) return;


  var THEME_KEY = "cavbot_legal_theme";
  var themeButtons = document.querySelectorAll("[data-ethics-theme-toggle]");
  var navGroups = document.querySelectorAll("[data-ethics-nav-group]");
  var sectionLinks = document.querySelectorAll(".ethics-nav-sub a[href^='#']");
  var rootLinks = document.querySelectorAll(".ethics-nav-title[href^='#']");
  var switchLinks = document.querySelectorAll("[data-legal-switch]");
  var heroBlocks = document.querySelectorAll("[data-legal-hero]");
  var docPanels = document.querySelectorAll("[data-legal-doc]");
  var breadcrumbCurrent = document.querySelector("[data-legal-breadcrumb-current]");
  var printButtons = document.querySelectorAll("[data-ethics-print]");
var shareButtons = document.querySelectorAll("[data-ethics-share]");
var legalCopyMenu = document.querySelector("[data-legal-copy-menu]");
var legalCopyPageButton = document.querySelector("[data-legal-copy-page]");
var legalMarkdownButton = document.querySelector("[data-legal-markdown-view]");
var legalCopyToast = document.querySelector("[data-legal-copy-toast]");
var legalAiLinks = document.querySelectorAll("[data-legal-ai-link]");
var sections = [];




  function pageForHash(hash) {
    if (!hash) return "ethics";
    if (hash === "#privacy-policy" || hash.indexOf("#privacy-") === 0) return "privacy";
    if (hash === "#terms-of-use" || hash.indexOf("#terms-") === 0) return "terms";
    if (hash === "#data-security" || hash.indexOf("#security-") === 0) return "security";
    return "ethics";
  }


  function labelForPage(pageName) {
    if (pageName === "privacy") return "Privacy Policy";
    if (pageName === "terms") return "Terms of Use";
    if (pageName === "security") return "Data Security";
    return "Code of Ethics";
  }


  function rootHashForPage(pageName) {
    if (pageName === "privacy") return "#privacy-policy";
    if (pageName === "terms") return "#terms-of-use";
    if (pageName === "security") return "#data-security";
    return "#ethics-overview";
  }


  function setTheme(theme) {
    var nextTheme = theme === "light" ? "light" : "dark";


    page.setAttribute("data-ethics-theme", nextTheme);
    document.documentElement.setAttribute("data-ethics-theme", nextTheme);
    document.documentElement.style.colorScheme = nextTheme;


    themeButtons.forEach(function (button) {
      button.setAttribute(
        "aria-label",
        nextTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    });


    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch (error) {}
  }


  function initTheme() {
    var savedTheme = "dark";


    try {
      savedTheme = window.localStorage.getItem(THEME_KEY) || "dark";
    } catch (error) {
      savedTheme = "dark";
    }


    setTheme(savedTheme);
  }


  function toggleTheme() {
    var currentTheme = page.getAttribute("data-ethics-theme") || "dark";
    setTheme(currentTheme === "dark" ? "light" : "dark");
  }


  function setupThemeButtons() {
    themeButtons.forEach(function (button) {
      button.addEventListener("click", toggleTheme);
    });
  }


  function setGroupOpen(group, shouldOpen) {
    if (!group) return;


    var toggle = group.querySelector(".ethics-nav-toggle");
    var sub = group.querySelector(".ethics-nav-sub");


    group.classList.toggle("is-open", shouldOpen);


    if (toggle) {
      toggle.setAttribute("aria-expanded", String(shouldOpen));
    }


    if (sub) {
      if (shouldOpen) {
        sub.removeAttribute("hidden");
      } else {
        sub.setAttribute("hidden", "");
      }
    }
  }


  function closeAllGroups() {
    navGroups.forEach(function (group) {
      setGroupOpen(group, false);
    });
  }


  function clearActiveLinks() {
    sectionLinks.forEach(function (link) {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });


    rootLinks.forEach(function (link) {
      link.classList.remove("is-current-root");
      link.removeAttribute("aria-current");
    });


    switchLinks.forEach(function (link) {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });
  }


  function markPageLinks(pageName) {
    rootLinks.forEach(function (link) {
      if (link.getAttribute("data-legal-root-link") === pageName) {
        link.classList.add("is-current-root");
        link.setAttribute("aria-current", "page");
      }
    });


    switchLinks.forEach(function (link) {
      if (link.getAttribute("data-legal-switch") === pageName) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });
  }


  function scrollToHash(hash) {
    if (!hash || hash === "#") return;


    var target = document.querySelector(hash);
    if (!target) return;


    target.scrollIntoView({
      block: "start",
      inline: "nearest"
    });
  }


  function setActiveDocument(pageName, options) {
    var nextPage =
      pageName === "privacy" ||
      pageName === "terms" ||
      pageName === "security"
        ? pageName
        : "ethics";


    var shouldCloseGroups = !options || options.closeGroups !== false;
    var shouldScroll = options && options.scrollToHash;
    var targetHash = options && options.hash ? options.hash : rootHashForPage(nextPage);


    page.setAttribute("data-legal-active", nextPage);


    heroBlocks.forEach(function (block) {
      if (block.getAttribute("data-legal-hero") === nextPage) {
        block.removeAttribute("hidden");
      } else {
        block.setAttribute("hidden", "");
      }
    });


    docPanels.forEach(function (panel) {
      if (panel.getAttribute("data-legal-doc") === nextPage) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });


    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = labelForPage(nextPage);
    }


    clearActiveLinks();
    markPageLinks(nextPage);


    if (shouldCloseGroups) {
      closeAllGroups();
    }


    setActiveSection(false);
syncLegalCopyLinks();

    if (shouldScroll) {
      window.setTimeout(function () {
        scrollToHash(targetHash);
        setActiveSection(false);
      }, 60);
    }
  }


  function updateHash(hash) {
    if (!hash || hash === window.location.hash) return;


    if (window.history && window.history.pushState) {
      window.history.pushState(null, "", hash);
    } else {
      window.location.hash = hash;
    }
  }


  function setupNavGroups() {
    navGroups.forEach(function (group) {
      var toggle = group.querySelector(".ethics-nav-toggle");
      var sub = group.querySelector(".ethics-nav-sub");
      var root = group.querySelector(".ethics-nav-title[href^='#']");


      setGroupOpen(group, false);


      if (toggle && sub) {
        toggle.addEventListener("click", function () {
          var isOpen = group.classList.contains("is-open");


          if (!isOpen) {
            closeAllGroups();
          }


          setGroupOpen(group, !isOpen);
        });
      }


      if (root) {
        root.addEventListener("click", function (event) {
          event.preventDefault();


          var hash = root.getAttribute("href");
          var nextPage = pageForHash(hash);


          updateHash(hash);


          setActiveDocument(nextPage, {
            closeGroups: true,
            scrollToHash: true,
            hash: hash
          });
        });
      }
    });
  }


  function setupSwitchLinks() {
    switchLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();


        var nextPage = link.getAttribute("data-legal-switch");


        if (
          nextPage !== "privacy" &&
          nextPage !== "terms" &&
          nextPage !== "security"
        ) {
          nextPage = "ethics";
        }


        var hash = rootHashForPage(nextPage);
        updateHash(hash);


        setActiveDocument(nextPage, {
          closeGroups: true,
          scrollToHash: true,
          hash: hash
        });
      });
    });
  }


  function collectSections() {
    var allLinks = [];


    sectionLinks.forEach(function (link) {
      allLinks.push(link);
    });


    rootLinks.forEach(function (link) {
      allLinks.push(link);
    });


    allLinks.forEach(function (link) {
      var id = link.getAttribute("href");


      if (!id || id.charAt(0) !== "#") return;


      var section = document.querySelector(id);
      if (!section) return;


      sections.push({
        id: id,
        page: pageForHash(id),
        section: section,
        link: link
      });
    });
  }


  function setActiveSection(updateDocumentFromScroll) {
    if (!sections.length) return;


    var currentPage = page.getAttribute("data-legal-active") || "ethics";
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var offset = 132;
    var active = null;


    sections.forEach(function (item) {
      if (item.page !== currentPage) return;


      var top = item.section.getBoundingClientRect().top + scrollY;


      if (scrollY + offset >= top) {
        active = item;
      }
    });


    clearActiveLinks();
    markPageLinks(currentPage);


    if (!active) return;


    if (active.link.matches(".ethics-nav-sub a")) {
      active.link.classList.add("is-active");
      active.link.setAttribute("aria-current", "true");
    }


    if (updateDocumentFromScroll) {
      var nextPage = pageForHash(active.id);


      if (nextPage !== currentPage) {
        setActiveDocument(nextPage, {
          closeGroups: false,
          hash: active.id
        });
      }
    }
  }


  function setupSectionLinks() {
    sectionLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();


        var hash = link.getAttribute("href");
        var nextPage = pageForHash(hash);


        updateHash(hash);


        setActiveDocument(nextPage, {
          closeGroups: false,
          scrollToHash: true,
          hash: hash
        });
      });
    });
  }


  function setupScrollSpy() {
    var ticking = false;


    function onScroll() {
      if (ticking) return;


      ticking = true;


      window.requestAnimationFrame(function () {
        setActiveSection(false);
        ticking = false;
      });
    }


    window.addEventListener("scroll", onScroll, { passive: true });


    window.addEventListener("resize", function () {
      setActiveSection(false);
    });


    window.addEventListener("hashchange", function () {
      var hash = window.location.hash;
      var nextPage = pageForHash(hash);


      setActiveDocument(nextPage, {
        closeGroups: true,
        scrollToHash: true,
        hash: hash || rootHashForPage(nextPage)
      });
    });
  }


  function setupPrint() {
    printButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        window.print();
      });
    });
  }


  function setupShare() {
    shareButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var activePage = page.getAttribute("data-legal-active") || "ethics";
        var title = "CavBot Code of Ethics";


        if (activePage === "privacy") {
          title = "CavBot Privacy Policy";
        }


        if (activePage === "terms") {
          title = "CavBot Terms of Use";
        }


        if (activePage === "security") {
          title = "CavBot Data Security";
        }


        var shareData = {
          title: title,
          text: title,
          url: window.location.href
        };


        if (navigator.share) {
          navigator.share(shareData).catch(function () {});
          return;
        }


        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(window.location.href).then(function () {
            button.classList.add("is-copied");


            window.setTimeout(function () {
              button.classList.remove("is-copied");
            }, 1200);
          }).catch(function () {});
        }
      });
    });
  }

function activeLegalPage() {
  var active = page.getAttribute("data-legal-active") || "ethics";

  if (
    active === "privacy" ||
    active === "terms" ||
    active === "security"
  ) {
    return active;
  }

  return "ethics";
}

function absoluteLegalUrl(pageName) {
  var root = window.location.origin + window.location.pathname;
  return root + rootHashForPage(pageName || activeLegalPage());
}

function showLegalCopyToast(message) {
  if (!legalCopyToast) return;

  legalCopyToast.textContent = message || "Copied";
  legalCopyToast.classList.add("is-visible");
  legalCopyToast.setAttribute("aria-hidden", "false");

  window.clearTimeout(showLegalCopyToast.timer);

  showLegalCopyToast.timer = window.setTimeout(function () {
    legalCopyToast.classList.remove("is-visible");
    legalCopyToast.setAttribute("aria-hidden", "true");
  }, 1400);
}

function writeClipboard(text) {
  var value = String(text || "").trim();

  if (!value) {
    return Promise.resolve(false);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(value).then(function () {
      return true;
    }).catch(function () {
      return false;
    });
  }

  var textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";

  document.body.appendChild(textarea);
  textarea.select();

  var ok = false;

  try {
    ok = document.execCommand("copy");
  } catch (error) {
    ok = false;
  }

  document.body.removeChild(textarea);

  return Promise.resolve(ok);
}

function textFromNode(node) {
  return String(node && node.textContent ? node.textContent : "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function markdownFromElement(element, lines) {
  if (!element || !lines) return;

  Array.from(element.children).forEach(function (child) {
    var tag = child.tagName ? child.tagName.toLowerCase() : "";
    var text = textFromNode(child);

    if (!text) return;

    if (child.matches(".ethics-document-actions")) {
      return;
    }

    if (tag === "h1") {
      lines.push("# " + text);
      lines.push("");
      return;
    }

    if (tag === "h2") {
      lines.push("## " + text);
      lines.push("");
      return;
    }

    if (tag === "h3") {
      lines.push("### " + text);
      lines.push("");
      return;
    }

    if (tag === "p") {
      lines.push(text);
      lines.push("");
      return;
    }

    if (tag === "ul") {
      Array.from(child.querySelectorAll(":scope > li")).forEach(function (li) {
        lines.push("- " + textFromNode(li));
      });
      lines.push("");
      return;
    }

    if (tag === "ol") {
      Array.from(child.querySelectorAll(":scope > li")).forEach(function (li, index) {
        lines.push(String(index + 1) + ". " + textFromNode(li));
      });
      lines.push("");
      return;
    }

    if (tag === "section" || tag === "div" || tag === "article") {
      markdownFromElement(child, lines);
    }
  });
}

function getLegalMarkdown() {
  var active = activeLegalPage();
  var title = "CavBot " + labelForPage(active);
  var hero = document.querySelector("[data-legal-hero='" + active + "']");
  var panel = document.querySelector("[data-legal-doc='" + active + "']");
  var lines = [];

  lines.push("# " + title);
  lines.push("");
  lines.push("Source: " + absoluteLegalUrl(active));
  lines.push("");

  if (hero) {
    var heroText = textFromNode(hero.querySelector("p"));

    if (heroText) {
      lines.push(heroText);
      lines.push("");
    }
  }

  if (panel) {
    markdownFromElement(panel, lines);
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

function openLegalMarkdownView() {
  var markdown = getLegalMarkdown();
  var active = activeLegalPage();
  var blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var tab = window.open(url, "_blank", "noopener,noreferrer");

  if (!tab) {
    writeClipboard(markdown).then(function (ok) {
      showLegalCopyToast(ok ? "Markdown copied" : "Open blocked");
    });
  }

  window.setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 60000);

  if (legalCopyMenu) {
    legalCopyMenu.open = false;
  }

  showLegalCopyToast(labelForPage(active) + " opened");
}

function promptForLegalPage() {
  var active = activeLegalPage();
  return "Read this CavBot legal page and help me understand it clearly: " + absoluteLegalUrl(active);
}

function syncLegalCopyLinks() {
  var prompt = encodeURIComponent(promptForLegalPage());

  legalAiLinks.forEach(function (link) {
    var service = link.getAttribute("data-legal-ai-link");

    if (service === "cavai") {
      link.setAttribute(
        "href",
        "https://app.cavbot.io/cavai?prompt=" + prompt + "&q=" + prompt + "#prompt=" + prompt
      );
    }

    if (service === "chatgpt") {
      link.setAttribute("href", "https://chatgpt.com/?prompt=" + prompt);
    }

    if (service === "claude") {
      link.setAttribute("href", "https://claude.ai/new?q=" + prompt);
    }
  });
}

function setupLegalCopyMenu() {
  if (legalCopyPageButton) {
    legalCopyPageButton.addEventListener("click", function () {
      writeClipboard(getLegalMarkdown()).then(function (ok) {
        showLegalCopyToast(ok ? "Page copied" : "Copy unavailable");

        if (legalCopyMenu) {
          legalCopyMenu.open = false;
        }
      });
    });
  }

  if (legalMarkdownButton) {
    legalMarkdownButton.addEventListener("click", function () {
      openLegalMarkdownView();
    });
  }

  if (legalCopyMenu) {
    document.addEventListener("click", function (event) {
      if (
        legalCopyMenu.open &&
        event.target instanceof Node &&
        !legalCopyMenu.contains(event.target)
      ) {
        legalCopyMenu.open = false;
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        legalCopyMenu.open = false;
      }
    });
  }

  legalAiLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (legalCopyMenu) {
        legalCopyMenu.open = false;
      }
    });
  });

  syncLegalCopyLinks();
}


  function boot() {
    var initialHash = window.location.hash;
    var initialPage = pageForHash(initialHash);


    initTheme();
    setupThemeButtons();
    setupNavGroups();
    setupSwitchLinks();
    setupSectionLinks();
    collectSections();
    setupScrollSpy();
setupPrint();
setupShare();
setupLegalCopyMenu();



    setActiveDocument(initialPage, {
      closeGroups: true,
      scrollToHash: Boolean(initialHash),
      hash: initialHash || rootHashForPage(initialPage)
    });
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
