(function () {
  const body = document.body;
  const themeButton = document.querySelector("[data-docs-theme-toggle]");
  const docsHomeLink = document.querySelector("[data-docs-home-link]");
  const mobileToggle = document.querySelector("[data-docs-mobile-toggle]");
  const mobilePanel = document.querySelector("[data-docs-mobile-panel]");
  const searchInput = document.querySelector("#docs-search-input");
  const searchForm = searchInput ? searchInput.closest("form") : null;
  const searchClearButton = document.querySelector("[data-docs-search-clear]");
  const hero = document.querySelector("[data-docs-hero]");
  const copyToast = document.querySelector("[data-docs-copy-toast]");
  const copyMenu = document.querySelector("[data-docs-copy-menu]");
  const copyPageButton = document.querySelector("[data-docs-copy-page]");
  const aiLinks = Array.from(document.querySelectorAll("[data-docs-ai-link]"));
  const markdownLink = document.querySelector("[data-docs-markdown-link]");
  const articleTitle = document.querySelector("#docs-article-title");
  const articleKicker = document.querySelector(".docs-kicker");
  const articleLede = document.querySelector(".docs-lede");
  const callout = document.querySelector(".docs-callout");
  const prose = document.querySelector(".docs-prose");
  const leftPanel = document.querySelector(".docs-left-panel");
  const leftTitle = document.querySelector(".docs-left-title span");
  const leftNav = document.querySelector(".docs-left-nav");
  const rightPanel = document.querySelector(".docs-right-panel nav");
  const toggleStack = document.querySelector(".docs-toggle-stack");
  const topicGrid = document.querySelector(".docs-topic-grid");
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let searchResults = null;
  let cavaiPanel = null;

  function s(value) {
    return String(value || "").trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slugPath(path) {
    const clean = String(path || "/").replace(/\/+$/, "").toLowerCase();
    return clean || "/";
  }

  const commandRows = [
    ["cav guide", "Prints the full terminal guide.", "cav guide", "Returns workflow guidance and command groups."],
    ["cav commands", "Lists supported Cav commands.", "cav commands", "Returns the compact command index."],
    ["cav help [namespace]", "Shows focused help for a namespace.", "cav help diag", "Returns syntax and examples for that namespace."],
    ["cav status", "Shows operator, project, origin, and surface.", "cav status", "Returns the current CavBot terminal status."],
    ["cav ctx", "Shows active file and working directory context.", "cav ctx", "Returns current CavCode context."],
    ["cav whoami", "Shows the current operator context.", "cav whoami", "Returns identity and workspace scope."],
    ["cav clear", "Clears terminal output.", "cav clear", "Clears the terminal panel."],
    ["cav sync", "Reloads local workspace state.", "cav sync", "Forces a local storage sync."],
    ["cav diag", "Summarizes codebase files, markers, runtime events, and sync state.", "cav diag", "Returns a diagnostics snapshot."],
    ["cav diag errors", "Lists active Monaco diagnostics.", "cav diag errors", "Returns errors and warnings for the editor."],
    ["cav diag find", "Searches codebase file contents.", "cav diag find \"checkout\" --path /codebase/src", "Returns matching file lines."],
    ["cav events tail", "Shows recent CavTools events.", "cav events tail 10", "Returns recent event lines."],
    ["cav events filter", "Filters events by tone.", "cav events filter bad", "Returns matching events."],
    ["cav events clear", "Clears event history.", "cav events clear", "Clears local events."],
    ["cav jump", "Opens a file at a line and column.", "cav jump /codebase/app/page.tsx:2:1", "Opens the target file."],
    ["cav tab", "Switches a CavTools or CavCode tab.", "cav tab scm", "Changes the active panel."],
    ["cav open codebase", "Opens the CavCode editor.", "cav open codebase", "Navigates to CavCode."],
    ["cav open --", "Opens a codebase file.", "cav open -- /codebase/styles/global.css", "Opens the file in the editor."],
    ["cav run --", "Opens a file through the run shortcut.", "cav run -- /codebase/app/page.tsx", "Opens the file."],
    ["cav live", "Opens the live viewer.", "cav live", "Navigates to the HTML viewer/live preview."],
    ["cav studio run", "Runs the CavTools studio action.", "cav studio run", "Starts the configured studio run."],
    ["cav studio clear", "Clears studio output.", "cav studio clear", "Clears the studio state."],
    ["cav studio reset", "Resets studio state.", "cav studio reset", "Resets the studio panel."],
    ["cav export all", "Builds an export payload.", "cav export all", "Returns JSON with current context."],
    ["cav codebase pwd", "Prints the codebase working directory.", "cav codebase pwd", "Returns the active codebase path."],
    ["cav codebase ls", "Lists files in a codebase directory.", "cav codebase ls /codebase", "Returns child files and folders."],
    ["cav codebase tree", "Prints a codebase tree.", "cav codebase tree /codebase", "Returns nested file structure."],
    ["cav codebase cd", "Changes codebase working directory.", "cav codebase cd /codebase/src", "Updates cwd."],
    ["cav codebase mkdir", "Creates a codebase folder.", "cav codebase mkdir /codebase/snippets", "Adds a directory."],
    ["cav codebase touch", "Creates an empty codebase file.", "cav codebase touch /codebase/snippets/example.ts", "Adds a file."],
    ["cav codebase cat", "Reads a codebase file.", "cav codebase cat /codebase/README.md", "Returns file contents."],
    ["cav codebase write", "Writes text to a codebase file.", "cav codebase write /codebase/a.txt \"hello\"", "Updates file content."],
    ["cav codebase rm", "Removes a codebase node.", "cav codebase rm /codebase/a.txt", "Deletes the file or folder in workspace state."],
    ["cav codebase open", "Opens a codebase file.", "cav codebase open /codebase/app/page.tsx", "Opens the file."],
    ["cav workspace ls", "Lists mounted workspace files.", "cav workspace ls", "Returns workspace children."],
    ["cav workspace tree", "Prints the workspace tree.", "cav workspace tree", "Returns mounted workspace structure."],
    ["cav workspace open", "Opens a mounted workspace file.", "cav workspace open /app/page.tsx", "Opens the file."],
    ["cav workspace write", "Writes a mounted workspace file.", "cav workspace write /app/page.tsx \"export default function Page(){}\"", "Updates the file."],
    ["cav ai explain-current-diagnostic", "Routes a diagnostic explanation request.", "cav ai explain-current-diagnostic", "Returns the AI action hook state."],
    ["cav ai suggest-fix", "Routes a fix suggestion request.", "cav ai suggest-fix", "Returns the AI action hook state."],
    ["cav ai improve-seo", "Routes an SEO assist request.", "cav ai improve-seo", "Returns the AI action hook state."],
    ["cav ai create-fix-plan", "Routes a deterministic fix-plan request.", "cav ai create-fix-plan", "Returns the AI action hook state."],
    ["cav ai summarize-artifact", "Routes a CavCloud artifact summary request.", "cav ai summarize-artifact", "Returns the AI action hook state."],
    ["cav run dev|build|test", "Starts a runtime session for the mounted project.", "cav run dev", "Starts the process and streams logs."],
    ["cav run status", "Shows runtime sessions.", "cav run status", "Returns runtime state."],
    ["cav run logs", "Reads runtime logs.", "cav run logs <sessionId> 0", "Returns log lines."],
    ["cav run stop|restart", "Stops or restarts a runtime session.", "cav run stop <sessionId>", "Changes session state."],
    ["cav project service start|status|refresh|diagnostics|logs|stop|restart", "Controls the TypeScript project service.", "cav project service diagnostics", "Returns project-service diagnostics or state."],
    ["cav task list|run|status|logs|stop|restart|history", "Runs configured workspace tasks.", "cav task run build", "Returns task session output."],
    ["cav extension marketplace|install|update|uninstall|enable|disable|list|host|activate|api", "Manages CavCode extensions and the extension host.", "cav extension list", "Returns extension state or changes installation."],
    ["cav collab session|presence|op|share", "Controls collaborative editing sessions.", "cav collab session start /cavcode/src/app.tsx ot", "Creates or updates collaboration state."],
    ["cav security status|profile|secrets|scan|audit", "Reviews and configures command security controls.", "cav security status", "Returns security profile, scans, or audit events."],
    ["cav remote provider|session|port|debug", "Manages remote workspaces, sessions, ports, and debug adapters.", "cav remote provider list", "Returns or changes remote session state."],
    ["cav reliability status|snapshots|restore|replay|budget|crash", "Reviews runtime reliability state and recovery data.", "cav reliability status", "Returns reliability summaries or changes budgets."],
    ["cav ui palette|shortcut|view|layout", "Controls CavCode UI command surfaces.", "cav ui view list", "Returns or changes local UI state."],
    ["cav search rg|semantic|replace-preview", "Searches and previews replacements across CavCode files.", "cav search rg \"TODO\" --path /cavcode/src --max 200", "Returns search matches or replacement preview."],
    ["cav git status|diff|stage|unstage|commit|log|branch|checkout|remote|fetch|pull|push|sync|ahead-behind|rebase|cherry-pick|conflicts", "Runs source-control commands in the CavCode workspace.", "cav git status", "Returns Git output or changes the repository."],
    ["cav debug start|config|attach|select|stop|status|logs|continue|pause|next|step|out|threads|frame|scopes|vars|evaluate|repl|break|watch", "Runs debugger sessions and debug actions.", "cav debug start /cavcode/app/page.tsx", "Starts or controls a debug session."],
    ["cav index refresh|symbols|refs|calls|graph|xref|semantic", "Builds and queries the CavCode code index.", "cav index symbols", "Returns index results."],
    ["cav template list|init", "Lists or initializes code templates.", "cav template init website starter", "Returns templates or creates starter files."],
    ["cav loop plan|replace|checkpoint|run", "Runs deterministic edit-loop helpers.", "cav loop checkpoint create pre-refactor", "Creates plans, replacements, checkpoints, or loop runs."]
  ];

  function p(text) { return { type: "p", text: text }; }
  function list(items) { return { type: "ul", items: items }; }
  function ol(items) { return { type: "ol", items: items }; }
  function note(title, text) { return { type: "note", title: title, text: text }; }
  function code(text) { return { type: "code", text: text }; }
  function table(headers, rows) { return { type: "table", headers: headers, rows: rows }; }

  const docs = {
    getstarted: {
      path: "/getstarted",
      icon: "assets/icons/docs/rocket-svgrepo-com.svg",
      label: "Get started",
      kicker: "Start here",
      title: "Get started",
      description: "Create an account, add a website, install Analytics v5, and verify that CavBot is receiving signals.",
      sections: [
        { id: "overview", title: "Overview", summary: "What CavBot is and when to use it.", blocks: [p("CavBot is a workspace for monitoring websites after launch. It organizes site profiles, route activity, client-side errors, SEO snapshots, accessibility snapshots, 404 recovery data, reports, and assistant context."), p("A workspace contains projects and sites. A site represents a website origin such as https://example.com. The selected or primary site is the default context for dashboards, reports, and CavAi."), ol(["Create or sign in to your account.", "Open the workspace.", "Add a clean website origin.", "Install the Analytics v5 snippet.", "Visit the site and confirm signals appear in CavBot."])] },
        { id: "account", title: "Account", summary: "Set up the identity and workspace owner.", blocks: [p("Use an email address that can remain attached to the business or team. The owner account is the account that should keep billing, access, security, and workspace-control responsibility."), p("After signing in, check that the workspace opens, the account profile is recognizable, and the user can reach settings, dashboard, and Command Center surfaces."), note("Before inviting members", "Confirm the owner can access settings and billing. Invite teammates after the workspace, site, and owner account are stable.")] },
        { id: "site-setup", title: "Site setup", summary: "Create the site profile CavBot monitors.", blocks: [p("Use Sites to connect each website origin you want CavBot to monitor. Enter the origin, not a full path or tracking URL."), code("https://example.com\nhttps://www.example.com\nhttps://app.example.com"), p("CavBot normalizes origins with protocol and host. Dashboard selection, reports, route views, and the snippet all depend on this site profile."), note("Avoid", "Do not create the primary site from a URL like /pricing or ?ref=test. Add those as routes inside the site, not as separate site origins.")] },
        { id: "snippet", title: "Snippet", summary: "Install Analytics v5 on the site.", blocks: [p("Analytics v5 is the browser-side signal layer. It identifies the project key and site ID, sends events to /api/embed/analytics, and lets CavBot connect browser activity to the correct workspace site."), code('<script>\n  window.CAVBOT_API_URL = "https://app.cavbot.io/api/embed/analytics";\n  window.CAVBOT_PROJECT_KEY = "YOUR_PROJECT_KEY";\n  window.CAVBOT_SITE = "YOUR_SITE_ID";\n  window.CAVBOT_SITE_ID = "YOUR_SITE_ID";\n  window.CAVBOT_SITE_PUBLIC_ID = "YOUR_SITE_ID";\n</script>\n<script src="https://cdn.cavbot.io/sdk/v5/cavai-analytics-v5.min.js" defer></script>'), p("Install the snippet once in the global layout, theme, or custom-code area so it appears on every production page you want CavBot to read. The snippet sends project and site identifiers, SDK version and environment headers when present, route context, client-side event payloads, and browser snapshots used by CavBot signal modules."), note("Verify", "After installing, visit the site, move through important routes, then open CavBot and confirm the selected site shows recent activity or a useful empty state.")] },
        { id: "launch-checklist", title: "Launch checklist", summary: "Confirm setup before relying on CavBot.", blocks: [list(["Account is created and the owner can sign in.", "Workspace opens without an access request.", "Website origin is saved as a site.", "Primary site is selected when the workspace has more than one site.", "Analytics v5 snippet is present once on production pages.", "The project key and site ID match the CavBot workspace.", "A real browser visit has happened after installation.", "Dashboard, Routes, Errors, SEO, A11y, Reports, and 404 Control Room point to the expected site."]), p("After the checklist passes, continue to Website signals for diagnostics or Integrations for platform-specific install notes.")] }
      ]
    },
    account: {
      path: "/account",
      icon: "assets/icons/docs/account-avatar-head-svgrepo-com.svg",
      label: "Account and profile",
      kicker: "Account",
      title: "Account and profile",
      description: "Manage profile identity, sites, projects, primary site selection, notifications, and team access.",
      sections: [
        { id: "profile", title: "Profile", summary: "Manage account and public profile details.", blocks: [p("Profile settings store identity details used across CavBot, including display name, username, avatar style, company category, country, and profile links when configured."), p("Public profile controls exist in the app. When public profile is enabled, CavBot can show a public workspace profile at a username route. When it is disabled, the profile exists but public workspace details are not shared."), note("Privacy", "Only document and publish profile fields you intend visitors or teammates to see. Do not use profile text for secrets or private operational notes.")] },
        { id: "sites", title: "Sites", summary: "Represent website origins.", blocks: [p("A site is a saved website origin connected to a workspace project. CavBot uses it as the anchor for Analytics v5, route views, errors, SEO, accessibility, reports, and CavAi context."), p("Add clean origins such as https://example.com. CavBot validates and normalizes the origin before saving it. Owners and admins can add sites; members have more limited access."), note("Plan limits", "The app enforces website limits from the active plan: Free includes 1 website, Premium includes 6, and Premium+ includes 20.")] },
        { id: "projects", title: "Projects", summary: "Organize workspace context.", blocks: [p("Projects organize sites, members, settings, and active workspace selection. The app stores the active project and site selection so dashboards and tools can stay pointed at the same context."), p("Use separate projects when the work has different sites, teams, billing context, or operational boundaries. Keep related website origins in the same project when the same team reviews them together.")] },
        { id: "top-site", title: "Top site", summary: "Choose the primary website.", blocks: [p("Top site is the primary website for a workspace project. It is the site CavBot opens first and uses by default for dashboard views, reports, site context, and CavAi signal summaries."), p("Choose the production site your team reviews most often. If you add staging or preview origins, keep the public production site as Top site unless the workspace is dedicated to testing.")] },
        { id: "notifications", title: "Notifications", summary: "See operational updates.", blocks: [p("Notifications surface workspace events and operational messages. The app includes notification routes for unread counts, read-all actions, settings, storage-low notices, and operator ID reveals."), p("Use notifications to review changes that need attention, such as invite state, storage thresholds, CavCloud/CavSafe events, and system notices. Open the notification center before changing settings or deleting assets if you need recent context.")] },
        { id: "team-access", title: "Team access", summary: "Invite members and assign roles.", blocks: [p("Team access is role-based. Roles in the app are Owner, Admin, and Member."), table(["Role", "What it can do"], [["Owner", "Full workspace ownership, billing, security, role management, API keys, settings, and all modules."], ["Admin", "Operational work across CavCode, diagnostics, invites for non-owner roles, monitored targets, and most workspace modules. Admins cannot replace owner control."], ["Member", "Standard workspace access for dashboard and route monitoring. Members cannot manage billing, security, roles, or critical controls."]]), p("Invites can be pending, accepted, declined, revoked, or expired. Seat limits come from the plan: Free includes 4 seats, Premium includes 8, and Premium+ includes 16.")] }
      ]
    },
    workspace: {
      path: "/workspace",
      icon: "assets/icons/docs/gnome-panel-workspace-switcher-svgrepo-com.svg",
      label: "Workspace",
      kicker: "Workspace",
      title: "Workspace",
      description: "Use the dashboard, reports, CavPad, Arcade, Command Center, and member controls from one workspace context.",
      sections: [
        { id: "dashboard", title: "Dashboard", summary: "Review the selected site.", blocks: [p("The dashboard is the first operating view for the selected site. It reads the active project and site selection, plan context, storage usage, site list, guardrails, and notices."), p("Start by confirming the selected site is the one you expect. Then review storage, site status, plan limits, and the modules that are available on your plan.")] },
        { id: "reports", title: "Reports", summary: "Use focused summaries.", blocks: [p("Reports collect site and workspace signals into reviewable summaries. Use reports when you need to explain current site state or prepare a team update without opening every module manually."), p("Treat reports as snapshots. When a report calls out a route, error, SEO, accessibility, or 404 concern, open the source module before planning a fix.")] },
        { id: "cavpad", title: "CavPad", summary: "Create and sync workspace notes.", blocks: [p("CavPad is the workspace note surface. It supports directories, notes, note versions, rich text controls, links, tables, export, trash/restore behavior, and optional sync to CavCloud or CavSafe where enabled."), p("Use CavPad for operational notes, fix plans, release notes, setup instructions, and shared review notes tied to the workspace.")] },
        { id: "arcade", title: "Arcade", summary: "Manage CavBot Arcade surfaces.", blocks: [p("Arcade is the 404 and recovery game surface. The app includes multiple games with plan gates: catch-cavbot on Free, additional games on Premium, and all games on Premium+."), p("Use Arcade when a broken or missing route should give visitors a recovery path instead of a dead end. Check the platform integration docs before installing Arcade on a builder or storefront.")] },
        { id: "command-center", title: "Command Center", summary: "Operate workspace sites and controls.", blocks: [p("Command Center is the workspace operating surface. The legacy /command-center route redirects to the app root, where site setup, selection, guardrails, dashboard controls, and workspace context are managed."), p("Check Command Center first when a site is missing, the wrong site is selected, a plan limit is blocking setup, or guardrails need review.")] },
        { id: "members-and-roles", title: "Members and roles", summary: "Review access before work starts.", blocks: [p("Workspace access depends on member role. Owners manage billing, settings, security, API keys, sites, invites, and critical controls. Admins can perform operational work. Members can view and contribute within limited surfaces."), p("Before a team starts using CavBot, verify the owner, seat usage, active invites, and whether any access requests are pending.")] }
      ]
    },
    signals: {
      path: "/signals",
      icon: "assets/icons/docs/signal-svgrepo-com.svg",
      label: "Website signals",
      kicker: "Signals",
      title: "Website signals",
      description: "Read errors, routes, SEO, accessibility, insights, and 404 recovery data from the selected website.",
      sections: [
        { id: "errors", title: "Errors", summary: "Review client-side errors.", blocks: [p("Errors are runtime issues reported from the browser or derived from CavBot diagnostics. Use Error Intelligence when you need to know what failed, where it happened, and which route or context was involved."), p("After reading an error signal, open the affected route, reproduce the issue if possible, and check whether it affects a conversion, auth, checkout, or support flow.")] },
        { id: "routes", title: "Routes", summary: "Understand route behavior.", blocks: [p("Routes show the website paths CavBot has seen or scanned. Route context can include page visits, route metadata, 404-like behavior, navigation structure, and reliability signals."), p("Use Routes to find unexpected paths, missing pages, redirect problems, or important pages with weak metadata.")] },
        { id: "seo", title: "SEO", summary: "Read search metadata snapshots.", blocks: [p("SEO snapshots come from page metadata and CavBot analysis. The runtime reads titles, descriptions, favicon state, structured data, headings, keyword signals, trust-page signals, and other metadata when available."), p("After reading an SEO signal, fix the source page markup or CMS fields, then revisit the page so CavBot can collect a newer snapshot.")] },
        { id: "a11y", title: "A11y", summary: "Review accessibility snapshots.", blocks: [p("A11y snapshots look for issues such as missing alt text, missing form labels, focus-visible concerns, keyboard traps, heading order, landmark concerns, skip links, and reduced-motion support."), p("Use A11y to prioritize barriers that affect real users first. Verify fixes with keyboard navigation and a screen reader check when possible.")] },
        { id: "cavbot-insights", title: "CavBot Insights", summary: "Read prioritized observations.", blocks: [p("CavBot Insights combines site signals into observations the team can act on. Insights can include SEO, accessibility, performance, UX layout, engagement, route, 404, auth funnel, and geo trend context when the underlying data exists."), p("Use Insights to choose what to inspect next. Do not treat an insight as a fix by itself; open the source module and verify the route or page before changing production.")] },
        { id: "404-control-room", title: "404 Control Room", summary: "Investigate broken routes.", blocks: [p("404 Control Room is the recovery view for broken or missing routes. It helps teams understand which URLs visitors reach, where recovery is needed, and whether Arcade or redirects should be used."), p("Open 404 Control Room when users report missing pages, campaign links are wrong, migrated content has gaps, or a release changed route behavior.")] }
      ]
    },
    cavai: {
      path: "/cavai",
      icon: "assets/logo/CavAi Official Logo-svg/2.png",
      label: "CavAi",
      kicker: "CavAi",
      title: "CavAi",
      description: "Use CavAi with workspace context, supported models, Caven, image tools, and assistant memory.",
      sections: [
        { id: "cavai-v3", title: "CavAi V3", summary: "Use the main CavAi assistant surface.", blocks: [p("CavAi V3 is the assistant surface inside CavBot. It can use workspace and site context to explain signals, summarize current issues, draft next steps, and help a user understand what to review."), p("Use CavAi when you need an explanation or a plan. Use the dashboard and signal modules when you need the source route, event, report, or setting.")] },
        { id: "models", title: "Models", summary: "Understand available model choices.", blocks: [p("CavAi model routing is defined in the app model catalog. The visible catalog includes CavAi Auto, DeepSeek Chat, DeepSeek Reasoner, Qwen3.5-Flash, Qwen3.5-Plus, Qwen3-Max, Caven powered by Qwen3-Coder, CavBot Companion, Qwen ASR/TTS models, Image Studio, and Image Edit."), p("Qwen3-Max is marked Premium+ only and requires web research mode in the catalog. Image Studio requires Premium or Premium+. Image Edit requires Premium+. Guest preview mode limits uploads, image tools, advanced models, and deeper reasoning."), table(["Model", "Use"], [["CavAi Auto", "Default routing choice."], ["DeepSeek Chat", "General chat."], ["DeepSeek Reasoner", "Reasoning tasks."], ["Qwen3.5-Flash", "Fast Qwen text model."], ["Qwen3.5-Plus", "Higher-capability Qwen text model."], ["Qwen3-Max", "Premium+ research-capable model."], ["Caven / Qwen3-Coder", "Coding-focused work in CavCode and Caven."], ["Image Studio", "Image generation with Qwen-Image-2.0-Pro."], ["Image Edit", "Image editing with Qwen-Image-Edit-Max."]])] },
        { id: "assistant-memory", title: "Memory", summary: "Keep project context available.", blocks: [p("Assistant memory is the project context CavAi can use when responding. It belongs to stable workspace facts such as site purpose, important routes, team preferences, and recurring operational concerns."), p("Do not store passwords, private keys, payment data, sensitive customer information, or temporary details that will become wrong quickly. Review memory when the site or team changes.")] },
        { id: "caven", title: "Caven", summary: "Use the coding-focused assistant.", blocks: [p("Caven is the CavCode-focused assistant mode. It uses Qwen3-Coder and Caven agents for code explanation, repair, refactoring, file summaries, component/page generation, 404 page building, UI debugging, API/schema guard checks, and related development tasks."), p("Use Caven inside CavCode when the active file, diagnostics, or mounted workspace files provide the context needed for coding work.")] },
        { id: "image-studio", title: "Image Studio", summary: "Generate images in CavAi.", blocks: [p("Image Studio is CavAi's image generation surface. The app routes it to Qwen-Image-2.0-Pro and stores Image Studio history through the CavAi image-studio APIs."), p("Use Image Studio for visual concepts and generated image assets. Premium or Premium+ access is required in the current app gating.")] },
        { id: "image-edit", title: "Image Edit", summary: "Edit uploaded images.", blocks: [p("Image Edit is the image editing surface. The app routes it to Qwen-Image-Edit-Max and requires Premium+."), p("Use Image Edit when there is an uploaded source image and a specific edit instruction. The app rejects Image Edit requests when the plan does not allow it.")] }
      ]
    },
    developers: {
      path: "/developers",
      icon: "assets/icons/docs/code-svgrepo-com.svg",
      label: "Developers",
      kicker: "Developers",
      title: "Developers",
      description: "Install Analytics v5, use SDK snippets, send events, manage API keys, understand webhooks, and read summary data.",
      sections: [
        { id: "analytics-v5", title: "Analytics v5", summary: "Install the browser signal layer.", blocks: [p("Analytics v5 is the browser-side signal layer for CavBot. It connects a live website to a CavBot site profile so CavBot can receive page, route, runtime, and selected browser context."), code('<script>\n  window.CAVBOT_API_URL = "https://app.cavbot.io/api/embed/analytics";\n  window.CAVBOT_PROJECT_KEY = "YOUR_PROJECT_KEY";\n  window.CAVBOT_SITE = "YOUR_SITE_ID";\n  window.CAVBOT_SITE_ID = "YOUR_SITE_ID";\n  window.CAVBOT_SITE_PUBLIC_ID = "YOUR_SITE_ID";\n</script>\n<script src="https://cdn.cavbot.io/sdk/v5/cavai-analytics-v5.min.js" defer></script>'), p("Install the snippet once in the shared layout or platform custom-code area. After installation, visit the site and confirm the matching CavBot site profile shows recent activity.")] },
        { id: "sdk", title: "SDK", summary: "Use CavBot runtime scripts.", blocks: [p("The CavBot ecosystem exposes browser SDK scripts for Analytics v5, CavAi/CavBot runtime behavior, widgets, and Arcade loader installs. The settings snippet generator builds the correct script tags for the selected site and key."), p("Use the generated snippets from Settings or Integrations instead of hand-building script tags when possible.")] },
        { id: "events", title: "Events", summary: "Send important product actions.", blocks: [p("Events are named actions sent from the website to CavBot. Use them for actions that help explain site behavior, such as form submissions, checkout starts, pricing clicks, sign-up attempts, recovery actions, or feature interactions."), code('window.CavBot?.track?.("pricing_cta_clicked", {\n  plan: "pro",\n  route: window.location.pathname\n});'), p("Keep event names stable and do not send passwords, payment details, private messages, or sensitive customer data.")] },
        { id: "api-keys", title: "API keys", summary: "Connect sites and embeds.", blocks: [p("API keys identify a workspace project and site for embed and analytics requests. Settings includes an API keys panel for creating, rotating, and revoking keys. Owners control sensitive key management."), p("Keep keys scoped to the intended site origin. The embed verification layer checks project key, site ID, origin, and related headers before forwarding analytics events.")] },
        { id: "webhooks", title: "Webhooks", summary: "Understand event integrations.", blocks: [p("The app contains Stripe webhook handling for billing events. Customer-facing webhook controls are not exposed as a finished workspace feature in the files reviewed."), p("Treat webhooks as system integration points unless CavBot exposes a customer-facing webhook settings screen in your workspace.")] },
        { id: "summary-api", title: "Summary API", summary: "Read compact site state.", blocks: [p("Summary data is the read layer for current CavBot results. It is used when a surface needs a compact view of the selected site, route state, dashboard status, or recent recovery context."), p("Use summaries as snapshots. For fix planning, open the focused module and verify the source route, error, SEO, accessibility, or 404 signal before changing production.")] }
      ]
    },
    tools: {
      path: "/tools",
      icon: "assets/icons/docs/devtool-svgrepo-com.svg",
      label: "Developer tools",
      kicker: "Tools",
      title: "Developer tools",
      description: "Use CavCode, CavCloud, CavTools, HTML Viewer, and Cav commands for development and workspace operations.",
      sections: [
        { id: "cavcode", title: "CavCode", summary: "Edit and run workspace code.", blocks: [p("CavCode is the browser code editor. It uses a codebase/workspace file model, Monaco diagnostics, tabs for explorer/search/source control/live/run/settings, a terminal command plane, and Caven for coding-focused help."), p("CavCode can open files from /cavcode, edit text files, sync with CavCloud, run project services, inspect diagnostics, start runtime sessions, debug code, and manage Git through Cav commands. Save behavior routes through CavTools/CavCloud APIs when editing canonical workspace files.")] },
        { id: "cavcloud", title: "CavCloud", summary: "Store and organize workspace files.", blocks: [p("CavCloud is CavBot's workspace file storage. It supports folders, files, uploads, text editing, previews, sharing, publishing artifacts, activity, search, tree views, versions, trash restore, collaborators, and storage notifications."), p("Use CavCloud for working assets, documents, generated outputs, shared files, and files CavCode can mount for editing or preview.")] },
        { id: "cavtools", title: "CavTools", summary: "Run terminal and file operations.", blocks: [p("CavTools is the command and inspector surface. It has tabs for Inspector, Events, Studio, and Settings; file namespaces for CavCloud, CavSafe, CavCode, Telemetry, and Workspace; and /api/cavtools endpoints for command execution and file reads/writes."), p("Use CavTools when you need a controlled command plane rather than direct app navigation. Commands return typed blocks such as text, tables, files, JSON, diagnostics, warnings, or open links.")] },
        { id: "html-viewer", title: "HTML Viewer", summary: "Preview HTML files.", blocks: [p("HTML Viewer lives at /cavcode-viewer. It loads HTML, CSS, JavaScript, image, video, font, JSON, SVG, and other assets from CavCloud or CavSafe file APIs and renders a live preview."), p("Use it to inspect HTML artifacts, preview a mounted file, and check whether generated or edited website files render correctly before publishing.")] },
        { id: "cav-commands", title: "Cav commands", summary: "Command dictionary.", blocks: [p("Cav commands are handled by the browser Cav terminal and the server CavTools command plane. The dictionary below lists commands found in the repository."), { type: "commands", rows: commandRows }] }
      ]
    },
    security: {
      path: "/security",
      icon: "assets/icons/page/shield-tick-svgrepo-com.svg",
      label: "Security",
      kicker: "Security",
      title: "Security",
      description: "Use CavVerify, CavGuard, CavSafe, audit trails, and risk controls to protect workspace actions and files.",
      sections: [
        { id: "caverify", title: "CavVerify", summary: "Step-up verification for sensitive actions.", blocks: [p("CavVerify is the verification challenge system. It issues verification sessions and grants through /api/verify/challenge and /api/verify/submit, uses headers such as x-cavbot-verify-session and x-cavbot-verify-grant, and can be required before sensitive actions such as invites."), p("When CavVerify appears, complete the challenge before retrying the protected action.")] },
        { id: "cavguard", title: "CavGuard", summary: "Block or step up risky actions.", blocks: [p("CavGuard is the app's decision layer for protected workspace actions. Components display a CavGuard decision when a request is restricted by workspace access controls or requires a safer path."), p("CavGuard is used around role-sensitive and command-plane actions. If it blocks an action, review role, plan, origin, and workspace context before retrying.")] },
        { id: "cavsafe", title: "CavSafe", summary: "Store protected files.", blocks: [p("CavSafe is secured storage. It supports owner-only access, secured storage quotas, folders, files, gallery/tree views, private sharing, move-in/move-out with CavCloud, snapshots, time locks, integrity checks, audit logs, and owner dashboard analytics where the plan allows."), p("Premium includes CavSafe owner-only storage with 10 GB. Premium+ includes 50 GB plus Integrity Lock, Audit Log, Mountable CavSafe, Time Locks, Snapshots, and CavSafe Analytics.")] },
        { id: "audit-trail", title: "Audit trail", summary: "Review recorded actions.", blocks: [p("Audit trails record important workspace and storage activity. The app writes audit entries for account/admin actions, CavCloud publishing, CavCloud collaboration, CavSafe file access attempts, CavSafe moves, time-lock events, integrity updates, and security command-plane actions."), p("Use audit trails to understand who changed access, moved files, published artifacts, opened secured files, or ran sensitive commands. Teams should review audit history before investigating access disputes or production-impacting changes.")] },
        { id: "risk-controls", title: "Risk Controls", summary: "Configure guardrails.", blocks: [p("Risk controls are the settings and guardrails that reduce unsafe workspace behavior. The dashboard model includes blockUnknownOrigins, enforceAllowlist, alertOn404Spike, alertOnJsSpike, and strictDeletion."), p("Use these controls to limit unknown origins, enforce expected site allowlists, receive spike alerts for 404s and JavaScript errors, and make deletion more deliberate. Also review API key origin allowlists and CavCloud/CavSafe permissions before inviting new members.")] }
      ]
    },
    integrations: {
      path: "/integrations",
      icon: "assets/icons/docs/integrations-svgrepo-com.svg",
      label: "Integrations",
      kicker: "Integrations",
      title: "Integrations",
      description: "Install CavBot on Webflow, Shopify, Wix, Framer, WordPress, Squarespace, or custom HTML sites.",
      sections: [
        { id: "webflow", title: "Webflow", summary: "Install in Webflow project code.", blocks: integrationBlocks("Webflow", "Use Webflow for CMS and marketing sites managed in the Webflow designer.", "Project Settings or Page Settings custom code. Use the global footer/body area when every page should send signals.", "Publishing only to staging and forgetting the production domain, pasting the snippet into a single page when the whole site should be monitored, or using an origin that is not allowlisted on the API key.") },
        { id: "shopify", title: "Shopify", summary: "Install in a Shopify theme.", blocks: integrationBlocks("Shopify", "Use Shopify for storefronts and checkout-adjacent customer journeys.", "The shared theme layout, usually before the closing body tag. Avoid editing checkout files unless your Shopify plan and policy allow that work.", "Installing only on one template, testing on a preview theme but checking production signals, or using a store origin that is not allowlisted.") },
        { id: "wix", title: "Wix", summary: "Install in Wix custom code.", blocks: integrationBlocks("Wix", "Use Wix for builder-managed pages and storefronts.", "Settings custom code for the site, applied to all pages where CavBot should run.", "Adding code to an element instead of the global code area, leaving the code disabled, or checking a different origin than the connected site.") },
        { id: "framer", title: "Framer", summary: "Install in Framer custom code.", blocks: integrationBlocks("Framer", "Use Framer for design-driven sites. The app registry marks Framer as coming soon, so use the custom HTML approach until your workspace exposes the finished platform flow.", "Site custom code, preferably the end of body area.", "Assuming the coming-soon integration has a one-click connection, publishing a preview but checking the production domain, or missing the API-key allowlist.") },
        { id: "wordpress", title: "WordPress", summary: "Install in WordPress templates or plugins.", blocks: integrationBlocks("WordPress", "Use WordPress for theme-based sites, blogs, and CMS pages.", "A trusted header/footer code plugin, theme footer, or child theme layout that loads on every monitored page.", "Editing a parent theme that updates later, installing only on one page, caching old markup, or forgetting to purge cache after adding the snippet.") },
        { id: "squarespace", title: "Squarespace", summary: "Install in Squarespace code injection.", blocks: integrationBlocks("Squarespace", "Use Squarespace for managed business and portfolio sites. The app registry marks Squarespace as coming soon, so follow the custom code path until the dedicated integration is available.", "Code Injection for the site footer/body area.", "Using page-only injection when the whole site should be monitored, checking before publishing, or using a non-allowlisted origin.") },
        { id: "custom-html", title: "Custom HTML", summary: "Install directly in your site.", blocks: integrationBlocks("Custom HTML", "Use Custom HTML for hand-built sites, static sites, custom frameworks, and any platform where you control the page template.", "The shared HTML layout before the closing body tag, or the equivalent framework root layout.", "Loading the script before the configuration values, duplicating the snippet, omitting the production domain from the API key allowlist, or installing only on one route.")}
      ]
    },
    billing: {
      path: "/billing",
      icon: "assets/icons/docs/pay-svgrepo-com.svg",
      label: "Billing and plans",
      kicker: "Billing",
      title: "Billing and plans",
      description: "Understand plans, trial behavior, checkout, Stripe portal, seats, and cancellation.",
      sections: [
        { id: "plans", title: "Plans", summary: "Compare plan limits.", blocks: [p("Plan definitions are stored in lib/plans.ts and used by UI and API guardrails."), table(["Plan", "Monthly", "Websites", "Seats", "Storage", "Modules"], [["CavTower / Free", "$0", "1", "4", "5 GB CavCloud", "Dashboard, routing, Control Room, badge widgets. Errors, SEO, A11y, and Insights are locked."], ["CavControl / Premium", "$19.99", "6", "8", "50 GB CavCloud, 10 GB CavSafe", "Errors and SEO enabled. A11y and Insights locked."], ["CavElite / Premium+", "$39.99", "20", "16", "500 GB CavCloud, 50 GB CavSafe", "Errors, SEO, A11y, and Insights enabled."]]), p("Annual prices in the repo are $199.99 for Premium and $399.99 for Premium+.")] },
        { id: "trial", title: "Trial", summary: "Understand trial access.", blocks: [p("Trial state is represented by trialSeatActive and trialEndsAt on the account. When the trial is active, feature gates resolve the account as Premium+ for effective access."), p("Trial access ends when trialEndsAt passes or trialSeatActive is no longer true. After that, the account returns to its paid or free tier.")] },
        { id: "checkout", title: "Checkout", summary: "Start Stripe checkout.", blocks: [p("Checkout is handled through billing and Stripe routes, including /api/billing/checkout, /api/billing/checkout-session, /api/billing/checkout-embedded, and /api/stripe/checkout."), p("Owners and admins should start checkout from the plan or settings billing surface. After checkout, return routes show success or failure state.")] },
        { id: "portal", title: "Portal", summary: "Manage billing in Stripe.", blocks: [p("The Stripe portal route lets authorized workspace billing users manage payment methods, invoices, and subscription details in Stripe."), p("Use the portal when you need invoice history, payment method updates, or Stripe-managed subscription changes.")] },
        { id: "seats", title: "Seats", summary: "Plan member limits.", blocks: [p("Seats are enforced from plan limits: Free includes 4 seats, Premium includes 8, and Premium+ includes 16. Team invites check these limits and can fail with PLAN_SEAT_LIMIT."), p("Before inviting users, review current members and pending invites. Revoked or expired invites should not be treated as active access.")] },
        { id: "cancel-a-plan", title: "Cancel a plan", summary: "Cancel or downgrade billing.", blocks: [p("The app includes downgrade and cancel-downgrade billing routes. Plan changes should be started by an owner or authorized billing user from Settings or Plan screens."), p("After a downgrade or cancellation, expect CavBot to keep the workspace but enforce the resulting plan limits. Locked modules remain visible only where the app shows locked states, and capacity may need cleanup if usage exceeds the new plan.")] }
      ]
    },
    assets: {
      path: "/assets",
      icon: "assets/logo/cavbot-logomark.svg",
      label: "CavBot assets",
      kicker: "CavBot assets",
      title: "CavBot assets",
      description: "Install CavBot visual surfaces for badges, compact CavBot presence, guided moments, Arcade recovery, and brand resources.",
      sections: [
        { id: "cavbot-badge", title: "Badge", summary: "Show a compact CavBot trust marker.", blocks: [p("The CavBot Badge is a small website surface loaded from the CavBot CDN. Use it when a page should show that CavBot is present without changing the main page flow."), code('<link rel="stylesheet" href="https://cdn.cavbot.io/sdk/ui/v1/cavbot-badge-inline.css">\n\n<div\n  data-cavbot-cdn-floating-badge="1"\n  data-cavbot-cdn-slot="badge"\n  aria-hidden="true"\n  style="position:fixed;right:24px;bottom:24px;z-index:9999;"></div>'), p("Place it where it will not cover forms, checkout controls, cookie banners, or support widgets. Verify it appears in both light and dark page themes when the page supports them.")] },
        { id: "cavbot-head", title: "Head", summary: "Use a compact CavBot visual.", blocks: [p("CavBot Head is a compact visual component for onboarding, empty states, setup confirmation, and status surfaces."), code('<link rel="stylesheet" href="https://cdn.cavbot.io/sdk/ui/v1/cavbot-head-orbit.css">\n\n<div data-cavbot-head-orbit></div>'), p("Keep the component small and leave enough space around it. It should support the page state, not replace the actual instructions or controls.")] },
        { id: "cavbot-body", title: "Body", summary: "Use the larger CavBot visual.", blocks: [p("CavBot Body is the larger CavBot visual presence for guided product moments, launch states, recovery screens, or support surfaces."), code('<link rel="stylesheet" href="https://cdn.cavbot.io/sdk/ui/v1/cavbot-full-body.css">\n\n<div data-cavbot-full-body></div>'), p("Use the full body only when the page benefits from a stronger guide or recovery anchor. Check mobile layouts so it does not crowd the content.")] },
        { id: "arcade-404", title: "Arcade", summary: "Use Arcade on broken-page recovery.", blocks: [p("Arcade is the interactive 404 recovery surface. Use it when visitors reach a missing route and should have a useful recovery moment instead of a dead end."), p("Arcade should be loaded from the CavBot CDN/runtime loader for public installs. Keep the game runtime out of customer-facing source when the production setup is meant to fetch the experience remotely."), p("After installing Arcade, verify the 404 route loads the selected experience, the visitor can return to a useful route, and CavBot records the recovery context.")] },
        { id: "arcade-games", title: "404 games", summary: "Choose the recovery game.", blocks: [p("404 games are the playable recovery experiences used by Arcade. They are meant for broken-page recovery, not as a replacement for fixing bad links."), p("Choose the game that fits the site and keep the recovery links clear. Review 404 Control Room after launch to see which broken routes still need redirects or repairs.")] },
        { id: "brand-resources", title: "Brand resources", summary: "Use approved CavBot brand files.", blocks: [p("Brand resources live at brand.cavbot.io. Use that site for approved CavBot marks, logotypes, and brand guidance."), p("Use the CDN badge and documented assets for product surfaces. Do not copy internal source files into a public site when a CDN asset or approved brand resource exists.")] }
      ]
    },
    resources: {
      path: "/resources",
      icon: "assets/icons/docs/image-combiner-svgrepo-com3.svg",
      label: "More docs",
      kicker: "Resources",
      title: "More docs",
      description: "Find support, status, releases, and community information.",
      sections: [
        { id: "support", title: "Support", summary: "Get help with CavBot.", blocks: [p("Use support when a workspace cannot sign in, a site will not connect, a snippet fails verification, billing needs review, or a module shows an unexpected error."), p("Include the workspace, site origin, route, time of the issue, and any request or error code shown by the app.")] },
        { id: "status", title: "Status", summary: "Check CavBot service health.", blocks: [p("The app status surface tracks services such as CavAi Analytics v5, CavAi v3, CavTools, CavCode, CavCode Viewer, CavCloud and our arcade CDN. It also includes status history and incident routes."), p("Check Status before debugging a local install issue if multiple CavBot services appear unavailable.")] },
        { id: "releases", title: "Releases", summary: "Follow product changes.", blocks: [p("Release notes should explain what changed, what users need to do, and whether any behavior changed in setup, billing, integrations, or workspace modules."), p("When reading a release, verify whether the change affects your plan, snippet, integration platform, or site settings.")] },
        { id: "community", title: "Community", summary: "Future CavBot community.", blocks: [p("CavBot is working on building a community. It is intended to become a place where users can ask questions, share setup patterns, report issues, learn from other teams, and follow CavBot updates."), p("Do not treat the community as an active support channel until CavBot publishes the finished community surface. For now, use support and status for operational issues.")] }
      ]
    }
  };

  function integrationBlocks(name, when, placement, mistakes) {
    return [
      p(name + " installation connects that platform to CavBot Analytics v5, widgets, and Arcade snippets generated for a CavBot site."),
      p("When to use it: " + when),
      p("Where to paste the snippet: " + placement),
      p("What to verify: publish the site, visit the public origin, move through a few routes, then check CavBot for recent signals on the same site profile."),
      p("Common mistakes: " + mistakes),
      p("Next step: open Website signals and confirm Routes, Errors, SEO, A11y, and 404 Control Room are pointed at the expected origin.")
    ];
  }

  const pathToRoute = {};
  Object.keys(docs).forEach(function (key) {
    pathToRoute[docs[key].path] = key;
  });
  const sectionToRoute = {};
  Object.keys(docs).forEach(function (key) {
    docs[key].sections.forEach(function (section) {
      sectionToRoute[section.id] = key;
    });
  });

  function currentRoute() {
    const path = slugPath(window.location.pathname);
    if (path === "/" || path === "/docs.html" || path === "/index.html") return "home";
    return pathToRoute[path] || "home";
  }

  function categoryForRoute(route) {
    return docs[route] || docs.getstarted;
  }

  function safeStorageGet(key) {
    try { return window.localStorage.getItem(key); } catch (error) { return null; }
  }

  function safeStorageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (error) {}
  }

  function setTheme(theme) {
    const safeTheme = theme === "light" ? "light" : "dark";
    body.setAttribute("data-docs-theme", safeTheme);
    safeStorageSet("cavbot_docs_theme", safeTheme);
    if (themeButton) themeButton.setAttribute("aria-label", safeTheme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    const logo = document.querySelector(".docs-brand-mark");
    if (!logo) return;
    const darkLogo = logo.getAttribute("data-docs-logo-dark");
    const lightLogo = logo.getAttribute("data-docs-logo-light");
    logo.setAttribute("src", safeTheme === "light" && lightLogo ? lightLogo : darkLogo || logo.getAttribute("src"));
  }

  function initTheme() {
    setTheme(safeStorageGet("cavbot_docs_theme") === "light" ? "light" : "dark");
    if (themeButton) {
      themeButton.addEventListener("click", function () {
        setTheme(body.getAttribute("data-docs-theme") === "dark" ? "light" : "dark");
      });
    }
  }

  function renderLanding() {
    if (!topicGrid) return;
    topicGrid.innerHTML = Object.keys(docs).map(function (key) {
      const cat = docs[key];
      return '<article class="docs-topic-card is-visible" data-docs-reveal>' +
        '<a class="docs-topic-title-link" href="' + cat.path + '">' +
          '<img class="docs-topic-icon" src="' + cat.icon + '" alt="" aria-hidden="true" decoding="async">' +
          '<h2>' + escapeHtml(cat.label) + '</h2>' +
        '</a>' +
        '<ul>' + cat.sections.map(function (section) {
          return '<li><a href="' + cat.path + '#' + section.id + '" data-docs-open="' + section.id + '">' + escapeHtml(section.title) + '</a></li>';
        }).join("") + '</ul>' +
      '</article>';
    }).join("");
  }

  function blockHtml(block) {
    if (block.type === "p") return "<p>" + escapeHtml(block.text) + "</p>";
    if (block.type === "ul") return "<ul>" + block.items.map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("") + "</ul>";
    if (block.type === "ol") return "<ol>" + block.items.map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("") + "</ol>";
    if (block.type === "note") return '<div class="docs-note"><strong>' + escapeHtml(block.title) + ':</strong><span>' + escapeHtml(block.text) + "</span></div>";
    if (block.type === "code") return "<pre><code>" + escapeHtml(block.text) + "</code></pre>";
    if (block.type === "table") {
      return '<table class="docs-table"><thead><tr>' + block.headers.map(function (h) { return "<th>" + escapeHtml(h) + "</th>"; }).join("") + "</tr></thead><tbody>" + block.rows.map(function (row) {
        return "<tr>" + row.map(function (cell) { return "<td>" + escapeHtml(cell) + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table>";
    }
    if (block.type === "commands") {
      return '<div class="docs-command-list">' + block.rows.map(function (row) {
        return '<section class="docs-callout"><h2><code>' + escapeHtml(row[0]) + '</code></h2>' +
          '<p><strong>Purpose:</strong> ' + escapeHtml(row[1]) + '</p>' +
          '<pre><code>' + escapeHtml(row[2]) + '</code></pre>' +
          '<p><strong>Returns or changes:</strong> ' + escapeHtml(row[3]) + '</p></section>';
      }).join("") + "</div>";
    }
    return "";
  }

  function renderArticle(route) {
    const cat = categoryForRoute(route);
    body.setAttribute("data-docs-route", route);
    body.setAttribute("data-docs-section", route);
    body.setAttribute("data-cavbot-page-type", "docs-article");
    if (docsHomeLink) docsHomeLink.removeAttribute("aria-current");
    document.title = cat.label + " · CavBot Docs";
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", cat.description);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", "https://docs.cavbot.io" + cat.path);
    if (articleKicker) articleKicker.textContent = cat.kicker;
    if (articleTitle) articleTitle.textContent = cat.title;
    if (articleLede) articleLede.textContent = cat.description;
    if (leftPanel) leftPanel.setAttribute("aria-label", cat.label + " navigation");
    if (leftTitle) leftTitle.textContent = cat.label;
    if (leftNav) {
      leftNav.setAttribute("aria-label", cat.label + " sections");
      leftNav.innerHTML = '<div class="docs-nav-group" data-docs-nav-section="' + route + '"><p>' + escapeHtml(cat.label) + '</p>' +
        cat.sections.map(function (section) {
          return '<a href="' + cat.path + '#' + section.id + '" data-docs-open="' + section.id + '">' + escapeHtml(section.title) + '</a>';
        }).join("") + "</div>";
    }
    if (rightPanel) {
      rightPanel.innerHTML = cat.sections.map(function (section) {
        return '<a href="' + cat.path + '#' + section.id + '" data-docs-open="' + section.id + '">' + escapeHtml(section.title) + '</a>';
      }).join("");
    }
    if (callout) {
      callout.innerHTML = '<h2>Documentation index</h2><p>Fetch the complete documentation index at: <a href="https://docs.cavbot.io/llms.txt">https://docs.cavbot.io/llms.txt</a></p><p>Use the left menu or the On this page panel to open a section.</p>';
    }
    if (prose) {
      prose.innerHTML = '<p>' + escapeHtml(cat.description) + '</p>';
    }
    if (toggleStack) {
      toggleStack.setAttribute("aria-label", cat.label + " documentation");
      toggleStack.innerHTML = cat.sections.map(function (section, index) {
        return '<details class="docs-doc-toggle" id="' + section.id + '" data-docs-title="' + escapeHtml(section.title) + '" data-docs-summary="' + escapeHtml(section.summary) + '"' + (index === 0 ? " open" : "") + '>' +
          '<summary><span>' + escapeHtml(section.title) + '</span><em>' + escapeHtml(section.summary) + '</em></summary>' +
          '<div class="docs-toggle-body">' + section.blocks.map(blockHtml).join("") + '</div>' +
        '</details>';
      }).join("");
    }
  }

  function setHomeRoute() {
    body.setAttribute("data-docs-route", "home");
    body.setAttribute("data-cavbot-page-type", "docs-home");
    if (docsHomeLink) docsHomeLink.setAttribute("aria-current", "page");
    document.title = "CavBot Docs · Guides and references · CavBot";
  }

  function headerOffset() {
    const header = document.querySelector("[data-docs-header]");
    return Math.ceil((header ? header.getBoundingClientRect().height : 72) + 18);
  }

  function setActive(id) {
    Array.from(document.querySelectorAll("[data-docs-open]")).forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("data-docs-open") === id);
    });
  }

  function openToggle(id, shouldScroll, replace) {
    const route = currentRoute() === "home" ? sectionToRoute[id] || "getstarted" : currentRoute();
    if (body.getAttribute("data-docs-route") !== route) renderArticle(route);
    const cat = categoryForRoute(route);
    const safeId = cat.sections.some(function (section) { return section.id === id; }) ? id : cat.sections[0].id;
    Array.from(document.querySelectorAll(".docs-doc-toggle")).forEach(function (toggle) {
      const active = toggle.id === safeId;
      toggle.open = active;
    });
    setActive(safeId);
    if (replace && window.history) window.history.replaceState(null, "", cat.path + "#" + safeId);
    if (shouldScroll) {
      const target = document.getElementById(safeId);
      if (target) {
        const top = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - headerOffset());
        window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
      }
    }
    syncExternalDocLinks();
  }

  function navigateTo(url) {
    const parsed = new URL(url, window.location.origin);
    const route = pathToRoute[slugPath(parsed.pathname)];
    if (!route) {
      window.location.href = parsed.href;
      return;
    }
    history.pushState(null, "", parsed.pathname + parsed.hash);
    renderArticle(route);
    const id = parsed.hash ? parsed.hash.slice(1) : categoryForRoute(route).sections[0].id;
    openToggle(id, Boolean(parsed.hash), true);
    if (!parsed.hash) {
      const target = document.querySelector(".docs-article-header") || document.querySelector(".docs-article");
      if (target) {
        const top = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - headerOffset());
        window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
      }
    }
  }

  function initLinks() {
    document.addEventListener("click", function (event) {
      const link = event.target.closest && event.target.closest("a");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;
      const parsed = new URL(href, window.location.origin);
      if (!pathToRoute[slugPath(parsed.pathname)]) return;
      event.preventDefault();
      navigateTo(parsed.pathname + parsed.hash);
    });
    window.addEventListener("popstate", function () {
      const route = currentRoute();
      if (route === "home") {
        setHomeRoute();
      } else {
        renderArticle(route);
        openToggle(window.location.hash ? window.location.hash.slice(1) : categoryForRoute(route).sections[0].id, false, false);
      }
    });
    window.addEventListener("hashchange", function () {
      const id = window.location.hash ? window.location.hash.slice(1) : "";
      if (id) openToggle(id, true, false);
    });
  }

  function showCopyToast(message) {
    if (!copyToast) return;
    copyToast.textContent = message || "Saved";
    copyToast.classList.add("is-visible");
    copyToast.setAttribute("aria-hidden", "false");
    window.clearTimeout(showCopyToast.timer);
    showCopyToast.timer = window.setTimeout(function () {
      copyToast.classList.remove("is-visible");
      copyToast.setAttribute("aria-hidden", "true");
    }, 1400);
  }

  function copyText(value) {
    const text = String(value || "").trim();
    if (!text) return Promise.resolve(false);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; });
    }
    return Promise.resolve(false);
  }

  function getCanonicalPageUrl() {
    const route = body.getAttribute("data-docs-route") || "getstarted";
    const cat = categoryForRoute(route);
    const hash = window.location.hash || ("#" + cat.sections[0].id);
    return "https://docs.cavbot.io" + cat.path + hash;
  }

  function getCavAiUrl(query) {
    const prompt = encodeURIComponent((query ? "Use the CavBot Docs context to answer: " + query + "\n" : "Read this CavBot Docs page: ") + getCanonicalPageUrl());
    return "https://app.cavbot.io/cavai?prompt=" + prompt + "&q=" + prompt + "#prompt=" + prompt;
  }

  function syncExternalDocLinks() {
    const route = body.getAttribute("data-docs-route") || "getstarted";
    const cat = categoryForRoute(route);
    aiLinks.forEach(function (link) {
      const service = link.getAttribute("data-docs-ai-link");
      const prompt = encodeURIComponent("Read from " + getCanonicalPageUrl() + " so I can ask questions about it.");
      if (service === "cavai") link.setAttribute("href", getCavAiUrl(""));
      if (service === "chatgpt") link.setAttribute("href", "https://chatgpt.com/?prompt=" + prompt);
      if (service === "claude") link.setAttribute("href", "https://claude.ai/new?q=" + prompt);
    });
    if (markdownLink) markdownLink.setAttribute("href", "https://docs.cavbot.io" + cat.path + ".md");
  }

  function initCopy() {
    if (copyPageButton) {
      copyPageButton.addEventListener("click", function () {
        const article = document.querySelector(".docs-article");
        copyText(article ? article.innerText : document.title).then(function (ok) {
          showCopyToast(ok ? "Page copied" : "Copy unavailable");
          if (copyMenu) copyMenu.open = false;
        });
      });
    }
    if (copyMenu) {
      document.addEventListener("click", function (event) {
        if (copyMenu.open && event.target instanceof Node && !copyMenu.contains(event.target)) copyMenu.open = false;
      });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") copyMenu.open = false;
      });
    }
  }

  function initMobileMenu() {
    if (!mobileToggle || !mobilePanel) return;
    mobilePanel.innerHTML = Object.keys(docs).map(function (key) {
      return '<a href="' + docs[key].path + '">' + escapeHtml(docs[key].label) + '</a>';
    }).join("");
    mobileToggle.addEventListener("click", function () {
      const isOpen = mobileToggle.getAttribute("aria-expanded") === "true";
      mobileToggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
      if (isOpen) mobilePanel.setAttribute("hidden", "");
      else mobilePanel.removeAttribute("hidden");
    });
    mobilePanel.addEventListener("click", function () {
      mobileToggle.setAttribute("aria-expanded", "false");
      mobilePanel.setAttribute("hidden", "");
    });
  }

  function initSearchShortcut() {
    if (!searchInput) return;
    window.addEventListener("keydown", function (event) {
      const tag = event.target && event.target.tagName ? event.target.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea" || (event.target && event.target.isContentEditable)) return;
      if (event.key === "/") {
        event.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  }

  function getSearchItems() {
    const items = [];
    Object.keys(docs).forEach(function (key) {
      const cat = docs[key];
      items.push({ title: cat.label, summary: cat.description, href: cat.path, text: (cat.label + " " + cat.description).toLowerCase() });
      cat.sections.forEach(function (section) {
        const text = [cat.label, section.title, section.summary].concat(section.blocks.map(function (block) {
          if (block.text) return block.text;
          if (block.items) return block.items.join(" ");
          return "";
        })).join(" ");
        items.push({ title: section.title, summary: cat.label + " documentation", href: cat.path + "#" + section.id, id: section.id, text: text.toLowerCase() });
      });
    });
    return items;
  }

  function ensureSearchResults() {
    if (!searchForm || searchResults) return searchResults;
    searchResults = searchForm.querySelector(".docs-search-results");
    return searchResults;
  }

  function closeSearchPanel() {
    body.classList.remove("docs-search-active");
    if (searchForm) searchForm.classList.remove("is-open");
    if (searchResults) searchResults.hidden = true;
  }

  function renderSearchResults(query) {
    const resultsNode = ensureSearchResults();
    if (!resultsNode) return;
    const term = s(query).toLowerCase();
    const matches = term ? getSearchItems().filter(function (item) { return item.text.indexOf(term) >= 0; }).slice(0, 8) : getSearchItems().slice(0, 8);
    resultsNode.innerHTML = '<div class="docs-search-group"><p>Search docs</p>' + (matches.length ? matches.map(function (item) {
      return '<button type="button" class="docs-search-result" data-docs-search-href="' + escapeHtml(item.href) + '"><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.summary) + '</span></button>';
    }).join("") : '<p class="docs-search-empty">No docs matched that search.</p>') + '</div>' +
      '<div class="docs-search-ask"><p><img src="assets/logo/CavAi Official Logo-svg/2.png" alt="" aria-hidden="true" decoding="async"> Ask CavAi</p><button type="button" class="docs-search-ask-button" data-docs-cavai-question="' + escapeHtml(query || "How do I get started with CavBot?") + '"><span>Ask CavAi about "' + escapeHtml(query || "CavBot Docs") + '"</span><small>Uses docs context.</small></button></div>';
    Array.from(resultsNode.querySelectorAll("[data-docs-search-href]")).forEach(function (button) {
      button.addEventListener("click", function () {
        navigateTo(button.getAttribute("data-docs-search-href") || "/getstarted");
        closeSearchPanel();
      });
    });
    const ask = resultsNode.querySelector("[data-docs-cavai-question]");
    if (ask) ask.addEventListener("click", function () { openCavAiPanel(ask.getAttribute("data-docs-cavai-question") || ""); closeSearchPanel(); });
    resultsNode.hidden = false;
  }

  function openSearchPanel() {
    const resultsNode = ensureSearchResults();
    if (!resultsNode || !searchForm) return;
    body.classList.add("docs-search-active");
    searchForm.classList.add("is-open");
    renderSearchResults(searchInput ? searchInput.value : "");
  }

  function initSearch() {
    if (!searchInput || !searchForm) return;
    function update() {
      const hasValue = Boolean(s(searchInput.value));
      searchForm.classList.toggle("has-value", hasValue);
      if (searchClearButton) searchClearButton.hidden = !hasValue;
    }
    update();
    searchInput.addEventListener("input", function () { update(); openSearchPanel(); });
    searchInput.addEventListener("focus", function () { update(); openSearchPanel(); });
    searchForm.addEventListener("submit", function (event) { event.preventDefault(); openCavAiPanel(searchInput.value); closeSearchPanel(); });
    if (searchClearButton) searchClearButton.addEventListener("click", function (event) { event.preventDefault(); searchInput.value = ""; update(); openSearchPanel(); });
    document.addEventListener("click", function (event) {
      if (!searchResults || searchResults.hidden || (event.target instanceof Node && searchForm.contains(event.target))) return;
      closeSearchPanel();
    });
  }

  function ensureCavAiPanel() {
    if (cavaiPanel) return cavaiPanel;
    cavaiPanel = document.createElement("section");
    cavaiPanel.className = "docs-cavai-panel";
    cavaiPanel.hidden = true;
    cavaiPanel.innerHTML = '<div class="docs-cavai-panel-head"><span><img src="assets/logo/CavAi Official Logo-svg/2.png" alt="" aria-hidden="true" decoding="async"> CavAi</span><a data-docs-cavai-open-full target="_blank" rel="noopener noreferrer">Open full CavAi</a><button type="button" data-docs-cavai-close aria-label="Close CavAi">×</button></div><iframe title="CavAi docs assistant" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>';
    document.body.appendChild(cavaiPanel);
    cavaiPanel.querySelector("[data-docs-cavai-close]").addEventListener("click", function () { cavaiPanel.hidden = true; });
    return cavaiPanel;
  }

  function openCavAiPanel(query) {
    const panel = ensureCavAiPanel();
    const url = getCavAiUrl(query);
    panel.querySelector("iframe").setAttribute("src", url);
    panel.querySelector("[data-docs-cavai-open-full]").setAttribute("href", url);
    panel.hidden = false;
  }

  function initFeedback() {
    Array.from(document.querySelectorAll("[data-docs-feedback]")).forEach(function (button) {
      button.addEventListener("click", function () { showCopyToast("Thanks for the feedback"); });
    });
  }

  function init() {
    renderLanding();
    initTheme();
    initMobileMenu();
    initSearchShortcut();
    initSearch();
    initCopy();
    initFeedback();
    initLinks();
    const route = currentRoute();
    if (route === "home") setHomeRoute();
    else {
      renderArticle(route);
      openToggle(window.location.hash ? window.location.hash.slice(1) : categoryForRoute(route).sections[0].id, Boolean(window.location.hash), true);
    }
    syncExternalDocLinks();
    if (hero && !reduceMotion) {
      window.addEventListener("scroll", function () {
        if (currentRoute() !== "home") return;
        const rect = hero.getBoundingClientRect();
        const progress = Math.min(Math.max(((window.innerHeight || 1) - rect.top) / ((window.innerHeight || 1) + rect.height), 0), 1);
        hero.style.setProperty("--hero-left-orbit-x", (-12 + 26 * progress).toFixed(2) + "px");
        hero.style.setProperty("--hero-right-stack-x", (34 - 48 * progress).toFixed(2) + "px");
      }, { passive: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
