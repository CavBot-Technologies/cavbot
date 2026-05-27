(function () {
  "use strict";

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initArticleToc() {
    var links = qsa("[data-article-toc]");
    if (!links.length) return;

    var sections = links
      .map(function (link) {
        var id = (link.getAttribute("href") || "").replace("#", "");
        var section = document.getElementById(id);
        return section ? { link: link, section: section } : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    function setActive(id) {
      links.forEach(function (link) {
        var isActive = link.getAttribute("href") === "#" + id;
        link.classList.toggle("is-active", isActive);
      });
    }

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              setActive(entry.target.id);
            }
          });
        },
        {
          root: null,
          rootMargin: "-22% 0px -64% 0px",
          threshold: 0.01
        }
      );

      sections.forEach(function (item) {
        observer.observe(item.section);
      });
    }

    links.forEach(function (link) {
      link.addEventListener("click", function () {
        var id = (link.getAttribute("href") || "").replace("#", "");
        if (id) setActive(id);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initArticleToc);
  } else {
    initArticleToc();
  }
})();
