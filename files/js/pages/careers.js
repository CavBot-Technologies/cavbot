(function () {
  "use strict";


  function initCareersHero() {
    var hero = document.querySelector("[data-team-hero]");


    if (!hero) return;
    if (hero.dataset.teamHeroBound === "true") return;


    hero.dataset.teamHeroBound = "true";


    window.requestAnimationFrame(function () {
      hero.classList.add("is-ready");
    });
  }


  function initCareersRoles() {
    var section = document.querySelector(".careers-roles-section");


    if (!section) return;
    if (section.dataset.careersRolesBound === "true") return;


    section.dataset.careersRolesBound = "true";


    var filters = Array.prototype.slice.call(
      section.querySelectorAll("[data-careers-filter]")
    );


    var rows = Array.prototype.slice.call(
      section.querySelectorAll(".careers-role-row")
    );


    var groups = Array.prototype.slice.call(
      section.querySelectorAll("[data-careers-role-group]")
    );


    var empty = section.querySelector("[data-careers-empty]");


    var active = {
      team: "all",
      location: "all"
    };


    function closeFilters(exceptFilter) {
      filters.forEach(function (filter) {
        if (filter === exceptFilter) return;


        var button = filter.querySelector(".careers-filter-button");
        var menu = filter.querySelector(".careers-filter-menu");


        filter.classList.remove("is-open");


        if (button) {
          button.setAttribute("aria-expanded", "false");
        }


        if (menu) {
          menu.hidden = true;
        }
      });
    }


    function setFilterLabel(filter, value) {
      var label = filter.querySelector("[data-careers-filter-label]");
      var selected = filter.querySelector('[data-filter-value="' + value + '"]');


      if (!label || !selected) return;


      label.textContent = selected.textContent.trim();
    }


    function applyFilters() {
      var visibleCount = 0;


      rows.forEach(function (row) {
        var team = row.getAttribute("data-team") || "";
        var location = row.getAttribute("data-location") || "";


        var matchesTeam =
          active.team === "all" ||
          team === active.team;


        var matchesLocation =
          active.location === "all" ||
          location === active.location;


        var visible = matchesTeam && matchesLocation;


        row.classList.toggle("is-hidden", !visible);


        if (visible) {
          visibleCount += 1;
        }
      });


      groups.forEach(function (group) {
        var visibleRows = group.querySelectorAll(".careers-role-row:not(.is-hidden)");
        group.classList.toggle("is-hidden", visibleRows.length === 0);
      });


      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }


    filters.forEach(function (filter) {
      var type = filter.getAttribute("data-careers-filter");
      var button = filter.querySelector(".careers-filter-button");
      var menu = filter.querySelector(".careers-filter-menu");
      var options = Array.prototype.slice.call(
        filter.querySelectorAll("[data-filter-value]")
      );


      if (!type || !button || !menu) return;


      button.addEventListener("click", function (event) {
        event.preventDefault();

        var isOpen = filter.classList.contains("is-open");


        closeFilters(filter);


        filter.classList.toggle("is-open", !isOpen);
        button.setAttribute("aria-expanded", !isOpen ? "true" : "false");
        menu.hidden = isOpen;
      });


      options.forEach(function (option) {
        option.addEventListener("click", function (event) {
          event.preventDefault();


          var value = option.getAttribute("data-filter-value") || "all";


          active[type] = value;


          options.forEach(function (item) {
            item.classList.toggle("is-active", item === option);
          });


          setFilterLabel(filter, value);
          closeFilters();
          applyFilters();
        });
      });
    });


    document.addEventListener("click", function (event) {
      if (event.target.closest("[data-careers-filter]")) return;


      closeFilters();
    });


    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;


      closeFilters();
    });


    applyFilters();
  }


  function init() {
    initCareersHero();
    initCareersRoles();
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
