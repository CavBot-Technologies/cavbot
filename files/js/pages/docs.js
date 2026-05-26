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
    path: "/docs/getstarted",
    icon: "assets/icons/docs/rocket-svgrepo-com.svg",
    label: "Get started",
    kicker: "Start here",
    title: "Get started",
    description: "Create an account, add a website, install Analytics v5, and verify that CavBot is receiving signals.",
    sections: [
      {
        id: "overview",
        title: "Overview",
        summary: "What CavBot is and when to use it.",
        blocks: [
          p(`CavBot is a workspace for monitoring websites after launch. It helps teams see what is happening across their site after visitors arrive: which routes are being reached, where broken paths appear, when browser errors happen, what SEO structure is present, how accessibility signals look, and whether recovery surfaces like Arcade are helping users move forward.`),
          p(`The product is built around a simple operating model: connect a website, collect the right signals, review them from one workspace, and use CavBot surfaces to decide what needs attention. Instead of treating analytics, errors, SEO, accessibility, 404s, files, notes, and assistant context as separate tools, CavBot keeps them attached to the same project and site profile.`),
          p(`A workspace contains projects and sites. A project is the operating container. A site is a saved website origin, such as https://example.com. The selected site becomes the default context for dashboards, reports, CavAi, Routes, Errors, SEO, A11y, Arcade, 404 Control Room, and other workspace surfaces.`),
          p(`Start with one production website. Add the clean origin, install the Analytics v5 snippet once in the shared layout, visit real pages in a browser, and then return to CavBot to confirm the site is receiving signals. Once the first site is stable, you can add more origins, invite teammates, set a primary site, and turn on deeper workflows.`),
          ol([
            "Create or sign in to your CavBot account.",
            "Open the workspace and confirm the correct project is selected.",
            "Add the website origin you want CavBot to monitor.",
            "Install the Analytics v5 snippet in the global layout or platform custom-code area.",
            "Visit the public site in a browser so CavBot receives a real signal.",
            "Open the CavBot workspace and confirm the selected site shows recent activity or a useful empty state.",
            "Review Routes, Errors, SEO, A11y, Reports, and 404 Control Room after the first signals arrive."
          ]),
          note("Best first setup", "Use your public production origin for the first install. Add staging, preview, or test origins later after the main site is connected and working.")
        ]
      },
      {
        id: "account",
        title: "Account",
        summary: "Set up the identity and workspace owner.",
        blocks: [
          p(`Your CavBot account is the identity that owns or joins a workspace. Use an email address that can remain attached to the business or team, especially if the account will control billing, site access, API keys, member invites, or security settings.`),
          p(`The owner account should be treated as the long-term administrative identity. It is responsible for billing, role management, workspace settings, sensitive controls, plan changes, and recovery of the workspace if other members lose access.`),
          p(`After signing in, confirm that the account can open the dashboard, reach Settings, view the workspace, and access the correct plan state. This prevents confusion later when a teammate receives an invite or when a plan feature appears locked because the wrong account is active.`),
          list([
            "Use a stable email address for the owner account.",
            "Confirm the account can open the workspace without an access request.",
            "Check that Settings, Billing, Sites, and workspace controls are reachable.",
            "Avoid sharing owner credentials with teammates. Invite members instead.",
            "Keep billing and security changes limited to trusted users."
          ]),
          note("Before inviting members", "Finish the owner setup first. Add the production site, verify the snippet, and confirm the owner can access billing and settings before expanding the workspace.")
        ]
      },
      {
        id: "site-setup",
        title: "Site setup",
        summary: "Create the site profile CavBot monitors.",
        blocks: [
          p(`A site is the saved website origin CavBot uses as the anchor for signals. Each site should represent an origin, not an individual page. For example, https://example.com is a site. https://example.com/pricing is a route inside that site.`),
          p(`CavBot uses the site profile to connect browser signals, route history, SEO snapshots, accessibility snapshots, 404 recovery data, reports, and assistant context. If the wrong origin is saved, the dashboard may look empty even if the snippet is installed somewhere else.`),
          code("https://example.com\nhttps://www.example.com\nhttps://app.example.com"),
          p(`Use the exact origin that visitors use in production. If your website redirects from www to non-www, choose the final public origin. If your app and marketing site live on different subdomains, add them as separate sites only when you want CavBot to track them separately.`),
          list([
            "Use the full origin with https:// whenever possible.",
            "Do not include paths like /pricing, /blog, /checkout, or /404.",
            "Do not include tracking query strings.",
            "Do not add localhost as a production site unless you are testing a local-only workflow.",
            "Set the primary site when the workspace has more than one origin."
          ]),
          note("Avoid", "Do not create separate sites for every page. Pages belong inside a site as routes. Sites should be used for website origins, apps, storefronts, subdomains, or environments that need separate review.")
        ]
      },
      {
        id: "snippet",
        title: "Snippet",
        summary: "Install Analytics v5 on the site.",
        blocks: [
          p(`Analytics v5 is the browser-side signal layer. It connects your public website to the matching CavBot site profile. Once installed, it can send route context, browser events, runtime errors, page metadata, SEO structure, accessibility snapshots, 404 recovery context, and other website signals that CavBot uses across the workspace.`),
          p(`Install the snippet once in the shared layout, theme, or custom-code area that loads on every monitored page. The configuration values must appear before the script source so the runtime knows which project and site should receive the signal.`),
          code('<script>\n  window.CAVBOT_API_URL = "https://app.cavbot.io/api/embed/analytics";\n  window.CAVBOT_PROJECT_KEY = "YOUR_PROJECT_KEY";\n  window.CAVBOT_SITE = "YOUR_SITE_ID";\n  window.CAVBOT_SITE_ID = "YOUR_SITE_ID";\n  window.CAVBOT_SITE_PUBLIC_ID = "YOUR_SITE_ID";\n</script>\n<script src="https://cdn.cavbot.io/sdk/v5/cavai-analytics-v5.min.js" defer></script>'),
          p(`The snippet should be installed in the production template, not only on a single test page. If your platform has separate header and footer code areas, place the configuration and script where both can load consistently on public pages. After publishing, open the live site in a browser and move through a few important routes so CavBot receives real traffic context.`),
          p(`Do not paste private keys, customer data, passwords, payment information, or internal notes into the snippet. The snippet should only contain the public runtime configuration needed to identify the CavBot project and site.`),
          list([
            "Install the snippet once in the global site layout.",
            "Keep the configuration values above the runtime script.",
            "Publish the site after adding the snippet.",
            "Visit the public site after publishing.",
            "Return to CavBot and confirm the selected site receives activity."
          ]),
          note("Verify", "If the dashboard does not update, confirm the public origin matches the saved CavBot site, the API key is correct, the snippet is present in production HTML, and browser privacy tools are not blocking the request during testing.")
        ]
      },
      {
        id: "launch-checklist",
        title: "Launch checklist",
        summary: "Confirm setup before relying on CavBot.",
        blocks: [
          p(`Use this checklist before treating CavBot as active for a site. It helps confirm the workspace, site, snippet, and signal surfaces are aligned before the team starts relying on reports or assistant context.`),
          list([
            "Account is created and the owner can sign in.",
            "Workspace opens without an access request.",
            "The correct project is selected.",
            "Website origin is saved as a site.",
            "Primary site is selected when the workspace has more than one site.",
            "Analytics v5 snippet is installed once on production pages.",
            "Project key and site ID match the CavBot workspace.",
            "The snippet is present in the public page source after publishing.",
            "A real browser visit has happened after installation.",
            "Dashboard points to the expected site.",
            "Routes show recent or expected route context.",
            "Errors, SEO, A11y, Reports, and 404 Control Room point to the same selected site.",
            "Team members know which site is the production site.",
            "Billing and plan state match the features the team expects to use."
          ]),
          p(`After the checklist passes, continue to Website signals for diagnostics, Integrations for platform-specific install notes, or Assets for badges, Arcade, and other installable surfaces.`),
          note("Do not skip verification", "A snippet can be installed but still point to the wrong site, wrong project, or unpublished environment. Always verify from the live site and the CavBot workspace together.")
        ]
      }
    ]
  },


  account: {
    path: "/docs/account",
    icon: "assets/icons/docs/account-avatar-head-svgrepo-com.svg",
    label: "Account and profile",
    kicker: "Account",
    title: "Account and profile",
    description: "Manage profile identity, sites, projects, primary site selection, notifications, and team access.",
    sections: [
      {
        id: "profile",
        title: "Profile",
        summary: "Manage account and public profile details.",
        blocks: [
          p(`Profile settings store the identity details used across CavBot. These details can include display name, username, avatar style, company category, country, profile links, and public profile visibility when enabled.`),
          p(`Use a clear profile identity so teammates understand who owns changes, who is responding to alerts, and who is connected to workspace actions. This matters more as the workspace grows and more people interact with sites, notes, files, billing, and security controls.`),
          p(`Public profile controls exist in the app. When public profile is enabled, CavBot can show a public workspace profile at a username route. When it is disabled, the profile can still exist internally, but public workspace details are not shared.`),
          list([
            "Use a recognizable display name.",
            "Keep public profile text simple and professional.",
            "Do not publish private workspace details in profile fields.",
            "Review profile links before making the profile public.",
            "Use team invites for collaboration instead of sharing one profile."
          ]),
          note("Privacy", "Only document and publish profile fields you intend visitors or teammates to see. Do not use profile text for secrets, passwords, internal roadmap notes, or private customer information.")
        ]
      },
      {
        id: "sites",
        title: "Sites",
        summary: "Represent website origins.",
        blocks: [
          p(`Sites represent website origins connected to a workspace project. CavBot uses each site as the source of truth for Analytics v5, route views, browser errors, SEO snapshots, accessibility snapshots, reports, Arcade installs, and CavAi context.`),
          p(`A clean site record keeps the rest of the workspace reliable. If the site origin is wrong, signals may appear missing, reports may point to the wrong place, and CavAi may not have the correct website context.`),
          p(`Owners and admins can add sites when the plan allows it. CavBot validates and normalizes the origin before saving it. Plan limits decide how many sites can exist in the workspace.`),
          note("Plan limits", "The app enforces website limits from the active plan: Free includes 1 website, Premium includes 6, and Premium+ includes 20."),
          list([
            "Use Sites for production domains, app subdomains, storefronts, or separate environments.",
            "Use Routes for individual pages inside a site.",
            "Set a primary site when the workspace has multiple saved origins.",
            "Remove stale test origins when they no longer need monitoring."
          ])
        ]
      },
      {
        id: "projects",
        title: "Projects",
        summary: "Organize workspace context.",
        blocks: [
          p(`Projects organize sites, members, settings, files, notes, plan context, and active selection. A project gives CavBot a clear boundary for what belongs together.`),
          p(`Use separate projects when the work has different teams, different client accounts, different billing expectations, or different operational boundaries. Keep related sites in the same project when the same team reviews them together and the signals should be understood as one workspace.`),
          p(`The app stores the active project and selected site so dashboards, reports, tools, and CavAi can stay pointed at the same context. This prevents the team from switching between unrelated sites by accident.`),
          list([
            "Use one project for one company, product, client, or operating group.",
            "Keep production and related app subdomains together when the same team owns them.",
            "Use separate projects for unrelated clients or products.",
            "Confirm the active project before changing billing, sites, members, or security settings."
          ])
        ]
      },
      {
        id: "top-site",
        title: "Top site",
        summary: "Choose the primary website.",
        blocks: [
          p(`Top site is the primary website for a workspace project. It is the site CavBot opens first and uses by default for dashboard views, reports, site context, and CavAi signal summaries.`),
          p(`Choose the production site your team reviews most often. If you add staging, preview, local, or test origins, keep the public production site as Top site unless the workspace exists only for development or QA.`),
          p(`Top site selection is especially important when a workspace includes a marketing site, an app domain, and a storefront. Choosing the right primary site keeps the first view focused and prevents reports from starting on a less important environment.`),
          note("Recommended", "Use the public customer-facing production origin as Top site. Change it only when the workspace’s main operating focus changes.")
        ]
      },
      {
        id: "notifications",
        title: "Notifications",
        summary: "See operational updates.",
        blocks: [
          p(`Notifications surface workspace events and operational messages. The app includes notification routes for unread counts, read-all actions, settings, storage-low notices, operator ID reveals, and other workspace notices.`),
          p(`Use notifications to review changes that need attention, such as invite state, storage thresholds, CavCloud and CavSafe events, account notices, plan limits, and system updates.`),
          p(`Before changing settings, deleting assets, downgrading a plan, or inviting teammates, open notifications if you need recent context. Notifications can help explain why a module is locked, why storage is near a limit, or why a workspace action needs review.`),
          list([
            "Check unread notifications after billing or plan changes.",
            "Review storage notices before uploading large files.",
            "Use notifications to confirm workspace actions completed.",
            "Clear read items after the team has reviewed them."
          ])
        ]
      },
      {
        id: "team-access",
        title: "Team access",
        summary: "Invite members and assign roles.",
        blocks: [
          p(`Team access is role-based. Roles decide who can manage billing, sites, security controls, workspace settings, API keys, invites, diagnostics, and everyday dashboard work.`),
          p(`Use the lowest role that gives a teammate the access they need. Not every teammate needs owner-level controls. Keeping roles clear protects the workspace from accidental billing changes, API key rotation, site deletion, or sensitive security changes.`),
          table(
            ["Role", "What it can do"],
            [
              ["Owner", "Full workspace ownership, billing, security, role management, API keys, settings, and all modules."],
              ["Admin", "Operational work across diagnostics, invites for non-owner roles, monitored targets, workspace modules, and site setup. Admins should not replace owner control."],
              ["Member", "Standard workspace access for dashboard and route monitoring. Members cannot manage billing, security, roles, or critical controls."]
            ]
          ),
          p(`Invites can be pending, accepted, declined, revoked, or expired. Seat limits come from the plan: Free includes 4 seats, Premium includes 8, and Premium+ includes 16.`),
          note("Access review", "Review members and pending invites before adding more people. Remove stale access for users who no longer need the workspace.")
        ]
      }
    ]
  },


  workspace: {
    path: "/docs/workspace",
    icon: "assets/icons/docs/gnome-panel-workspace-switcher-svgrepo-com.svg",
    label: "Workspace",
    kicker: "Workspace",
    title: "Workspace",
    description: "Use the dashboard, reports, CavPad, Arcade, Command Center, and member controls from one workspace context.",
    sections: [
      {
        id: "dashboard",
        title: "Dashboard",
        summary: "Review the selected site.",
        blocks: [
          p(`The dashboard is the first operating view for the selected site. It reads the active project, selected site, plan context, storage usage, site list, guardrails, notifications, and module access state.`),
          p(`Start every review by confirming the selected site is the one you expect. Then look at plan limits, storage, site status, and available modules. If the dashboard looks empty, the most common causes are a missing snippet, the wrong selected site, the wrong origin, or no public visit after installation.`),
          p(`The dashboard should be used as the entry point, not the final diagnosis. When a tile, card, or notice points to a concern, open the focused module such as Routes, Errors, SEO, A11y, Reports, or 404 Control Room to inspect the source signal.`),
          list([
            "Confirm the selected project.",
            "Confirm the selected site.",
            "Review plan and module access.",
            "Check storage and workspace notices.",
            "Open focused modules for deeper review."
          ])
        ]
      },
      {
        id: "reports",
        title: "Reports",
        summary: "Use focused summaries.",
        blocks: [
          p(`Reports collect site and workspace signals into reviewable summaries. They are useful when you need to explain the current state of a site without opening every module manually.`),
          p(`A report should be treated as a snapshot of what CavBot can see at the time it is generated. It can summarize route behavior, broken paths, errors, SEO concerns, accessibility findings, 404 recovery context, and other workspace signals depending on what data exists.`),
          p(`Use reports for team updates, founder reviews, client check-ins, QA handoffs, and operational notes. When a report mentions a problem, open the source module before changing production so the team can verify the route, timestamp, and impact.`),
          note("Reports are not replacements for review", "Reports make signal review faster. They do not remove the need to verify important production issues before shipping fixes.")
        ]
      },
      {
        id: "cavpad",
        title: "CavPad",
        summary: "Create and sync workspace notes.",
        blocks: [
          p(`CavPad is the workspace note surface. It supports directories, notes, rich text controls, links, tables, export, trash and restore behavior, note versions, and optional sync to CavCloud or CavSafe where enabled.`),
          p(`Use CavPad for operational notes that belong near the work: fix plans, release notes, debugging steps, setup instructions, team reminders, QA observations, client notes, and decisions made during a review.`),
          p(`A useful CavPad note should explain the context, the affected route or site, the decision made, the owner, and the next step. Notes should be clear enough that another teammate can return later and understand what happened.`),
          list([
            "Use folders for projects, releases, audits, or clients.",
            "Write notes that include route, date, owner, and decision.",
            "Use CavCloud sync when the note belongs with workspace files.",
            "Use CavSafe only for protected workspace material.",
            "Delete or archive outdated notes after major project changes."
          ])
        ]
      },
      {
       
        id: "command-center",
        title: "Command Center",
        summary: "Operate workspace sites and controls.",
        blocks: [
          p(`Command Center is the workspace operating surface. The legacy /command-center route redirects to the app root, where site setup, selection, guardrails, dashboard controls, workspace context, and project actions are managed.`),
          p(`Open Command Center when a site is missing, the wrong site is selected, a plan limit is blocking setup, a guardrail needs review, a workspace notice appears, or a teammate needs help understanding the active context.`),
          p(`Command Center should be treated as the control room for the workspace. It is where the team confirms what site is active, what tools are available, and what core actions can be taken safely.`),
          list([
            "Manage websites and active site context.",
            "Set the primary site.",
            "Review guardrails.",
            "Open linked modules such as Console, Errors, Routes, SEO, and Reports.",
            "Confirm workspace notices and plan state."
          ])
        ]
      },
      {
        id: "members-and-roles",
        title: "Members and roles",
        summary: "Review access before work starts.",
        blocks: [
          p(`Workspace access depends on member role. Owners manage billing, settings, security, API keys, sites, invites, and critical controls. Admins can perform operational work. Members can view and contribute within limited surfaces.`),
          p(`Before a team starts using CavBot, verify the owner, seat usage, active invites, and pending requests. This prevents confusion when someone cannot open a module, change a site, or reach billing settings.`),
          p(`Access should be reviewed any time the team changes. Remove stale members, revoke old invites, and keep owner-level access limited to people responsible for business and security decisions.`),
          note("Team hygiene", "A clean member list protects the workspace. Keep roles accurate and remove unused access.")
        ]
      }
    ]
  },


  signals: {
    path: "/docs/signals",
    icon: "assets/icons/docs/signal-svgrepo-com.svg",
    label: "Website signals",
    kicker: "Signals",
    title: "Website signals",
    description: "Read errors, routes, SEO, accessibility, insights, and 404 recovery data from the selected website.",
    sections: [
      {
        id: "errors",
        title: "Errors",
        summary: "Review client-side errors.",
        blocks: [
          p(`Errors are runtime issues reported from the browser or derived from CavBot diagnostics. Use Error Intelligence when you need to know what failed, where it happened, which route was involved, and whether the issue may affect a real user journey.`),
          p(`A useful error review starts with the route, the message, the time, and the surrounding user action. A harmless console warning on an unused page is not the same as a checkout error, login failure, form submission error, or broken pricing route.`),
          p(`After reading an error signal, open the affected route, try to reproduce the issue, and check whether it affects a conversion, auth, checkout, support, onboarding, or payment flow. If the same error appears repeatedly, treat it as a stronger signal.`),
          list([
            "Review the route where the error happened.",
            "Check whether the issue is repeated.",
            "Prioritize errors on business-critical flows.",
            "Look for recent deploys or content changes near the timestamp.",
            "Verify the fix in the browser after shipping."
          ])
        ]
      },
      {
        id: "routes",
        title: "Routes",
        summary: "Understand route behavior.",
        blocks: [
          p(`Routes show the website paths CavBot has seen or scanned. Route context can include page visits, route metadata, 404-like behavior, navigation structure, and reliability signals.`),
          p(`Use Routes to understand the shape of the site. Important pages should be visible, named clearly, and supported by good metadata. Unexpected routes can reveal broken links, old campaigns, migration leftovers, bot traffic, or paths visitors are still trying to reach.`),
          p(`When reviewing routes, look for patterns. One strange route may not matter. A group of repeated missing routes may mean a navigation issue, bad redirect, outdated sitemap, or external link that still sends visitors to an old page.`),
          list([
            "Check high-value pages first.",
            "Look for missing or unexpected paths.",
            "Review routes after migrations and redesigns.",
            "Compare routes with SEO and 404 signals.",
            "Fix, redirect, or restore paths that keep receiving traffic."
          ])
        ]
      },
      {
        id: "seo",
        title: "SEO",
        summary: "Read search metadata snapshots.",
        blocks: [
          p(`SEO snapshots come from page metadata and CavBot analysis. The runtime can read titles, descriptions, favicon state, structured data, headings, keyword signals, trust-page signals, canonical data, and other metadata when available.`),
          p(`Use SEO to confirm that important pages have clear titles, useful descriptions, strong headings, stable canonical structure, and enough page context for search engines and visitors to understand the page.`),
          p(`After reading an SEO signal, fix the source page markup, CMS fields, layout, or metadata configuration. Then revisit the page so CavBot can collect a newer snapshot. SEO data is only useful when the live page reflects the latest changes.`),
          note("Focus", "Start with the homepage, pricing page, product pages, docs, blog, support pages, and any route used in campaigns or investor outreach.")
        ]
      },
      {
        id: "a11y",
        title: "A11y",
        summary: "Review accessibility snapshots.",
        blocks: [
          p(`A11y snapshots look for accessibility concerns such as missing alt text, missing form labels, focus-visible issues, keyboard traps, heading order problems, landmark concerns, skip links, and reduced-motion support.`),
          p(`Use A11y to find barriers that can prevent people from using the site. Accessibility is not only a compliance task. It affects navigation, readability, keyboard use, forms, modals, menus, controls, and the ability to understand what a page is asking the visitor to do.`),
          p(`After fixing an accessibility concern, verify the page manually. Use keyboard navigation, visible focus states, form labels, alt text, and a screen reader check when possible. Automated snapshots help you find issues, but real review confirms the experience.`),
          list([
            "Check forms and buttons first.",
            "Confirm keyboard navigation works.",
            "Use meaningful alt text for important images.",
            "Avoid trapping focus inside menus or modals.",
            "Respect reduced-motion preferences."
          ])
        ]
      },
      {
        id: "cavbot-insights",
        title: "CavBot Insights",
        summary: "Read prioritized observations.",
        blocks: [
          p(`CavBot Insights combines site signals into observations the team can act on. Insights can include SEO, accessibility, performance, UX layout, engagement, route, 404, auth funnel, and geo trend context when the underlying data exists.`),
          p(`Use Insights to decide what to inspect next. An insight should help you prioritize, but it should not be treated as the full fix. Open the source module and verify the route, timestamp, and behavior before changing production.`),
          p(`A good workflow is to read the insight, open the affected route or module, confirm whether it still matters, write a CavPad note if the issue needs coordination, and then ship the smallest safe change that improves the experience.`),
          note("Use with judgment", "Insights help focus attention. The team still owns the final decision, the fix, and the production review.")
        ]
      },
      {
        id: "404-control-room",
        title: "404 Control Room",
        summary: "Investigate broken routes.",
        blocks: [
          p(`404 Control Room is the recovery view for broken or missing routes. It helps teams understand which URLs visitors reach, where recovery is needed, and whether Arcade, redirects, restored pages, or link fixes should be used.`),
          p(`Open 404 Control Room when users report missing pages, campaign links are wrong, migrated content has gaps, old URLs still receive traffic, or a release changed route behavior.`),
          p(`A broken route is not always equal in priority. A one-off typo may be low impact. A missing pricing page, docs route, login route, or campaign landing page can cost trust and conversions. Review frequency, source, and business value before deciding the fix.`),
          list([
            "Identify which missing routes are repeated.",
            "Check whether the path should exist.",
            "Add a redirect when the content moved.",
            "Restore the page when the route is still important.",
            "Fix internal links that point to the wrong path.",
            "Use Arcade when the recovery moment should feel designed."
          ])
        ]
      }
    ]
  },


  cavai: {
    path: "/docs/cavai",
    icon: "assets/logo/CavAi Official Logo-svg/2.png",
    label: "CavAi",
    kicker: "CavAi",
    title: "CavAi",
    description: "Use CavAi with workspace context, supported models, Caven, image tools, and assistant memory.",
    sections: [
      {
        id: "cavai-v3",
        title: "CavAi v3",
        summary: "Use the main CavAi assistant surface.",
        blocks: [
          p(`CavAi v3 is the assistant surface inside CavBot. It can use workspace and site context to explain signals, summarize current issues, draft next steps, and help a user understand what to review.`),
          p(`Use CavAi when you need an explanation, a checklist, a rewrite, a plan, or a structured summary of what CavBot is showing. Use the dashboard and signal modules when you need the original route, event, report, setting, or source signal.`),
          p(`The strongest CavAi results come from clear context. Ask about the selected site, the route you are reviewing, the signal you saw, and what you want to accomplish next. For example, ask for a release checklist, a 404 recovery plan, a pricing page SEO review, or a short explanation of an error group.`),
          note("Best use", "Use CavAi to think through the work. Use the workspace modules to verify the facts before changing production.")
        ]
      },
      {
        id: "models",
        title: "Models",
        summary: "Understand available model choices.",
        blocks: [
          p(`CavAi model routing is defined in the app model catalog. The visible catalog includes CavAi Auto, DeepSeek Chat, DeepSeek Reasoner, Qwen3.5-Flash, Qwen3.5-Plus, Qwen3-Max, Caven powered by Qwen3-Coder, CavBot Companion, Qwen ASR and TTS models, Image Studio, and Image Edit.`),
          p(`Use the default model when you want CavAi to choose the right path. Use coding-focused modes when working inside CavCode. Use image tools only when the task is visual. Use higher-capability models for heavier planning, research, or reasoning when the plan allows it.`),
          p(`Qwen3-Max is marked Premium+ only and requires web research mode in the catalog. Image Studio requires Premium or Premium+. Image Edit requires Premium+. Guest preview mode limits uploads, image tools, advanced models, and deeper reasoning.`),
          table(
            ["Model", "Use"],
            [
              ["CavAi Auto", "Default routing choice."],
              ["DeepSeek Chat", "General chat."],
              ["DeepSeek Reasoner", "Reasoning tasks."],
              ["Qwen3.5-Flash", "Fast Qwen text model."],
              ["Qwen3.5-Plus", "Higher-capability Qwen text model."],
              ["Qwen3-Max", "Premium+ research-capable model."],
              ["Caven / Qwen3-Coder", "Coding-focused work in CavCode and Caven."],
              ["Image Studio", "Image generation with Qwen-Image-2.0-Pro."],
              ["Image Edit", "Image editing with Qwen-Image-Edit-Max."]
            ]
          )
        ]
      },
      {
        id: "assistant-memory",
        title: "Memory",
        summary: "Keep project context available.",
        blocks: [
          p(`Assistant memory is the project context CavAi can use when responding. It belongs to stable workspace facts such as the site purpose, important routes, team preferences, recurring operational concerns, brand rules, and product decisions that should carry across sessions.`),
          p(`Good memory helps CavAi avoid asking for the same stable information again. Bad memory makes the assistant less reliable. Store details that will remain true. Do not store temporary bugs, one-time requests, private secrets, or anything that should expire quickly.`),
          p(`Do not store passwords, private keys, payment data, sensitive customer information, private legal material, or temporary details that will become wrong quickly. Review memory when the site, brand, team, or product changes.`),
          list([
            "Save stable workspace facts.",
            "Keep secrets out of memory.",
            "Review memory after major product changes.",
            "Remove outdated preferences or old project assumptions."
          ])
        ]
      },
      {
        id: "agent-workflows",
        title: "Agent workflows",
        summary: "Run repeatable agents for research, fixes, and summaries.",
        blocks: [
          p(`Agent workflows are repeatable CavAi and Caven-assisted processes for research, fixes, summaries, code review, recovery planning, and workspace follow-up. Use them when the team needs a consistent sequence instead of a one-off answer.`),
          p(`A workflow should start with the project, selected site, route, file, signal, or dashboard state that needs review. Then the agent can summarize context, propose next steps, draft a plan, or help verify what changed.`),
          p(`For production work, ask for a plan first when the change touches multiple files, protected actions, public pages, or workspace settings. Apply small changes, review the output, and verify the result in the focused CavBot surface.`),
          note("Workflow rule", "Keep agent workflows scoped to the specific route, file, report, or issue being reviewed.")
        ]
      },
      {
        id: "caven",
        title: "Caven",
        summary: "Use the coding-focused assistant.",
        blocks: [
          p(`Caven is the CavCode-focused assistant mode. It uses Qwen3-Coder and Caven agents for code explanation, repair, refactoring, file summaries, component generation, page generation, 404 page building, UI debugging, API checks, schema checks, and related development tasks.`),
          p(`Use Caven inside CavCode when the active file, diagnostics, or mounted workspace files provide the context needed for coding work. It is strongest when you point it at the exact file, error, component, or behavior you want to change.`),
          p(`For production work, ask Caven for a plan first when the change touches multiple files. Then apply small patches, review diagnostics, run the project, and verify the UI. Avoid asking for wide rewrites unless the goal is clearly scoped.`),
          note("Coding workflow", "Explain the bug, name the file, state what must not change, then ask Caven for the smallest safe fix.")
        ]
      },
      {
        id: "image-studio",
        title: "Image Studio",
        summary: "Generate images in CavAi.",
        blocks: [
          p(`Image Studio is CavAi's image generation surface. The app routes it to Qwen-Image-2.0-Pro and stores Image Studio history through the CavAi image-studio APIs.`),
          p(`Use Image Studio for visual concepts, campaign visuals, brand explorations, product illustrations, art direction drafts, and generated image assets. Premium or Premium+ access is required in the current app gating.`),
          p(`A good image request should describe the subject, style direction, composition, background, lighting, format, and any brand constraints. Avoid vague prompts when the result needs to match a specific product or website section.`)
        ]
      },
      {
        id: "image-edit",
        title: "Image Edit",
        summary: "Edit uploaded images.",
        blocks: [
          p(`Image Edit is the image editing surface. The app routes it to Qwen-Image-Edit-Max and requires Premium+.`),
          p(`Use Image Edit when there is an uploaded source image and a specific edit instruction. The instruction should describe what to keep, what to change, and what must not be altered.`),
          p(`The app rejects Image Edit requests when the plan does not allow it. If editing is available, review the result carefully before using it in production, especially for brand, product, or public marketing assets.`)
        ]
      }
    ]
  },


  developers: {
    path: "/docs/developers",
    icon: "assets/icons/docs/code-svgrepo-com.svg",
    label: "Developers",
    kicker: "Developers",
    title: "Developers",
    description: "Install Analytics v5, use SDK snippets, send events, manage API keys, understand webhooks, and read summary data.",
    sections: [
      {
        id: "analytics-v5",
        title: "Analytics v5",
        summary: "Install the browser signal layer.",
        blocks: [
          p(`Analytics v5 is the browser-side signal layer for CavBot. It connects a live website to a CavBot site profile so CavBot can receive page, route, runtime, metadata, and selected browser context.`),
          p(`The runtime should be installed once in the shared layout or platform custom-code area. It should not be duplicated across multiple templates unless the platform requires that structure. Duplicate installs can create noisy signals and make debugging harder.`),
          code('<script>\n  window.CAVBOT_API_URL = "https://app.cavbot.io/api/embed/analytics";\n  window.CAVBOT_PROJECT_KEY = "YOUR_PROJECT_KEY";\n  window.CAVBOT_SITE = "YOUR_SITE_ID";\n  window.CAVBOT_SITE_ID = "YOUR_SITE_ID";\n  window.CAVBOT_SITE_PUBLIC_ID = "YOUR_SITE_ID";\n</script>\n<script src="https://cdn.cavbot.io/sdk/v5/cavai-analytics-v5.min.js" defer></script>'),
          p(`After installation, publish the site, visit the public origin, and confirm the matching CavBot site profile shows activity. If nothing appears, inspect the page source, browser console, network requests, API key, site ID, and origin allowlist.`),
          note("Developer check", "The public site origin, the saved CavBot site origin, and the API key allowlist must agree.")
        ]
      },
      {
        id: "sdk",
        title: "SDK",
        summary: "Use CavBot runtime scripts.",
        blocks: [
          p(`The CavBot ecosystem exposes browser SDK scripts for Analytics v5, CavAi and CavBot runtime behavior, widgets, visual surfaces, badges, and Arcade loader installs. Settings and Integrations should generate the correct script tags for the selected site and key.`),
          p(`Use generated snippets when possible. They reduce mistakes in project keys, site IDs, script order, and CDN paths. Hand-built snippets should only be used when a platform requires manual placement or a custom deployment path.`),
          p(`When using any SDK surface, keep the script close to the page purpose. Analytics belongs globally. A badge belongs where the brand wants trust presence. Arcade belongs on a recovery route or documented install location.`)
        ]
      },
      {
        id: "events",
        title: "Events",
        summary: "Send important product actions.",
        blocks: [
          p(`Events are named actions sent from the website to CavBot. Use them for important product behavior that helps explain what visitors did, where they stopped, and what path they followed.`),
          p(`Good event names are stable, readable, and tied to real product actions. Examples include pricing_cta_clicked, signup_started, checkout_started, contact_form_submitted, docs_search_used, recovery_link_clicked, and arcade_game_started.`),
          code('window.CavBot?.track?.("pricing_cta_clicked", {\n  plan: "pro",\n  route: window.location.pathname\n});'),
          p(`Keep payloads small and safe. Do not send passwords, payment details, private messages, medical data, sensitive customer data, or anything that would make event review unsafe for the team.`),
          list([
            "Use consistent event names.",
            "Include route context when useful.",
            "Avoid sending sensitive values.",
            "Document events used by important funnels.",
            "Review events after major product or layout changes."
          ])
        ]
      },
      {
        id: "api-keys",
        title: "API keys",
        summary: "Connect sites and embeds.",
        blocks: [
          p(`API keys identify a workspace project and site for embed and analytics requests. Settings includes an API keys panel for creating, rotating, and revoking keys. Owners control sensitive key management.`),
          p(`Keep keys scoped to the intended site origin. The embed verification layer checks project key, site ID, origin, and related headers before forwarding analytics events.`),
          p(`Rotate a key if it was exposed in the wrong place, shared with the wrong team, used on an unapproved origin, or included in a public file where it should not appear. After rotation, update the installed snippet and verify signals again.`),
          note("Security", "Do not treat API keys like passwords, but do treat them as controlled workspace credentials. Keep them limited to the site and purpose they were created for.")
        ]
      },
      {
        id: "webhooks",
        title: "Webhooks",
        summary: "Understand event integrations.",
        blocks: [
          p(`The app contains Stripe webhook handling for billing events. These system webhooks help CavBot respond to subscription changes, checkout updates, payment state, and billing lifecycle events.`),
          p(`Customer-facing webhook controls are not exposed as a finished workspace feature in the files reviewed. Treat webhooks as system integration points unless CavBot exposes a dedicated webhook settings screen in your workspace.`),
          p(`If customer webhooks become available later, use them for events that external systems need to receive reliably. Keep payloads clear, signed, and limited to the receiving system’s purpose.`)
        ]
      },
      {
        id: "summary",
        title: "Summary",
        summary: "Read compact site state.",
        blocks: [
          p(`Summary data is the read layer for current CavBot results. It is used when a surface needs a compact view of selected site state, route health, dashboard status, or recent recovery context.`),
          p(`Use summaries as snapshots. They help a page load quickly and give CavAi or dashboard modules a compact operating picture. For fix planning, open the focused module and verify the source route, error, SEO, accessibility, or 404 signal before changing production.`),
          p(`A summary is most useful when it points you to the next review surface. If it mentions errors, open Error Intelligence. If it mentions missing routes, open 404 Control Room. If it mentions metadata, open SEO and inspect the page.`)
        ]
      }
    ]
  },


  tools: {
    path: "/docs/tools",
    icon: "assets/icons/docs/devtool-svgrepo-com.svg",
    label: "Developer tools",
    kicker: "Tools",
    title: "Developer tools",
    description: "Use CavCode, CavCloud, CavTools, HTML Viewer, and Cav commands for development and workspace operations.",
    sections: [
      {
        id: "cavcode",
        title: "CavCode",
        summary: "Edit and run workspace code.",
        blocks: [
          p(`CavCode is the browser code editor. It uses a codebase and workspace file model, Monaco diagnostics, explorer/search/source-control/live/run/settings panels, tabs, a terminal command plane, and Caven for coding-focused help.`),
          p(`Use CavCode when you want to open, inspect, edit, save, run, or debug project files from inside CavBot. It is designed to reduce the need for a separate local editor when the work can be done safely in the browser.`),
          p(`CavCode can open files from /cavcode, edit text files, sync with CavCloud, run project services, inspect diagnostics, start runtime sessions, debug code, manage Git through Cav commands, and work with mounted workspace files when available.`),
          list([
            "Use Explorer to open project files.",
            "Use Problems to review diagnostics.",
            "Use Terminal for Cav commands.",
            "Use Live or Viewer routes for preview when available.",
            "Use Caven when a code change needs explanation or repair."
          ])
        ]
      },
      {
        id: "cavcloud",
        title: "CavCloud",
        summary: "Store and organize workspace files.",
        blocks: [
          p(`CavCloud is CavBot's workspace file storage. It supports folders, files, uploads, text editing, previews, sharing, publishing artifacts, activity, search, tree views, versions, trash restore, collaborators, and storage notifications.`),
          p(`Use CavCloud for working assets, documents, generated outputs, shared files, project notes, HTML artifacts, and files CavCode can mount for editing or preview.`),
          p(`Keep CavCloud organized with folders that match how the team works. Separate client files, source exports, brand assets, generated documents, and code artifacts when the workspace grows.`),
          note("Storage review", "Watch storage notices before uploading large projects, videos, image sets, or exported site bundles.")
        ]
      },
      {
  id: "cavtools",
  title: "CavTools",
  summary: "Debug, inspect, and test workspace behavior.",
  blocks: [
    p(`CavTools is the developer tools area inside CavBot. It gives builders a focused place to inspect what is happening inside a workspace, check recent activity, review file-related behavior, test commands, read output, and understand why something is or is not working. Use it when the dashboard shows the surface-level state, but you need to look closer before making a change.`),


    p(`Think of CavTools as the place you open when you need to investigate. If a file does not open, a preview does not load, a command returns something unexpected, a workspace action feels stuck, or a developer feature is not behaving the way it should, CavTools gives you a controlled space to slow down, inspect the result, and understand the next safe step.`),


    p(`CavTools is built for debugging, checking, and verification. It helps you answer practical questions: Did the file exist? Did the command run? Did the workspace receive the action? Did the output return an error? Is the selected project correct? Is the selected site correct? Is the issue coming from the file, the workspace, the live preview, storage, or the command itself?`),


    p(`Use CavTools when you need more detail than a normal product screen can give you. A dashboard can tell you that something needs attention. CavTools helps you inspect the pieces behind that behavior so you can understand what happened before you edit code, change settings, remove files, restart anything, or publish a fix.`),


    p(`CavTools is especially useful when you are working through a technical issue and do not want to guess. You can review recent events, inspect workspace context, check command results, open developer panels, confirm file-related behavior, and read structured output from actions that need to be verified.`),


    p(`For example, if a preview is not showing the latest file, CavTools can help you check whether the right file was opened, whether the workspace context is correct, and whether the tool returned an error. If a command does not behave as expected, CavTools gives you a place to read the result instead of trying to understand the issue from the page alone.`),


    p(`CavTools should be used before making larger changes. Start by reading what the workspace already knows. Confirm the active project, active site, selected file, recent activity, and output from the action you ran. Once you understand the state, you can move into CavCode, CavCloud, Settings, or the dashboard with a clearer reason for what needs to happen next.`),


    p(`CavTools is not the same as CavCode. CavCode is where you write, edit, and review code files. CavTools is where you inspect the developer workflow around those files. CavCode is for changing the work. CavTools is for checking the work, testing behavior, reading output, and finding the reason something is not behaving correctly.`),


    p(`CavTools is also not a replacement for the main dashboard. The dashboard is for understanding the website and workspace at a higher level. CavTools is for developer-level inspection. When you need to see what a command returned, what a file action did, or why a connected developer surface is not responding, open CavTools.`),


    p(`A strong workflow is simple: first identify what you are checking, then open CavTools, then read the current workspace context, then review the action output, then decide where the fix belongs. If the problem is code, continue in CavCode. If the problem is storage, continue in CavCloud. If the problem is a site or workspace setting, return to the workspace controls. If the problem is only a misunderstanding of the output, CavTools helps you catch that before you change anything.`),


    list([
      "Use CavTools to inspect workspace behavior before changing files or settings.",
      "Use CavTools to review recent developer activity and command results.",
      "Use CavTools to check whether an action ran, failed, or returned unexpected output.",
      "Use CavTools to understand whether an issue belongs in CavCode, CavCloud, the dashboard, or workspace settings.",
      "Use CavTools to debug previews, file actions, command output, and connected developer surfaces.",
      "Use CavTools to verify context before running actions that could change the workspace."
    ]),


    p(`When you are investigating, begin with read-only checks. Read the output, inspect the current state, and confirm the target before you run anything that writes, deletes, restarts, replaces, restores, or changes a file. This keeps the debugging process clean and prevents a small issue from becoming a larger workspace problem.`),


    p(`CavTools should make developer work feel calmer. Instead of jumping between screens and guessing what happened, you can review the action in one place, read the result, and decide the next move. It gives the workspace a clear inspection layer for the moments when something needs a closer look.`),


    p(`Use it when you need to answer questions like: What did this command return? Which file is being referenced? Why is this preview not matching the current file? Did the workspace action complete? Did the tool return an error? Is the active project or site different from what I expected? What should I check before I touch the code?`),


    p(`For teams, CavTools helps make debugging easier to explain. A developer can inspect the output, confirm the context, and share a clearer status with another teammate. Instead of saying something is broken, the developer can say what was checked, what returned, what looks wrong, and what surface should be opened next.`),


    p(`For solo builders, CavTools gives you a safer way to move fast. You can check the result of a command, verify that a file exists, confirm that the right workspace is active, and understand the next step without breaking your flow or making blind changes.`),


    p(`When CavTools shows an output, read it carefully before acting. A result may point to the wrong path, a missing file, a locked feature, a permissions issue, a workspace mismatch, or an action that needs to be run from a different surface. The value of CavTools is that it helps you see that difference clearly.`),


    note("Best practice", "Use CavTools as your inspection layer. Read first, confirm the target, then make the smallest safe change in the correct surface."),


    p(`The safest pattern is to inspect, confirm, act, and verify. Inspect the current state in CavTools. Confirm the project, site, file, or command target. Act only when you know what needs to change. Then return to CavTools, CavCode, CavCloud, or the dashboard to verify the result.`),


    p(`CavTools should be opened anytime the question is not just “what does the page show?” but “what happened behind this action?” That is where it earns its place inside the developer workflow. It helps turn unclear behavior into a readable result, and a readable result into a safer next step.`)
  ]
},

      {
        id: "html-viewer",
        title: "HTML Viewer",
        summary: "Preview HTML files.",
        blocks: [
          p(`HTML Viewer lives at /cavcode-viewer. It loads HTML, CSS, JavaScript, image, video, font, JSON, SVG, and other assets from CavCloud or CavSafe file APIs and renders a live preview.`),
          p(`Use it to inspect HTML artifacts, preview a mounted file, check generated pages, review visual output, and confirm that edited website files render correctly before publishing.`),
          p(`If a preview does not match the expected result, confirm that the referenced assets exist, relative paths are correct, scripts are allowed to run, and the source file is the version you intended to preview.`)
        ]
      },
      {
        id: "cav-commands",
        title: "Cav commands",
        summary: "Command dictionary.",
        blocks: [
          p(`Cav commands are handled by the browser Cav terminal and the server CavTools command plane. They give the workspace a controlled way to inspect files, run tasks, review diagnostics, manage source control, query indexes, start debug sessions, and operate project tooling.`),
          p(`The dictionary below lists commands found in the repository. Use the command exactly as shown unless your workspace provides a specific path, file, task name, session ID, or argument.`),
          note("Safe use", "Run read-only commands first when you are inspecting a workspace. Use write, remove, stage, commit, stop, restart, and restore commands only when you understand the target."),
          { type: "commands", rows: commandRows }
        ]
      }
    ]
  },


  security: {
    path: "/docs/security",
    icon: "assets/icons/page/shield-tick-svgrepo-com.svg",
    label: "Security",
    kicker: "Security",
    title: "Security",
    description: "Use CavVerify, CavGuard, CavSafe, audit trails, and risk controls to protect workspace actions and files.",
    sections: [
      {
        id: "security",
        title: "Security",
        summary: "Protect workspace actions and files.",
        blocks: [
          p(`CavBot security combines verification, guardrails, protected storage, audit trails, and risk controls so sensitive workspace actions can be reviewed before they affect production or protected files.`),
          p(`Start with roles and access. Then review CavVerify for step-up checks, CavGuard for protected actions, CavSafe for secured storage, audit trails for history, and risk controls for origin, alert, and deletion guardrails.`),
          list([
            "Use CavVerify before sensitive actions.",
            "Use CavGuard decisions to slow down risky workflows.",
            "Use CavSafe for protected files.",
            "Use audit trails to review important changes.",
            "Use risk controls to limit unsafe workspace behavior."
          ])
        ]
      },
      {
        id: "caverify",
        title: "CavVerify",
        summary: "Step-up verification for sensitive actions.",
        blocks: [
          p(`CavVerify is the verification challenge system. It issues verification sessions and grants through /api/verify/challenge and /api/verify/submit, uses headers such as x-cavbot-verify-session and x-cavbot-verify-grant, and can be required before sensitive actions such as invites.`),
          p(`When CavVerify appears, complete the challenge before retrying the protected action. This helps CavBot confirm that the person taking the action is present and approved for the sensitive workflow.`),
          p(`Use CavVerify as a step-up layer, not as a replacement for good roles. A user still needs the correct workspace role before a verification challenge should allow a protected action.`)
        ]
      },
      {
        id: "cavguard",
        title: "CavGuard",
        summary: "Block or step up risky actions.",
        blocks: [
          p(`CavGuard is the app's decision layer for protected workspace actions. Components display a CavGuard decision when a request is restricted by workspace access controls or requires a safer path.`),
          p(`CavGuard is used around role-sensitive and command-plane actions. If it blocks an action, review role, plan, origin, site selection, account state, and workspace context before retrying.`),
          p(`A blocked action should be treated as a signal to slow down. The user may be in the wrong workspace, using the wrong account, missing a plan requirement, or attempting an action that needs owner review.`)
        ]
      },
      {
        id: "cavsafe",
        title: "CavSafe",
        summary: "Store protected files.",
        blocks: [
          p(`CavSafe is secured storage. It supports owner-only access, secured storage quotas, folders, files, gallery and tree views, private sharing, move-in and move-out with CavCloud, snapshots, time locks, integrity checks, audit logs, and owner dashboard analytics where the plan allows.`),
          p(`Use CavSafe for workspace files that need stronger protection than ordinary CavCloud storage. This can include sensitive operational documents, private business records, protected assets, high-value project files, and files that should have stronger access review.`),
          p(`Premium includes CavSafe owner-only storage with 10 GB. Premium+ includes 50 GB plus Integrity Lock, Audit Log, Mountable CavSafe, Time Locks, Snapshots, and CavSafe Analytics.`),
          note("Do not overuse secured storage", "Use CavSafe for protected material. Keep normal project files in CavCloud so the team can work without unnecessary friction.")
        ]
      },
      {
        id: "audit-trail",
        title: "Audit trail",
        summary: "Review recorded actions.",
        blocks: [
          p(`Audit trails record important workspace and storage activity. The app writes audit entries for account and admin actions, CavCloud publishing, CavCloud collaboration, CavSafe file access attempts, CavSafe moves, time-lock events, integrity updates, and security command-plane actions.`),
          p(`Use audit trails to understand who changed access, moved files, published artifacts, opened secured files, or ran sensitive commands. Teams should review audit history before investigating access disputes, missing files, unexpected plan changes, or production-impacting actions.`),
          p(`A good audit review checks the actor, action, target, timestamp, result, and surrounding workspace context. Do not rely on memory when the audit log can show what happened.`)
        ]
      },
      {
        id: "risk-controls",
        title: "Risk Controls",
        summary: "Configure guardrails.",
        blocks: [
          p(`Risk controls are the settings and guardrails that reduce unsafe workspace behavior. The dashboard model includes blockUnknownOrigins, enforceAllowlist, alertOn404Spike, alertOnJsSpike, and strictDeletion.`),
          p(`Use these controls to limit unknown origins, enforce expected site allowlists, receive spike alerts for 404s and JavaScript errors, and make deletion more deliberate.`),
          p(`Also review API key origin allowlists and CavCloud or CavSafe permissions before inviting new members. Most workspace problems become easier to prevent when roles, origins, keys, and deletion rules are clean.`),
          list([
            "Block unknown origins when production data matters.",
            "Use allowlists for known website origins.",
            "Keep spike alerts enabled for 404 and JavaScript errors.",
            "Use strict deletion when removing sites or storage assets.",
            "Review permissions after plan, team, or project changes."
          ])
        ]
      }
    ]
  },


  integrations: {
    path: "/docs/integrations",
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
    path: "/docs/billing",
    icon: "assets/icons/docs/pay-svgrepo-com.svg",
    label: "Billing and plans",
    kicker: "Billing",
    title: "Billing and plans",
    description: "Understand plans, trial behavior, checkout, Stripe portal, seats, and cancellation.",
    sections: [
      {
        id: "plans",
        title: "Plans",
        summary: "Compare plan limits.",
        blocks: [
          p(`CavBot plans are designed to scale from a first website setup to a larger operating workspace with more sites, seats, storage, protected files, and advanced modules.`),
          p(`Our plans are called CavTower, CavControl, and CavElite. In some parts of the docs and product, they may also appear as Free, Premium, and Premium+ so plan access is easier to understand in product screens.`),
          p(`Choose the plan based on how many sites the workspace needs, how many people need access, how much storage the team uses, and which signal modules matter for the business.`),
          table(
            ["Plan", "Monthly", "Websites", "Seats", "Storage", "Modules"],
            [
              ["CavTower / Free", "$0", "1", "4", "5 GB CavCloud", "Dashboard, routing, Control Room, badge widgets. Errors, SEO, A11y, and Insights are locked."],
              ["CavControl / Premium", "$19.99", "6", "8", "50 GB CavCloud, 10 GB CavSafe", "Errors and SEO enabled. A11y and Insights locked."],
              ["CavElite / Premium+", "$39.99", "20", "16", "500 GB CavCloud, 50 GB CavSafe", "Errors, SEO, A11y, and Insights enabled."]
            ]
          ),
          p(`Annual prices in the repo are $199.99 for Premium and $399.99 for Premium+.`)
        ]
      },
      {
        id: "trial",
        title: "Trial",
        summary: "Understand trial access.",
        blocks: [
          p(`Trial state is represented by trialSeatActive and trialEndsAt on the account. When the trial is active, feature gates resolve the account as Premium+ for effective access.`),
          p(`Use the trial to test the complete workspace flow: adding sites, installing the snippet, reviewing signals, using reports, testing CavAi, opening CavCode, exploring CavCloud, and checking locked or unlocked modules.`),
          p(`Trial access ends when trialEndsAt passes or trialSeatActive is no longer true. After that, the account returns to its paid or free tier and feature gates enforce the resulting plan.`)
        ]
      },
      {
        id: "checkout",
        title: "Checkout",
        summary: "Start Stripe checkout.",
        blocks: [
          p(`Checkout is handled through billing and Stripe routes, including /api/billing/checkout, /api/billing/checkout-session, /api/billing/checkout-embedded, and /api/stripe/checkout.`),
          p(`Owners and admins should start checkout from the Plan or Settings billing surface. The selected plan and billing cycle should be checked before continuing so the customer enters the correct Stripe flow.`),
          p(`After checkout, return routes show success or failure state. If the plan does not update immediately, refresh billing state, check the Stripe portal, and confirm the webhook completed.`)
        ]
      },
      {
        id: "portal",
        title: "Portal",
        summary: "Manage billing in Stripe.",
        blocks: [
          p(`The Stripe portal route lets authorized workspace billing users manage payment methods, invoices, and subscription details in Stripe.`),
          p(`Use the portal when you need invoice history, payment method updates, receipt access, card changes, or Stripe-managed subscription actions.`),
          p(`After returning from the portal, check the CavBot billing page to confirm the workspace reflects the current plan and subscription state.`)
        ]
      },
      {
        id: "seats",
        title: "Seats",
        summary: "Plan member limits.",
        blocks: [
          p(`Seats are enforced from plan limits: Free includes 4 seats, Premium includes 8, and Premium+ includes 16. Team invites check these limits and can fail with PLAN_SEAT_LIMIT.`),
          p(`Before inviting users, review current members and pending invites. A pending invite may still count toward planning even if the person has not accepted it yet.`),
          p(`Revoked or expired invites should not be treated as active access. Keep the member list clean so the team understands who has real workspace access.`)
        ]
      },
      {
        id: "cancel-a-plan",
        title: "Cancel a plan",
        summary: "Cancel or downgrade billing.",
        blocks: [
          p(`The app includes downgrade and cancel-downgrade billing routes. Plan changes should be started by an owner or authorized billing user from Settings or Plan screens.`),
          p(`After a downgrade or cancellation, CavBot keeps the workspace but enforces the resulting plan limits. Locked modules remain visible only where the app shows locked states, and capacity may need cleanup if usage exceeds the new plan.`),
          p(`Before downgrading, review site count, seat count, CavCloud storage, CavSafe storage, and enabled modules. If usage is above the new plan limit, decide what should be removed, archived, or upgraded before the change.`),
          note("Plan changes", "Downgrades can affect features, storage, sites, seats, and module access. Review the workspace before confirming.")
        ]
      }
    ]
  },


  assets: {
    path: "/docs/assets",
    icon: "assets/logo/cavbot-logomark.svg",
    label: "CavBot assets",
    kicker: "CavBot assets",
    title: "CavBot assets",
    description: "Install CavBot visual surfaces for badges, compact CavBot presence, guided moments, Arcade recovery, and brand resources.",
    sections: [
      {
        id: "cavbot-badge",
        title: "Badge",
        summary: "Show a compact CavBot trust marker.",
        blocks: [
          p(`The CavBot Badge is a small website surface loaded from the CavBot CDN. Use it when a page should show that CavBot is present without changing the main page flow.`),
          code('<link rel="stylesheet" href="https://cdn.cavbot.io/sdk/ui/v1/cavbot-badge-inline.css">\n\n<div\n  data-cavbot-cdn-floating-badge="1"\n  data-cavbot-cdn-slot="badge"\n  aria-hidden="true"\n  style="position:fixed;right:24px;bottom:24px;z-index:9999;"></div>'),
          p(`Place the badge where it will not cover forms, checkout controls, cookie banners, support widgets, accessibility controls, or mobile navigation. Review the site on desktop and mobile after install.`),
          p(`The badge should feel like a trust marker, not a distraction. Keep it small, stable, and out of the visitor’s way.`)
        ]
      },
      {
        id: "cavbot-head",
        title: "Head",
        summary: "Use a compact CavBot visual.",
        blocks: [
          p(`CavBot Head is a compact visual component for onboarding, empty states, setup confirmation, guidance moments, and status surfaces.`),
          code('<link rel="stylesheet" href="https://cdn.cavbot.io/sdk/ui/v1/cavbot-head-orbit.css">\n\n<div data-cavbot-head-orbit></div>'),
          p(`Use the component when the page benefits from a small CavBot presence. It should support the page state without replacing the actual instructions, forms, labels, or controls.`),
          note("Layout", "Keep enough space around the component so it does not crowd the page or compete with primary actions.")
        ]
      },
      {
        id: "cavbot-body",
        title: "Body",
        summary: "Use the larger CavBot visual.",
        blocks: [
          p(`CavBot Body is the larger CavBot visual presence for guided product moments, launch states, recovery screens, support surfaces, and stronger branded experiences.`),
          code('<link rel="stylesheet" href="https://cdn.cavbot.io/sdk/ui/v1/cavbot-full-body.css">\n\n<div data-cavbot-full-body></div>'),
          p(`Use the full body only when the page benefits from a stronger guide or recovery anchor. On small screens, confirm that the visual does not crowd text, buttons, form fields, or important navigation.`),
          note("Use carefully", "The full body should strengthen the page. It should not hide the main action or make the page feel heavy.")
        ]
      },
      {
        id: "arcade-404",
        title: "Arcade",
        summary: "Play CavBot Arcade games anytime.",
        blocks: [
          p(`CavBot Arcade is the interactive game surface inside CavBot. It gives users a place to open, explore, and play CavBot Arcade games at any time from a supported device.`),
          p(`Arcade is not limited to broken pages, 404 routes, or recovery installs. It is the main CavBot game hub inside the platform. Users can open the Arcade, choose a game, test the controls, learn how each game feels, and play without installing anything on a website.`),
          p(`All six CavBot Arcade games are available to play inside the Arcade at all times, no matter which plan a user is on. Free, Premium, and Premium+ users can open the Arcade and play the full game collection from CavBot.`),
          p(`Arcade has two connected purposes. First, it is a playable game hub where users can enjoy the games directly. Second, it can support broken-page recovery when a team chooses to install an Arcade experience on a 404 page.`),
          p(`Inside the Arcade, users can play the games freely. They can test controls, preview the pacing, understand each game’s style, and decide which experience fits their website before using it publicly.`),
          p(`This makes Arcade useful for discovery, previewing, team review, product demos, and simple gameplay. A team can see the experience first instead of installing something blind on a public route.`),
          p(`For broken-page recovery, CavBot Arcade can also be used as a live website experience. When installed on a missing route or 404 page, it gives visitors something more useful than a basic Page Not Found screen.`),
          p(`Instead of leaving the visitor at a dead end, the site can offer a short game, a clear path forward, and a cleaner recovery moment. The goal is not to hide the broken route. The goal is to protect the visitor experience while the team reviews what should be fixed.`),
          p(`Plan access may affect which games can be selected for a live website recovery install. However, the Arcade play surface itself always keeps all six games available to play.`),
          p(`Use CavBot Arcade when you want to explore the full game collection, play CavBot games from the platform, preview an Arcade experience before using it on a website, or show teammates what the recovery experience looks like.`),
          p(`When using Arcade as a website recovery surface, install it through the approved CavBot runtime or CDN loader. This keeps the public install clean and avoids placing the full game runtime directly inside customer-facing source files when the production setup is meant to load the experience remotely.`),
          p(`After installing Arcade on a 404 route, verify that the selected experience loads correctly, the visitor can return to a useful page, and CavBot records the recovery context.`),
          p(`When using Arcade inside the CavBot platform, no install is required. Open the Arcade, choose a game, and start playing.`)
        ]
      },
      {
        id: "arcade-games",
        title: "404 games",
        summary: "Install playable recovery experiences for broken pages.",
        blocks: [
          p(`404 games are the installable CavBot Arcade experiences for broken pages. Use them when visitors land on a missing route and you want the page to feel intentional instead of empty, confusing, or unfinished.`),
          p(`A 404 game gives the visitor a short interactive moment, then helps them return to a useful page. This is different from the main CavBot Arcade. The Arcade is where users can play all games anytime inside the CavBot platform. 404 games are the website version: the game experience a team can install on a live 404 page.`),
          p(`When installed, a 404 game turns a basic Page Not Found screen into a recovery experience. The visitor can play, reset, continue, or follow a clear link back to the site.`),
          p(`The goal is simple: protect the moment, keep the visitor moving, and help the team understand where people got lost.`),
          p(`404 games are not a replacement for fixing broken links. If an important route is missing, the team should still repair the link, restore the page, or add a proper redirect.`),
          p(`The game gives visitors a better experience while the team reviews and fixes the source of the problem.`),
          p(`Only one Arcade game should be active on a single 404 page at a time. Your plan controls how many games you can choose from for that public 404 install.`),
          p(`Free users can choose from 1 installable 404 game. Premium users can choose from 3 installable 404 games. Premium+ users can choose from all 6 installable 404 games.`),
          p(`All six games remain playable inside CavBot Arcade at all times. The plan limit only applies to which games can be selected for a website as a public 404 recovery experience.`),
          p(`Choose the game that fits the website. A playful brand may use a faster game. A professional site may use a calmer recovery experience. The best choice is the one that feels natural for the visitor and does not distract from the path back.`),
          p(`Every installed 404 game should include clear recovery links. Visitors should always have a simple way to return home, open search, visit support, go back to pricing, or continue to another important route.`),
          p(`The game should improve the broken moment, not trap the visitor inside it.`),
          p(`For public installs, load the 404 game through the approved CavBot runtime or CDN loader. This keeps the website cleaner and allows CavBot to manage the experience without requiring the full game code to be copied directly into the site.`),
          p(`After installing a 404 game, open the missing page and confirm that the game loads correctly, the controls work, the recovery links are visible, and the visitor can continue without friction.`),
          p(`After launch, review 404 Control Room to see which broken routes are still being reached. If a missing route receives repeated visits, treat that as a signal.`),
          p(`The page may need a redirect, a restored route, a fixed link, or a clearer path inside the website.`),
          p(`404 games make broken pages feel designed. 404 Control Room helps you understand which broken pages still need repair. Together, they turn a dead end into a better visitor experience and a clearer signal for the team.`)
        ]
      },
      {
        id: "brand-resources",
        title: "Brand resources",
        summary: "Use approved CavBot brand files.",
        blocks: [
          p(`Brand resources live at brand.cavbot.io. Use that site for approved CavBot marks, logotypes, product visuals, and brand guidance.`),
          p(`Use the CDN badge and documented assets for product surfaces. Do not copy internal source files into a public site when a CDN asset or approved brand resource exists.`),
          p(`When using CavBot marks publicly, keep the mark clear, readable, and aligned with approved brand usage. Avoid stretching, recoloring, compressing, or placing the mark on backgrounds that make it hard to read.`)
        ]
      }
    ]
  },


  resources: {
    path: "/docs/resources",
    icon: "assets/icons/docs/image-combiner-svgrepo-com3.svg",
    label: "More docs",
    kicker: "Resources",
    title: "More docs",
    description: "Find support, status, releases, and community information.",
    sections: [
      {
        id: "support",
        title: "Support",
        summary: "Get help with CavBot.",
        blocks: [
          p(`Use support when a workspace cannot sign in, a site will not connect, a snippet fails verification, billing needs review, a module shows an unexpected error, or a teammate cannot access the correct project.`),
          p(`A good support request includes the workspace, site origin, route, time of the issue, browser, platform, and any request ID or error code shown by the app. More context helps the issue get diagnosed faster.`),
          list([
            "Include the site origin.",
            "Include the route where the problem happened.",
            "Include the time and browser.",
            "Include screenshots only when they help explain the issue.",
            "Avoid sending secrets, passwords, or private customer data."
          ])
        ]
      },
      {
        id: "status",
        title: "Status",
        summary: "Check CavBot service health.",
        blocks: [
          p(`The app status surface tracks services such as CavAi Analytics v5, CavAi v3, CavTools, CavCode, CavCode Viewer, CavCloud, and the Arcade CDN. It also includes status history and incident routes.`),
          p(`Check Status before debugging a local install issue if multiple CavBot services appear unavailable. If Status shows a known incident, wait for the service update before changing your own site configuration.`),
          p(`If Status is healthy but your workspace still has a problem, continue with the focused docs for the affected area: Integrations for snippet installs, Billing for plan issues, Security for protected actions, or Developer tools for CavCode and CavTools.`)
        ]
      },
      {
        id: "releases",
        title: "Releases",
        summary: "Follow product changes.",
        blocks: [
          p(`Release notes explain what changed, what users need to do, and whether behavior changed in setup, billing, integrations, workspace modules, CavAi, CavCode, CavCloud, CavSafe, Arcade, or signal collection.`),
          p(`When reading a release, verify whether the change affects your plan, snippet, integration platform, site settings, API keys, or team workflow.`),
          p(`For larger releases, review the workspace after the update. Confirm that the selected site, active modules, reports, and key surfaces still behave as expected.`)
        ]
      },
      {
        id: "community",
        title: "Community",
        summary: "Future CavBot community.",
        blocks: [
          p(`CavBot is working on building a community. It is intended to become a place where users can ask questions, share setup patterns, report issues, learn from other teams, and follow CavBot updates.`),
          p(`Do not treat the community as an active support channel until CavBot publishes the finished community surface. For now, use support and status for operational issues.`),
          p(`When the community surface becomes available, use it for shared learning and product conversation. Use official support for account, billing, security, production, and workspace-specific issues.`)
        ]
      }
    ]
  }
};


function integrationBlocks(name, when, placement, mistakes) {
  return [
    p(name + " installation connects that platform to CavBot Analytics v5, widgets, visual surfaces, and Arcade snippets generated for a CavBot site."),
    p("When to use it: " + when),
    p("Where to paste the snippet: " + placement),
    p("Before installing, confirm the CavBot site origin matches the public website origin you are about to publish. If the platform uses preview domains, staging domains, or custom production domains, make sure you are testing the same origin that is saved inside CavBot."),
    p("Install the snippet in the shared area that loads across the pages you want CavBot to monitor. For most sites, that means the global footer, body, theme layout, project code area, or equivalent platform-wide custom-code field."),
    p("After adding the snippet, publish the site. Then open the public website in a browser and visit several important routes such as the homepage, pricing page, contact page, login page, product page, or a known missing route if you are testing 404 recovery."),
    p("What to verify: publish the site, visit the public origin, move through a few routes, then check CavBot for recent signals on the same site profile."),
    p("Common mistakes: " + mistakes),
    p("If CavBot does not show activity, inspect the live page source and confirm the configuration values appear before the runtime script. Also check that the browser is not blocking the request, the API key is still active, and the saved site origin matches the live domain."),
    p("Next step: open Website signals and confirm Routes, Errors, SEO, A11y, and 404 Control Room are pointed at the expected origin."),
    note("Install rule", "Use one clean global install first. Add page-specific widgets, badges, or Arcade recovery surfaces only after the base Analytics v5 signal is verified.")
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
  const hashId = window.location.hash ? window.location.hash.slice(1) : "";
  if ((path === "/docs" || path === "/docs.html") && hashId && sectionToRoute[hashId]) return sectionToRoute[hashId];
  if (path === "/docs" || path === "/docs.html") return "home";
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
    if (canonical) canonical.setAttribute("href", "https://cavbot.io" + cat.path);
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
      callout.innerHTML = '<h2>Documentation index</h2><p>Fetch the complete documentation index at: <a href="https://cavbot.io/docs/llms.txt">https://cavbot.io/docs/llms.txt</a></p><p>Use the left menu or the On this page panel to open a section.</p>';
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
    if (replace && window.history) {
      const path = slugPath(window.location.pathname);
      const targetPath = path === "/docs" || path === "/docs.html" ? window.location.pathname : cat.path;
      window.history.replaceState(null, "", targetPath + "#" + safeId);
    }
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
    const parsedPath = slugPath(parsed.pathname);
    const hashId = parsed.hash ? parsed.hash.slice(1) : "";
    const route = pathToRoute[parsedPath] || ((parsedPath === "/docs" || parsedPath === "/docs.html") && hashId ? sectionToRoute[hashId] : "");
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
    return "https://cavbot.io" + cat.path + hash;
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
    if (markdownLink) markdownLink.setAttribute("href", "https://cavbot.io" + cat.path + ".md");
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
        navigateTo(button.getAttribute("data-docs-search-href") || "/docs/getstarted");

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
