(function () {
  "use strict";


  var COMMANDS = [
    {
      command: "cav status",
      caption: "See what needs attention now.",
      lines: [
        { text: "site app.cavbot.io", tone: "muted" },
        { text: "health 97% · uptime stable", tone: "good" },
        { text: "2 routes need review", tone: "warn" },
        { text: "last check 38s ago", tone: "muted" }
      ]
    },
    {
      command: "cav scan --live",
      caption: "Run a fresh check across the site.",
      lines: [
        { text: "starting live scan", tone: "blue" },
        { text: "routes checked 148", tone: "muted" },
        { text: "pages passed 144", tone: "good" },
        { text: "issues found 4", tone: "warn" }
      ]
    },
    {
      command: "cav routes --broken",
      caption: "Find broken routes before visitors do.",
      lines: [
        { text: "broken routes", tone: "blue" },
        { text: "/old-pricing -> 404", tone: "warn" },
        { text: "/account/reset -> slow redirect", tone: "warn" },
        { text: "2 fixes ready", tone: "good" }
      ]
    },
    {
      command: "cav errors --recent",
      caption: "Read the newest errors without leaving the page.",
      lines: [
        { text: "recent errors", tone: "blue" },
        { text: "checkout.ts · 3 events", tone: "warn" },
        { text: "auth/session.ts · 1 event", tone: "violet" },
        { text: "priority normal", tone: "muted" }
      ]
    },
    {
      command: "cav sessions --watch",
      caption: "Watch live sessions and catch user friction.",
      lines: [
        { text: "live sessions", tone: "blue" },
        { text: "visitors online 42", tone: "muted" },
        { text: "rage clicks 2", tone: "warn" },
        { text: "checkout flow clean", tone: "good" }
      ]
    },
    {
      command: "cav performance --page /pricing",
      caption: "Check how a page feels in real time.",
      lines: [
        { text: "pricing page", tone: "blue" },
        { text: "LCP 1.8s", tone: "good" },
        { text: "CLS 0.02", tone: "good" },
        { text: "status healthy", tone: "good" }
      ]
    },
    {
      command: "cav seo --check",
      caption: "Review search basics from the terminal.",
      lines: [
        { text: "seo check", tone: "blue" },
        { text: "missing titles 0", tone: "good" },
        { text: "weak descriptions 3", tone: "warn" },
        { text: "sitemap reachable", tone: "good" }
      ]
    },
    {
      command: "cav a11y --snapshot",
      caption: "Catch accessibility issues early.",
      lines: [
        { text: "accessibility snapshot", tone: "blue" },
        { text: "contrast issues 2", tone: "warn" },
        { text: "missing labels 1", tone: "warn" },
        { text: "keyboard path passes", tone: "good" }
      ]
    },
    {
      command: "cav logs --tail",
      caption: "Follow live events as they happen.",
      lines: [
        { text: "streaming events", tone: "blue" },
        { text: "GET /pricing 200", tone: "good" },
        { text: "POST /api/session 200", tone: "good" },
        { text: "GET /missing-page 404", tone: "warn" }
      ]
    },
    {
      command: "cav deploy --verify",
      caption: "Check a release before it reaches users.",
      lines: [
        { text: "release check", tone: "blue" },
        { text: "build passed", tone: "good" },
        { text: "routes verified", tone: "good" },
        { text: "safe to ship", tone: "good" }
      ]
    },
    {
      command: "cav storage --list",
      caption: "See storage usage without opening another panel.",
      lines: [
        { text: "storage", tone: "blue" },
        { text: "assets 1.4 GB", tone: "muted" },
        { text: "logs 238 MB", tone: "muted" },
        { text: "backups ready", tone: "good" }
      ]
    },
    {
      command: "cav recover --route /old-pricing",
      caption: "Move from problem to recovery plan.",
      lines: [
        { text: "recovery plan", tone: "blue" },
        { text: "redirect found", tone: "good" },
        { text: "patch ready", tone: "lime" },
        { text: "review before apply", tone: "muted" }
      ]
    }
  ];


  function initTerminalPage() {
    var page = document.querySelector("[data-terminal-page]");
    if (!page) return;


    if (page.dataset.terminalBound === "true") return;
    page.dataset.terminalBound = "true";


    var demo = page.querySelector("[data-terminal-demo]");
    var headCommand = page.querySelector("[data-terminal-head-command]");
    var headCaption = page.querySelector("[data-terminal-head-caption]");
    var lineCommand = page.querySelector("[data-terminal-line-command]");
    var output = page.querySelector("[data-terminal-output]");
    var toggle = page.querySelector("[data-terminal-toggle]");


    if (!demo || !headCommand || !headCaption || !lineCommand || !output || !toggle) return;


    var activeIndex = 0;
    var runId = 0;
    var isVisible = true;
    var isPaused = false;


    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    function wait(ms) {
      return new Promise(function (resolve) {
        window.setTimeout(resolve, ms);
      });
    }


    function clearNode(node) {
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
    }


    function setToggleState() {
      toggle.dataset.state = isPaused ? "paused" : "playing";
      toggle.setAttribute(
        "aria-label",
        isPaused ? "Play terminal animation" : "Pause terminal animation"
      );
    }


    async function typeText(node, text, speed, currentRunId) {
      node.textContent = "";


      for (var i = 0; i < text.length; i += 1) {
        if (currentRunId !== runId || isPaused) return false;


        node.textContent += text.charAt(i);
        await wait(text.charAt(i) === " " ? speed * 1.35 : speed);
      }


      return currentRunId === runId && !isPaused;
    }


    async function revealOutput(lines, currentRunId) {
      clearNode(output);


      for (var i = 0; i < lines.length; i += 1) {
        if (currentRunId !== runId || isPaused) return false;


        var line = document.createElement("div");
        var tone = lines[i].tone || "default";


        line.className = "terminal-output-line is-" + tone;
        line.textContent = lines[i].text;


        output.appendChild(line);


        window.requestAnimationFrame(
          (function (target) {
            return function () {
              target.classList.add("is-visible");
            };
          })(line)
        );


        await wait(210);
      }


      return currentRunId === runId && !isPaused;
    }


    function renderStatic(index) {
      var item = COMMANDS[index];


      activeIndex = index;


      headCommand.textContent = item.command;
      lineCommand.textContent = item.command;
      headCaption.textContent = item.caption;
      headCaption.classList.add("is-visible");


      clearNode(output);


      item.lines.forEach(function (entry) {
        var line = document.createElement("div");
        line.className = "terminal-output-line is-visible is-" + (entry.tone || "default");
        line.textContent = entry.text;
        output.appendChild(line);
      });
    }


    async function playCommand(index) {
      if (isPaused) return;


      runId += 1;


      var currentRunId = runId;
      var safeIndex = ((index % COMMANDS.length) + COMMANDS.length) % COMMANDS.length;
      var item = COMMANDS[safeIndex];


      activeIndex = safeIndex;


      headCaption.classList.remove("is-visible");
      headCaption.textContent = "";
      headCommand.textContent = "";
      lineCommand.textContent = "";


      clearNode(output);


      var headDone = await typeText(headCommand, item.command, 28, currentRunId);
      if (!headDone) return;


      if (currentRunId !== runId || isPaused) return;


      headCaption.textContent = item.caption;


      window.requestAnimationFrame(function () {
        headCaption.classList.add("is-visible");
      });


      await wait(260);


      if (currentRunId !== runId || isPaused) return;


      var lineDone = await typeText(lineCommand, item.command, 24, currentRunId);
      if (!lineDone) return;


      await wait(220);


      if (currentRunId !== runId || isPaused) return;


      var outputDone = await revealOutput(item.lines, currentRunId);
      if (!outputDone) return;


      await wait(2700);


      if (currentRunId !== runId || isPaused || !isVisible) return;


      playCommand(activeIndex + 1);
    }


    function bindVisibility() {
      if (!("IntersectionObserver" in window)) {
        isVisible = true;
        return;
      }


      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            isVisible = entry.isIntersecting;


            if (isVisible && !isPaused && !prefersReduced) {
              playCommand(activeIndex);
            }


            if (!isVisible) {
              runId += 1;
            }
          });
        },
        {
          threshold: 0.18,
          rootMargin: "0px 0px -8% 0px"
        }
      );


      observer.observe(demo);
    }


    toggle.addEventListener("click", function () {
      isPaused = !isPaused;
      setToggleState();


      if (isPaused) {
        runId += 1;
        return;
      }


      playCommand(activeIndex);
    });


    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        runId += 1;
        return;
      }


      if (!prefersReduced && !isPaused && isVisible) {
        playCommand(activeIndex);
      }
    });


    setToggleState();


    if (prefersReduced) {
      isPaused = true;
      setToggleState();
      renderStatic(0);
      return;
    }


    bindVisibility();
    playCommand(0);
  }


  function initTerminalSeal() {
    var section = document.querySelector("[data-terminal-seal]");
    if (!section) return;


    if (section.dataset.terminalSealBound === "true") return;
    section.dataset.terminalSealBound = "true";


    var map = section.querySelector("[data-terminal-seal-map]");


    if (map && !map.children.length) {
      var columns = 74;
      var rows = 26;


      for (var row = 0; row < rows; row += 1) {
        for (var col = 0; col < columns; col += 1) {
          var bottomField =
            row >= 9 &&
            ((row + col) % 3 !== 0 || row > 17);


          var rightField =
            col >= 43 &&
            row >= 2 &&
            ((row * 2 + col) % 4 !== 0);


          var centerField =
            col >= 16 &&
            col < 48 &&
            row >= 3 &&
            row < 20 &&
            ((row + col * 2) % 5 !== 0);


          var lowerBlend =
            row >= 18 &&
            ((row + col * 3) % 5 !== 0);


          var edgeIslands =
            (col === 5 && row === 12) ||
            (col === 9 && row === 18) ||
            (col === 15 && row === 10) ||
            (col === 31 && row === 22) ||
            (col === 49 && row === 5) ||
            (col === 58 && row === 8) ||
            (col === 67 && row === 16);


          if (!bottomField && !rightField && !centerField && !lowerBlend && !edgeIslands) {
            var empty = document.createElement("span");
            empty.style.opacity = "0";
            map.appendChild(empty);
            continue;
          }


          var square = document.createElement("span");
          var opacity = 0.16 + (((col + 3) * (row + 5)) % 8) * 0.032;


          if (row > 15) opacity += 0.1;
          if (row > 20) opacity += 0.08;
          if (col > 50) opacity += 0.05;


          square.style.setProperty(
            "--seal-square-opacity",
            Math.min(opacity, 0.62).toFixed(3)
          );


          map.appendChild(square);
        }
      }
    }


    if (!("IntersectionObserver" in window)) {
      section.classList.add("is-visible");
      return;
    }


    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            section.classList.add("is-visible");
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px"
      }
    );


    observer.observe(section);
  }


  function init() {
    initTerminalPage();
    initTerminalSeal();
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
