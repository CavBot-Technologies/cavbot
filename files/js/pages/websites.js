(function () {
  "use strict";

  var API_URL = window.CAVBOT_MONITORED_SITES_API || "https://app.cavbot.io/api/public/monitored-sites";
  var FALLBACK_ICON = "/assets/icons/favicon-32x32.png";
  var DEFAULT_PAYLOAD = {
    ok: true,
    generatedAt: "2026-06-15T00:00:00-04:00",
    sites: {
      active: [
        {
          rank: 1,
          host: "cavbot.io",
          displayName: "cavbot.io",
          url: "https://cavbot.io",
          status: "Pending",
          signals: 0,
          delta: 0,
          trend: [0, 0],
          faviconUrl: FALLBACK_ICON
        },
        {
          rank: 2,
          host: "app.cavbot.io",
          displayName: "app.cavbot.io",
          url: "https://app.cavbot.io",
          status: "Pending",
          signals: 0,
          delta: 0,
          trend: [0, 0],
          faviconUrl: FALLBACK_ICON
        }
      ],
      recent: [
        {
          rank: 1,
          host: "cavbot.io",
          displayName: "cavbot.io",
          url: "https://cavbot.io",
          status: "Pending",
          signals: 0,
          delta: 0,
          trend: [0, 0],
          faviconUrl: FALLBACK_ICON
        },
        {
          rank: 2,
          host: "app.cavbot.io",
          displayName: "app.cavbot.io",
          url: "https://app.cavbot.io",
          status: "Pending",
          signals: 0,
          delta: 0,
          trend: [0, 0],
          faviconUrl: FALLBACK_ICON
        }
      ],
      top: [
        {
          rank: 1,
          host: "cavbot.io",
          displayName: "cavbot.io",
          url: "https://cavbot.io",
          status: "Pending",
          signals: 0,
          delta: 0,
          trend: [0, 0],
          faviconUrl: FALLBACK_ICON
        },
        {
          rank: 2,
          host: "app.cavbot.io",
          displayName: "app.cavbot.io",
          url: "https://app.cavbot.io",
          status: "Pending",
          signals: 0,
          delta: 0,
          trend: [0, 0],
          faviconUrl: FALLBACK_ICON
        }
      ]
    }
  };
  var state = {
    activeFilter: "active",
    payload: DEFAULT_PAYLOAD
  };

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function numberFormat(value) {
    var number = Number(value || 0);
    if (!Number.isFinite(number)) return "0";
    return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(number);
  }

  function dateFormat(value) {
    var date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "";
    return new Intl.DateTimeFormat("en", {
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(date);
  }

  function setText(node, value) {
    if (!node) return;
    node.textContent = String(value == null ? "" : value);
  }

  function clear(node) {
    while (node && node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function isValidUrl(value) {
    try {
      var url = new URL(String(value || ""));
      return url.protocol === "https:" || url.protocol === "http:";
    } catch (_error) {
      return false;
    }
  }

  function normalizedHost(site) {
    var raw = site && (site.host || site.displayName || site.url);
    try {
      if (isValidUrl(raw)) return new URL(raw).hostname.toLowerCase();
    } catch (_error) {}
    return String(raw || "").replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase();
  }

  function faviconForSite(site) {
    var host = normalizedHost(site);
    if (host === "cavbot.io" || host === "www.cavbot.io" || host === "app.cavbot.io") {
      return FALLBACK_ICON;
    }
    return site.faviconUrl || FALLBACK_ICON;
  }

  function trendColor(values) {
    if (!values || values.length < 2) return "#58c6a6";
    var first = Number(values[0] || 0);
    var last = Number(values[values.length - 1] || 0);
    return last < first ? "#ff7a82" : "#58c6a6";
  }

  function buildTrend(values) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "websites-trend");
    svg.setAttribute("viewBox", "0 0 150 46");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    var cleanValues = Array.isArray(values) && values.length ? values.map(function (value) {
      var number = Number(value || 0);
      return Number.isFinite(number) && number >= 0 ? number : 0;
    }) : [0, 0];

    var max = Math.max.apply(null, cleanValues);
    var min = Math.min.apply(null, cleanValues);
    var spread = Math.max(1, max - min);
    var step = cleanValues.length > 1 ? 128 / (cleanValues.length - 1) : 128;
    var points = cleanValues.map(function (value, index) {
      var x = 10 + index * step;
      var y = 36 - ((value - min) / spread) * 26;
      if (max === min) y = 24;
      return x.toFixed(2) + "," + y.toFixed(2);
    }).join(" ");
    var color = trendColor(cleanValues);

    var fill = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var fillPoints = points.split(" ");
    var fillPath = "M " + fillPoints.join(" L ") + " L 138 42 L 10 42 Z";
    fill.setAttribute("d", fillPath);
    fill.setAttribute("fill", color);
    fill.setAttribute("opacity", "0.12");

    var line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    line.setAttribute("points", points);
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "3");
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("stroke-linejoin", "round");

    svg.appendChild(fill);
    svg.appendChild(line);
    return svg;
  }

  function siteRows() {
    var payloadSites = state.payload && state.payload.sites ? state.payload.sites : {};
    return Array.isArray(payloadSites[state.activeFilter]) ? payloadSites[state.activeFilter] : [];
  }

  function renderSummary() {
    var summary = qs("[data-websites-summary]");
    var updated = qs("[data-websites-updated]");
    var rows = siteRows();
    var filterLabel = {
      active: "active websites",
      recent: "recently onboarded websites",
      top: "top monitored websites"
    }[state.activeFilter] || "websites";

    setText(summary, rows.length + " " + filterLabel + " are currently available from CavBot's public monitoring snapshot.");

    if (updated && state.payload && state.payload.generatedAt) {
      updated.dateTime = state.payload.generatedAt;
      setText(updated, "Updated " + dateFormat(state.payload.generatedAt));
    }
  }

  function renderRows() {
    var tbody = qs("[data-websites-rows]");
    if (!tbody) return;

    clear(tbody);
    var rows = siteRows();

    if (!rows.length) {
      var empty = document.createElement("tr");
      var emptyCell = document.createElement("td");
      emptyCell.colSpan = 5;
      emptyCell.className = "websites-empty";
      emptyCell.textContent = "No public monitored websites are available yet.";
      empty.appendChild(emptyCell);
      tbody.appendChild(empty);
      renderSummary();
      return;
    }

    rows.forEach(function (site, index) {
      var tr = document.createElement("tr");

      var rank = document.createElement("td");
      rank.className = "websites-rank";
      rank.textContent = String(site.rank || index + 1);
      tr.appendChild(rank);

      var website = document.createElement("td");
      var link = document.createElement("a");
      link.className = "websites-site-link";
      link.href = isValidUrl(site.url) ? site.url : "https://" + String(site.host || "");
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      var img = document.createElement("img");
      img.className = "websites-favicon";
      img.src = faviconForSite(site);
      img.alt = "";
      img.loading = "eager";
      img.fetchPriority = "high";
      img.decoding = "async";
      img.addEventListener("error", function () {
        img.src = FALLBACK_ICON;
      }, { once: true });

      var host = document.createElement("span");
      host.textContent = site.displayName || site.host || "Unknown website";

      link.appendChild(img);
      link.appendChild(host);
      website.appendChild(link);
      tr.appendChild(website);

      var status = document.createElement("td");
      status.className = "websites-status";
      status.textContent = site.status || "monitored";
      tr.appendChild(status);

      var signals = document.createElement("td");
      var signalWrap = document.createElement("span");
      signalWrap.className = "websites-signals";
      var total = document.createElement("span");
      total.textContent = numberFormat(site.signals);
      var delta = document.createElement("span");
      var deltaValue = Number(site.delta || 0);
      delta.className = "websites-delta";
      if (deltaValue > 0) delta.classList.add("is-positive");
      if (deltaValue < 0) delta.classList.add("is-negative");
      delta.textContent = (deltaValue > 0 ? "+" : "") + numberFormat(deltaValue);
      signalWrap.appendChild(total);
      signalWrap.appendChild(delta);
      signals.appendChild(signalWrap);
      tr.appendChild(signals);

      var trend = document.createElement("td");
      trend.appendChild(buildTrend(site.trend || []));
      tr.appendChild(trend);

      tbody.appendChild(tr);
    });

    renderSummary();
  }

  function setActiveFilter(nextFilter) {
    state.activeFilter = nextFilter;
    qsa("[data-websites-filter]").forEach(function (button) {
      var active = button.getAttribute("data-websites-filter") === nextFilter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
    renderRows();
  }

  function bindFilters() {
    qsa("[data-websites-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        var nextFilter = button.getAttribute("data-websites-filter") || "active";
        setActiveFilter(nextFilter);
      });
    });
  }

  function renderError() {
    var tbody = qs("[data-websites-rows]");
    var summary = qs("[data-websites-summary]");
    var updated = qs("[data-websites-updated]");
    if (summary) {
      summary.textContent = "CavBot could not load the public monitoring snapshot right now.";
    }
    if (updated) {
      updated.removeAttribute("datetime");
      updated.textContent = "Retry shortly";
    }
    if (!tbody) return;
    clear(tbody);
    var row = document.createElement("tr");
    var cell = document.createElement("td");
    cell.colSpan = 5;
    cell.className = "websites-empty";
    cell.textContent = "Monitoring data is temporarily unavailable.";
    row.appendChild(cell);
    tbody.appendChild(row);
  }

  async function loadSites() {
    try {
      var response = await fetch(API_URL, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error("Request failed: " + response.status);
      }

      var payload = await response.json();
      if (!payload || payload.ok !== true || !payload.sites) {
        throw new Error("Invalid monitored sites response");
      }

      state.payload = payload;
      renderRows();
    } catch (error) {
      console.error("[websites]", error);
      if (!state.payload) renderError();
    }
  }

  function init() {
    bindFilters();
    renderRows();
    loadSites();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
