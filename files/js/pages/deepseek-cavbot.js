(function () {
  "use strict";

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initArticleToc() {
    var links = qsa("[data-article-toc]");
    if (!links.length) return;

    links.forEach(function (link) {
      link.classList.add("is-active");

      link.addEventListener("click", function () {
        links.forEach(function (item) {
          item.classList.remove("is-active");
        });

        link.classList.add("is-active");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initArticleToc);
  } else {
    initArticleToc();
  }
})();
