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
    
    title: "Get started",
    description: "Create an account, add a website, install Analytics v5, and verify that CavBot is receiving signals.",
    sections: [
     {
  id: "overview",
  title: "Overview",
  summary: "Understand what CavBot does, how a workspace is organized, and where to begin.",
  blocks: [
    p(`CavBot is a website intelligence workspace for teams that need to understand what happens after a website goes live. It helps owners, developers, founders, and operators see the parts of a website that normally become scattered across separate tools: live routes, broken paths, browser errors, search structure, accessibility signals, recovery pages, reports, files, notes, and assistant context.`),

    p(`Use CavBot when a website matters to the business and the team needs more than a basic traffic chart. CavBot is built for the moments after launch: when visitors are moving through real pages, when links break, when errors appear, when important routes need review, when SEO structure needs to be checked, and when a team needs a clearer way to decide what deserves attention next.`),

    p(`The purpose of CavBot is not to replace every tool a team already uses. The purpose is to bring the most important website signals into one operating workspace so the team can see them together. A route issue, a browser error, a missing page, a weak metadata setup, and a recovery experience should not feel like five disconnected problems. CavBot keeps them attached to the same project, site, and workspace context.`),

    p(`A CavBot workspace is organized around projects and sites. A project is the operating container for the work. A site is a saved website origin, such as https://example.com. Once a site is selected, CavBot uses that site as the default context for dashboards, reports, assistant help, routing, errors, SEO, accessibility, 404 recovery, Arcade, and other workspace surfaces.`),

    table(
      ["Term", "Meaning"],
      [
        ["Workspace", "The main area where a team manages CavBot activity, settings, sites, files, reports, and access."],
        ["Project", "The operating container inside the workspace. A project can hold one or more monitored sites."],
        ["Site", "A saved website origin that CavBot watches, such as https://example.com."],
        ["Selected site", "The site currently being reviewed. Many dashboards, reports, and tools use it as their active context."],
        ["Primary site", "The main site for the project. Use it when one website should be treated as the default production target."]
      ]
    ),

    p(`The best way to start is with one real production website. Add the clean public origin, install the Analytics v5 snippet once in the shared layout or platform custom-code area, publish the site, visit the live pages in a browser, and then return to CavBot to confirm that the workspace is receiving activity.`),

    p(`Do not begin by adding every test domain, staging domain, preview URL, and old project at once. Start with the website that matters most. Once that first connection is clean, you can add more sites, invite teammates, organize files, set up security controls, and begin deeper review across the workspace.`),

    ol([
      "Create or sign in to your CavBot account.",
      "Open the workspace and confirm the correct project is selected.",
      "Add the public website origin you want CavBot to monitor.",
      "Install the Analytics v5 snippet once in the global layout, site header, or approved custom-code area.",
      "Publish the website if the platform requires publishing before scripts appear live.",
      "Visit the public website in a browser so CavBot receives a real page signal.",
      "Return to CavBot and confirm the selected site shows activity or a clear empty state.",
      "Review Routes, Errors, SEO, A11y, Reports, and 404 Recovery after the first signals arrive.",
      "Set a primary site when the project has more than one saved origin.",
      "Invite teammates only after the workspace, site, and access model are clear."
    ]),

    note("Best first setup", "Use your public production origin for the first install. Add staging, preview, local, or test origins later after the main site is connected and working."),

    p(`CavBot is most useful when the team treats it as a review layer, not just a setup screen. After the snippet is installed, the real value comes from checking what CavBot is showing: which routes are active, which pages are missing, which errors are repeating, which pages need SEO review, which accessibility signals need attention, and whether visitors have a clear recovery path when something breaks.`),

    p(`Each CavBot surface has a specific job. The dashboard gives a broad view. Routes helps review page movement and path activity. Errors helps identify browser and runtime problems. SEO helps review page structure and visibility basics. A11y helps review accessibility signals. 404 Recovery focuses on missing routes. Arcade can improve broken-page recovery. Reports help summarize current site state. CavAi can explain, organize, and help plan next steps from the context the workspace already has.`),

    table(
      ["Surface", "Use it for"],
      [
        ["Dashboard", "Review the broad state of the selected site."],
        ["Routes", "Understand which paths are being reached and how route activity is developing."],
        ["Errors", "Review browser errors, runtime problems, and repeated failure patterns."],
        ["SEO", "Check page titles, descriptions, canonical structure, headings, and basic visibility signals."],
        ["A11y", "Review accessibility signals that may affect usability and page quality."],
        ["404 Recovery", "Find missing routes, repeated broken paths, and recovery opportunities."],
        ["Arcade", "Play CavBot games inside the platform and use selected games for better 404 recovery."],
        ["Reports", "Read a structured snapshot of the selected site and its current condition."],
        ["CavAi", "Ask for explanations, summaries, plans, checklists, and next-step guidance."]
      ]
    ),

    p(`CavBot should also help teams slow down before making risky changes. If a route is broken, the first step is not always to rewrite the page. If an error appears, the first step is not always to change code. If a page looks weak in SEO, the first step is not always to rewrite all copy. Use CavBot to understand the pattern first, then make the smallest useful fix.`),

    list([
      "Start with one production site.",
      "Install the snippet once, not repeatedly across every template unless the platform requires it.",
      "Confirm that the saved CavBot origin matches the public website origin.",
      "Review the selected site before reading reports or asking CavAi for help.",
      "Use focused modules when you need the source details behind a summary.",
      "Invite teammates only after roles and ownership are clear.",
      "Keep test, staging, and preview origins separate from the main production site when possible."
    ]),

    p(`CavBot works best when the workspace stays clean. Site origins should be named clearly. The primary site should be intentional. Team roles should match real responsibility. Storage should be organized. Security controls should be reviewed before inviting more members. Reports should be read with the selected site in mind.`),

    p(`A healthy CavBot setup gives the team one place to answer practical questions: Is the right site connected? Are visitors reaching real pages? Are broken routes repeating? Are browser errors appearing after launch? Are important pages structured clearly? Are recovery paths helping visitors move forward? Does the team know what to fix next?`),

    table(
      ["Question", "Where to look"],
      [
        ["Is my website connected?", "Workspace site settings, Integrations, Analytics v5, and Dashboard activity."],
        ["Are visitors reaching pages?", "Routes and Dashboard."],
        ["Are pages breaking?", "Errors and 404 Recovery."],
        ["Are missing routes repeating?", "404 Recovery."],
        ["Does page structure need review?", "SEO."],
        ["Are accessibility signals healthy?", "A11y."],
        ["Can visitors recover from a missing page?", "Arcade and 404 Recovery."],
        ["What should I do next?", "Reports, CavAi, and the focused module connected to the issue."]
      ]
    ),

    p(`For a small team, CavBot can become the place where website health is reviewed before a launch, after a change, and during normal operations. For a founder or solo builder, it can reduce guessing by showing where the site needs attention. For a larger team, it can help separate ownership: developers can review errors, operators can review reports, owners can manage access, and support can understand where visitors may be getting stuck.`),

    p(`The main rule is simple: connect the site, verify the setup, read the focused surface, then act. CavBot should make website review feel calmer, more organized, and easier to trust.`),

    note("Core rule", "CavBot is the operating workspace for what happens after launch. Connect the site first, confirm real activity, then use the focused modules to understand what needs attention.")
  ]
},

      {
  id: "account",
  title: "Account",
  summary: "Set up the identity, owner access, and workspace foundation.",
  blocks: [
    p(`Your CavBot account is the identity used to create, own, or join a workspace. It controls how you sign in, which workspaces you can access, which projects you can open, and which actions you are allowed to perform inside CavBot.`),

    p(`Set up the account carefully before adding sites, inviting teammates, changing billing, creating API keys, or adjusting security settings. A clean account setup prevents confusion later when a teammate cannot access the right workspace, a billing screen is locked, or a protected action requires owner approval.`),

    p(`The first account connected to a serious workspace should be treated as the owner identity. The owner is responsible for the long-term administration of the workspace, including billing, member access, plan changes, site settings, protected actions, storage controls, API keys, security decisions, and workspace recovery.`),

    p(`Use an email address that can remain attached to the business, product, or team. Avoid using a temporary email address, school email, old personal inbox, or any address that may be lost later. If the workspace belongs to a company, use an address that the company can continue to manage.`),

    table(
      ["Account area", "Why it matters"],
      [
        ["Owner identity", "The owner account is the highest-trust account for the workspace."],
        ["Email address", "The email should remain available for sign-in, billing, security, and recovery."],
        ["Workspace access", "The account determines which projects, sites, files, and settings the user can reach."],
        ["Billing access", "Plan changes, checkout, cancellation, and billing review should stay limited to trusted users."],
        ["Security actions", "Sensitive settings, protected files, API keys, and member controls should not be handled from a shared account."]
      ]
    ),

    p(`Do not share the owner account with teammates. Shared credentials make it harder to know who changed something, who approved an action, who rotated a key, who invited a member, or who changed billing. Invite teammates as members instead, then give each person the correct role for their work.`),

    p(`Before inviting anyone else, confirm that the owner account can sign in, open the correct workspace, access the dashboard, reach Settings, view Billing, manage Sites, and open the security controls that belong to the workspace. This should be done before the workspace becomes active for a team.`),

    ol([
      "Create or sign in to the CavBot account that should own the workspace.",
      "Confirm the account email is stable and can receive important messages.",
      "Open the workspace and confirm the correct project is selected.",
      "Add the production site or confirm the saved site is correct.",
      "Install and verify the site connection before inviting teammates.",
      "Open Settings and confirm the owner can reach billing, site settings, member controls, and security controls.",
      "Review the plan state and confirm the expected features are available.",
      "Invite teammates only after ownership, billing, and site setup are clear."
    ]),

    note("Owner setup", "Finish the owner setup before expanding the workspace. The owner should be able to access the workspace, billing, sites, settings, and security controls without needing another member to unlock the account."),

    p(`A CavBot account and a CavBot workspace are connected, but they are not the same thing. The account is the person or identity signing in. The workspace is the operating area where projects, sites, files, reports, settings, members, and billing live. One account may join more than one workspace, but each workspace should still have clear ownership.`),

    table(
      ["Term", "Meaning"],
      [
        ["Account", "The identity used to sign in to CavBot."],
        ["Owner", "The highest-trust user responsible for the workspace."],
        ["Workspace", "The operating area where the team manages CavBot activity."],
        ["Project", "The container for sites, settings, reports, files, and related work."],
        ["Member", "A teammate invited into the workspace with limited access based on role."]
      ]
    ),

    p(`Use roles instead of shared logins. The owner should keep control of the workspace. Admins can help manage important areas when trusted. Members should only receive the access they need to complete their work. This keeps the workspace easier to review and safer to operate.`),

    list([
      "Use one stable account as the workspace owner.",
      "Use a business-safe email address when the workspace belongs to a company.",
      "Do not share owner credentials with teammates.",
      "Invite teammates as separate members.",
      "Give each member the role they actually need.",
      "Review members before changing billing, storage, security, or protected settings.",
      "Remove access when a teammate no longer works on the project."
    ]),

    p(`The account you use also affects what CavBot shows. If the wrong account is active, the workspace may look empty, a site may appear missing, billing may not match what you expect, or a module may appear locked. Before assuming something is broken, confirm that you are signed in with the correct account and viewing the correct workspace.`),

    table(
      ["Problem", "What to check"],
      [
        ["Workspace looks empty", "Confirm you signed in with the account that owns or joined the workspace."],
        ["Billing is not visible", "Confirm the account has owner or authorized billing access."],
        ["Site is missing", "Confirm the correct project and selected workspace are open."],
        ["Feature appears locked", "Confirm the workspace plan and the account role."],
        ["Invite cannot be managed", "Confirm the account has permission to manage members."],
        ["Protected setting is blocked", "Confirm the action is allowed for the account role."]
      ]
    ),

    p(`Account setup is also part of security. A strong workspace begins with clear ownership, separate member accounts, careful role assignment, and limited access to billing and protected controls. The more important the website is, the more important it is to keep account access clean.`),

    p(`If a teammate needs access, send an invite. If a teammate needs more responsibility, change their role only after reviewing what that role can do. If a teammate leaves the project, remove their access. Do not leave old members inside a workspace because they may still have access to files, settings, reports, or protected areas.`),

    p(`For billing, use the account that should be responsible for the subscription. Plan changes, checkout, cancellations, seat limits, and storage limits should be handled by the owner or an authorized billing user. Avoid starting checkout from an account that should not control the workspace long term.`),

    p(`For recovery, keep the owner email reachable. If the owner loses access to the email account, the workspace may become harder to recover. The owner should keep sign-in access current and avoid relying on an inbox that may expire, be deleted, or belong to someone outside the business.`),

    list([
      "Keep the owner email active.",
      "Keep billing responsibility clear.",
      "Keep member access current.",
      "Keep old teammates out of active workspaces.",
      "Keep protected actions limited to trusted roles.",
      "Keep recovery paths tied to an account the business can access."
    ]),

    p(`A well-set-up account gives CavBot a clean foundation. The right owner can manage the workspace, the right members can do their work, billing stays understandable, and protected actions remain tied to trusted users instead of shared credentials or unclear access.`),

    note("Core rule", "Set up ownership first. Use one stable owner account, invite teammates separately, and keep billing, settings, sites, API keys, and protected actions under trusted access.")
  ]
},

     {
  id: "site-setup",
  title: "Site setup",
  summary: "Create the website profile CavBot monitors.",
  blocks: [
    p(`A site is the saved website address CavBot monitors inside a workspace. It should represent the main public origin of a website, app, storefront, portal, or subdomain. A site is not one page. It is the address CavBot uses to understand where signals belong.`),


    p(`For example, https://example.com is a site. https://example.com/pricing is a route inside that site. CavBot uses the site profile to group routes, visits, broken paths, browser errors, metadata checks, accessibility snapshots, reports, recovery activity, and assistant context under the correct website.`),


    code("https://example.com\nhttps://www.example.com\nhttps://app.example.com"),


    p(`Site setup matters because CavBot depends on the saved site address to match incoming browser signals to the correct workspace. If the wrong address is saved, the snippet may still run on the website, but the dashboard may look empty, incomplete, or connected to the wrong profile.`),


    table(
      ["Term", "Meaning"],
      [
        ["Site", "The saved website origin CavBot monitors, such as https://example.com."],
        ["Route", "A page or path inside a site, such as /pricing, /docs, or /checkout."],
        ["Origin", "The protocol and domain together, such as https://app.example.com."],
        ["Primary site", "The main site CavBot should use first when a workspace has more than one saved origin."],
        ["Subdomain", "A separate website area such as app.example.com, docs.example.com, or shop.example.com."]
      ]
    ),


    p(`Use the exact public address visitors use in production. If your website redirects from www to non-www, save the final address visitors land on. If your website redirects from non-www to www, save the www version. CavBot should match the real website, not the address you wish the website used.`),


    p(`Do not save a page path as a site. Pages belong inside the site as routes. A route such as /pricing, /blog, /checkout, /docs, or /404 should not be added as a separate site unless it is actually hosted on a separate origin.`),


    table(
      ["Use this", "Do not use this as the site"],
      [
        ["https://example.com", "https://example.com/pricing"],
        ["https://www.example.com", "https://www.example.com/blog/post-name"],
        ["https://app.example.com", "https://app.example.com/dashboard/settings"],
        ["https://docs.example.com", "https://docs.example.com/getting-started"],
        ["https://shop.example.com", "https://shop.example.com/products/item-name"]
      ]
    ),


    p(`When a business has more than one public surface, add each one only when it needs separate review. A marketing site, app dashboard, documentation site, storefront, and support portal may deserve separate site profiles if they live on different subdomains and need their own signals, reports, settings, or recovery review.`),


    table(
      ["Website structure", "Recommended setup"],
      [
        ["Marketing site only", "Add the main production origin."],
        ["Marketing site and app on different subdomains", "Add each subdomain as its own site if both need monitoring."],
        ["Docs on a separate subdomain", "Add the docs site separately if docs quality, search, or broken routes matter."],
        ["Storefront on a separate subdomain", "Add the storefront separately if checkout, product routes, or customer paths need review."],
        ["Temporary preview domains", "Add only when you intentionally want CavBot to monitor preview or staging behavior."]
      ]
    ),


    p(`Start with the main production website first. Production is the address real visitors use. Once that site is connected and receiving signals, you can add staging, preview, test, documentation, app, or storefront origins if the workspace needs them.`),


    ol([
      "Open the CavBot workspace.",
      "Confirm the correct project is selected.",
      "Add the public production origin for the website.",
      "Use https:// whenever the website supports it.",
      "Do not include page paths, query strings, tracking tags, or fragments.",
      "Save the site profile.",
      "Install the Analytics v5 snippet for that site.",
      "Publish the website if the snippet was added through a website builder or deployment flow.",
      "Visit the live public site in a browser.",
      "Return to CavBot and confirm the site begins showing activity or the correct empty state."
    ]),


    note("Best first setup", "Add the real production origin first. Do not begin with localhost, a temporary preview URL, or a page path unless you are intentionally testing a local or preview workflow."),


    p(`The saved site address should be clean. It should include the protocol and domain. It should not include paths, campaign tags, search parameters, anchors, or tracking values. CavBot will discover routes through browser activity after the snippet is installed.`),


    list([
      "Use https://example.com, not example.com/pricing.",
      "Use the final public address after redirects.",
      "Use the correct subdomain when the app, docs, store, or portal lives separately.",
      "Do not include ?utm_source, ?ref, ?preview, or other query values.",
      "Do not include #section links.",
      "Do not create one site for every page.",
      "Do not use localhost as the production site.",
      "Set a primary site when the workspace has more than one saved origin."
    ]),


    p(`If the website has both https://example.com and https://www.example.com, choose the version visitors actually use after redirect. Saving both is usually unnecessary unless both versions intentionally serve different experiences. If both versions are active by mistake, clean up the website redirect rules before treating them as separate CavBot sites.`),


    p(`If your product uses separate subdomains, decide whether each subdomain needs its own CavBot profile. A public marketing site and a logged-in app often behave differently. The marketing site may need SEO, route, and conversion review. The app may need errors, protected flows, account routes, and dashboard behavior. Separate profiles can keep those signals clearer.`),


    table(
      ["Example", "How to think about it"],
      [
        ["https://cavbot.io", "Main public marketing website."],
        ["https://app.cavbot.io", "Logged-in product application."],
        ["https://docs.cavbot.io", "Documentation surface."],
        ["https://status.cavbot.io", "Service health surface."],
        ["https://brand.cavbot.io", "Brand and media resource surface."]
      ]
    ),


    p(`Localhost should be used carefully. A local development address can help during testing, but it should not be treated as the production site profile. Local signals do not represent real visitor behavior, and they can make the workspace harder to understand if mixed with production data.`),


    p(`Preview and staging domains should also be handled intentionally. Add them only when you want CavBot to monitor those environments separately. If preview domains change often, they can create noise. For most teams, production should be the first stable site, and staging should be added later only when the workflow needs it.`),


    p(`After the site is created, the next important step is installing the Analytics v5 snippet for that site. The saved site address, site ID, project key, and allowed origin must agree. If one of those pieces points to a different website, CavBot may reject the signal or place it somewhere unexpected.`),


    table(
      ["Setup piece", "What should match"],
      [
        ["Saved site origin", "The public website address CavBot should monitor."],
        ["Installed snippet", "The code placed on that same website."],
        ["Site ID", "The CavBot site profile the snippet belongs to."],
        ["Project key", "The workspace project allowed to receive the signal."],
        ["Origin allowlist", "The approved website origin allowed to send data."]
      ]
    ),


    p(`When the workspace has more than one site, set the primary site. The primary site is the default site CavBot should open first in dashboards, reports, assistant context, and workspace surfaces. This is especially important for teams with a marketing site, app, docs site, and storefront in the same workspace.`),


    p(`A clean primary site reduces confusion. If the wrong site is selected, a user may think a dashboard is empty, a report is missing, or a module is not working. Before investigating, always confirm the selected site at the top of the workspace.`),


    list([
      "Use the primary site for the main production surface.",
      "Switch sites when reviewing a separate app, docs, store, or portal.",
      "Confirm the selected site before reading reports.",
      "Confirm the selected site before asking CavAi about workspace context.",
      "Confirm the selected site before debugging missing activity."
    ]),


    p(`If CavBot does not show activity after setup, do not assume the site is broken. First check whether the saved site address matches the live website. Then check whether the snippet is installed on the published page, whether the browser loaded the script, whether the project key and site ID are correct, and whether the origin is allowed.`),


    table(
      ["Problem", "What to check"],
      [
        ["Dashboard looks empty", "Confirm the saved site origin matches the live website where the snippet is installed."],
        ["Signals do not arrive", "Confirm the snippet is present on the published page and not only in a draft or local file."],
        ["Wrong site shows activity", "Confirm the snippet uses the correct site ID and project key."],
        ["Only some pages appear", "Confirm the snippet is installed in the shared layout, not only on one page."],
        ["Activity appears under a different domain", "Check www versus non-www, app subdomains, redirects, and preview domains."],
        ["Local testing creates noise", "Use production for the main site and keep localhost testing separate."],
        ["Site selector feels confusing", "Set the correct primary site and remove old or duplicate origins if needed."]
      ]
    ),


    p(`Good site setup keeps CavBot accurate. The workspace should have one clear profile for each website origin that matters. Routes should flow into those profiles naturally. Reports should be tied to the correct site. Team members should know which site they are reviewing before they make decisions.`),


    p(`Do not rush this step. A clean site profile makes every other CavBot surface easier to trust: routes, errors, SEO, accessibility, reports, 404 recovery, Arcade, assistant context, storage references, and developer tools all become clearer when the selected site is correct.`),


    note("Core rule", "Create sites for website origins, not individual pages. Save the exact production origin, install the snippet once in the shared layout, then confirm CavBot receives signals from the live website.")
  ]
},


     {
  id: "launch-checklist",
  title: "Launch checklist",
  summary: "Confirm the workspace, site, snippet, signals, and plan before relying on CavBot.",
  blocks: [
    p(`Use this checklist before treating CavBot as active for a website. A CavBot setup is not complete just because the workspace exists or the snippet was pasted somewhere. The account, project, site profile, installed snippet, public website, signal surfaces, team access, and plan state should all point to the same place.`),

    p(`The goal is simple: confirm that CavBot is watching the correct website, receiving real activity from the live origin, and showing that activity under the right workspace. This prevents confusion later when a report looks empty, a module appears locked, a teammate reviews the wrong site, or CavAi receives the wrong context.`),

    p(`Run this checklist after the first production install, after adding a new site, after changing the primary site, after moving a website to a new domain, after updating the Analytics v5 snippet, and before inviting a wider team to rely on CavBot for review.`),

    table(
      ["Area", "What must be true"],
      [
        ["Account", "The owner can sign in and reach the correct workspace."],
        ["Workspace", "The correct project is selected and opens without an access request."],
        ["Site", "The saved site origin matches the live website visitors use."],
        ["Snippet", "Analytics v5 is installed once in the shared production layout."],
        ["Signals", "A real browser visit from the live site reaches CavBot."],
        ["Modules", "Dashboard, routes, reports, errors, SEO, accessibility, and 404 surfaces point to the same selected site."],
        ["Team", "Members understand which site is production and which role they have."],
        ["Plan", "The active plan matches the features the team expects to use."]
      ]
    ),

    p(`Start with the owner account. The owner should be able to sign in, open the workspace, reach Settings, view Billing, manage sites, and confirm the selected project. If the owner account is not stable, do not move forward with team setup yet.`),

    list([
      "Account is created.",
      "Owner can sign in.",
      "Workspace opens without an access request.",
      "Settings are reachable.",
      "Billing or plan status is visible to the correct account.",
      "The owner is not using a teammate account by mistake."
    ]),

    p(`Next, confirm the workspace and project. CavBot work should happen inside the correct project container. If the wrong project is active, the site, reports, members, keys, and signals may appear missing even though the platform is working.`),

    list([
      "The correct project is selected.",
      "The project name or workspace context matches the business or website being monitored.",
      "Old test projects are not being mistaken for production.",
      "The team knows which workspace should be used for live work."
    ]),

    p(`Then confirm the site profile. The saved site should be the clean production origin, not a page path, temporary preview link, localhost address, or campaign URL. CavBot should monitor the address real visitors use.`),

    table(
      ["Correct", "Avoid"],
      [
        ["https://example.com", "https://example.com/pricing"],
        ["https://www.example.com", "https://www.example.com/blog/article-name"],
        ["https://app.example.com", "http://localhost:3000"],
        ["https://docs.example.com", "https://preview-builder-example.vercel.app"],
        ["https://shop.example.com", "https://shop.example.com/products/item?utm_source=test"]
      ]
    ),

    list([
      "Website origin is saved as a site.",
      "The site uses the final public origin after redirects.",
      "The site does not include a path, query string, or hash.",
      "The correct subdomain is used when the app, docs, store, or portal lives separately.",
      "Primary site is selected when the workspace has more than one site.",
      "Duplicate or outdated origins are removed or clearly separated."
    ]),

    p(`After the site profile is clean, confirm the Analytics v5 snippet. The snippet should be installed once in the shared production layout or the platform’s global custom-code area. If the snippet is installed only on one page, CavBot may only see part of the website. If it is installed more than once, signals may become noisy.`),

    list([
      "Analytics v5 snippet is installed once on production pages.",
      "The snippet is placed in the shared layout or global custom-code area.",
      "Project key matches the CavBot workspace.",
      "Site ID matches the saved CavBot site.",
      "The public website origin is allowed for that key or site.",
      "The snippet is not duplicated across multiple templates unless the platform requires it.",
      "The snippet is not only installed in a draft, preview, or local environment."
    ]),

    note("Snippet check", "Open the live public website after publishing and inspect the page source or browser developer tools. The snippet must exist on the published page, not only inside the editor or local project."),

    p(`Once the snippet is installed, generate a real signal. Open the live website in a normal browser, visit a few important pages, and then return to CavBot. CavBot should begin showing the expected site activity or a clear empty state tied to the selected site.`),

    ol([
      "Publish the website after installing the snippet.",
      "Open the live public origin in a browser.",
      "Visit the homepage.",
      "Visit at least one important route such as pricing, docs, signup, dashboard, or contact.",
      "Return to CavBot.",
      "Confirm the selected site matches the website you visited.",
      "Check whether recent route or dashboard activity begins to appear."
    ]),

    p(`Then confirm the main CavBot surfaces are aligned. The dashboard, route views, reports, error views, SEO checks, accessibility checks, and 404 review surfaces should all be reading from the same selected site. If one surface appears empty, check the site selector before assuming the feature is broken.`),

    list([
      "Dashboard points to the expected site.",
      "Routes show recent or expected route context.",
      "Reports use the same selected site.",
      "Errors point to the same selected site.",
      "SEO points to the same selected site.",
      "Accessibility points to the same selected site.",
      "404 Recovery points to the same selected site.",
      "CavAi responses are based on the intended workspace and site context."
    ]),

    p(`Review plan access before relying on advanced features. Some modules, storage limits, seats, secured storage, image tools, assistant capabilities, and live install options may depend on the active plan. A locked surface does not always mean the setup failed. It may mean the current plan does not include that feature.`),

    table(
      ["Check", "Why it matters"],
      [
        ["Plan state", "Confirms which features should be available."],
        ["Seat limit", "Prevents invite errors before adding teammates."],
        ["Site limit", "Prevents confusion when adding more origins."],
        ["Storage limit", "Helps the team plan uploads and protected files."],
        ["Module access", "Explains why a dashboard surface may be locked."],
        ["Trial status", "Confirms whether the workspace is still using trial access."]
      ]
    ),

    p(`Before inviting teammates, confirm access and ownership. The owner should finish the first site setup, verify the snippet, confirm plan access, and understand the workspace state before other members begin reviewing reports or changing settings.`),

    list([
      "Team members know which site is the production site.",
      "Owner-only actions remain limited to the owner.",
      "Admins are added only when they need elevated access.",
      "Members are invited for normal workspace review or contribution.",
      "Pending invites are reviewed so seat usage stays clear.",
      "No one is sharing the owner password instead of using invites."
    ]),

    p(`If the workspace includes protected actions, review the security baseline before launch. The goal is not to slow the team down. The goal is to make sure important changes are deliberate, traceable, and limited to the right people.`),

    list([
      "Roles are clean.",
      "Primary site is set.",
      "Unknown or duplicate origins are removed.",
      "API keys are scoped to the correct site.",
      "Strict deletion is enabled where appropriate.",
      "CavVerify is available for sensitive actions when required.",
      "CavGuard blocks owner-only actions for the wrong role.",
      "Audit Trail is available for important workspace activity where the plan allows it."
    ]),

    p(`If CavBot does not show activity after setup, work through the basics before changing code. Most setup issues come from the wrong origin, a snippet that was not published, a mismatched site ID, a key pointed at the wrong project, a blocked script, or the wrong site being selected in the workspace.`),

    table(
      ["Problem", "What to check first"],
      [
        ["Dashboard is empty", "Confirm the selected site matches the live website where the snippet is installed."],
        ["No route activity appears", "Confirm a real browser visit happened after publishing."],
        ["Only one page appears", "Confirm the snippet is installed in the shared layout, not one page only."],
        ["Wrong site receives signals", "Check site ID, project key, primary site, and selected workspace."],
        ["Signals appear delayed", "Refresh the workspace and confirm the browser request was sent successfully."],
        ["A module is locked", "Check the active plan before debugging the install."],
        ["A teammate cannot access the site", "Check role, invite status, seat limit, and workspace selection."]
      ]
    ),

    p(`After the checklist passes, CavBot can be treated as active for that site. From there, continue into Website Signals for diagnostics, Integrations for platform-specific install notes, Security for protected actions, Billing for plan access, Developer Tools for CavCode and CavTools, or Assets for badges, Arcade, and other installable surfaces.`),

    note("Do not skip verification", "A snippet can be installed but still point to the wrong site, wrong project, wrong key, or unpublished environment. Always verify the live website and the CavBot workspace together."),

    note("Core rule", "Do not rely on CavBot for a site until the owner account, project, site origin, installed snippet, live browser visit, selected dashboard site, and plan state all agree.")
  ]
},

{
  id: "how-to-use-cavbot",
  title: "How to use CavBot",
  summary: "Learn the day-to-day workflow for using CavBot after a website is connected.",
  blocks: [
    p(`CavBot is used from a workspace. The workspace holds your account, projects, sites, reports, files, alerts, and the website signals CavBot receives from the installed snippet. Start by confirming that you are in the right workspace and that the correct project is selected.`),

    p(`A workspace can hold more than one project or website, so the selected context matters. Before trusting any dashboard, report, alert, or module, check that CavBot is looking at the site you actually want to review. Most confusion starts when the wrong project or wrong site is selected.`),

    p(`The most important setup choice is the site. A site is the saved origin CavBot watches, such as https://example.com. If the wrong site is selected, dashboards and reports can look empty even when another site is receiving activity.`),

    p(`The site origin should match the public website where the CavBot snippet is installed. Keep production, staging, preview, and local development origins separate. A production report should be based on the production site, not a preview URL or old staging address.`),

    p(`Use the primary site when one website should be treated as the main review target for the project. The primary site helps CavBot know which origin should be used first across workspace views, reports, and module links.`),

    ol([
      "Sign in to CavBot and open the workspace.",
      "Open the project you want to review.",
      "Go to Manage Websites and add the public website origin.",
      "Set the main production website as the primary site.",
      "Install the Analytics v5 snippet on the live website.",
      "Publish the website if your platform requires publishing.",
      "Visit the live website in a browser to create real activity.",
      "Return to CavBot and confirm the selected site is showing activity.",
      "Use the left menu to review the site by area.",
      "Fix the clearest issue first, then review the site again."
    ]),

    p(`After setup, CavBot should be used as a review system for the live website. It is not only a place to look at numbers. It is where you confirm the site being watched, review what CavBot is seeing, open the right module, and decide what needs to be fixed next.`),

    table(
      ["Area", "What to use it for"],
      [
        ["Command Center", "Review notices, manage URLs, and keep the workspace pointed at the right site."],
        ["Dashboard", "Check the broad health of the selected site."],
        ["Error Tracking", "Find JavaScript errors, API errors, and routes where problems appear."],
        ["SEO Audit", "Review page structure, titles, descriptions, canonical signals, and search basics."],
        ["Route Analytics", "See which paths visitors reach and where route activity changes."],
        ["Accessibility Check", "Review accessibility and usability signals that affect visitors."],
        ["Insights", "Turn site activity into clear next steps."],
        ["404 Recovery", "Find missing pages and decide where visitors should go instead."],
        ["Reports", "Read a structured snapshot of the selected site."],
        ["CavAi", "Ask for explanations, summaries, and plans based on the current workspace context."]
      ]
    ),

    p(`Use CavBot in this order when you are checking a website: confirm the site, check the dashboard, review routes, inspect errors, review SEO and accessibility, then look at 404 recovery. This keeps the review grounded in the website that is actually selected.`),

    p(`The Dashboard is the best place to start because it gives you the broad state of the selected site. Use it to decide where to go next. If the dashboard points to errors, open Error Tracking. If routes look unusual, open Route Analytics. If pages need cleanup, open SEO Audit or Accessibility Check.`),

    p(`Route Analytics helps you understand which paths CavBot has seen. Use it before making assumptions about a page. If a route does not appear, confirm that the page was visited, the snippet is installed on that page, and the selected CavBot site matches the live website.`),

    p(`Error Tracking should be reviewed when users may be hitting broken behavior. JavaScript errors, API errors, failed requests, and unstable routes can make a site feel unfinished even when the design looks polished. Start with errors that appear on important pages such as homepage, pricing, signup, checkout, dashboard, docs, and support routes.`),

    p(`SEO Audit should be reviewed when you want to understand how pages are described, structured, and prepared for search. Use it for titles, descriptions, canonical URLs, headings, page sections, internal links, and basic search readiness.`),

    p(`Accessibility Check should be reviewed when you want to make sure visitors can use the page clearly. Accessibility is not only a compliance task. It affects readability, navigation, trust, and whether people can understand the page without friction.`),

    p(`404 Recovery should be reviewed when missing routes appear. A 404 is not always a disaster, but repeated missing pages can waste traffic and hurt trust. Use 404 Recovery to decide whether a missing route should be redirected, rebuilt, corrected, or ignored.`),

    table(
      ["Review step", "Why it matters"],
      [
        ["Confirm selected site", "Prevents you from reading data from the wrong origin."],
        ["Check Dashboard", "Shows the broad state of the selected website."],
        ["Review Routes", "Confirms which pages CavBot has actually seen."],
        ["Inspect Errors", "Shows broken behavior that may affect visitors."],
        ["Review SEO", "Shows whether important pages are clear and properly described."],
        ["Review Accessibility", "Shows usability issues that can make the site harder to use."],
        ["Review 404 Recovery", "Shows missing routes that may need redirects or cleanup."],
        ["Open Reports", "Creates a structured view of what needs attention."],
        ["Use CavAi", "Helps explain findings and turn them into practical next steps."]
      ]
    ),

    p(`When the dashboard is empty, do not assume the product is broken first. Check the origin, selected site, snippet placement, project key, browser request, and whether the website was published after the snippet was added.`),

    table(
      ["If you see this", "Check this first"],
      [
        ["No data yet", "Make sure the selected CavBot site matches the live website where the snippet is installed."],
        ["Only one page has activity", "Confirm the snippet is installed in the shared layout or global code area."],
        ["The wrong site shows activity", "Check the primary site, selected site, and project key."],
        ["Routes stay empty", "Visit the live website after publishing and refresh CavBot."],
        ["Errors stay empty", "Confirm errors are actually happening on the live site and that the snippet is loaded."],
        ["SEO or A11y looks empty", "Confirm CavBot has received page activity for the selected site."],
        ["404 Recovery is empty", "Open a missing route on the live site or review routes after traffic appears."]
      ]
    ),

    p(`A normal CavBot review does not need to be complicated. Pick the site, read the current state, open the module connected to the issue, make one useful fix, then check CavBot again after real activity comes through.`),

    list([
      "Use one primary production site as the default review target.",
      "Keep staging, preview, and local origins separate from production.",
      "Install the snippet once in the shared site layout when possible.",
      "Review the selected site before trusting a report.",
      "Use the focused module when a dashboard card needs more detail.",
      "Invite teammates with roles that match their work.",
      "Keep billing, security, site deletion, and API keys limited to trusted owners or admins."
    ]),

    p(`The best way to use CavBot is to make one clear fix at a time. Do not jump across every module at once. Start with the issue that affects the most important page or the most important visitor path. Fix it, publish it, create real activity, then review CavBot again.`),

    table(
      ["If the issue is about", "Go here first"],
      [
        ["A page is missing or visitors hit a dead route", "404 Recovery"],
        ["A page loads but something breaks", "Error Tracking"],
        ["A page does not appear in activity", "Route Analytics"],
        ["A page has weak titles or descriptions", "SEO Audit"],
        ["A page is hard to read or use", "Accessibility Check"],
        ["You need a broad summary", "Dashboard or Reports"],
        ["You need help understanding the finding", "CavAi"]
      ]
    ),

    p(`Reports are useful when you need to share the state of a website with yourself, a teammate, a client, or a decision maker. A good report should name the selected site, show what CavBot reviewed, and make the next step clear.`),

    p(`Before sharing a report, check the selected site again. A report based on the wrong site can send the team in the wrong direction. If the report looks empty, outdated, or unrelated, return to the workspace and confirm the project, primary site, selected site, and live snippet.`),

    table(
      ["Before sharing a report", "Confirm this"],
      [
        ["Workspace", "You are inside the right account workspace."],
        ["Project", "The correct project is selected."],
        ["Site", "The selected site matches the live website being reviewed."],
        ["Origin", "The saved origin matches the public website URL."],
        ["Activity", "The site has received recent page activity."],
        ["Modules", "The report reflects the areas you actually reviewed."],
        ["Next step", "The report makes the next fix clear."]
      ]
    ),

    p(`CavAi should be used after CavBot has enough context. It can help explain what a finding means, summarize the state of a site, turn a report into a simple action plan, or help write next steps for a teammate. It should not replace checking the selected site and live page.`),

    p(`For teams, CavBot works best when each person has the right role. Owners and admins should handle billing, site deletion, API keys, security settings, and team access. Members should focus on review work, fixes, reports, and day-to-day site improvement.`),

    table(
      ["Role area", "Best handled by"],
      [
        ["Billing and plans", "Owner or trusted admin."],
        ["Team invites and removals", "Owner or admin."],
        ["Primary site changes", "Owner, admin, or the person responsible for the project."],
        ["API keys and sensitive settings", "Owner or trusted admin."],
        ["SEO fixes", "Developer, marketer, content owner, or site manager."],
        ["Error fixes", "Developer or technical owner."],
        ["Accessibility fixes", "Designer, developer, or product owner."],
        ["Reports and review notes", "Anyone responsible for site quality."]
      ]
    ),

    p(`If your site is built with a website builder or CMS, install the snippet in the global code area when possible. If your site is custom-coded, install the snippet in the shared layout so it loads across pages. If the snippet is added to only one page, CavBot may only receive activity from that page.`),

    table(
      ["Website setup", "Best placement"],
      [
        ["Website builder", "Use the global custom code or site-wide header area."],
        ["CMS", "Use the shared template, layout, or global header field."],
        ["Next.js or React app", "Use the shared root layout or app shell."],
        ["Static site", "Add the snippet to the shared HTML layout or template."],
        ["Single landing page", "Add the snippet to the live page before publishing."],
        ["Multiple domains", "Save each public origin separately in CavBot."]
      ]
    ),

    p(`After installing the snippet, publish the site and open the live website in a browser. CavBot needs live activity to review. Opening a draft, preview, editor, or local version may not create the signal you expect for the production site.`),

    list([
      "Install the snippet in the shared layout or global code area.",
      "Publish the website after adding the snippet.",
      "Open the live public website.",
      "Visit more than one important route.",
      "Return to CavBot and refresh the selected site view.",
      "Check Route Analytics if only one page appears.",
      "Check the selected site if activity appears under the wrong origin."
    ]),

    p(`When fixing issues, make the change at the source. CavBot shows what it can observe, but the fix usually happens in the website, CMS, codebase, router, metadata fields, redirect settings, page content, or deployment settings.`),

    table(
      ["Finding", "Where the fix usually happens"],
      [
        ["Missing page title", "Page metadata, CMS SEO field, or layout metadata."],
        ["Missing description", "Page description field, metadata export, or CMS SEO settings."],
        ["Wrong canonical", "Domain settings, route config, CMS canonical field, or page head tags."],
        ["Broken route", "Router, redirect settings, page file, CMS slug, or hosting configuration."],
        ["JavaScript error", "Frontend code, third-party script, component logic, or deployment build."],
        ["API error", "Backend route, auth logic, server config, database call, or external service."],
        ["Accessibility issue", "Markup, labels, contrast, keyboard behavior, or page structure."],
        ["Missing snippet", "Shared layout, global code area, or publishing step."]
      ]
    ),

    p(`Do not mark a fix complete only because it was edited. Publish the website, visit the live route, and let CavBot receive new activity. A fix is only confirmed when the live website shows the expected behavior and CavBot can collect the newer signal.`),

    p(`Use CavBot as a repeatable review loop. Check the selected site, review the current state, fix one important issue, publish the change, visit the live page, then review again. This keeps the work clean and prevents the team from chasing old or unrelated findings.`),

    table(
      ["Review loop", "What to do"],
      [
        ["Select", "Choose the correct workspace, project, and site."],
        ["Read", "Use Dashboard and Reports to understand the current state."],
        ["Open", "Go to the module connected to the issue."],
        ["Fix", "Update the live website, CMS, code, redirect, or setting."],
        ["Publish", "Push the change to the public site."],
        ["Visit", "Open the live route to create fresh activity."],
        ["Review again", "Return to CavBot and confirm the newer signal."]
      ]
    ),

    p(`If CavBot looks confusing, slow down and check the foundation first. Most issues can be traced back to selected site, origin mismatch, unpublished changes, snippet placement, stale deployment, or activity not yet reaching the selected project.`),

    table(
      ["Problem", "What to check"],
      [
        ["The dashboard is empty", "Confirm the selected site, installed snippet, live page visit, and project key."],
        ["Only some pages show activity", "Confirm the snippet is installed globally and not only on one route."],
        ["The wrong domain appears", "Check saved origins, primary site, selected site, and canonical domain."],
        ["A report looks outdated", "Publish the latest site and revisit the live pages."],
        ["Errors are missing", "Confirm the error happens on the live site while the snippet is loaded."],
        ["SEO findings look old", "Revisit the live route after publishing metadata changes."],
        ["404s do not appear", "Open a missing route on the live site and confirm the selected site is correct."],
        ["A teammate cannot access something", "Check their role, plan access, and workspace membership."]
      ]
    ),

    p(`CavBot should become part of the normal website routine. Use it after launches, redesigns, pricing changes, campaign pages, new docs, CMS edits, domain changes, checkout updates, and any release that changes important routes.`),

    table(
      ["Use CavBot after", "Reason"],
      [
        ["Launch", "Confirm the public site is being watched and important pages are visible."],
        ["Redesign", "Check routes, SEO, accessibility, and broken behavior after visual changes."],
        ["New campaign", "Review landing pages before traffic arrives."],
        ["Pricing update", "Confirm key conversion pages are still clear and stable."],
        ["Docs update", "Check structure, links, and route stability."],
        ["Domain change", "Review origins, canonical URLs, redirects, and selected site."],
        ["CMS update", "Make sure templates did not break metadata or page structure."],
        ["Product release", "Review new pages, user paths, errors, and reports."]
      ]
    ),

    note("Clean workflow", "Select the site first. Then read Dashboard, Routes, Errors, SEO, Accessibility, Insights, and 404 Recovery from that same site context."),

    note("Core rule", "Trust the selected site first. If the selected site is wrong, every module can feel wrong even when CavBot is working."),

    note("Best practice", "Fix one important issue, publish it, visit the live route, then check CavBot again. That loop keeps the review clean.")
  ]
}



    ]
  },


























  
  account: {
    path: "/docs/account",
    icon: "assets/icons/docs/account-avatar-head-svgrepo-com.svg",
    label: "Account and profile",
    
    title: "Account and profile",
    description: "Manage profile identity, sites, projects, primary site selection, notifications, and team access.",
    sections: [
     {
  id: "profile",
  title: "Profile",
  summary: "Manage account identity, public profile details, and how your name appears across CavBot.",
  blocks: [
    p(`Profile settings control the identity details attached to your CavBot account. These details help CavBot show who owns a workspace, who changed a setting, who created or edited files, who responded to activity, and which account is connected to public profile information when that feature is enabled.`),

    p(`A profile should be clear, professional, and easy to recognize. In a small workspace, profile details may feel simple. As the workspace grows, they become more important because teammates need to understand who is taking action, who owns a decision, and which account should be trusted for billing, security, file access, support, and workspace changes.`),

    p(`Profile details can include a display name, username, avatar style, company category, country, public links, and public profile visibility. Some fields are used inside the workspace. Other fields may appear publicly if the user chooses to enable a public profile route.`),

    table(
      ["Profile field", "Purpose"],
      [
        ["Display name", "Shows the name teammates can recognize inside CavBot."],
        ["Username", "Can be used for public profile routing when public visibility is enabled."],
        ["Avatar", "Helps identify the account visually across workspace surfaces."],
        ["Company category", "Helps describe the type of work, business, or organization connected to the profile."],
        ["Country", "Adds basic public or account context where the profile experience supports it."],
        ["Profile links", "Lets the user share approved public destinations such as a website, portfolio, or company page."],
        ["Public profile visibility", "Controls whether profile information can be shown outside the private workspace experience."]
      ]
    ),

    p(`Use a recognizable display name. Teammates should not have to guess which person made a change, sent an invite, edited a file, or owns a workspace decision. A clean name also helps support and billing reviews because the account identity is easier to confirm.`),

    list([
      "Use a display name teammates can recognize.",
      "Keep the name professional if the workspace represents a business.",
      "Avoid temporary nicknames for owner or admin accounts.",
      "Do not use another person’s name or company identity unless you are authorized to represent it.",
      "Update the name when account ownership or team responsibility changes."
    ]),

    p(`Choose a username carefully. If public profiles are enabled, the username can become part of the public route attached to the profile. A username should be stable, readable, and aligned with the person, brand, or company using the account.`),

    table(
      ["Good username practice", "Avoid"],
      [
        ["Use a clean name that can stay in place.", "Changing usernames repeatedly without reason."],
        ["Use the brand or personal name people already recognize.", "Using confusing abbreviations that teammates cannot identify."],
        ["Keep it readable in public contexts.", "Adding private project names, secrets, or internal labels."],
        ["Review spelling before publishing.", "Publishing a username that looks temporary or unfinished."]
      ]
    ),

    p(`Avatar settings help teammates identify an account quickly. The avatar does not replace the display name, role, or permissions, but it can make the workspace easier to scan when several people are active in the same project.`),

    p(`Public profile controls should be used with care. When public profile visibility is enabled, CavBot may show a public-facing profile at a username route. When public profile visibility is disabled, the profile can still exist inside CavBot, but public workspace profile details should not be shown to visitors.`),

    note("Public visibility", "Only enable a public profile when the name, username, avatar, links, and description are ready to be seen outside the private workspace."),

    p(`Before making a profile public, review every field as if a customer, investor, teammate, partner, or support contact could see it. Public profile text should explain who the account represents without exposing private workspace information.`),

    list([
      "Review the display name.",
      "Review the username.",
      "Review the avatar.",
      "Review profile links.",
      "Review company category and country fields.",
      "Remove private notes, internal roadmap details, customer names, secrets, or temporary project references.",
      "Confirm the profile should be visible before enabling public access."
    ]),

    p(`Profile links should point only to approved public destinations. A profile link can send visitors to a company website, portfolio, documentation site, public brand page, or another trusted destination. Do not add private dashboards, temporary preview URLs, internal files, unpublished client work, or links that should not be shared publicly.`),

    table(
      ["Link type", "Use it when"],
      [
        ["Company website", "The account represents a business or product."],
        ["Portfolio", "The user wants to show approved professional work."],
        ["Brand page", "The profile should connect to official public brand material."],
        ["Documentation", "The account supports a product, tool, or public resource."],
        ["Support page", "Visitors may need a trusted place to ask for help."]
      ]
    ),

    p(`Do not use profile fields for secrets. Profile settings are not a private notes system, password manager, legal vault, billing record, or storage area for sensitive information. Anything that should stay private should not be placed in display names, usernames, descriptions, links, or public-facing profile fields.`),

    list([
      "Do not add passwords.",
      "Do not add private keys.",
      "Do not add payment information.",
      "Do not add customer records.",
      "Do not add private legal material.",
      "Do not add internal roadmap notes.",
      "Do not add confidential workspace details.",
      "Do not add links to private files or restricted dashboards."
    ]),

    p(`Profile identity is separate from workspace permissions. A clean profile helps people recognize the account, but access still comes from roles, workspace membership, billing permissions, owner status, and security rules. Changing a profile name does not grant access to owner-only actions or protected workspace controls.`),

    table(
      ["Profile controls", "Workspace access controls"],
      [
        ["Name", "Role"],
        ["Username", "Membership"],
        ["Avatar", "Owner, admin, or member permissions"],
        ["Public links", "Billing and security access"],
        ["Public visibility", "Protected actions and file permissions"]
      ]
    ),

    p(`Use team invites for collaboration. Do not share one profile or owner login with multiple people. Shared accounts make it harder to understand who changed something, who approved an action, who moved a file, who edited a setting, or who should be contacted about an issue.`),

    p(`For owner accounts, keep the profile especially clear. The owner profile may be tied to billing, plan changes, member invites, workspace recovery, security settings, protected files, and long-term account administration. The owner account should look stable and trustworthy inside the workspace.`),

    list([
      "Use a stable owner identity.",
      "Keep owner profile links clean and current.",
      "Avoid using a temporary username for the workspace owner.",
      "Do not share the owner account with teammates.",
      "Invite admins and members through the team system instead.",
      "Review owner profile details before publishing any public profile."
    ]),

    p(`For team members, profile details should make collaboration easier. A teammate’s profile should help others understand who they are, what account they use, and whether the person is the right contact for a file, alert, report, support issue, or workspace decision.`),

    p(`If a profile looks wrong, outdated, or too public, update it before continuing with sensitive workspace work. This is especially important before inviting a larger team, publishing a public profile, contacting support, changing billing, or handling protected files.`),

    table(
      ["Situation", "What to review"],
      [
        ["New workspace", "Confirm owner name, username, avatar, and links before inviting members."],
        ["Public profile enabled", "Review every field before the profile becomes visible."],
        ["Team growth", "Make sure names and avatars help teammates recognize each other."],
        ["Support request", "Use a profile identity that support can connect to the right account."],
        ["Ownership change", "Update profile details so the new owner identity is clear."],
        ["Old links or brand changes", "Remove outdated profile links and replace them with current public destinations."]
      ]
    ),

    p(`When public profile visibility is disabled, profile information can still support internal workspace clarity. Teammates may still see account identity inside CavBot, but visitors should not receive public workspace profile details from a disabled public profile.`),

    p(`A strong profile is simple: recognizable name, clean username, appropriate avatar, current links, no private information, and public visibility only when the profile is ready to be shared.`),

    note("Privacy", "Only publish profile fields you are comfortable showing outside the private workspace. Do not use profile settings for secrets, passwords, internal notes, private customer information, or restricted files."),

    note("Core rule", "A profile identifies the account. It does not replace roles, permissions, owner controls, security checks, or audit history.")
  ]
},

     {
  id: "sites",
  title: "Sites",
  summary: "Represent the website origins CavBot monitors.",
  blocks: [
    p(`Sites are the saved website origins connected to a CavBot workspace. A site is not a single page. It is the main origin CavBot uses to organize signals, reports, routes, errors, SEO details, accessibility checks, recovery activity, installed assets, and assistant context for a specific website or web app.`),

    p(`A clean site record keeps the workspace reliable. When the site origin is correct, CavBot can connect the installed snippet, browser activity, route history, broken paths, reports, and workspace tools to the right website. When the site origin is wrong, the workspace may look empty, signals may appear under the wrong place, and reports may not match the website the team is reviewing.`),

    p(`Think of a site as the address CavBot watches. Individual pages live inside that site as routes. For example, https://example.com is a site. https://example.com/pricing, https://example.com/docs, and https://example.com/contact are routes inside that site.`),

    code("https://example.com\nhttps://www.example.com\nhttps://app.example.com"),

    table(
      ["Term", "Meaning"],
      [
        ["Site", "A saved website origin connected to the workspace."],
        ["Origin", "The protocol and domain CavBot uses, such as https://example.com."],
        ["Route", "An individual path inside a site, such as /pricing or /docs."],
        ["Primary site", "The main site CavBot should select by default when a workspace has more than one site."],
        ["Site limit", "The number of website origins allowed by the active plan."]
      ]
    ),

    p(`Use the exact public origin visitors use in production. If your website redirects from www to non-www, save the final public origin. If your app, docs, storefront, and marketing site live on different subdomains, add them as separate sites only when the team needs to review them separately.`),

    list([
      "Use https:// whenever the public website supports it.",
      "Save the origin only, not an individual page path.",
      "Do not include /pricing, /blog, /checkout, /docs, /404, or any other route in the site field.",
      "Do not include tracking parameters or query strings.",
      "Do not save temporary preview URLs as production sites unless the workspace is meant to monitor that environment.",
      "Use separate sites for separate subdomains when they need separate review.",
      "Set a primary site when the workspace has more than one saved origin."
    ]),

    p(`The site record is used across CavBot. Dashboards use it to show the selected website. Reports use it to describe the correct origin. The browser snippet uses it to attach incoming activity to the right workspace. Recovery tools use it to understand where broken routes are happening. The assistant uses it so answers are grounded in the right website context.`),

    table(
      ["Workspace area", "How the site record is used"],
      [
        ["Dashboard", "Shows activity and status for the selected website."],
        ["Routes", "Groups visited paths under the correct origin."],
        ["Errors", "Connects browser and runtime issues to the right site."],
        ["SEO", "Keeps page metadata and structure checks attached to the correct website."],
        ["Accessibility", "Organizes accessibility findings by selected site."],
        ["Reports", "Builds exports and summaries around the current site context."],
        ["404 Recovery", "Shows missing routes and recovery activity for the selected origin."],
        ["Arcade installs", "Connects public recovery installs to the right website."],
        ["CavAi", "Uses the selected site as context when explaining workspace activity."]
      ]
    ),

    p(`Owners and admins can add sites when the active plan allows it. CavBot should validate and normalize the origin before saving it so the workspace does not end up with duplicate, malformed, or unclear site records.`),

    p(`Plan limits control how many sites a workspace can save. The current plan should be reviewed before adding more origins, especially when a team is managing a marketing site, app subdomain, docs site, storefront, staging environment, and customer-facing support area.`),

    table(
      ["Plan", "Website limit"],
      [
        ["CavTower", "1 website"],
        ["CavControl", "6 websites"],
        ["CavElite", "20 websites"]
      ]
    ),

    note("Plan limits", "If a workspace reaches its website limit, remove unused origins, upgrade the plan, or decide which sites truly need active CavBot monitoring."),

    p(`Use one site record for each website origin that needs its own review. Do not create a new site for every page. A single production origin can contain hundreds or thousands of routes, and those routes should remain grouped under the same site.`),

    table(
      ["Use Sites for", "Use Routes for"],
      [
        ["Production domains", "Pricing pages"],
        ["App subdomains", "Blog posts"],
        ["Docs subdomains", "Checkout pages"],
        ["Storefront origins", "Product pages"],
        ["Staging or preview environments when needed", "404 paths"],
        ["Separate client or project websites", "Dashboard paths inside the same app"]
      ]
    ),

    p(`The primary site is the default site CavBot should open when a workspace has more than one origin. Set the primary site to the website the team reviews most often. This helps dashboards, reports, tools, and assistant context start from the right place instead of forcing the user to reselect the same site repeatedly.`),

    list([
      "Set the production website as the primary site when it is the main monitored origin.",
      "Use a separate primary site only when the app or dashboard is more important than the marketing site.",
      "Update the primary site after a domain migration.",
      "Confirm the primary site after removing an old origin.",
      "Make sure teammates know which saved site represents production."
    ]),

    p(`When adding a new site, save the origin first, then install the CavBot snippet for that site, then publish the website, then visit the live page in a browser. After that, return to CavBot and confirm the workspace shows the expected activity for the selected site.`),

    ol([
      "Add the public website origin as a site.",
      "Confirm the saved origin matches the real public website.",
      "Install the Analytics v5 snippet for that project and site.",
      "Publish the website after the snippet is added.",
      "Open the public website in a real browser.",
      "Return to CavBot and select the same site.",
      "Confirm that the dashboard, routes, and signal surfaces point to the expected origin."
    ]),

    p(`The installed snippet, project key, site ID, and saved site origin must agree. If one of those values points to a different workspace, site, or environment, CavBot may receive activity but attach it somewhere unexpected, or it may reject the request.`),

    table(
      ["Item", "What to confirm"],
      [
        ["Saved origin", "The site in CavBot matches the live website origin."],
        ["Project key", "The snippet uses the key for the correct workspace project."],
        ["Site ID", "The snippet points to the selected CavBot site."],
        ["Public page source", "The snippet appears on the live published website."],
        ["Origin allowlist", "The website origin is approved for the key or workspace policy."],
        ["Selected site", "The dashboard is viewing the same site you installed."]
      ]
    ),

    note("Developer check", "If the snippet is installed but no activity appears, compare the saved CavBot site origin, the public website origin, the snippet site ID, and the project key before changing anything else."),

    p(`Use separate sites for subdomains when the team needs separate reporting or operational review. For example, a marketing website and an application dashboard may deserve separate site records because they have different routes, different users, different errors, and different recovery patterns.`),

    table(
      ["Example", "Recommended setup"],
      [
        ["https://example.com", "Use one site for the main marketing website."],
        ["https://app.example.com", "Use a separate site for the logged-in app when it needs separate monitoring."],
        ["https://docs.example.com", "Use a separate site when docs need their own route, SEO, and search review."],
        ["https://shop.example.com", "Use a separate site when the storefront has its own traffic and checkout flow."],
        ["https://staging.example.com", "Use a separate site only if staging needs active monitoring."],
        ["https://example.com/pricing", "Do not create a separate site. This is a route inside the main site."]
      ]
    ),

    p(`Clean site records also make team work easier. When names, origins, and primary site settings are clear, teammates can understand which website they are reviewing, which origin is production, and where a signal belongs. This matters when the workspace contains multiple sites or when several people are reviewing reports at the same time.`),

    list([
      "Name sites clearly when the workspace has multiple origins.",
      "Keep production, staging, and preview origins easy to distinguish.",
      "Remove stale test origins when they no longer need monitoring.",
      "Avoid keeping duplicate records for the same public website.",
      "Review site records after a domain change, migration, rebrand, or platform move.",
      "Confirm the selected site before reviewing reports or making decisions."
    ]),

    p(`Removing a site should be deliberate. A removed site may no longer appear in normal workspace selection, and new activity from that origin may stop matching the expected workspace setup. Before removing a site, confirm that the team no longer needs its reports, route history, install context, recovery setup, or active monitoring.`),

    table(
      ["Before removing a site", "Why it matters"],
      [
        ["Confirm it is not the production origin", "Avoid removing the main website by mistake."],
        ["Check whether the snippet is still installed", "A live snippet may continue sending requests from that origin."],
        ["Review reports and history", "The team may still need past context."],
        ["Check Arcade or badge installs", "Public assets may still be connected to that site."],
        ["Confirm team ownership", "Another teammate may still rely on the saved site."],
        ["Update the primary site if needed", "The workspace should still open to the correct default origin."]
      ]
    ),

    p(`If a site looks empty, do not assume CavBot is broken. Empty site state can happen when the snippet is missing, the site has not been published, the wrong origin was saved, the selected site is not the installed site, the browser visit has not happened yet, or the plan does not include the module being reviewed.`),

    table(
      ["Problem", "What to check"],
      [
        ["No activity appears", "Confirm the snippet is installed on the live public site and a real browser visit happened after publishing."],
        ["Activity appears under the wrong site", "Check the snippet site ID and saved origin."],
        ["Reports show the wrong website", "Confirm the selected site and primary site settings."],
        ["404 data looks unrelated", "Check whether the missing routes belong to another saved origin."],
        ["A module looks locked", "Review the workspace plan and module access."],
        ["Site cannot be added", "Check plan limits, duplicate origins, and whether the origin format is valid."]
      ]
    ),

    p(`A strong Sites setup is simple: save the correct production origin, install the matching snippet once, verify live activity, set the primary site, remove stale origins, and keep each site record aligned with the real website it represents.`),

    note("Core rule", "Sites are for website origins. Routes are for pages inside those origins. Keep that separation clean so CavBot can organize signals, reports, recovery, and workspace context correctly.")
  ]
},

{
  id: "top-site",
  title: "Top site",
  summary: "Choose the primary website CavBot opens first.",
  blocks: [
    p(`Top site is the primary website for a workspace project. It is the site CavBot should open first when the workspace loads and the site CavBot should use as the default context for dashboards, reports, routes, alerts, recovery review, and assistant summaries.`),

    p(`A workspace can contain more than one site. For example, a team may connect a marketing website, an app domain, a documentation site, a storefront, a staging environment, and a preview environment. Top site tells CavBot which one matters most by default.`),

    p(`Choose the website your team reviews most often. In most cases, this should be the public customer-facing production origin. That is usually the website where broken routes, visitor activity, SEO structure, accessibility checks, recovery flows, reports, and operational review matter the most.`),

    table(
      ["Workspace setup", "Recommended Top site"],
      [
        ["One production website", "Use the production website."],
        ["Marketing site and app domain", "Use the one your team reviews most often."],
        ["Public site and staging site", "Use the public production site."],
        ["Storefront and marketing site", "Use the site where customer activity matters most."],
        ["Development-only workspace", "Use the main development or QA origin."],
        ["Client workspace", "Use the client’s active public website."]
      ]
    ),

    p(`Top site does not delete or disable the other sites in the workspace. It only decides which site should be treated as the default. Other saved sites can still be opened, reviewed, monitored, and used when the team selects them.`),

    p(`The right Top site keeps the workspace focused. It prevents the dashboard from opening on a staging site by mistake, keeps reports pointed at the most important website, and helps teammates start from the same operating context when they open CavBot.`),

    list([
      "Use the main production website when the workspace monitors a live business site.",
      "Use the app domain when the product dashboard matters more than the marketing website.",
      "Use the storefront when checkout and customer paths are the highest priority.",
      "Use the docs site when documentation quality is the main focus of the workspace.",
      "Use a staging or preview site only when the workspace exists for testing or QA.",
      "Update Top site after a domain migration, rebrand, platform move, or major site restructure."
    ]),

    p(`Top site is especially important when the workspace has similar origins. A team may have https://example.com, https://www.example.com, https://app.example.com, and https://staging.example.com saved at the same time. Without a clear Top site, teammates may review the wrong origin and think CavBot is missing signals or showing the wrong reports.`),

    table(
      ["Top site affects", "Why it matters"],
      [
        ["First workspace view", "CavBot can open the most important site first."],
        ["Dashboard context", "The main view starts with the right website."],
        ["Reports", "Exports and summaries are easier to understand when they begin from the correct site."],
        ["Assistant context", "CavAi can explain activity for the website the team actually cares about."],
        ["Team review", "Members are less likely to inspect staging when they meant to inspect production."],
        ["Operational focus", "The workspace stays centered on the website that matters most."]
      ]
    ),

    p(`Do not choose a temporary preview URL as Top site unless that preview environment is the main purpose of the workspace. Preview URLs often change, expire, or represent unfinished work. If a preview URL becomes the default by mistake, the workspace may feel empty or misleading when the team expects production activity.`),

    p(`When adding new sites, review the Top site setting after the new origin is saved. A newly added site should not automatically become the most important site unless the team intentionally wants that change.`),

    ol([
      "Open the workspace Sites area.",
      "Review the saved origins.",
      "Confirm which origin is the main production or operating site.",
      "Set that origin as Top site.",
      "Open the dashboard and confirm it starts on the correct site.",
      "Check reports and key modules to confirm they use the expected site context.",
      "Tell teammates which site is the primary site for the workspace."
    ]),

    p(`Change Top site when the main operating focus changes. This can happen after a domain migration, launch, product pivot, app restructure, storefront launch, client handoff, or when the team decides that a different origin should become the default review surface.`),

    table(
      ["Change Top site when", "Example"],
      [
        ["The production domain changes", "The business moves from olddomain.com to newdomain.com."],
        ["The app becomes the main focus", "The team reviews app.example.com more than the marketing site."],
        ["A storefront launches", "The team wants shop.example.com to become the main monitored site."],
        ["A staging workspace becomes production", "A tested origin becomes the live customer-facing site."],
        ["A client handoff happens", "The client’s live domain becomes the main workspace focus."],
        ["An old origin is retired", "The previous Top site is no longer used."]
      ]
    ),

    p(`If the wrong Top site is selected, CavBot may still work, but the workspace can feel confusing. The dashboard may open on the wrong origin, teammates may review the wrong reports, and the assistant may summarize activity from a site that is not the team’s current priority.`),

    table(
      ["Problem", "What to check"],
      [
        ["Dashboard opens on the wrong website", "Confirm the Top site is set to the intended origin."],
        ["Reports appear to reference the wrong site", "Check the selected site and Top site setting."],
        ["Team members keep reviewing staging", "Set the public production site as Top site and label staging clearly."],
        ["CavAi answers feel out of context", "Confirm the selected site and Top site match the website being discussed."],
        ["A removed site was the Top site", "Choose a new Top site after removing an old origin."],
        ["A new domain launched", "Update Top site to the new production origin."]
      ]
    ),

    p(`For teams, Top site should be treated as a workspace baseline. It should be obvious which website is production, which sites are secondary, and which origin CavBot should open first. This keeps reviews cleaner and reduces mistakes when multiple people are using the same workspace.`),

    list([
      "Label production, staging, app, docs, and storefront sites clearly.",
      "Keep the public production origin as Top site unless there is a clear reason not to.",
      "Review Top site after adding or removing sites.",
      "Review Top site after changing domains.",
      "Do not use a temporary preview URL as Top site for a long-term workspace.",
      "Make sure teammates understand which site is the main workspace context."
    ]),

    p(`Top site is a small setting, but it has a large effect on how CavBot feels day to day. A clean Top site makes the workspace open in the right place, keeps reports easier to trust, and helps the team review the website that matters most without extra steps.`),

    note("Recommended", "Use the public customer-facing production origin as Top site. Change it only when the workspace’s main operating focus changes."),

    note("Core rule", "Top site is the default website for the workspace. It should point to the origin your team needs to review first, most often, and with the least confusion.")
  ]
},

     {
  id: "notifications",
  title: "Notifications",
  summary: "Review workspace updates, notices, and actions that need attention.",
  blocks: [
    p(`Notifications are the workspace update center inside CavBot. They help owners, admins, and members see important activity without having to search through every module manually. Use notifications to understand what changed, what needs review, and whether a recent action completed successfully.`),

    p(`A notification can point to many kinds of workspace activity. It may relate to account access, team invites, storage usage, plan limits, security checks, files, protected actions, system notices, or product updates. The purpose is to keep important workspace information visible before it becomes a larger issue.`),

    p(`Notifications are not a replacement for audit history, billing records, reports, or the focused module where the work happened. They are the first place to look when you need a quick operating update. If a notification points to a deeper issue, open the related area and review the full context there.`),

    table(
      ["Notification type", "What it helps you understand"],
      [
        ["Unread notices", "Items the workspace has not reviewed yet."],
        ["Invite updates", "Team invitation activity that may need owner or admin attention."],
        ["Storage notices", "CavCloud or CavSafe usage approaching a limit."],
        ["Plan notices", "Feature access, plan limits, upgrade state, or downgrade impact."],
        ["Security notices", "Protected actions, verification checks, or sensitive workspace events."],
        ["System updates", "CavBot service or product messages that may affect the workspace."]
      ]
    ),

    p(`Open notifications when something in the workspace feels different. A module may be locked because of plan access. A storage action may fail because the workspace is near a limit. An invite may not appear because the seat limit was reached. A protected action may require review because CavGuard or CavVerify is involved. Notifications can help explain those moments quickly.`),

    list([
      "Check notifications after changing a plan, billing cycle, or workspace access.",
      "Check notifications after inviting, removing, or changing a teammate’s role.",
      "Check notifications before uploading large files or moving protected files.",
      "Check notifications when a module appears locked or unavailable.",
      "Check notifications when a workspace action does not behave as expected.",
      "Check notifications before deleting assets, changing settings, or making security-sensitive updates."
    ]),

    p(`Notifications are especially useful for storage. When CavCloud or CavSafe approaches a plan limit, the workspace should know before uploads fail or protected storage becomes harder to manage. Review storage notices before uploading large projects, image sets, videos, exported site bundles, archives, or generated files.`),

    p(`Notifications also help teams understand access-related changes. If a teammate is invited, removed, blocked by a seat limit, or unable to access the expected workspace, notifications can provide useful context before the owner or admin changes settings.`),

    table(
      ["Before you act", "Why notifications matter"],
      [
        ["Before inviting teammates", "You can review seat limits, pending invites, and recent access notices."],
        ["Before changing a plan", "You can see whether the workspace is already near a plan limit."],
        ["Before deleting files", "You can check whether storage or security notices mention the affected area."],
        ["Before changing security settings", "You can review recent protected-action notices."],
        ["Before troubleshooting a locked module", "You can check whether plan state or access changed recently."]
      ]
    ),

    p(`Unread notifications should be treated as items that still need review. They do not always require action, but they should not be ignored when the workspace is being actively managed. A clean unread count makes it easier to notice new issues when they appear.`),

    p(`Use the read-all action only after the team has reviewed the items that matter. Marking everything as read can make the workspace feel cleaner, but it can also hide useful context if the team has not actually looked at recent changes.`),

    list([
      "Review unread notifications before clearing them.",
      "Do not clear notices only to hide a problem.",
      "Keep storage and plan notices visible until the team understands the impact.",
      "Use read-all after the team has already reviewed the important items.",
      "Return to the related module when a notification needs deeper investigation."
    ]),

    p(`Notifications can help confirm that a workspace action completed. For example, after a site is added, a file is moved, a notice is recorded, a plan changes, or a storage threshold is reached, the notification area may provide a quick confirmation that CavBot recognized the event.`),

    p(`Some notifications are informational. Others are warnings. A warning does not always mean something is broken. It may simply mean the workspace is close to a limit, a protected action needs more care, or the team should review a change before continuing.`),

    table(
      ["Message tone", "How to treat it"],
      [
        ["Informational", "Read it, confirm the context, and continue if nothing needs action."],
        ["Success", "Use it as confirmation that an action completed."],
        ["Warning", "Review the related setting, limit, file, site, or role before continuing."],
        ["Security-related", "Check the actor, action, workspace, and affected area carefully."],
        ["Storage-related", "Review usage before uploading, moving, restoring, or publishing more files."]
      ]
    ),

    p(`When troubleshooting, start with the notification, then open the related surface. If the notice mentions storage, open CavCloud or CavSafe. If it mentions a plan or locked feature, open Billing or Plans. If it mentions access, open Team or Settings. If it mentions a protected action, review Security, CavGuard, CavVerify, and Audit Trail as needed.`),

    p(`For teams, notifications create a shared sense of what recently happened. They help reduce confusion when one person changes a setting, another person sees a locked feature, and a third person is trying to understand why something no longer behaves the same way.`),

    p(`For solo builders, notifications help you move faster without losing track of important changes. You can see recent workspace activity, confirm that an action completed, and catch limits before they interrupt your work.`),

    table(
      ["Problem", "What to check"],
      [
        ["A module is locked", "Review plan notices and confirm the active plan allows the module."],
        ["A file upload fails", "Review storage notices and check CavCloud or CavSafe usage."],
        ["A teammate cannot join", "Review seat limits, invite notices, and pending invites."],
        ["An action did not complete", "Check whether a success, warning, or error notice was recorded."],
        ["A protected action is blocked", "Review security notices and confirm role, verification, and workspace context."],
        ["Unread count keeps returning", "Open the latest notices and confirm whether new events are being created."]
      ]
    ),

    p(`Notifications should stay useful and readable. They should not become a place for noise. The best notifications are clear, timely, and tied to actions that actually matter: access, storage, billing, security, site setup, file movement, protected workflows, and service updates.`),

    note("Best practice", "Review notifications before making changes that affect access, storage, billing, protected files, or workspace settings."),

    note("Core rule", "Notifications are the first operating signal. Use them to understand what changed, then open the related CavBot surface when the issue needs deeper review.")
  ]
},

     {
  id: "team-access",
  title: "Team access",
  summary: "Invite members, assign roles, and keep workspace access under control.",
  blocks: [
    p(`Team access controls who can enter a CavBot workspace and what each person is allowed to do once they are inside. It should be set up carefully because workspace access can affect sites, files, billing, security settings, API keys, reports, diagnostics, and protected actions.`),

    p(`Every teammate should have their own account. Do not share one owner login across a team. Shared logins make it harder to understand who changed a setting, who accepted an invite, who moved a file, who rotated a key, or who performed a protected action. A clean team setup keeps responsibility clear.`),

    p(`CavBot uses roles to separate ownership, administration, and everyday workspace work. The role assigned to a teammate should match the work they actually need to do. A person who only needs to review dashboards should not receive the same access as the person responsible for billing, API keys, security, and member management.`),

    p(`Use the lowest role that still allows the teammate to complete their work. This protects the workspace from accidental billing changes, site deletion, exposed keys, unnecessary security changes, and access mistakes. Strong access control is not about slowing the team down. It is about making important actions deliberate.`),

    table(
      ["Role", "What it is for"],
      [
        ["Owner", "The main workspace authority. The owner controls billing, plan changes, security settings, role management, API keys, sensitive workspace controls, and full workspace ownership."],
        ["Admin", "A trusted operator role for setup and day-to-day management. Admins can help manage sites, diagnostics, invites, workspace modules, and operational settings, but should not replace owner control."],
        ["Member", "Standard workspace access for teammates who need to review dashboards, routes, reports, files, or website signals without managing billing, security, roles, or critical controls."]
      ]
    ),

    p(`The owner role should be kept limited. A workspace should usually have one clear owner, or only a very small number of owner-level users when the business requires it. Owner access should be reserved for people trusted to control the account, billing, plan state, security posture, and long-term workspace direction.`),

    p(`Admins should be trusted users who help run the workspace. They may need to add sites, review diagnostics, manage setup details, invite members, or help maintain the workspace. Admin access should still be reviewed regularly because it can affect important workspace behavior.`),

    p(`Members are the best role for most teammates. A member can participate in the workspace without receiving control over billing, security, keys, role changes, or owner-only actions. Use Member when the person needs visibility and collaboration, not full control.`),

    table(
      ["Access area", "Owner", "Admin", "Member"],
      [
        ["Billing and plan changes", "Full control", "Limited or no control depending on product rules", "No control"],
        ["Team roles and owner-level access", "Full control", "Limited invite or member management where allowed", "No control"],
        ["API keys and sensitive settings", "Full control", "Operational access where allowed", "No control"],
        ["Sites and workspace setup", "Full control", "Can help manage setup where allowed", "View or limited access depending on workspace rules"],
        ["Dashboards and reports", "Full access", "Full operational access", "Standard access"],
        ["Protected actions", "Allowed when policy permits", "May require CavGuard or CavVerify", "Restricted or blocked when action is not part of the role"]
      ]
    ),

    p(`Invites should be sent intentionally. Before inviting someone, confirm which workspace they should join, what role they need, and whether the plan has enough seats. A teammate should not be invited into the wrong workspace just because the email was available or because a project was selected by mistake.`),

    p(`An invitation may be pending, accepted, declined, revoked, or expired. Pending invites should be reviewed because they can still affect how the team thinks about access. A person who has not accepted yet may not be active in the workspace, but their invite should still be treated as part of the access review.`),

    table(
      ["Invite state", "Meaning"],
      [
        ["Pending", "The invite was sent, but the person has not accepted it yet."],
        ["Accepted", "The person joined the workspace and now has access based on their assigned role."],
        ["Declined", "The invite was not accepted."],
        ["Revoked", "The invite was canceled before access was granted."],
        ["Expired", "The invite can no longer be used and should be resent if access is still needed."]
      ]
    ),

    p(`Seat limits come from the active plan. A seat represents a person who can belong to the workspace. Members and pending invites should be reviewed before adding more people so the workspace does not reach a limit unexpectedly.`),

    table(
      ["Plan", "Seat limit"],
      [
        ["Free", "4 seats"],
        ["Premium", "8 seats"],
        ["Premium+", "16 seats"]
      ]
    ),

    p(`If a team reaches the seat limit, CavBot may block the invite until a seat is available or the plan is changed. In that case, review current members, remove users who no longer need access, revoke stale invites, or upgrade the plan if the team has outgrown the current limit.`),

    list([
      "Invite each teammate with their own email address.",
      "Choose the lowest role that gives the person enough access to do their work.",
      "Keep owner access limited to trusted workspace leaders.",
      "Use Admin for trusted operators who help manage the workspace.",
      "Use Member for standard dashboard, report, and workspace review.",
      "Review pending invites before adding more teammates.",
      "Remove users who no longer need access.",
      "Revoke old invites that were never accepted."
    ]),

    p(`Review team access after major workspace changes. This includes plan changes, new production sites, new billing ownership, security updates, API key rotation, storage changes, company staffing changes, or any moment where a teammate’s role no longer matches their responsibilities.`),

    p(`Team access also matters during security review. If a protected action is blocked, check the user’s role, workspace, account, plan, selected site, and whether CavGuard or CavVerify is required. A blocked action may not mean the app is broken. It may mean the user is trying to perform an action their role should not allow.`),

    table(
      ["Problem", "What to check"],
      [
        ["Invite cannot be sent", "Check the plan seat limit, pending invites, and whether the current user has permission to invite members."],
        ["Teammate cannot access the workspace", "Confirm the invite was accepted, the correct email was used, and the user is signing in with the invited account."],
        ["Wrong role was assigned", "Have the owner or authorized admin update the role if the change is allowed."],
        ["Protected action is blocked", "Review the user’s role, plan access, workspace context, CavGuard decision, and CavVerify requirement."],
        ["Seat limit reached", "Remove inactive members, revoke unused invites, or move to a plan with more seats."],
        ["Former teammate still appears", "Remove the member or revoke the invite so the access list stays clean."]
      ]
    ),

    p(`A clean access list helps the whole workspace. Owners can see who has control. Admins can manage work without guessing. Members can review the areas they need without touching sensitive settings. Support and security reviews become easier because each action is tied to a real user and a clear role.`),

    p(`Do not leave old access in place out of convenience. If a contractor, employee, collaborator, or temporary tester no longer needs the workspace, remove their access. If a pending invite is no longer needed, revoke it. Access should reflect the team as it exists now, not the team as it existed months ago.`),

    note("Access review", "Review members and pending invites before adding more people. Keep owner access limited, use admin access carefully, and remove stale access when a person no longer needs the workspace."),

    note("Core rule", "Every teammate should have their own account, the correct role, and only the access needed for their work.")
  ]
}

    ]
  },


  workspace: {
    path: "/docs/workspace",
    icon: "assets/icons/docs/gnome-panel-workspace-switcher-svgrepo-com.svg",
    label: "Workspace",
    
    title: "Workspace",
    description: "Use the dashboard, reports, CavPad, Arcade, Command Center, and member controls from one workspace context.",
    sections: [
      {
  id: "dashboard",
  title: "Dashboard",
  summary: "Review the selected site, workspace state, and next actions.",
  blocks: [
    p(`The Dashboard is the first operating view for a CavBot workspace. It gives the owner, admin, or team member a clear starting point for the selected project and site before they open deeper tools. Use it to confirm what CavBot is looking at, what the workspace can access, what needs attention, and which area should be reviewed next.`),

    p(`The most important rule is simple: always confirm the selected site first. CavBot work is tied to a project and a website origin. If the wrong site is selected, the rest of the workspace may appear empty, outdated, locked, or unrelated to the website you meant to review.`),

    p(`A clean Dashboard should answer the first questions a team asks when opening CavBot: Which project is active? Which site is selected? Is the site connected? Is the plan correct? Are the right modules available? Are there storage notices? Are there unread workspace notifications? Is there anything that needs review before the team continues?`),

    p(`The Dashboard should be treated as the entry point, not the final diagnosis. It helps you understand the current workspace state, but deeper investigation should happen inside the focused surface that owns the signal. If the Dashboard points to broken routes, open 404 Recovery. If it points to browser errors, open Errors. If it points to search structure, open SEO. If it points to accessibility, open Accessibility. If it points to reports, open Reports.`),

    table(
      ["Dashboard area", "What to confirm"],
      [
        ["Project", "Confirm the workspace project is the one you intended to open."],
        ["Selected site", "Confirm the website origin matches the public site you want to review."],
        ["Plan state", "Confirm the active plan supports the modules, seats, storage, and site count you expect."],
        ["Module access", "Check which areas are available and which are locked by plan limits."],
        ["Storage", "Review CavCloud and CavSafe usage before uploading large files or project folders."],
        ["Notifications", "Look for workspace notices that explain recent changes, limits, warnings, or completed actions."],
        ["Guardrails", "Confirm the workspace protection settings match the level of control the team needs."]
      ]
    ),

    p(`When the Dashboard looks empty, do not assume the product is broken. Empty data usually means CavBot has not received the right signal yet, the selected site is not the one receiving traffic, the snippet was installed on a different origin, the site has not been published after installation, or no real public browser visit has happened since setup.`),

    p(`Start troubleshooting from the top of the chain. First, confirm the selected project. Then confirm the selected site. Then confirm the saved origin is correct. Then confirm the snippet exists on the live public page. Then visit the site in a real browser. After that, return to CavBot and review whether the Dashboard begins showing recent activity or a more useful empty state.`),

    table(
      ["If the Dashboard looks empty", "What to check"],
      [
        ["Wrong selected site", "Switch to the site that matches the live origin where the snippet is installed."],
        ["Wrong origin saved", "Confirm the saved site is the final public origin, not a path, preview link, or old domain."],
        ["Snippet missing", "Open the live page source and confirm the Analytics v5 snippet is present."],
        ["Snippet installed twice", "Remove duplicate installs so signals do not become noisy or confusing."],
        ["No public visit yet", "Visit the live site in a normal browser after publishing."],
        ["Plan module locked", "Check whether the current plan includes the module you are trying to review."],
        ["Staging selected by mistake", "Use the production site as the main selected site unless the workspace is for testing."]
      ]
    ),

    p(`The Dashboard also helps prevent confusion when a workspace has more than one site. A business may have a marketing site, app domain, documentation site, storefront, staging origin, and preview environment. CavBot treats each saved origin as a separate site context when it is added to the workspace. The Dashboard helps you stay aware of which one is currently active.`),

    p(`If the workspace has multiple sites, set the most important production website as the Top site. The Top site should be the site the team reviews most often. This keeps the Dashboard, reports, and assistant context focused on the main operating website instead of opening on a test origin or less important environment.`),

    list([
      "Confirm the selected project before reviewing any signal.",
      "Confirm the selected site before trusting dashboard data.",
      "Use the public production origin as the main site whenever possible.",
      "Set the Top site when the workspace has more than one saved origin.",
      "Keep staging, preview, and test sites clearly separated from production.",
      "Remove stale origins when they no longer need monitoring."
    ]),

    p(`Plan and module access should also be reviewed from the Dashboard. Some workspace areas may be available on one plan and locked on another. A locked module does not always mean something failed. It may mean the current plan does not include that surface, the trial ended, the workspace was downgraded, or the account is signed into a different workspace than expected.`),

    p(`Storage notices should be reviewed before uploading large folders, images, videos, exported site bundles, code archives, or protected files. If storage is close to the limit, clean up unused files, move protected files into the correct area, empty trash where available, or review the plan before continuing.`),

    table(
      ["Notice type", "Why it matters"],
      [
        ["Plan notice", "Explains whether features, seats, storage, or modules are limited by the current plan."],
        ["Storage notice", "Warns when CavCloud or CavSafe usage may affect uploads, file moves, or protected storage."],
        ["Site notice", "Helps identify setup, origin, snippet, or selected-site issues."],
        ["Security notice", "Points to protected actions, role limits, verification, or guardrail decisions."],
        ["Team notice", "Helps owners review invites, seat limits, role changes, or access issues."],
        ["System notice", "Shows product state, service updates, or workspace-level messages that may affect usage."]
      ]
    ),

    p(`Use the Dashboard at the start of every serious review. Before changing settings, rotating keys, inviting teammates, installing snippets, uploading files, or publishing a fix, open the Dashboard and confirm that the workspace context is correct. A few seconds of confirmation can prevent work from being done against the wrong site or project.`),

    p(`The Dashboard is especially important after setup changes. Recheck it after adding a site, changing the Top site, updating the snippet, changing plans, inviting teammates, moving files, enabling protected storage, adjusting risk controls, or publishing a new version of the website.`),

    table(
      ["After this change", "Return to the Dashboard to confirm"],
      [
        ["New site added", "The new origin appears and can be selected."],
        ["Top site changed", "The workspace opens on the intended primary site."],
        ["Snippet installed", "The selected site begins receiving activity after a real public visit."],
        ["Plan changed", "Module access, seat limits, and storage limits match the new plan."],
        ["Team member invited", "The invite appears in the team or notification flow where available."],
        ["Storage updated", "Usage reflects the files that were uploaded, moved, restored, or removed."],
        ["Security settings changed", "Guardrails and protected-action behavior match the owner’s intent."]
      ]
    ),

    p(`When a Dashboard card points to a concern, open the focused module instead of guessing from the card alone. The Dashboard is designed to show direction. The focused modules are where the source details live.`),

    table(
      ["Dashboard points to", "Open this next"],
      [
        ["Broken or missing routes", "404 Recovery"],
        ["Browser errors or failed requests", "Errors"],
        ["Search structure or metadata concerns", "SEO"],
        ["Accessibility concerns", "Accessibility"],
        ["Reports or executive review", "Reports"],
        ["Storage usage or file activity", "CavCloud or CavSafe"],
        ["Protected actions or blocked workflows", "Security, CavGuard, or Audit Trail"],
        ["Setup or snippet concerns", "Integrations and Analytics v5"]
      ]
    ),

    p(`A strong Dashboard review follows the same pattern each time: confirm the project, confirm the site, read notices, check plan and module access, review storage, inspect any warning or empty state, then open the focused module that owns the issue. This keeps the workflow calm and prevents the team from jumping into fixes before understanding the workspace state.`),

    list([
      "Confirm the active project.",
      "Confirm the selected site.",
      "Check whether the site is production, staging, preview, or test.",
      "Review plan access and locked modules.",
      "Review storage usage and workspace notices.",
      "Check whether signals are present or whether the page is still waiting for activity.",
      "Open the focused module for the issue you want to inspect.",
      "Verify the source signal before making production changes."
    ]),

    p(`For owners, the Dashboard is the main health check for the workspace. It shows whether the business has the right plan, the right site context, the right storage posture, and the right operating surfaces available.`),

    p(`For admins, the Dashboard is the coordination point. It helps confirm setup, review notices, check selected-site state, and move into the right module for investigation.`),

    p(`For members, the Dashboard is the safest starting view. It gives enough context to understand what the workspace is showing without requiring access to billing, security settings, API keys, or owner-only controls.`),

    p(`The Dashboard should make CavBot feel understandable before it feels deep. It should not force users to guess where to begin. A user should be able to open it, understand the selected site, see the workspace state, and know which surface to open next.`),

    note("Best practice", "Start every review from the Dashboard, but verify important findings inside the focused module before changing production, billing, access, files, or security settings."),

    note("Core rule", "The Dashboard tells you where to look. The focused modules show what happened.")
  ]
},

     {
  id: "reports",
  title: "Reports",
  summary: "Create focused summaries for site review, team updates, and follow-up work.",
  blocks: [
    p(`Reports turn CavBot workspace activity into reviewable summaries. Use them when you need a clear view of what is happening on a selected site without opening every module one by one. A report should help the team understand the current state, what changed, what needs attention, and where to look next.`),

    p(`A report is a snapshot. It reflects what CavBot can see at the time the report is created, based on the selected project, selected site, available signals, active plan, and connected modules. It should be used for review, explanation, handoff, and planning. It should not be treated as the only source of truth for a production fix.`),

    p(`Reports are most useful when a team needs to share the state of a site with someone who does not want to inspect every dashboard surface manually. This can include a founder review, client update, QA handoff, release review, support investigation, investor check-in, or internal weekly summary.`),

    table(
      ["Use Reports for", "Why it helps"],
      [
        ["Team updates", "Give the team a readable summary of site activity and current concerns."],
        ["Founder reviews", "Review what needs attention without opening every module manually."],
        ["Client check-ins", "Explain visible issues, improvements, and next steps in a cleaner format."],
        ["QA handoffs", "Document what was checked before or after a release."],
        ["Support reviews", "Summarize what happened around a route, issue, or visitor-facing problem."],
        ["Operational notes", "Keep a record of what the workspace showed at a specific moment."]
      ]
    ),

    p(`A good report should make the next action easier. It should not only say that something happened. It should help the reader understand what area needs review, which signal matters, and what module should be opened next. If a report mentions broken routes, review 404 Recovery. If it mentions browser errors, review Errors. If it mentions metadata or search structure, review SEO. If it mentions accessibility, review Accessibility.`),

    p(`Reports can include different kinds of site and workspace information depending on what CavBot has available. A new workspace may only have basic setup and route context. A more active workspace may include route behavior, missing paths, errors, search structure, accessibility findings, recovery activity, storage notes, and workspace notices.`),

    table(
      ["Report area", "What it can explain"],
      [
        ["Site context", "Which project and website origin the report is reviewing."],
        ["Route activity", "Which pages or paths are being observed and whether recent activity exists."],
        ["404 activity", "Which missing routes need review, redirect decisions, or source-link fixes."],
        ["Errors", "Which browser or request issues may need developer attention."],
        ["SEO", "Which page structure, metadata, or indexing concerns should be checked."],
        ["Accessibility", "Which accessibility findings may need review before release or after changes."],
        ["Recovery context", "Whether visitor recovery surfaces are helping users move forward."],
        ["Workspace notices", "Plan, storage, setup, or access messages that may affect the review."]
      ]
    ),

    p(`Reports should always be tied to the selected site. Before generating or reading a report, confirm that the active site is the one you intend to review. If the wrong site is selected, the report may summarize a staging environment, old domain, preview origin, or unrelated website instead of the production site.`),

    list([
      "Confirm the correct project is selected.",
      "Confirm the correct site is selected.",
      "Confirm the site origin matches the live website you want to review.",
      "Check whether the report is reviewing production, staging, preview, or test activity.",
      "Make sure the report date and time match the review period you care about.",
      "Open the source module before changing production."
    ]),

    p(`A report should be written and read with context. A single issue may not mean the site is unhealthy. One missing route may be a visitor typo. One browser error may be a rare device issue. A repeated route, repeated error, or recurring accessibility concern deserves deeper review because it may affect real visitors more than once.`),

    p(`When a report mentions a concern, use it as a pointer. Open the source module and verify the details before making a change. Look for the route, timestamp, frequency, affected page, likely cause, and business impact. This protects the team from reacting too quickly to a summary without checking the underlying signal.`),

    table(
      ["If the report mentions", "Review this next"],
      [
        ["Missing routes or broken paths", "Open 404 Recovery and inspect route frequency, source paths, and recovery behavior."],
        ["JavaScript errors or failed requests", "Open Errors and review the grouped issue, route, timestamp, and affected context."],
        ["SEO structure concerns", "Open SEO and inspect title, description, canonical, headings, robots settings, and page structure."],
        ["Accessibility findings", "Open Accessibility and review the specific issue type, affected page, and severity."],
        ["Storage or file notices", "Open CavCloud or CavSafe and confirm usage, file state, and access rules."],
        ["Plan or locked-module notes", "Open Billing or Plans and confirm current access, limits, and seat usage."],
        ["Setup problems", "Open Integrations and Analytics v5 to verify snippet, site ID, origin, and key setup."]
      ]
    ),

    p(`Reports are also useful after a release. After publishing a new website version, opening a new page, changing navigation, editing metadata, updating a 404 page, or installing a runtime snippet, generate or review a report to see whether the workspace reflects the expected state.`),

    p(`For release reviews, focus on what changed. Confirm that important routes still load, missing routes are not increasing, new errors are not appearing, SEO structure still looks clean, accessibility did not regress, and the selected site still matches the production origin.`),

    list([
      "Review Reports before and after major website releases.",
      "Use Reports to document what the workspace showed during a review.",
      "Compare the report against the focused module before assigning a fix.",
      "Share reports with teammates when they need context without full dashboard inspection.",
      "Keep reports clear enough that another person can understand the next step.",
      "Do not use a report as a reason to skip direct verification of important issues."
    ]),

    p(`For client or stakeholder updates, keep the report practical. Explain what CavBot saw, why it matters, and what the team will review next. Avoid turning a report into a long technical dump. The best report gives enough detail to make the issue understandable without overwhelming the reader.`),

    p(`For internal teams, reports can be more direct. Developers may need route names, error groups, timestamps, affected pages, and suggested modules to inspect. Owners may need plan, site, storage, and risk context. Support teams may need the user-facing route, time of issue, recovery link, and any visible error message.`),

    table(
      ["Audience", "What the report should emphasize"],
      [
        ["Owner", "Workspace state, site health, plan limits, risks, and next decisions."],
        ["Admin", "Setup status, module access, route concerns, notices, and follow-up areas."],
        ["Developer", "Routes, errors, source modules, timestamps, and verification steps."],
        ["Designer", "Visitor-facing recovery, accessibility concerns, layout issues, and page experience."],
        ["Support team", "Affected page, visitor path, visible issue, and recommended response."],
        ["Client or stakeholder", "Clear summary, impact, progress, and next steps."]
      ]
    ),

    p(`A report is strongest when it separates observation from action. Observation explains what CavBot saw. Action explains what the team should check or do next. Keeping those two parts clear makes the report easier to trust.`),

    table(
      ["Report part", "Purpose"],
      [
        ["Observation", "State what CavBot saw in the selected site or workspace."],
        ["Context", "Explain where the signal appeared and why it may matter."],
        ["Impact", "Describe whether the issue may affect visitors, search, accessibility, support, or team workflow."],
        ["Next review", "Point the reader to the module or surface where the issue should be verified."],
        ["Next action", "Describe the likely repair, decision, or follow-up after verification."]
      ]
    ),

    p(`Reports should not include secrets, private keys, passwords, payment details, sensitive customer information, private messages, or internal information that does not belong in a shareable summary. If a report is being shared outside the core team, review it first and remove anything that should remain private.`),

    note("Privacy", "Reports should explain site and workspace state without exposing secrets, private customer data, payment information, API keys, or internal material that does not belong in a shared summary."),

    p(`If a report looks incomplete, check the setup before rewriting the conclusion. The selected site may not have received enough traffic. The Analytics v5 snippet may not be installed on the live page. The wrong origin may be selected. A module may be locked by plan access. The workspace may be reviewing a new site that has not collected enough signals yet.`),

    table(
      ["Problem", "What to check"],
      [
        ["Report is empty", "Confirm the selected site has received a real public visit after snippet installation."],
        ["Report shows the wrong site", "Switch to the correct site and confirm the saved origin matches production."],
        ["Report misses expected activity", "Check the snippet, project key, site ID, origin allowlist, and public page source."],
        ["Report mentions locked areas", "Confirm the active plan includes the module being summarized."],
        ["Report feels outdated", "Generate or review a newer report after recent activity has been collected."],
        ["Report mentions an issue but details are thin", "Open the focused module and inspect the source signal directly."]
      ]
    ),

    p(`Reports should support decision-making, not replace it. They help the team move faster by collecting the most important context in one place. The final decision should still come from reviewing the source signal, understanding the impact, and confirming the right fix.`),

    p(`The safest workflow is simple: generate or open the report, confirm the selected site, read the summary, identify the items that matter, open the source module, verify the signal, then assign or complete the next action.`),

    list([
      "Open the report.",
      "Confirm the selected project and site.",
      "Read the summary for route, error, SEO, accessibility, recovery, storage, or setup concerns.",
      "Separate urgent issues from informational notes.",
      "Open the source module for anything important.",
      "Verify the route, timestamp, frequency, and impact.",
      "Take the smallest correct action.",
      "Return to Reports or the Dashboard after the fix to confirm the workspace state."
    ]),

    note("Reports are not replacements for review", "Reports make site review faster and easier to share. They do not remove the need to verify important production issues in the source module before shipping fixes."),

    note("Core rule", "Use Reports to understand what needs attention. Use the focused modules to prove what happened.")
  ]
},

     {
  id: "cavpad",
  title: "CavPad",
  summary: "Create, organize, and sync workspace notes.",
  blocks: [
    p(`CavPad is CavBot’s workspace notepad. It gives a team a clean place to write notes that belong close to the work: setup steps, fix plans, release notes, debugging notes, QA observations, client notes, meeting decisions, product ideas, and follow-up tasks.`),

    p(`Use CavPad when the information is important enough to keep, but does not need to become a full report, file, ticket, or code change yet. It is the place for clear written context: what happened, what was reviewed, what decision was made, who is responsible, and what should happen next.`),

    p(`CavPad supports directories, notes, rich text controls, links, tables, exports, trash and restore behavior, note versions, and optional sync to CavCloud or CavSafe where enabled. This lets the workspace keep everyday notes organized without scattering important context across messages, screenshots, browser tabs, or memory.`),

    table(
      ["Use CavPad for", "What to write"],
      [
        ["Fix plans", "The issue, affected route, likely cause, owner, and next step."],
        ["Release notes", "What changed, what was tested, and what should be checked after publishing."],
        ["Debugging notes", "What was observed, what was tried, what failed, and what worked."],
        ["Setup instructions", "Steps for installs, snippets, keys, sites, storage, or team access."],
        ["QA observations", "Pages reviewed, issues found, screenshots referenced, and final status."],
        ["Client notes", "Decisions, requests, review history, open items, and approved direction."],
        ["Team reminders", "Short operational notes that help the workspace stay organized."]
      ]
    ),

    p(`A good CavPad note should be readable after the moment has passed. Another teammate should be able to open the note later and understand the context without asking what happened. The note should include the site, route, date, decision, owner, and next action whenever those details apply.`),

    list([
      "Write the reason for the note.",
      "Name the site or route being discussed.",
      "Include the date or review period when it matters.",
      "State the decision clearly.",
      "Name the owner when someone is responsible for follow-up.",
      "Include the next step so the note does not become a dead end.",
      "Keep the note clean enough for another teammate to understand later."
    ]),

    p(`Directories keep CavPad organized. Use directories for projects, releases, clients, audits, setup work, internal reviews, or recurring workflows. A workspace with many notes should not become one long list. Group notes in a way that matches how the team actually works.`),

    table(
      ["Directory type", "Useful for"],
      [
        ["Projects", "Keeping notes for a specific build, client, website, or product area together."],
        ["Releases", "Tracking what changed before and after each launch."],
        ["Audits", "Keeping SEO, accessibility, route, error, or performance review notes together."],
        ["Clients", "Separating client decisions, approvals, requests, and handoff notes."],
        ["Setup", "Saving install steps, platform notes, snippet checks, and workspace instructions."],
        ["Archive", "Moving older notes out of the main working area without losing them."]
      ]
    ),

    p(`Use rich text controls when structure helps the note. Headings, lists, links, and tables can make a note easier to scan. Keep formatting useful and simple. CavPad should make the note clearer, not heavier.`),

    p(`Links are helpful when a note refers to a route, report, file, support page, dashboard view, or external reference. Use links to connect the note back to the work. Do not paste large amounts of unrelated material into a note when a link or attached file would be cleaner.`),

    p(`Tables are useful when a note needs comparison, review status, owners, or decisions. For example, a QA note can list pages, findings, status, and next action. A release note can list changes, risk, reviewer, and verification status.`),

    table(
      ["Note structure", "When to use it"],
      [
        ["Plain paragraph", "Short context, reminders, or simple decisions."],
        ["Checklist", "Launch reviews, QA steps, setup tasks, and follow-up items."],
        ["Table", "Page reviews, owners, statuses, decisions, or comparisons."],
        ["Linked note", "When a note needs to point back to a route, report, file, or external source."],
        ["Versioned note", "When the note changes over time and the history may matter later."]
      ]
    ),

    p(`CavPad notes can be exported when the content needs to leave the workspace. Use export for handoffs, client summaries, internal records, review packets, or notes that need to be saved outside CavBot. Before exporting, review the note and remove anything that should stay private.`),

    p(`Trash and restore behavior gives the workspace a safer way to clean up notes. Deleting a note should not always mean losing it forever immediately. If a note was removed by mistake, restore it when available. If a note is outdated but may still matter, move it to an archive directory instead of deleting it too quickly.`),

    p(`Note versions help preserve the history of important notes. This matters when a decision changes, a release plan is updated, a debugging path takes a different direction, or a teammate needs to understand how the note reached its current state.`),

    list([
      "Use versions for notes that change during a release or investigation.",
      "Review older versions when a decision is disputed or unclear.",
      "Do not overwrite important context without leaving the final note understandable.",
      "Use clear headings when a note has been updated more than once."
    ]),

    p(`CavPad can sync notes to CavCloud or CavSafe where enabled. Use CavCloud sync when the note belongs with ordinary workspace files, project documents, shared assets, or team materials. Use CavSafe only when the note contains protected workspace material that needs stronger access control.`),

    table(
      ["Sync location", "Use it when"],
      [
        ["CavPad only", "The note is part of everyday workspace context and does not need file storage."],
        ["CavCloud", "The note belongs with shared files, project documents, exports, or working assets."],
        ["CavSafe", "The note contains protected material that should have stronger access review."],
        ["Export", "The note needs to be shared outside the workspace or saved as a standalone record."]
      ]
    ),

    note("Storage rule", "Use CavCloud for normal workspace notes and shared project material. Use CavSafe only when the note contains protected information that truly needs stronger access control."),

    p(`CavPad should not be used for secrets. Do not store passwords, private keys, payment details, recovery codes, private customer data, sensitive legal material, or anything that should live in a dedicated secure system. Notes are for work context, not credential storage.`),

    list([
      "Do not store passwords.",
      "Do not store private keys.",
      "Do not store payment details.",
      "Do not store recovery codes.",
      "Do not store private customer data unless the workspace policy allows it.",
      "Do not use notes as a substitute for secure credential management."
    ]),

    p(`For debugging, CavPad is useful because it keeps the investigation readable. Instead of trying to remember what was checked, write down the issue, the route, the suspected cause, the actions already tried, and the result. This prevents repeated work and makes handoff easier if another teammate takes over.`),

    table(
      ["Debug note field", "Example"],
      [
        ["Issue", "Pricing page form does not submit on mobile."],
        ["Route", "/pricing"],
        ["Observed behavior", "Button click does not trigger the expected confirmation state."],
        ["Checked", "Console, network request, recent release, form markup, mobile layout."],
        ["Likely cause", "Button is covered by sticky element on small screens."],
        ["Owner", "Assigned developer or teammate."],
        ["Next step", "Fix layout overlap, test mobile width, then verify in browser."]
      ]
    ),

    p(`For release work, CavPad can hold the working checklist before the release becomes a final report. Use it to record what changed, which pages were checked, what still needs review, and who approved the release. After the release, keep the note if it helps explain the history of the work.`),

    p(`For client or stakeholder work, CavPad should stay clean and professional. Write the decision, not just the conversation. A useful client note explains what was requested, what was agreed, what changed, what remains open, and when the next review should happen.`),

    p(`For teams, CavPad helps reduce confusion. A teammate should not have to search old messages to understand why a site was changed, why a route was redirected, why a file was moved, or why a release was delayed. The note should preserve the reason.`),

    p(`For solo builders, CavPad is just as important. It gives you a place to pause your thinking, save the current state, and return later without losing the thread. A clear note can protect momentum when you step away from the work and come back hours or days later.`),

    note("Best practice", "Write notes for the person who will read them later, even if that person is you."),

    p(`A strong CavPad workflow is simple: create the note, place it in the right directory, write the context, record the decision, add the next step, sync or export only when needed, and clean up outdated notes when the project changes.`),

    list([
      "Create a note when the work needs written context.",
      "Place it in the correct directory.",
      "Write the site, route, file, or workspace area being reviewed.",
      "Record the decision or current status.",
      "Add the next step.",
      "Sync to CavCloud or CavSafe only when the note belongs there.",
      "Archive or delete notes that no longer help the workspace."
    ]),

    p(`If CavPad becomes cluttered, review old notes by directory. Keep notes that explain important decisions, active work, unresolved issues, release history, or client context. Archive notes that may matter later. Delete notes that are outdated, duplicated, temporary, or no longer useful.`),

    table(
      ["Problem", "What to check"],
      [
        ["Too many notes", "Create directories and move notes by project, release, client, or review type."],
        ["Hard to understand later", "Add route, date, owner, decision, and next step."],
        ["Duplicate notes", "Merge the useful parts into one clear note and archive or delete the rest."],
        ["Old notes causing confusion", "Archive outdated notes or mark the current decision clearly."],
        ["Sensitive material in a note", "Remove it, move approved protected material to CavSafe if needed, and follow workspace policy."],
        ["Note should be shared as a file", "Export it or sync it to CavCloud when appropriate."]
      ]
    ),

    p(`CavPad should make the workspace calmer. It gives important work a written place to live so decisions, setup steps, and follow-up items do not disappear. Use it often, keep it organized, and write notes that another person can trust.`),

    note("Core rule", "CavPad is for clear workspace notes: what happened, why it matters, who owns it, and what happens next.")
  ]
},

      {
  id: "command-center",
  title: "Command Center",
  summary: "Operate workspace sites, guardrails, notices, and core controls.",
  blocks: [
    p(`Command Center is the main operating area for a CavBot workspace. It is where owners and teams manage the websites connected to the workspace, confirm the active site, review workspace notices, check plan limits, manage core controls, and open the focused modules used for deeper review.`),

    p(`In the current app, the older /command-center route points users back to the main workspace home. This keeps the experience simple. Whether a user opens Command Center directly or lands on the app root, the purpose is the same: confirm the workspace context before taking action.`),

    p(`Command Center should be the first place a user checks when something feels unclear. If the wrong site is selected, a website is missing, a plan limit blocks setup, a guardrail needs review, a module appears locked, or a workspace notice needs attention, Command Center gives the team the starting point for understanding what is happening.`),

    p(`A CavBot workspace can contain multiple sites. The selected site controls what many CavBot surfaces review first. If the selected site is wrong, the dashboard, reports, signal modules, and assistant context may appear empty or may point to the wrong website. Command Center helps prevent that confusion by making site context visible before the user continues into deeper tools.`),

    table(
      ["Command Center area", "What it is used for"],
      [
        ["Sites", "Add, review, select, and manage the website origins connected to the workspace."],
        ["Top site", "Choose the primary website CavBot should open and review by default."],
        ["Selected site", "Confirm which site is active before reading dashboards, reports, or signals."],
        ["Guardrails", "Review workspace safety settings that protect origins, alerts, deletion, and risky behavior."],
        ["Workspace notices", "Read important messages about setup, storage, access, billing, limits, or required action."],
        ["Plan state", "Understand which features, limits, seats, sites, and modules are available."],
        ["Linked modules", "Open focused areas such as Console, Routes, Errors, SEO, Reports, and 404 Recovery."]
      ]
    ),

    p(`Use Command Center before assuming that a feature is broken. Many workspace issues are caused by simple context problems: the wrong site is active, the production origin was not added, the snippet was installed on a different domain, the plan limit has been reached, or the user is signed in with an account that does not have the right role.`),

    list([
      "Open Command Center when the wrong site appears in CavBot.",
      "Open Command Center when a newly added site does not show where expected.",
      "Open Command Center when a module looks locked or unavailable.",
      "Open Command Center when a workspace notice appears.",
      "Open Command Center when a teammate needs help understanding what project or site is active.",
      "Open Command Center before changing guardrails, site settings, or workspace controls."
    ]),

    p(`The site list is one of the most important parts of Command Center. Each saved site should represent a clean website origin, such as https://example.com, https://www.example.com, or https://app.example.com. Individual pages should not be added as sites. Pages belong inside a site as routes.`),

    p(`When a workspace has more than one site, Command Center helps the team stay aligned. A marketing site, app domain, documentation site, and storefront may all belong to the same business, but they may need separate review. The selected site tells CavBot which website should be used as the current working context.`),

    table(
      ["If you see this", "Check this in Command Center"],
      [
        ["Dashboard looks empty", "Confirm the selected site matches the live site where the snippet is installed."],
        ["Signals appear under the wrong website", "Check whether the wrong site is selected or the snippet points to another site ID."],
        ["A teammate cannot find a site", "Confirm the site exists in the workspace and the teammate has access."],
        ["A feature appears locked", "Review the active plan and module access state."],
        ["A site cannot be added", "Check the plan website limit and whether the origin already exists."],
        ["A protected action is blocked", "Review role, guardrails, plan state, and workspace context before retrying."]
      ]
    ),

    p(`Top site selection belongs in Command Center because it affects the first view of the workspace. The Top site should usually be the public production website the team reviews most often. If the workspace includes test, staging, or preview domains, keep the production site as the primary site unless the workspace is meant only for development review.`),

    p(`Guardrails should also be reviewed from Command Center. Guardrails help keep important workspace behavior deliberate. They can protect against unknown origins, enforce allowed site origins, keep spike alerts active, and make deletion more careful. These controls matter most when the workspace is connected to a real production website.`),

    list([
      "Keep production origins clean and approved.",
      "Review guardrails before inviting new teammates.",
      "Keep alerts enabled when the team depends on CavBot for site review.",
      "Use stricter deletion rules when files, sites, or workspace settings matter.",
      "Revisit guardrails after plan changes, team changes, or site migrations."
    ]),

    p(`Command Center is also the place to review workspace notices. A notice may explain why storage is close to a limit, why a feature is unavailable, why a site needs attention, why a plan change matters, or why a workspace action should be reviewed. Do not ignore notices when setting up or operating a serious workspace.`),

    p(`Plan state matters because CavBot features are tied to the active plan. Website count, seat count, storage, protected storage, modules, and advanced tools may change depending on the plan. If something is not available, Command Center should help the user understand whether the issue is setup, access, plan limits, or missing data.`),

    table(
      ["Review item", "Why it matters"],
      [
        ["Selected project", "Confirms the user is working in the correct workspace container."],
        ["Selected site", "Controls which website CavBot reviews first."],
        ["Top site", "Sets the default website for the workspace."],
        ["Plan limits", "Explains available sites, seats, storage, and modules."],
        ["Guardrails", "Protects important workspace behavior."],
        ["Notices", "Shows recent messages that may explain setup or access issues."],
        ["Module links", "Moves the user into the right focused area for deeper review."]
      ]
    ),

    p(`Command Center should be used as a starting point, not as the final diagnosis. It helps confirm the workspace state. When a specific issue needs review, open the focused module that owns the signal. Use Routes for route activity, Errors for browser or runtime problems, SEO for page structure, Reports for summaries, CavCloud for files, CavSafe for protected storage, and 404 Recovery for missing routes.`),

    p(`A strong workflow begins in Command Center. Confirm the project, confirm the selected site, review notices, check plan and module access, then open the focused surface that matches the work. This keeps the team from solving the wrong problem in the wrong place.`),

    list([
      "Confirm the correct workspace is open.",
      "Confirm the correct site is selected.",
      "Confirm the Top site is still the main production site.",
      "Review workspace notices before changing settings.",
      "Check plan limits if a feature, site, seat, or module is blocked.",
      "Review guardrails before risky actions.",
      "Open the correct focused module for deeper diagnosis."
    ]),

    p(`For owners, Command Center is the control point for keeping the workspace organized. Owners should use it to confirm that production sites are connected, test origins are not cluttering the workspace, guardrails are set correctly, and teammates are operating from the right context.`),

    p(`For admins, Command Center is the daily operating view. It helps admins understand which site is active, whether the workspace has notices, what modules are available, and where to go next when a site needs attention.`),

    p(`For members, Command Center helps reduce confusion. A member may not control billing or sensitive settings, but they still need to understand which site is active and which CavBot surface should be used for the task in front of them.`),

    table(
      ["Role", "How to use Command Center"],
      [
        ["Owner", "Review workspace ownership, plan state, guardrails, sites, notices, and protected actions."],
        ["Admin", "Manage operational setup, confirm active context, review notices, and open focused modules."],
        ["Member", "Confirm the selected site and use linked modules for assigned review work."]
      ]
    ),

    p(`If Command Center shows an empty or limited state, begin with the basics. Confirm that the account has access to the workspace, the project is selected, the site origin has been added, the snippet is installed on the live site, and a real browser visit has happened after publishing.`),

    table(
      ["Problem", "What to check"],
      [
        ["No sites are shown", "Add a website origin or confirm the account is in the correct workspace."],
        ["Wrong site is active", "Select the correct site or update the Top site."],
        ["Site exists but has no signals", "Confirm the snippet is installed, published, and pointing to the correct site."],
        ["Module is locked", "Check the active plan and role access."],
        ["Action is blocked", "Review role, plan state, guardrails, and whether verification is required."],
        ["Workspace feels out of sync", "Refresh the workspace and confirm the selected project and site again."]
      ]
    ),

    p(`Command Center should remain clean. Do not keep old test origins, duplicate sites, or unused staging records in the main workspace unless the team still needs them. A clean Command Center makes the rest of CavBot easier to trust.`),

    note("Best practice", "Start every serious review in Command Center. Confirm the workspace, selected site, notices, plan state, and guardrails before making changes elsewhere."),

    p(`The purpose of Command Center is simple: help the team know where they are, what site they are reviewing, what controls are active, and what action is safe to take next. When Command Center is clean, the rest of the workspace becomes easier to understand.`),

    note("Core rule", "Command Center is the workspace control room. Confirm context first, then move into the focused module that owns the work.")
  ]
},

     {
  id: "members-and-roles",
  title: "Members and roles",
  summary: "Review workspace access before work begins.",
  blocks: [
    p(`Members and roles control who can enter a CavBot workspace, what they can review, and which actions they are allowed to take. Before a team begins using CavBot for real website work, the workspace owner should confirm who has access, what role each person has, how many seats are being used, and whether any pending invites still need attention.`),

    p(`A clean access model protects the workspace. CavBot can contain production sites, API keys, billing controls, protected storage, reports, files, notes, and security settings. Those areas should not be available to every person by default. Each member should have the lowest role that still allows them to do their work.`),

    p(`The owner role should be treated as the long-term control role for the workspace. Owners are responsible for billing, security, role management, site ownership, key management, plan changes, and critical workspace decisions. Owner access should be limited to people who are trusted to make business and security decisions for the workspace.`),

    p(`Admins help operate the workspace. They can support setup, review sites, manage day-to-day work, help teammates, inspect signals, and keep the workspace moving. Admin access is powerful, but it should not be used as a replacement for ownership. The owner should remain the final authority for billing, security, and sensitive changes.`),

    p(`Members are standard workspace users. They can help review the selected site, read dashboards, inspect assigned surfaces, work with notes or files where allowed, and contribute to the team’s review process. Members should not be expected to manage billing, owner-only settings, API keys, security controls, or protected workspace actions.`),

    table(
      ["Role", "Main purpose", "Typical access"],
      [
        ["Owner", "Owns the workspace and makes final business, billing, and security decisions.", "Billing, plan changes, security settings, API keys, roles, invites, sites, storage controls, protected actions, and all available modules."],
        ["Admin", "Helps manage workspace operations and supports team setup.", "Site setup, diagnostics, module review, workspace operations, non-owner invites where allowed, and day-to-day management."],
        ["Member", "Reviews and contributes within the workspace without controlling sensitive settings.", "Dashboard review, route and signal review, notes, files, reports, and assigned workspace surfaces where allowed."]
      ]
    ),

    p(`Before work starts, review the member list. Confirm that the owner is correct, the team has the right number of seats, pending invites still make sense, and each person has the correct role. This prevents confusion later when someone cannot open a module, change a site, reach billing, or complete a protected action.`),

    list([
      "Confirm the workspace owner before inviting the full team.",
      "Use Admin only for people who need operational control.",
      "Use Member for standard review and contribution work.",
      "Avoid sharing one account across multiple people.",
      "Review pending invites before sending more.",
      "Remove stale access when someone no longer needs the workspace.",
      "Recheck roles after team, billing, or security changes."
    ]),

    p(`Seat usage matters because each plan has a member limit. A workspace can only hold the number of people allowed by the active plan. Pending invites should be reviewed because they may affect planning even before a person accepts. If the workspace reaches its seat limit, the owner may need to remove unused access, revoke old invites, or upgrade the plan before adding more people.`),

    table(
      ["Access state", "What it means"],
      [
        ["Active member", "The person has accepted access and can enter the workspace based on their role."],
        ["Pending invite", "The invitation was sent, but the person has not accepted yet."],
        ["Revoked invite", "The invitation was canceled and should no longer grant access."],
        ["Expired invite", "The invitation is no longer valid and should be resent only if access is still needed."],
        ["Removed member", "The person no longer has workspace access."]
      ]
    ),

    p(`Invites should be sent with intention. Before inviting someone, decide what work they need to do. A developer reviewing routes may only need Member access. A teammate helping manage setup may need Admin access. A founder, billing owner, or security lead may need Owner access. Do not give a higher role just to avoid thinking through the correct one.`),

    p(`Role changes should be reviewed carefully. Promoting a member gives them more control. Demoting a person removes access they may have been relying on. Removing a member should be done when the person no longer belongs in the workspace, leaves the team, finishes a project, or no longer needs access to the connected sites and files.`),

    table(
      ["Situation", "Recommended action"],
      [
        ["New teammate needs to review dashboards", "Invite them as a Member."],
        ["Developer needs to help manage site setup", "Use Admin only if they need operational controls."],
        ["Someone needs billing or security control", "Use Owner only when they are trusted with final workspace responsibility."],
        ["A contractor finished the project", "Remove the member or revoke their invite."],
        ["An invite was sent to the wrong email", "Revoke the invite and send a new one to the correct address."],
        ["A teammate changed responsibilities", "Update their role so access matches their current work."]
      ]
    ),

    p(`Access review should not happen only once. Review members and roles whenever the team changes, a plan changes, a production site is added, protected files are uploaded, API keys are rotated, billing changes, or a security concern appears. The larger the workspace becomes, the more important clean access becomes.`),

    list([
      "Review access after adding a production site.",
      "Review access after changing plans.",
      "Review access after inviting contractors or temporary teammates.",
      "Review access before working with protected files.",
      "Review access before rotating API keys.",
      "Review access after a billing or security incident.",
      "Review access when a teammate leaves the company or project."
    ]),

    p(`Owners should also review whether the current role setup matches the way the team actually works. If too many people are admins, the workspace becomes harder to control. If too few people have the right access, important work may be blocked. The goal is not to make access complicated. The goal is to keep control clear.`),

    p(`A good member list should be easy to understand. The owner should be obvious. Admins should have a clear reason for their access. Members should reflect the people actively working in the workspace. Pending invites should not sit forever without review.`),

    table(
      ["What to review", "Why it matters"],
      [
        ["Owner", "Confirms who has final responsibility for billing, security, and workspace control."],
        ["Admins", "Confirms who can help operate the workspace and manage important setup work."],
        ["Members", "Confirms who can view and contribute to workspace activity."],
        ["Pending invites", "Prevents old or incorrect invites from staying open."],
        ["Seat usage", "Shows whether the workspace is close to the plan limit."],
        ["Recent role changes", "Helps the team understand why access changed."]
      ]
    ),

    p(`If a teammate cannot access something, start with role and workspace context before assuming the product is broken. Confirm they accepted the invite, signed in with the correct email, opened the right workspace, selected the right project, and have a role that allows the action they are trying to complete.`),

    table(
      ["Problem", "What to check"],
      [
        ["Teammate cannot enter the workspace", "Confirm the invite was accepted and the person is using the correct email."],
        ["Teammate cannot open a module", "Check their role and the workspace plan."],
        ["Teammate cannot change a site", "Confirm whether the action requires Admin or Owner access."],
        ["Teammate cannot manage billing", "Billing should remain limited to the owner or authorized billing users."],
        ["Invite cannot be sent", "Check seat limits, pending invites, and whether the email is already invited."],
        ["Protected action is blocked", "Review role, plan state, CavGuard decision, and whether CavVerify is required."]
      ]
    ),

    p(`Do not share owner credentials to avoid inviting teammates. Shared accounts make it harder to know who changed a setting, moved a file, rotated a key, updated billing, or performed a protected action. Each person should use their own account so the workspace history remains clear.`),

    p(`Members and roles also support accountability. When every person has their own account and the right role, audit history becomes easier to trust. The team can understand who took an action, when it happened, and whether that person had the correct access at the time.`),

    note("Team hygiene", "Keep the member list clean. Use the lowest role that fits the work, remove stale access, and review pending invites before adding more people."),

    p(`The safest pattern is simple: assign access carefully, review it often, and remove it when it is no longer needed. CavBot work becomes easier to manage when every member has a clear role and every role has a clear reason.`),

    note("Core rule", "Access should match responsibility. Owners control the workspace, admins operate trusted workflows, and members contribute without holding sensitive controls.")
  ]
}

    ]
  },


  signals: {
    path: "/docs/signals",
    icon: "assets/icons/docs/signal-svgrepo-com.svg",
    label: "Website signals",
    
    title: "Website signals",
    description: "Read errors, routes, SEO, accessibility, insights, and 404 recovery data from the selected website.",
    sections: [
      {
  id: "errors",
  title: "Errors",
  summary: "Review browser issues that may affect real user flows.",
  blocks: [
    p(`Errors are issues reported from the browser while visitors use a connected site. They help the team understand what failed, where it happened, when it happened, and whether the problem may have affected a real user journey.`),

    p(`Use Error Intelligence when you need to move beyond a general “something broke” feeling and review the actual signal. A good error review should connect the message, route, timestamp, browser context, and user path so the team can decide whether the issue is urgent, minor, repeated, or already resolved.`),

    p(`Not every error has the same weight. A one-time warning on an unused page is different from a repeated failure on login, checkout, pricing, signup, onboarding, support, dashboard access, or payment flows. The purpose of Errors is to help the team separate noise from issues that may affect trust, conversion, access, or production quality.`),

    p(`Start with the route. The route tells you where the visitor was when the issue happened. Then review the message, time, frequency, and surrounding context. If the same issue appears again and again on an important page, it should be treated with more urgency than a single isolated report.`),

    table(
      ["Review area", "What to look for"],
      [
        ["Route", "The page or path where the error appeared."],
        ["Message", "The reported error text or failure reason."],
        ["Time", "When the issue happened and whether it lines up with a release, edit, or traffic spike."],
        ["Frequency", "Whether the issue happened once or is repeating."],
        ["User flow", "Whether the error affected signup, login, checkout, forms, dashboard use, support, or another important action."],
        ["Browser context", "Whether the issue may be limited to a browser, device type, extension, network state, or script behavior."],
        ["Recent changes", "Whether a deployment, content edit, route change, integration change, or script update happened near the error time."]
      ]
    ),

    p(`A useful error review starts with a simple question: did this issue prevent someone from completing something important? If the answer may be yes, the error deserves closer review. If the answer is no, the error may still matter, but it can be placed behind more urgent production issues.`),

    list([
      "Review the route where the error happened.",
      "Read the error message carefully before deciding what it means.",
      "Check whether the issue is repeated.",
      "Prioritize errors on business-critical flows.",
      "Look for recent deploys, content changes, integration changes, or script changes near the timestamp.",
      "Try to reproduce the issue in the browser.",
      "Verify the fix after shipping."
    ]),

    p(`Errors should be reviewed with impact in mind. The team should ask whether the error blocked a visitor, damaged the page experience, broke an important action, or created a hidden failure that the visitor may not have understood. The more closely an error is tied to revenue, signup, trust, support, or account access, the higher it should move in the review order.`),

    table(
      ["Priority", "When to treat it this way"],
      [
        ["Critical", "The error affects checkout, payment, account access, signup, login, security, dashboard access, or another core flow."],
        ["High", "The error repeats on an important public page, product page, pricing route, form, onboarding path, or customer-facing workflow."],
        ["Medium", "The error appears on a normal page and may affect the experience, but does not clearly block a key action."],
        ["Low", "The error appears once, affects a low-traffic area, or does not appear to change the visitor’s ability to continue."],
        ["Watch", "The error is not urgent yet, but should be watched because it may grow after a release or traffic change."]
      ]
    ),

    p(`The first step is not always to change code. Sometimes the right step is to confirm the selected site, open the affected route, check whether the page still loads, and see whether the error can be reproduced. A clear review prevents the team from fixing the wrong thing or shipping changes based on a signal that is no longer active.`),

    p(`When an error appears after a release, compare the timestamp with the deploy, content update, routing change, integration update, package change, or platform setting change. Errors that start immediately after a change often point to the area that should be reviewed first.`),

    table(
      ["Possible cause", "What to check"],
      [
        ["Recent deployment", "Review the files, routes, components, or settings changed in the latest release."],
        ["Broken script", "Confirm the script loads, runs in the right order, and is not blocked by the browser."],
        ["Missing asset", "Check whether an image, script, stylesheet, font, JSON file, or other asset path is wrong."],
        ["Route change", "Confirm the page still exists and any needed redirects are in place."],
        ["Third-party service issue", "Check whether an external tool, widget, payment provider, form tool, or script failed."],
        ["Browser-specific behavior", "Test the route in another browser or device if the issue appears limited."],
        ["Bad user input", "Review forms, validation, required fields, and error handling around the action."]
      ]
    ),

    p(`Repeated errors deserve special attention. A repeated error means the issue may be affecting more than one visitor or more than one attempt. Repetition can also show that the error belongs to a common route, shared component, shared script, or high-traffic page.`),

    p(`If the same error appears across many routes, check shared code first. This may include layout components, navigation, analytics snippets, authentication wrappers, payment widgets, form handlers, client scripts, or global providers. If the error appears on only one route, start with that page and the components used there.`),

    list([
      "If one route is affected, review that route first.",
      "If many routes are affected, review shared layout, shared scripts, and global components.",
      "If the error appears after a deploy, review the changed files first.",
      "If the error appears after a content update, review the edited content and embedded assets.",
      "If the error appears after installing a third-party tool, review that script and its placement.",
      "If the error appears only on mobile, test small screens and touch behavior.",
      "If the error appears only for signed-in users, review account, session, and permission flows."
    ]),

    p(`Errors should also be compared with other CavBot surfaces. A browser error may line up with a 404 spike, a broken route, a missing asset, an SEO issue, an accessibility issue, or a recovery event. Opening the focused module helps the team understand whether the issue is isolated or part of a larger site problem.`),

    table(
      ["If the error mentions", "Open this next"],
      [
        ["Missing route or failed page load", "Open 404 Recovery or Routes."],
        ["Broken asset path", "Open Routes and inspect the page source or deployment output."],
        ["Form failure", "Open the affected route and test the form directly."],
        ["Checkout or payment issue", "Review billing, checkout, and payment provider context."],
        ["Login or account issue", "Review authentication, sessions, roles, and protected actions."],
        ["Metadata or page structure issue", "Open SEO and inspect the page."],
        ["Visual or interaction issue", "Open the page in the browser and test the exact action."]
      ]
    ),

    p(`When reviewing an error, keep the visitor’s path in mind. The error is not just a technical message. It may represent a person who tried to complete an action and could not. The route, timestamp, and surrounding activity help the team understand whether the issue interrupted a real journey.`),

    p(`A strong review should answer five questions: where did it happen, what failed, how often did it happen, what user action may have been affected, and what should be checked next. If the team cannot answer those questions yet, continue reviewing before making broad changes.`),

    list([
      "Where did it happen?",
      "What failed?",
      "How often did it happen?",
      "What user action may have been affected?",
      "What should be checked next?"
    ]),

    p(`Do not treat every console message as a production emergency. Some warnings are harmless, temporary, or caused by browser extensions. At the same time, do not ignore repeated errors on important routes. The value of Error Intelligence is that it helps the team judge the difference.`),

    table(
      ["Signal", "How to treat it"],
      [
        ["One isolated warning", "Review when time allows unless it affects an important flow."],
        ["Repeated error on one route", "Inspect that route and try to reproduce the issue."],
        ["Repeated error across many routes", "Check shared layout, scripts, providers, or recent global changes."],
        ["Error on checkout, login, signup, or payment", "Review quickly and verify the flow directly."],
        ["Error after a deployment", "Compare the timestamp with the release and inspect changed areas."],
        ["Error tied to a third-party script", "Confirm the external service, script order, and browser behavior."]
      ]
    ),

    p(`For developers, the safest workflow is to reproduce before repair when possible. Open the affected route, follow the same action path, check the browser console, inspect network requests, and confirm whether the error still happens. Then make the smallest safe change and verify the result on the live or preview environment.`),

    p(`For owners and operators, the main responsibility is to understand impact. Ask whether the issue affects users, revenue, support, signups, or trust. If it does, escalate it. If it does not, keep it in the review queue and watch whether it repeats.`),

    p(`For teams, errors should be handled with a clear handoff. A useful handoff includes the route, error message, first seen time, how often it appeared, what changed recently, whether it was reproduced, and what action should happen next.`),

    table(
      ["Handoff detail", "Example of what to include"],
      [
        ["Route", "The page or path where the error appeared."],
        ["Message", "The exact error text shown in Error Intelligence."],
        ["Time", "When the issue appeared or when it started repeating."],
        ["Impact", "Whether the issue affects checkout, login, signup, forms, dashboard access, or another important flow."],
        ["Reproduction", "Whether someone could make the issue happen again."],
        ["Recent change", "Any release, edit, integration, or setting change near the timestamp."],
        ["Next step", "What should be checked, fixed, monitored, or verified."]
      ]
    ),

    p(`After a fix is shipped, verify the route again. Do not assume an error is fixed only because the code was changed. Open the affected page, repeat the action, check the browser, and continue watching Error Intelligence to confirm the signal stops or drops to an acceptable level.`),

    list([
      "Open the affected route after the fix.",
      "Repeat the action that may have caused the error.",
      "Check the browser console and network behavior.",
      "Confirm the page still works on desktop and mobile when relevant.",
      "Review Error Intelligence again after traffic returns.",
      "Document the fix if the issue affected a major flow."
    ]),

    p(`Some errors may be outside the team’s direct control. Browser extensions, blocked third-party scripts, unstable networks, external services, and device-specific behavior can all create signals. These still deserve review, but the fix may be a clearer fallback, better error handling, or a safer recovery path instead of a direct code change.`),

    p(`If an error cannot be reproduced, keep the review grounded. Check whether it happened once or many times, whether it affected an important route, whether it appears after a known release, and whether similar issues are appearing nearby. A non-reproducible issue can still matter if it repeats or touches a critical flow.`),

    table(
      ["Problem", "What to check"],
      [
        ["Error appears once", "Check route importance, timestamp, and whether similar signals exist."],
        ["Error repeats often", "Prioritize review and look for shared cause."],
        ["Error cannot be reproduced", "Check browser, device, release timing, and repeated patterns."],
        ["Error appears after a release", "Review the changed files, routes, scripts, or settings."],
        ["Error affects a form", "Test validation, submission, success state, and failure state."],
        ["Error affects checkout", "Test the full purchase path and payment provider handoff."],
        ["Error affects login", "Review session, redirect, protected route, and account state."]
      ]
    ),

    note("Review rule", "Prioritize errors by user impact, route importance, repetition, and timing. A repeated error on a critical flow should be reviewed before a one-time warning on a low-risk page."),

    p(`Errors should make the team more precise, not more reactive. The goal is to understand the issue clearly enough to take the right next step: monitor it, reproduce it, fix it, escalate it, or connect it to a larger site problem.`),

    note("Core rule", "Start with the route, message, time, frequency, and user flow. Then verify the issue in the browser before treating it as resolved.")
  ]
},

      {
  id: "routes",
  title: "Routes",
  summary: "Review the paths visitors reach across a connected site.",
  blocks: [
    p(`Routes are the website paths CavBot has seen, scanned, or received through the connected site. A route is an individual path inside a saved site origin. For example, https://example.com is the site, while /pricing, /docs, /signup, /blog/post-name, and /checkout are routes inside that site.`),

    p(`Use Routes to understand the shape of the website after it is live. Routes help the team see which pages are being reached, which paths matter most, which pages may be missing, and whether visitors are still reaching old, unexpected, or broken paths.`),

    p(`A clean route view gives the team a practical map of the site. Important pages should be visible, named clearly, and connected to the correct site. Unexpected routes can reveal broken links, old campaigns, deleted pages, migration leftovers, incorrect redirects, copied URLs, bot traffic, or paths that visitors are still trying to reach.`),

    p(`Routes should be reviewed any time a site changes. This includes launches, redesigns, migrations, pricing updates, documentation updates, checkout changes, navigation edits, product page changes, blog moves, and campaign launches. A route that worked yesterday can become a problem after a page is renamed, removed, moved, or published under a new path.`),

    table(
      ["Route area", "What it helps you understand"],
      [
        ["Visited paths", "Which pages visitors are reaching on the connected site."],
        ["Important pages", "Whether high-value pages such as pricing, signup, checkout, docs, and support are visible."],
        ["Unexpected paths", "Whether visitors are reaching old, mistyped, or unknown routes."],
        ["Missing paths", "Whether a path may need a redirect, restored page, or corrected link."],
        ["Route metadata", "Whether the page has useful structure, title context, and reviewable page information."],
        ["Route patterns", "Whether repeated paths point to a larger navigation, campaign, migration, or linking issue."]
      ]
    ),

    p(`Start with high-value routes. These are the pages that matter most to the business or product. For many websites, this includes the homepage, pricing page, signup page, login page, checkout page, product pages, docs pages, contact page, support page, and any page used in campaigns or sales conversations.`),

    list([
      "Review the homepage and main product pages first.",
      "Check pricing, signup, login, checkout, account, support, and contact routes.",
      "Look for repeated unexpected paths.",
      "Compare route behavior with 404, SEO, Errors, and Reports.",
      "Review route changes after launches, migrations, redesigns, or campaign updates.",
      "Fix, redirect, or restore paths that keep receiving meaningful traffic."
    ]),

    p(`One strange route may not matter. A repeated route pattern matters more. If the same missing path appears many times, the team should ask where visitors are coming from and why that path still exists. It may be linked from navigation, a marketing campaign, an old email, a search result, a third-party website, a saved bookmark, a social post, or an outdated sitemap.`),

    table(
      ["Route pattern", "What it may mean"],
      [
        ["One random unknown path", "A visitor may have typed the address incorrectly or a bot may have requested the path."],
        ["Repeated old product route", "A product page may have moved or been deleted without a redirect."],
        ["Repeated campaign path", "An ad, email, social post, or landing page link may be outdated or wrong."],
        ["Missing docs route", "Documentation may have moved without a redirect or updated navigation."],
        ["Missing asset path", "An image, script, font, stylesheet, or file reference may be broken."],
        ["Many similar broken paths", "A migration, slug change, routing rule, or deploy may need review."]
      ]
    ),

    p(`Routes should not be reviewed in isolation. A route can connect to other signals. A route may have missing metadata, repeated errors, accessibility issues, broken assets, 404 behavior, or poor recovery behavior. When a route looks suspicious, open the focused surface that explains the signal more clearly.`),

    table(
      ["If you see", "Open this next"],
      [
        ["A route that may be missing", "Open 404 Recovery."],
        ["A route with repeated browser issues", "Open Errors."],
        ["A route with weak title or page structure", "Open SEO."],
        ["A route with accessibility concerns", "Open A11y."],
        ["A route tied to a recovery experience", "Open Arcade or 404 Recovery."],
        ["A route that needs a team summary", "Open Reports or CavPad."]
      ]
    ),

    p(`A route review should answer a few simple questions. Does this path belong on the site? Is it still useful? Is it receiving traffic? Should it load a real page, redirect somewhere else, or remain unavailable? Is the route connected to an important user action? Does the page have the right structure and metadata?`),

    list([
      "Does this route belong on the site?",
      "Is the route still active or should it redirect?",
      "Is the route receiving repeated traffic?",
      "Is the route connected to a key business flow?",
      "Does the page load correctly on the live site?",
      "Does the route have clear page structure and metadata?",
      "Does the route appear in other CavBot surfaces?"
    ]),

    p(`For active pages, confirm that the page still works. Open the route in the browser, review the content, test the main action, check the page title, confirm important links, and make sure the page matches what the team expects visitors to see.`),

    p(`For missing or unexpected pages, decide what the route deserves. Some routes should be redirected because the content moved. Some should be restored because the page still matters. Some should be corrected at the source because the website is linking to the wrong path. Some can remain unavailable if they are invalid, low-value, or clearly not part of the site.`),

    table(
      ["Decision", "Use it when"],
      [
        ["Keep the route", "The page is valid, useful, and should continue to exist."],
        ["Redirect the route", "The content moved and visitors should be sent to the new page."],
        ["Restore the route", "The page was removed but still matters to visitors or the business."],
        ["Fix the source link", "The website, campaign, email, or external page is sending visitors to the wrong path."],
        ["Leave as unavailable", "The route is invalid, unsafe, meaningless, or not worth redirecting."],
        ["Watch the route", "The signal is unclear and should be reviewed again if it repeats."]
      ]
    ),

    p(`Routes are especially important after migrations. When a website changes platforms, frameworks, domains, slugs, navigation, or content structure, old paths can continue receiving visits. A route review helps the team catch missing redirects, broken links, and important pages that were lost during the move.`),

    p(`Routes are also important after campaigns. Ads, launch emails, social posts, QR codes, partner links, and sales materials can keep sending traffic long after the page changes. If a campaign route is wrong, the business may lose visitors before they ever reach the intended page.`),

    table(
      ["After this change", "Review routes for"],
      [
        ["Website launch", "Missing core pages, wrong paths, unpublished pages, and early visitor behavior."],
        ["Redesign", "Changed navigation, renamed pages, deleted pages, and broken internal links."],
        ["Migration", "Old slugs, missing redirects, changed platform paths, and route structure problems."],
        ["Pricing update", "Pricing, checkout, signup, and plan-related paths."],
        ["Docs update", "Moved articles, deleted guides, changed categories, and broken docs links."],
        ["Campaign launch", "Landing page paths, UTM-free route behavior, old campaign links, and mistyped URLs."]
      ]
    ),

    p(`High-value routes should be treated with more care than low-value paths. A broken checkout route matters more than a random typo. A pricing page with repeated route issues matters more than a one-time bot request. Use business importance, traffic, repetition, and user impact to decide what to review first.`),

    table(
      ["Priority", "When to treat it this way"],
      [
        ["Critical", "The route supports checkout, payment, account access, signup, login, onboarding, or another core action."],
        ["High", "The route is public, receives repeated visits, and supports pricing, product, support, docs, or lead capture."],
        ["Medium", "The route appears meaningful but does not clearly block a key user journey."],
        ["Low", "The route appears once, looks random, or does not connect to an important page."],
        ["Watch", "The route is not urgent yet, but may matter if it repeats after a launch, campaign, or migration."]
      ]
    ),

    p(`When a route keeps appearing and the team does not recognize it, do not guess. Open the path, check whether it loads, review where it may be linked from, compare it against recent site changes, and inspect whether it appears in 404 Recovery, Errors, SEO, or Reports.`),

    list([
      "Open the route directly in the browser.",
      "Check whether the page loads or returns a missing-page state.",
      "Look for internal links pointing to the route.",
      "Review recent content, navigation, deployment, or campaign changes.",
      "Check whether the route appears in 404 Recovery.",
      "Check whether the route has errors or metadata problems.",
      "Decide whether the route needs a fix, redirect, restore, or no action."
    ]),

    p(`For teams, Routes can also help explain what the site looks like from the visitor’s side. The route list can show where visitors actually go, not just what the sitemap or navigation says should exist. This makes it useful for QA, support, marketing, development, and founder review.`),

    table(
      ["Team", "How Routes helps"],
      [
        ["Founder or owner", "Shows whether important business pages are being reached and whether broken paths need attention."],
        ["Developer", "Helps identify routing, redirect, deployment, asset, or page structure problems."],
        ["Designer", "Helps confirm whether redesigned paths and navigation are being used correctly."],
        ["Marketing", "Helps review landing pages, campaign paths, old URLs, and traffic patterns."],
        ["Support", "Helps confirm whether users are being sent to the right help, docs, or account pages."],
        ["SEO reviewer", "Helps compare route structure with metadata, titles, indexable pages, and missing content."]
      ]
    ),

    p(`Route names should stay clean and intentional. Avoid treating every path as a separate site. Sites are origins. Routes are paths inside those origins. Keeping that difference clear helps CavBot connect signals correctly across dashboards, reports, 404 review, SEO, accessibility, errors, and assistant context.`),

    p(`If Routes looks empty, start with setup. Confirm the selected site is correct, the saved origin matches the public website, the Analytics v5 snippet is installed once, the page was published, and a real browser visit happened after installation.`),

    table(
      ["Problem", "What to check"],
      [
        ["No routes appear", "Confirm the selected site, saved origin, snippet install, public publish, and real browser visit."],
        ["Wrong routes appear", "Check whether the selected site is the wrong origin or environment."],
        ["Routes appear under the wrong site", "Confirm site ID, project key, and origin allowlist in the installed snippet."],
        ["Old routes keep appearing", "Review external links, redirects, campaign URLs, saved bookmarks, and search results."],
        ["Important route is missing", "Visit the live page and confirm the snippet runs on that page."],
        ["Many broken paths appear", "Check recent migrations, navigation edits, redirects, and route rules."]
      ]
    ),

    p(`After fixing a route problem, verify it from the visitor side. Open the old path, confirm the redirect or restored page works, test the destination, and return to CavBot after traffic or a manual visit so the workspace can show the updated behavior.`),

    list([
      "Open the affected route after the fix.",
      "Confirm the page loads, redirects, or stays unavailable intentionally.",
      "Test the main visitor action on the destination page.",
      "Check desktop and mobile when the route matters.",
      "Review 404 Recovery if the route was previously missing.",
      "Document the change if the route affected a major flow."
    ]),

    note("Review rule", "Prioritize routes by business value, repetition, and user impact. A repeated issue on a key page deserves attention before a one-time random path."),

    p(`Routes should give the team a clearer view of the live website. They show what visitors are reaching, what may be missing, and which paths deserve review. Used well, Routes helps the team keep the website organized, recover from broken paths, and make sure important pages stay easy to trust.`),

    note("Core rule", "Sites are origins. Routes are paths inside those origins. Review routes to understand where visitors go, what breaks, and what should be fixed, redirected, restored, or watched.")
  ]
},

     {
  id: "seo",
  title: "SEO",
  summary: "Review page metadata, structure, and search readiness.",
  blocks: [
    p(`SEO in CavBot helps teams review how important pages present themselves to search engines, visitors, shared links, and modern discovery surfaces. It reads the live page when available and turns page structure into a clearer review surface so the team can understand what may need attention.`),

    p(`Use SEO when you need to check whether a page has a clear title, useful description, proper heading structure, stable canonical URL, readable page context, favicon presence, trust signals, and the basic metadata expected from a serious website. A page can look finished visually while still being weak in the source information that search engines and link previews rely on.`),

    p(`SEO snapshots are based on what CavBot can observe from the connected page. The browser signal layer can read titles, descriptions, canonical tags, robots directives, heading structure, favicon state, structured data, trust-page signals, page text signals, and other page details when they are present and available.`),

    p(`A snapshot should be treated as a review point, not a permanent truth. If the live page changes, the SEO snapshot should be refreshed by visiting or rechecking the page after the update. CavBot can only review what the page actually publishes, so the live source must match the intended metadata.`),

    table(
      ["SEO area", "What CavBot helps review"],
      [
        ["Page title", "Whether the page has a clear title that explains the page purpose."],
        ["Meta description", "Whether the page has a useful summary for search results and link context."],
        ["Headings", "Whether the page uses a clear heading structure instead of scattered or missing headings."],
        ["Canonical URL", "Whether the page points to the correct preferred URL."],
        ["Robots settings", "Whether the page appears allowed or restricted for indexing where detectable."],
        ["Structured data", "Whether the page includes machine-readable information when the page type needs it."],
        ["Favicon state", "Whether the site presents a recognizable browser and tab identity."],
        ["Trust pages", "Whether important credibility pages such as privacy, terms, contact, support, or security are visible where relevant."]
      ]
    ),

    p(`Start with the pages that matter most. SEO review should not begin with random low-traffic routes. Begin with the homepage, pricing page, product pages, signup page, login page, docs, blog, contact page, support page, legal pages, and any route used in campaigns, sales outreach, investor outreach, or public launch materials.`),

    list([
      "Review the homepage first.",
      "Review pricing, product, signup, login, checkout, docs, support, and contact pages.",
      "Review pages used in ads, emails, launches, investor outreach, or social posts.",
      "Review pages after redesigns, migrations, CMS updates, or major copy changes.",
      "Compare SEO findings with Routes, Reports, 404 Recovery, and Errors when a page looks suspicious."
    ]),

    p(`A strong page title should be specific, readable, and honest. It should tell a visitor what the page is about without stuffing the title with repeated keywords. The title should feel like it belongs to the page, the product, and the brand.`),

    p(`A strong description should explain the page in plain language. It should help a person understand why the page exists and what they can expect to find. It should not be vague, misleading, overloaded, or copied across every page without change.`),

    table(
      ["Element", "Good pattern", "Weak pattern"],
      [
        ["Title", "Specific, readable, and tied to the page purpose.", "Generic, missing, duplicated, or overloaded with repeated keywords."],
        ["Description", "Clear summary of what the page offers.", "Empty, vague, copied across pages, or written only for search engines."],
        ["H1", "One clear main heading that matches the page intent.", "Missing, duplicated too many times, or unrelated to the page."],
        ["Canonical", "Points to the preferred live version of the page.", "Points to the wrong route, staging domain, old domain, or unrelated page."],
        ["Robots", "Matches the intended visibility of the page.", "Accidentally blocks an important public page or exposes a private page."],
        ["Structured data", "Used where it helps explain the page type.", "Broken, unrelated, duplicated, or added without matching visible content."]
      ]
    ),

    p(`Headings matter because they help organize the page. A visitor should be able to understand the page by scanning the main heading and section headings. Search engines also use the structure to understand what the page is about. A page with weak headings may look polished but still be hard to interpret.`),

    p(`Canonical URLs are important when the same content can be reached from more than one address. The canonical tag tells search engines which version should be treated as the preferred page. This is especially important after domain changes, www to non-www changes, platform migrations, campaign URLs, product page changes, and duplicated CMS routes.`),

    p(`Robots settings should be reviewed with care. An important public page should not be accidentally marked noindex. A private, staging, internal, or temporary page should not be made public by mistake. If CavBot detects robots-related behavior, use it as a reason to inspect the page source and confirm the intended visibility.`),

    note("Important", "CavBot can help you find SEO issues, but the fix must happen at the source: the page markup, CMS fields, layout component, framework metadata, or platform settings that generate the live page."),

    p(`SEO review is not only about search ranking. It is also about trust and clarity. A serious website should make its purpose clear to visitors, search engines, link previews, and internal teams. Clean metadata helps a page feel finished, shareable, and easier to understand.`),

    table(
      ["Page type", "What to review first"],
      [
        ["Homepage", "Title, description, main heading, brand purpose, favicon, trust links, and canonical URL."],
        ["Pricing page", "Plan clarity, title, description, heading structure, conversion path, and no accidental blocking."],
        ["Product page", "Product purpose, page title, description, headings, structured data when useful, and internal links."],
        ["Docs page", "Readable title, clear headings, canonical URL, updated content, and route stability."],
        ["Blog page", "Article title, description, author or publish context where relevant, canonical URL, and internal links."],
        ["Support page", "Clear support purpose, contact path, headings, and trust context."],
        ["Legal page", "Correct title, stable route, readable page structure, and no accidental missing metadata."]
      ]
    ),

    p(`When a page has weak metadata, fix the source page rather than editing only the docs or dashboard description. For a custom-coded site, this may mean updating the page component, layout metadata, head tags, route configuration, or framework metadata export. For a CMS, it may mean updating the page title field, SEO description field, canonical field, image field, or visibility settings.`),

    list([
      "Fix the live page source.",
      "Update CMS SEO fields when the site uses a CMS.",
      "Update framework metadata when the site is built in a modern app framework.",
      "Check layout-level defaults that may be overwriting page-specific metadata.",
      "Remove duplicate or outdated metadata.",
      "Publish the site after changes.",
      "Visit or recheck the live page so CavBot can collect the newer snapshot."
    ]),

    p(`Do not use SEO as a place for keyword stuffing. Repeating phrases unnaturally can make the page feel weaker, not stronger. The best page metadata is clear, direct, accurate, and useful to a real person. Write for the visitor first, then make sure the page is structured cleanly enough for search systems to understand it.`),

    table(
      ["Do", "Avoid"],
      [
        ["Write page titles that clearly identify the page.", "Using the same title on every page."],
        ["Write descriptions that summarize the actual page.", "Writing vague descriptions that could belong anywhere."],
        ["Use headings to organize the content.", "Using headings only for visual size or decoration."],
        ["Keep canonical URLs pointed at the correct live page.", "Pointing canonicals to staging, old domains, or unrelated routes."],
        ["Review important pages after every launch or migration.", "Assuming metadata stayed correct after a redesign."],
        ["Keep SEO honest and readable.", "Stuffing repeated keywords into titles, descriptions, or headings."]
      ]
    ),

    p(`SEO findings should be compared with route behavior. If an important page does not appear in Routes, confirm that the page was visited, the snippet is installed, and the selected site is correct. If a route appears with weak metadata, open the live page and inspect whether the page source matches what the team expected.`),

    p(`SEO findings should also be compared with 404 and error signals. A page with missing assets, broken scripts, failed navigation, or repeated missing routes may have a larger site-quality problem. Metadata is important, but it is only one part of whether a page is healthy and trustworthy.`),

    table(
      ["If SEO shows", "What to check next"],
      [
        ["Missing title", "Check the page metadata, layout defaults, and CMS SEO title field."],
        ["Missing description", "Check the page description field or framework metadata configuration."],
        ["Duplicate title", "Check whether multiple pages are using the same default metadata."],
        ["Wrong canonical", "Check domain settings, redirects, canonical tag generation, and route configuration."],
        ["No useful headings", "Review the page content structure and main heading."],
        ["No fresh snapshot", "Visit or recheck the live page after publishing changes."],
        ["Unexpected page context", "Confirm the selected site, saved origin, route, and installed snippet are correct."]
      ]
    ),

    p(`For teams, SEO review should create a clear handoff. A useful handoff names the route, the issue, the source field or file that likely needs editing, the owner, and the expected result after the fix. This keeps SEO work practical instead of vague.`),

    table(
      ["Handoff detail", "What to include"],
      [
        ["Route", "The exact page path being reviewed."],
        ["Issue", "What is missing, duplicated, incorrect, weak, or outdated."],
        ["Source", "Where the fix likely belongs: CMS, page file, layout, metadata config, or platform settings."],
        ["Priority", "Whether the page is high-value, repeated, campaign-related, or lower-risk."],
        ["Owner", "Who should update the page or approve the copy."],
        ["Verification", "How the team will confirm the live page now shows the correct metadata."]
      ]
    ),

    p(`After a fix is published, verify the live page. Open the route, inspect the page title in the browser tab, confirm the visible page content still matches the metadata, and let CavBot collect a newer snapshot. Do not mark the issue resolved only because the code or CMS entry was edited.`),

    list([
      "Publish the metadata change.",
      "Open the live page, not only the preview page.",
      "Confirm the browser tab title changed when relevant.",
      "Confirm the page content matches the title and description.",
      "Confirm the canonical URL points to the intended live route.",
      "Revisit the page so CavBot can collect a newer snapshot.",
      "Review the SEO surface again after the new signal appears."
    ]),

    p(`If SEO looks wrong, start by checking the basics. The wrong selected site, wrong origin, unpublished changes, duplicate snippets, missing page visits, CMS draft state, framework metadata caching, or old deployment can all make a review look confusing.`),

    table(
      ["Problem", "What to check"],
      [
        ["SEO data is missing", "Confirm the page was published, visited, and connected to the correct CavBot site."],
        ["SEO data looks old", "Publish the latest page, revisit the live route, and allow a newer snapshot to be collected."],
        ["Wrong page appears", "Confirm the selected site, origin, route, and canonical URL."],
        ["Metadata changed but CavBot still shows old data", "Check caching, deployment state, and whether the live page was visited after the change."],
        ["Important page is blocked", "Review robots settings, page visibility, password protection, and platform settings."],
        ["Title or description is duplicated", "Check global layout defaults and CMS templates."],
        ["Canonical points to the wrong place", "Review routing, domain redirects, canonical generation, and old environment values."]
      ]
    ),

    p(`SEO should be reviewed regularly, but especially after major changes. Launches, redesigns, migrations, pricing changes, domain changes, CMS changes, and new campaigns can all affect metadata and route structure. A quick review after these moments can prevent important pages from being unclear, duplicated, blocked, or pointed at the wrong URL.`),

    table(
      ["Review SEO after", "Reason"],
      [
        ["Launch", "Confirm public pages have clean metadata before traffic arrives."],
        ["Redesign", "Make sure visual changes did not weaken page structure."],
        ["Migration", "Check canonical URLs, route changes, redirects, and missing pages."],
        ["Pricing update", "Confirm pricing and plan pages still have accurate titles and descriptions."],
        ["New campaign", "Review landing pages before ads, emails, or social posts send traffic."],
        ["Domain change", "Check canonical URLs, redirects, and saved site origin."],
        ["CMS update", "Confirm templates did not overwrite page-level metadata."]
      ]
    ),

    note("Focus", "Start with the homepage, pricing page, product pages, docs, blog, support pages, legal pages, and any route used in campaigns, launch materials, sales conversations, or investor outreach."),

    p(`CavBot SEO should help the team stay honest about page quality. The goal is not to chase every small search theory. The goal is to make sure important pages are clear, readable, well-structured, correctly represented, and easy to trust.`),

    note("Core rule", "Fix SEO at the source, publish the page, visit the live route, then review the new CavBot snapshot. A page is only clean when the live page shows the correct metadata.")
  ]
},

     {
  id: "a11y",
  title: "A11y",
  summary: "Review accessibility signals that affect how people use the site.",
  blocks: [
    p(`A11y means accessibility. In CavBot, A11y helps teams review whether a connected website can be used by people with different devices, input methods, vision needs, motion preferences, and browsing conditions. It looks for barriers that may make a page harder to read, navigate, understand, or complete.`),

    p(`Use A11y when you need to check whether important pages are usable beyond the visual design. A page can look polished and still be difficult for someone using a keyboard, screen reader, smaller screen, reduced-motion setting, high zoom, or assistive technology.`),

    p(`A11y snapshots can help identify concerns such as missing alt text, missing form labels, weak button names, focus-visible problems, keyboard traps, heading order issues, landmark concerns, missing skip links, reduced-motion support, and contrast concerns where available.`),

    p(`Accessibility is not only a compliance task. It affects real product use. If a visitor cannot reach a button, understand a form, see the focused element, read the text, close a modal, use a menu, or understand the page structure, the website is creating friction that should be reviewed.`),

    table(
      ["Area", "What to review"],
      [
        ["Images", "Important images should have useful alt text. Decorative images should not create noise."],
        ["Forms", "Inputs should have clear labels, instructions, errors, and success states."],
        ["Buttons and links", "Interactive controls should have readable names and clear purpose."],
        ["Keyboard use", "Visitors should be able to move through the page without a mouse."],
        ["Focus states", "The focused element should be visible and easy to follow."],
        ["Headings", "The page should have a clear structure that matches the content."],
        ["Menus and modals", "Overlays should open, focus, and close without trapping the user."],
        ["Motion", "Animations should respect reduced-motion preferences where possible."]
      ]
    ),

    p(`Start with the pages that matter most. Review the homepage, pricing page, signup page, login page, checkout page, product pages, forms, docs, support pages, account pages, dashboards, and any route where a visitor needs to complete an action.`),

    list([
      "Review forms and buttons first.",
      "Confirm keyboard navigation works.",
      "Check visible focus states.",
      "Use meaningful alt text for important images.",
      "Keep decorative images quiet for assistive technology.",
      "Avoid trapping focus inside menus, drawers, or modals.",
      "Respect reduced-motion preferences.",
      "Verify important fixes manually after updating the page."
    ]),

    p(`Forms deserve special attention because they are often where a visitor is trying to sign up, contact the team, request support, start checkout, log in, reset a password, or complete another important action. A form should tell the user what each field is for, what went wrong, and what happened after submission.`),

    table(
      ["Form concern", "Why it matters"],
      [
        ["Missing label", "The user may not know what information the field expects."],
        ["Unclear error message", "The user may not know how to fix the problem."],
        ["No success state", "The user may not know whether the form submitted."],
        ["Keyboard issue", "The user may be unable to reach or submit the form."],
        ["Weak focus state", "The user may lose track of where they are on the page."],
        ["Placeholder-only instruction", "The instruction may disappear when the user starts typing."]
      ]
    ),

    p(`Buttons and links should be clear on their own. A visitor should be able to understand what will happen before activating the control. Avoid vague labels when the action matters. “Submit” may be acceptable in some simple forms, but “Start trial,” “Send message,” “Download report,” or “Save changes” is often clearer.`),

    p(`Keyboard navigation should be tested on every important workflow. A user should be able to move forward, move backward, open menus, close overlays, submit forms, skip repeated navigation when supported, and reach the main action without getting stuck.`),

    p(`Focus should be visible. When someone uses the keyboard, the page should clearly show where they are. Removing focus outlines without replacing them with a clear visible style can make the page difficult or impossible to use without a mouse.`),

    table(
      ["Keyboard check", "Expected behavior"],
      [
        ["Tab through the page", "Focus moves in a logical order."],
        ["Shift + Tab backward", "Focus returns through the page without skipping important controls."],
        ["Open a menu", "Focus moves into the menu or remains understandable."],
        ["Close a modal", "Focus returns to a sensible place."],
        ["Submit a form", "The user can complete the action without a mouse."],
        ["Use skip link when present", "The user can move past repeated navigation."]
      ]
    ),

    p(`Headings should describe the page structure. The main heading should explain the page, and section headings should organize the content below it. Headings should not be used only because they look large. They should help people understand the page order.`),

    p(`Alt text should explain meaningful images. Product screenshots, diagrams, charts, icons used as controls, and important visuals should have descriptions that help a person understand what the image contributes. Decorative images should not be read as important content.`),

    table(
      ["Image type", "Recommended treatment"],
      [
        ["Product screenshot", "Describe the product state or key information shown."],
        ["Chart or diagram", "Explain the main point, not every visual detail."],
        ["Icon button", "Give the button a clear accessible name."],
        ["Decorative image", "Keep it hidden from assistive technology when it adds no meaning."],
        ["Logo", "Use a clear brand name when the logo identifies the site or company."]
      ]
    ),

    p(`Menus, drawers, dialogs, and modals should be reviewed carefully. These surfaces can easily create accessibility problems if focus moves unpredictably, the close button is hard to reach, the background stays active, or keyboard users become trapped.`),

    list([
      "Make sure modals can be closed.",
      "Make sure focus does not disappear behind an overlay.",
      "Keep close buttons reachable by keyboard.",
      "Do not place important actions outside the keyboard path.",
      "Avoid hidden controls that can still receive focus.",
      "Return focus to a sensible place after closing an overlay."
    ]),

    p(`Motion should be used with care. Some visitors reduce motion because animation can be distracting, uncomfortable, or difficult to follow. Pages should avoid forcing unnecessary motion, especially for major transitions, background effects, loading states, and repeated animations.`),

    p(`Contrast and readability matter because visitors need to read the page in real conditions. Thin text, low-contrast text, small labels, text over busy images, and unclear disabled states can make a page harder to use even when the design looks elegant.`),

    table(
      ["Readability concern", "What to check"],
      [
        ["Low contrast text", "Confirm text is readable against the background."],
        ["Small text", "Check whether labels, helper text, and error text are readable."],
        ["Text over images", "Use an overlay or simpler background when needed."],
        ["Disabled controls", "Make sure disabled states are understandable."],
        ["Long dense sections", "Use headings, spacing, and clear paragraphs to help scanning."]
      ]
    ),

    p(`A11y findings should be reviewed with real user impact in mind. A missing label on a checkout field matters more than a minor issue on a low-risk decorative page. A keyboard trap in a signup modal deserves immediate attention. A heading issue on a long docs page may affect understanding and should be cleaned up.`),

    table(
      ["Priority", "When to treat it this way"],
      [
        ["Critical", "The issue blocks signup, login, checkout, payment, account access, support, or another core action."],
        ["High", "The issue affects forms, modals, navigation, important buttons, or high-traffic pages."],
        ["Medium", "The issue affects readability, structure, image understanding, or page clarity."],
        ["Low", "The issue is minor, isolated, decorative, or unlikely to block the visitor."],
        ["Watch", "The issue is not urgent yet, but should be checked again after layout or content changes."]
      ]
    ),

    p(`After reading an A11y signal, fix the source page. This may mean updating markup, labels, button text, alt text, heading structure, modal behavior, CSS focus styles, motion settings, or component logic. The fix should happen where the live page is created, not only inside the report.`),

    list([
      "Fix missing labels in the source form component or CMS field.",
      "Fix weak button names where the button is rendered.",
      "Fix heading order in the page content or layout.",
      "Fix focus states in the page CSS or design system.",
      "Fix modal focus behavior in the component logic.",
      "Fix alt text in the image field, component, or content entry.",
      "Fix motion behavior in the animation or interaction code."
    ]),

    p(`Automated snapshots help find problems, but they do not replace manual review. Some accessibility problems can only be confirmed by using the page. After a fix, open the page and test the actual experience instead of trusting the report alone.`),

    table(
      ["Manual check", "How to verify"],
      [
        ["Keyboard navigation", "Use Tab, Shift + Tab, Enter, Space, and Escape on important flows."],
        ["Visible focus", "Confirm the focused element is clearly visible."],
        ["Forms", "Submit the form, trigger errors, and confirm the messages are understandable."],
        ["Images", "Review whether important images have meaningful text alternatives."],
        ["Modals", "Open and close overlays without using a mouse."],
        ["Motion", "Check that reduced-motion preferences are respected where supported."],
        ["Screen reader check", "Use a screen reader when possible for important flows."]
      ]
    ),

    p(`A11y should be compared with other CavBot surfaces. An accessibility issue may appear on the same route that has SEO problems, browser errors, high exit behavior, or repeated 404 recovery. When the same page shows multiple concerns, review it as a page-quality issue, not as a single isolated warning.`),

    table(
      ["If A11y shows", "What to check next"],
      [
        ["Missing form labels", "Open the route and test the form directly."],
        ["Focus issues", "Use keyboard navigation on the affected page."],
        ["Heading structure problems", "Review page content and compare with SEO structure."],
        ["Modal or menu concerns", "Test open, close, focus order, and keyboard behavior."],
        ["Image alt text issues", "Review important images and decorative images separately."],
        ["Motion concerns", "Check animations, transitions, loaders, and reduced-motion behavior."],
        ["Repeated issues on one page", "Open Reports, Routes, SEO, and Errors to understand the wider page state."]
      ]
    ),

    p(`For developers, the safest workflow is to reproduce the barrier before changing the component. Open the affected page, test the interaction, confirm what is actually difficult, make the smallest safe fix, and test again with keyboard and browser review.`),

    p(`For designers, A11y review helps protect the experience behind the visual system. Contrast, focus states, spacing, labels, motion, and reading order should be treated as part of the design, not as cleanup after the page is built.`),

    p(`For owners and operators, A11y should be treated as product quality. A website that is easier to use is easier to trust. Accessibility improvements can help more visitors complete the action they came to complete.`),

    table(
      ["Team", "How A11y helps"],
      [
        ["Founder or owner", "Shows whether important pages are usable and trustworthy."],
        ["Developer", "Points to markup, focus, form, keyboard, and component issues."],
        ["Designer", "Highlights contrast, motion, layout, focus, and readability concerns."],
        ["Marketing", "Helps keep landing pages, forms, and campaign pages easier to use."],
        ["Support", "Helps explain user friction on forms, account access, and help pages."],
        ["QA reviewer", "Gives a focused checklist for page usability before launch."]
      ]
    ),

    p(`If A11y looks empty or outdated, check setup first. Confirm the selected site is correct, the live route was visited, the snippet is installed on the page, the page is public, and the latest version has been published.`),

    table(
      ["Problem", "What to check"],
      [
        ["No A11y data appears", "Confirm the selected site, snippet install, public page, and live browser visit."],
        ["Data looks old", "Publish the latest page and revisit the live route."],
        ["Wrong page appears", "Confirm the selected site, origin, and route."],
        ["Issue remains after fix", "Check whether the live page actually changed and whether the component still renders the old markup."],
        ["Keyboard behavior still fails", "Test the exact interaction and review focus management."],
        ["Form issue still appears", "Check labels, helper text, validation, and error messages in the live form."],
        ["Motion concern remains", "Check animation settings and reduced-motion handling."]
      ]
    ),

    p(`Review A11y after major changes. Redesigns, new forms, new navigation, modals, pricing updates, checkout changes, dashboards, documentation updates, and new landing pages can all introduce barriers. A quick review before and after launch can prevent avoidable friction.`),

    list([
      "Review after a redesign.",
      "Review after adding a form.",
      "Review after changing navigation.",
      "Review after adding a modal, drawer, or menu.",
      "Review after changing checkout, signup, login, or account flows.",
      "Review after adding animations or new visual effects.",
      "Review after publishing major landing pages or campaign pages."
    ]),

    note("Review rule", "Automated snapshots can point to problems. Manual review confirms whether people can actually use the page."),

    p(`A11y should make the team more careful, not more afraid. The goal is to find barriers, fix the source, and verify the real experience. Good accessibility work makes the website clearer, calmer, and easier to use for everyone.`),

    note("Core rule", "Start with forms, buttons, keyboard navigation, focus states, headings, alt text, modals, contrast, and motion. Fix the source page, then test the live experience manually.")
  ]
},

      {
  id: "cavbot-insights",
  title: "Insights",
  summary: "Read prioritized observations from the connected site.",
  blocks: [
    p(`Insights turns connected site activity into clear observations the team can review. It helps owners, developers, designers, marketers, and support teams understand what may need attention without opening every surface first.`),

    p(`Use Insights when you want a focused starting point. Instead of looking at routes, errors, SEO, accessibility, 404 activity, reports, and page behavior one by one, Insights can point to the areas that appear most important based on the signals CavBot has available.`),

    p(`An insight is not the final answer. It is a prompt to inspect the source. Before changing production, open the affected route, review the source module, confirm the timestamp, and decide whether the issue still matters. Insights help focus the review, but the team still owns the decision and the fix.`),

    p(`Insights can include observations from route behavior, missing paths, browser errors, page metadata, accessibility concerns, page experience, visitor engagement, sign-up or sign-in paths, recovery activity, geographic trends, and other workspace signals when the underlying data exists.`),

    table(
      ["Insight area", "What it can help identify"],
      [
        ["Routes", "Important pages, unexpected paths, repeated old routes, or pages visitors are still trying to reach."],
        ["404 activity", "Missing paths that may need a redirect, restored page, corrected link, or clearer recovery flow."],
        ["Errors", "Browser issues that may affect a real visitor path or important page action."],
        ["SEO", "Missing, weak, duplicated, outdated, or unclear page metadata and structure."],
        ["A11y", "Accessibility barriers around forms, buttons, headings, images, focus, navigation, or motion."],
        ["Page experience", "Layout, clarity, readability, friction, or page behavior that may need review."],
        ["Engagement", "Signals that suggest visitors may be stopping, repeating an action, or missing the intended path."],
        ["Account paths", "Issues around signup, login, onboarding, or protected user actions when those signals are available."],
        ["Location trends", "Regional traffic or signal patterns that may help explain where activity is coming from."]
      ]
    ),

    p(`The best way to use Insights is to treat each observation as a lead. Read the insight, open the source route or module, confirm what CavBot is pointing to, then decide whether the team should fix, monitor, document, or ignore the item.`),

    list([
      "Read the insight first.",
      "Open the affected route or source module.",
      "Confirm the issue still exists on the live site.",
      "Check whether the issue affects an important visitor path.",
      "Decide whether to fix, monitor, document, or dismiss it.",
      "Use CavPad when the issue needs coordination.",
      "Ship the smallest safe change when a fix is needed.",
      "Verify the result after the change is live."
    ]),

    p(`Insights should be prioritized by impact. A repeated issue on a checkout, signup, login, pricing, docs, support, or contact route deserves more attention than a one-time signal on a low-risk page. A missing route that receives repeated traffic may matter more than a single random path.`),

    table(
      ["Priority", "When to treat it this way"],
      [
        ["Critical", "The insight points to checkout, payment, signup, login, account access, security, or another core action."],
        ["High", "The insight repeats on an important public page or affects a page used by customers, prospects, or teammates."],
        ["Medium", "The insight may affect the page experience, but does not clearly block a key action."],
        ["Low", "The insight appears isolated, minor, or connected to a low-risk page."],
        ["Watch", "The insight is not urgent yet, but should be reviewed again if it repeats or grows."]
      ]
    ),

    p(`A strong Insights workflow starts with the selected site. Confirm that the workspace is using the correct site before reading the observations. If the wrong site is selected, the insight may point to an environment, subdomain, or test origin that is not the production site the team meant to review.`),

    p(`After confirming the site, review the highest-priority observations first. Look for signals tied to pages that affect trust, revenue, account access, support, documentation, or conversion. Then move to lower-risk items such as minor metadata cleanup, isolated accessibility concerns, or old routes with little activity.`),

    table(
      ["If the insight mentions", "Open this next"],
      [
        ["A missing route", "Open Routes or 404 Recovery."],
        ["A repeated browser issue", "Open Errors."],
        ["Weak page metadata", "Open SEO and inspect the live page."],
        ["Accessibility barriers", "Open A11y and test the page manually."],
        ["A broken recovery path", "Open 404 Recovery and Arcade settings."],
        ["A confusing page pattern", "Open the live route and review the page experience."],
        ["A team decision is needed", "Create a CavPad note with the route, issue, owner, and next step."],
        ["A wider review is needed", "Generate or open a Report for the selected site."]
      ]
    ),

    p(`Insights are most useful when they lead to clear action. A good observation should help the team decide what to inspect, why it matters, and what the next step should be. If an insight is unclear, do not guess. Open the source module and review the original signal before making changes.`),

    p(`For example, an insight about a repeated missing pricing route should lead the team to open 404 Recovery, check whether visitors are still reaching that path, identify where the bad link may be coming from, and decide whether to redirect, restore, or correct the source link.`),

    p(`An insight about weak homepage metadata should lead the team to open SEO, inspect the title, description, heading structure, and canonical URL, then update the live page source or CMS fields before asking CavBot to collect a newer snapshot.`),

    p(`An insight about a form accessibility issue should lead the team to open A11y, test the form with keyboard navigation, review labels and error messages, fix the source component, and verify the live page manually.`),

    table(
      ["Insight example", "Good next step"],
      [
        ["Repeated missing route", "Review the path in 404 Recovery and decide whether it needs a redirect, restore, or source-link fix."],
        ["Browser error on signup", "Open Errors, reproduce the signup path, and verify whether the issue blocks account creation."],
        ["Missing page description", "Open SEO, update the source metadata, publish the page, and collect a newer snapshot."],
        ["Form label concern", "Open A11y, inspect the form, fix labels or instructions, and test the form manually."],
        ["Low engagement on an important page", "Open the live route and review clarity, call to action, load behavior, and page structure."],
        ["Unexpected regional signal", "Review location context and confirm whether the pattern matches expected traffic or a new audience."]
      ]
    ),

    p(`Insights should not be used to make blind changes. Do not rewrite a page, remove a route, rotate a key, change billing, delete files, or ship code only because an insight appeared. Use the insight to guide review, then act after the source signal is confirmed.`),

    list([
      "Do not treat an insight as proof without reviewing the source.",
      "Do not change production before confirming the affected route.",
      "Do not fix low-impact items before urgent visitor-blocking issues.",
      "Do not ignore repeated signals on important pages.",
      "Do not let old insights stay open after the source issue is fixed.",
      "Do not use Insights as a replacement for Reports, source modules, or live browser testing."
    ]),

    p(`Insights are also useful for team coordination. When an observation needs more than one person, create a CavPad note or report summary. Include the route, signal, reason it matters, owner, next step, and verification plan. This keeps the review clear and prevents the same issue from being rediscovered later.`),

    table(
      ["Handoff detail", "What to include"],
      [
        ["Route", "The affected page or path."],
        ["Signal", "What CavBot noticed."],
        ["Impact", "Why the issue may matter to visitors or the business."],
        ["Source", "The module or page where the signal should be verified."],
        ["Owner", "Who should review or fix the issue."],
        ["Next step", "Whether to fix, monitor, document, or dismiss."],
        ["Verification", "How the team will confirm the issue is resolved."]
      ]
    ),

    p(`For owners, Insights can help decide what deserves attention first. For developers, Insights can point toward the route, script, form, metadata, or component that needs review. For designers, Insights can highlight page clarity, accessibility, and recovery issues. For marketers, Insights can reveal campaign paths, landing page problems, and important pages that need cleanup.`),

    table(
      ["Team", "How Insights helps"],
      [
        ["Owner", "Prioritizes what needs review across the selected site."],
        ["Developer", "Points toward routes, errors, redirects, components, and page behavior that may need repair."],
        ["Designer", "Highlights page experience, accessibility, layout, and clarity concerns."],
        ["Marketing", "Surfaces landing page, campaign, SEO, and broken path issues."],
        ["Support", "Helps explain where visitors may be getting stuck or sent to the wrong place."],
        ["Founder", "Creates a faster operating view of what needs attention before demos, launches, or investor reviews."]
      ]
    ),

    p(`Insights can only be as useful as the signals available. If a site is not connected correctly, if the snippet is missing, if the wrong site is selected, or if no real visits have happened yet, Insights may be empty, limited, or less useful. Start by checking setup when the surface does not show what the team expects.`),

    table(
      ["Problem", "What to check"],
      [
        ["No insights appear", "Confirm the selected site, installed snippet, public page visit, and available signal history."],
        ["Insights look unrelated", "Check whether the wrong site, project, or environment is selected."],
        ["Insight looks old", "Confirm the page was updated, published, revisited, and rechecked after the change."],
        ["Insight points to a route that no longer matters", "Dismiss or document it if the route is intentionally removed and receives no meaningful traffic."],
        ["Insight keeps returning after a fix", "Check whether the live page actually changed and whether the source signal still exists."],
        ["Too many low-value items appear", "Start with business-critical pages and repeated signals before reviewing smaller cleanup items."]
      ]
    ),

    p(`After fixing an issue, return to the source module and confirm the result. If the insight came from SEO, verify the live metadata. If it came from A11y, test the page manually. If it came from Errors, reproduce the action and watch whether the error stops. If it came from a missing route, confirm the redirect, restored page, or corrected link works.`),

    list([
      "Verify the live page after the fix.",
      "Check the source module again.",
      "Confirm the signal has stopped, improved, or been intentionally dismissed.",
      "Update any CavPad notes or team handoffs.",
      "Review related routes if the issue may affect more than one page.",
      "Keep watching repeated signals after launches, migrations, and campaigns."
    ]),

    p(`Insights should make the workspace easier to operate. It should not replace careful review, but it should help the team spend less time searching for what matters and more time improving the site.`),

    note("Use with judgment", "Insights help focus attention. The team still owns the final decision, the fix, and the production review."),

    note("Core rule", "Read the insight, verify the source, judge the impact, make the smallest safe change, and confirm the result on the live site.")
  ]
},

      {
  id: "404-control-room",
  title: "404 Recovery",
  summary: "Investigate missing routes, recovery behavior, and broken-page patterns.",
  blocks: [
    p(`404 Recovery is the review surface for missing routes. It helps the team understand which URLs visitors are reaching that the site cannot find, how often those paths appear, and what should happen next.`),

    p(`A 404 is not only a technical status. It is a visitor reaching a dead end. Sometimes that dead end is harmless, like a one-time typo. Other times it points to a real problem, such as a missing pricing page, a broken campaign link, a deleted product route, a moved docs article, a failed redirect, or an old URL that people still use.`),

    p(`Use 404 Recovery when you need to separate random noise from broken paths that matter. The goal is to decide whether a missing route should be redirected, restored, corrected at the source link, supported with Arcade recovery, or left alone because it does not deserve action.`),

    p(`Open 404 Recovery after launches, redesigns, site migrations, pricing changes, campaign updates, product route changes, docs changes, and any release that touches navigation or routing. These are the moments when broken paths are most likely to appear.`),

    table(
      ["404 area", "What it helps you understand"],
      [
        ["Missing route", "The path a visitor reached that the website could not find."],
        ["Frequency", "Whether the path appeared once or keeps repeating."],
        ["Business value", "Whether the missing route is tied to pricing, signup, checkout, docs, support, login, or another important flow."],
        ["Likely source", "Whether the path may come from navigation, an old campaign, a search result, a bookmark, an email, or an external link."],
        ["Recovery option", "Whether the route should be redirected, restored, fixed at the source, supported with Arcade, or left unavailable."],
        ["Follow-up work", "Whether the team needs to repair a link, update a sitemap, add a redirect, restore content, or review a recent release."]
      ]
    ),

    p(`Start with repeated routes. One strange path may come from a typo, a bot, a copied URL, or a visitor testing something. A route that appears again and again deserves more attention because it may be connected to a real source that is still sending people to the wrong place.`),

    list([
      "Identify which missing routes are repeated.",
      "Check whether the path should exist.",
      "Review whether the route supports an important business flow.",
      "Look for the source of the broken path.",
      "Add a redirect when the content moved.",
      "Restore the page when the route still matters.",
      "Fix internal links that point to the wrong path.",
      "Use Arcade when the recovery moment should feel designed.",
      "Leave invalid paths alone when they do not deserve a destination."
    ]),

    p(`Priority matters. A missing checkout path is not the same as a random mistyped URL. A broken docs route used by customers may matter more than an old test path. A missing campaign page may waste paid traffic. A deleted product route may lose visitors who were ready to buy or learn more.`),

    table(
      ["Priority", "When to treat it this way"],
      [
        ["Critical", "The missing route affects checkout, payment, login, signup, account access, security, or another core action."],
        ["High", "The route supports pricing, product pages, docs, support, campaigns, lead capture, or customer-facing content."],
        ["Medium", "The route looks meaningful but does not clearly block a key action."],
        ["Low", "The route appears once, looks random, or does not connect to an important page."],
        ["Watch", "The route is not urgent yet, but should be reviewed again if it repeats or grows."]
      ]
    ),

    p(`A good 404 review begins with the route itself. Read the path carefully. Ask whether the route looks like a real page, an old page, a mistyped URL, a missing asset, a campaign link, a bot request, or a route created by a recent site change.`),

    p(`Then review the context. Look at how often the route appears, whether it started after a release, whether it resembles a known page, whether it belongs to a campaign, and whether the missing path could interrupt a visitor who had a real goal.`),

    table(
      ["404 pattern", "What it may mean"],
      [
        ["One random missing route", "A visitor may have typed the URL incorrectly, or the request may not matter."],
        ["Repeated pricing route", "A pricing page may have moved, or an old link may still be sending traffic."],
        ["Repeated product route", "A product page may have been deleted, renamed, or moved without a redirect."],
        ["Repeated docs route", "Documentation may have moved, or internal docs links may be outdated."],
        ["Campaign-style path", "An ad, email, launch post, QR code, or social link may be wrong."],
        ["Missing asset path", "An image, script, stylesheet, font, or file reference may be broken."],
        ["Many similar paths", "A migration, slug change, route rule, or framework change may need review."]
      ]
    ),

    p(`Not every missing route should be fixed the same way. The right action depends on whether the content still exists, whether visitors still need it, whether the route has a useful replacement, and whether the broken path is coming from a source the team controls.`),

    table(
      ["Action", "Use it when"],
      [
        ["Redirect", "The content moved to a new route and visitors should be sent there automatically."],
        ["Restore", "The route was removed but the page still matters to visitors or the business."],
        ["Fix the source link", "The website, campaign, email, docs page, or external reference points to the wrong URL."],
        ["Use Arcade recovery", "The missing-page experience should feel more designed while the team reviews or repairs the path."],
        ["Leave unavailable", "The path is invalid, unsafe, meaningless, or not worth sending anywhere."],
        ["Watch", "The route is unclear and should be reviewed again if it repeats."]
      ]
    ),

    p(`Redirects should be used when there is a clear replacement page. If /old-pricing moved to /pricing, visitors should not land on a dead end. If an old product page moved to a new product route, send visitors to the best matching destination. A redirect should help the visitor continue without confusion.`),

    p(`Restoring a page is the better choice when the route still deserves its own content. If people keep reaching an old docs article, product page, support guide, or landing page, the team should decide whether the content should exist again instead of forcing everyone to a less helpful page.`),

    p(`Fixing the source link is the right choice when the broken route comes from a place the team controls. If the navigation, footer, dashboard, email template, docs page, blog post, or campaign link points to the wrong path, correct the source so new visitors stop being sent to the missing route.`),

    p(`Arcade recovery is useful when the 404 page should feel more intentional. It can give visitors a short, branded recovery moment while still giving them a clear way back to the site. Arcade should support recovery. It should not hide the fact that a route needs review.`),

    note("Recovery rule", "Arcade can improve the broken-page experience, but repeated missing routes still need a decision: redirect, restore, fix the source link, or leave unavailable on purpose."),

    p(`A strong 404 page should not trap the visitor. Whether Arcade is installed or not, the page should explain that the route was not found and provide useful ways forward. The visitor should be able to return home, search, open docs, contact support, go to pricing, sign in, or continue to another important page.`),

    list([
      "Keep a clear Home link visible.",
      "Include Search or Docs when the site has searchable content.",
      "Include Support or Contact when visitors may need help.",
      "Include Pricing, Product, Dashboard, or Account links when those routes matter.",
      "Keep recovery actions near the missing-page message.",
      "Do not make a game, animation, or visual element the only way forward."
    ]),

    p(`404 Recovery should also be used after migrations. Site migrations often create broken paths because old slugs, old folders, old CMS routes, and old platform URLs may continue to receive visits. A clean migration review should include redirects for important old paths and a check for repeated missing routes after launch.`),

    table(
      ["After this change", "Review 404s for"],
      [
        ["Website launch", "Unpublished pages, wrong links, missing core routes, and early visitor confusion."],
        ["Redesign", "Changed navigation, deleted pages, renamed sections, and broken internal links."],
        ["Migration", "Old slugs, missing redirects, changed platform routes, and lost content."],
        ["Pricing update", "Old pricing pages, plan routes, checkout paths, and signup links."],
        ["Docs update", "Moved guides, renamed categories, deleted articles, and outdated links."],
        ["Campaign launch", "Landing page paths, ad links, QR codes, launch posts, and email URLs."]
      ]
    ),

    p(`When a missing route appears after a release, compare the first seen time with the release time. If the 404 started immediately after a deployment, content update, route change, or platform migration, review that change first. The cause may be closer than it looks.`),

    p(`Missing asset paths should be handled carefully. A 404 is not always a page. It can be an image, script, stylesheet, font, video, JSON file, or download path that the page expects to load. Missing assets can break layout, visuals, performance, or functionality even when the main page appears to load.`),

    table(
      ["If the missing path looks like", "Check this"],
      [
        ["/pricing-old", "Old page, campaign link, redirect rule, or renamed route."],
        ["/docs/getting-started", "Moved documentation, sidebar link, search result, or stale docs link."],
        ["/products/item-name", "Deleted product, changed slug, storefront route, or inventory page."],
        ["/assets/file.png", "Image path, deployment output, CDN upload, or broken reference."],
        ["/_next/static/...", "Build output, deployment cache, framework asset path, or stale client bundle."],
        ["/campaign/spring", "Ad URL, email link, QR code, or launch material."],
        ["/wp-content/...", "Bot traffic, old WordPress path, migrated site residue, or external request."]
      ]
    ),

    p(`404 Recovery should be compared with Routes, Errors, SEO, Reports, and Arcade. A missing route may also create browser errors, weak metadata, bad recovery behavior, or a confusing visitor path. If the same page or path appears in multiple surfaces, treat it as a larger site-quality issue.`),

    table(
      ["If 404 Recovery shows", "Open this next"],
      [
        ["Repeated missing page", "Open Routes and decide whether the path should exist."],
        ["Missing asset path", "Open the live page and inspect the broken asset reference."],
        ["Broken page with visitor complaints", "Open Reports or CavPad to document the issue and next step."],
        ["Missing route with errors nearby", "Open Errors and check whether the route caused runtime failures."],
        ["Missing route tied to search or metadata", "Open SEO and inspect related page structure."],
        ["404 page with Arcade installed", "Open Arcade settings and verify recovery links are visible."]
      ]
    ),

    p(`For developers, a 404 review should lead to a concrete fix. Check route files, framework routing rules, redirects, middleware, platform rewrites, CMS slugs, asset paths, deployment output, and any code that generates links. The fix should be made where the route is created or referenced.`),

    p(`For owners and operators, a 404 review should focus on visitor impact. Ask whether the missing route affects sales, signup, support, trust, onboarding, documentation, account access, or a public campaign. If it does, move it higher in the queue.`),

    p(`For marketing teams, 404 Recovery is especially useful after campaigns. Old links can live inside emails, social posts, partner pages, ads, QR codes, pitch decks, and search results. If those links continue to send visitors to missing pages, the campaign experience is weaker than it should be.`),

    table(
      ["Team", "How 404 Recovery helps"],
      [
        ["Owner", "Shows which missing routes may affect trust, sales, or customer experience."],
        ["Developer", "Points to broken paths, missing redirects, route rules, and asset references that need repair."],
        ["Marketing", "Helps catch old campaign links, wrong landing pages, and broken launch URLs."],
        ["Support", "Helps explain why users may be reaching missing help, docs, or account pages."],
        ["Designer", "Helps review whether the recovery page gives visitors a clear way forward."],
        ["SEO reviewer", "Helps identify missing content, bad redirects, and old pages that may still receive traffic."]
      ]
    ),

    p(`A useful handoff should include the missing route, how often it appears, when it started, why it matters, the likely source, the chosen action, and the person responsible for the fix. This keeps 404 work practical and prevents the same broken route from being rediscovered later.`),

    table(
      ["Handoff detail", "What to include"],
      [
        ["Missing route", "The exact path that visitors reached."],
        ["Frequency", "Whether the route appeared once, repeated, or spiked."],
        ["First seen", "When the missing route started appearing."],
        ["Impact", "Whether the route affects pricing, signup, checkout, docs, support, account access, or campaigns."],
        ["Likely source", "Navigation, campaign, old page, external link, migration, asset path, or unknown."],
        ["Decision", "Redirect, restore, fix source link, use Arcade, watch, or leave unavailable."],
        ["Owner", "Who will make the change or approve the decision."],
        ["Verification", "How the team will confirm the route is handled correctly."]
      ]
    ),

    p(`After fixing a missing route, test it from the visitor side. Open the old path directly, confirm the redirect or restored page works, check the destination, and make sure the visitor has a clear next step. If the issue came from a source link, test the source link too.`),

    list([
      "Open the missing route directly after the fix.",
      "Confirm the route redirects, restores, or remains unavailable intentionally.",
      "Test the destination page and its main action.",
      "Check desktop and mobile when the route matters.",
      "Verify internal links no longer point to the old path.",
      "Review 404 Recovery again after traffic returns.",
      "Document major fixes in CavPad or a report when the route affected an important flow."
    ]),

    p(`If 404 Recovery looks empty, confirm setup before assuming there are no missing routes. Check the selected site, saved origin, snippet install, public page visits, route activity, and whether the site has received enough traffic for meaningful review.`),

    table(
      ["Problem", "What to check"],
      [
        ["No 404 data appears", "Confirm the selected site, snippet install, public origin, and recent visits."],
        ["Wrong 404s appear", "Check whether the wrong site, subdomain, project, or environment is selected."],
        ["Old routes keep appearing", "Review redirects, search results, external links, bookmarks, emails, ads, and social posts."],
        ["Missing route continues after redirect", "Confirm the redirect is deployed, live, and matches the exact path."],
        ["Arcade does not show on 404", "Confirm the approved loader, selected game, plan access, and live recovery route."],
        ["Many missing routes appear at once", "Review recent migration, release, rewrite rule, navigation change, or deployment output."]
      ]
    ),

    p(`Some missing routes should be ignored. Bots, random scans, fake WordPress paths, old admin paths, and meaningless requests may not deserve redirects. A redirect should help real visitors. It should not turn random noise into unnecessary routing rules.`),

    note("Redirect rule", "Redirect routes that help real visitors continue. Do not create redirects for every random bot path or meaningless request."),

    p(`404 Recovery should make the team calmer and more precise. It shows where visitors hit dead ends, which missing paths matter, and what kind of recovery or repair should happen. Used well, it turns broken routes into clear decisions.`),

    note("Core rule", "Review frequency, source, and business value before acting. Fix important repeated routes, support visitors with clear recovery paths, and keep watching the routes that may grow after launches, migrations, and campaigns.")
  ]
}

    ]
  },


  cavai: {
    path: "/docs/cavai",
    icon: "assets/logo/CavAi Official Logo-svg/2.png",
    label: "CavAi",
    
    title: "CavAi",
    description: "Use CavAi with workspace context, supported models, Caven, image tools, and assistant memory.",
    sections: [
     {
  id: "cavai-v3",
  title: "CavAi v3",
  summary: "Use CavBot’s main assistant for writing, reasoning, planning, website review, and workspace-aware help.",
  blocks: [
    p(`CavAi v3 is the main assistant surface inside CavBot. It is built to help users think, write, review, plan, explain, and work through problems from one place. CavAi can be used as a general assistant, but it becomes more useful inside CavBot because it can also work with project context, selected sites, workspace signals, files, code, notes, and product surfaces when those features are available.`),

    p(`CavAi is not limited to one narrow task. It can help with normal writing, product thinking, technical explanations, planning, website review, code assistance, docs review, image workflows, workspace summaries, and operational questions. The goal is to give users a clear assistant that can help with everyday work while still connecting back to CavBot’s website intelligence platform.`),

    p(`Inside a CavBot workspace, CavAi can help explain what CavBot is showing. If the selected website has route signals, error signals, SEO snapshots, accessibility findings, 404 recovery activity, reports, notes, files, or code context, CavAi can help turn that information into a clearer explanation, checklist, status update, or next-step plan.`),

    p(`Use CavAi when you need help understanding what to do next. Use the dashboard, reports, and signal modules when you need the original source. CavAi can explain, summarize, compare, draft, and organize the work, but important production decisions should still be checked against the actual workspace data before changes are made.`),

    table(
      ["Use CavAi for", "What it helps with"],
      [
        ["General assistance", "Writing, rewriting, planning, brainstorming, explaining ideas, organizing tasks, and turning rough thoughts into clearer output."],
        ["Website review", "Explaining routes, errors, SEO signals, accessibility findings, 404 activity, reports, and site health concerns."],
        ["Workspace context", "Summarizing the selected project, selected site, recent signals, files, notes, and available workspace information when connected."],
        ["Technical work", "Explaining code, drafting fixes, reviewing snippets, preparing implementation plans, and helping with CavCode workflows."],
        ["Business work", "Drafting product copy, support notes, investor messages, launch checklists, feature plans, and internal documentation."],
        ["Creative work", "Supporting image prompts, brand direction, visual planning, content ideas, and structured creative briefs when image tools are available."]
      ]
    ),

    p(`The strongest CavAi results come from clear instructions. Tell CavAi what you are working on, what surface you are looking at, what result you want, and what should not change. A vague question usually produces a vague answer. A specific request gives CavAi a better path.`),

    list([
      "Ask CavAi to explain a signal when you do not understand what CavBot is showing.",
      "Ask CavAi to summarize a website issue before you send it to a teammate.",
      "Ask CavAi to turn a dashboard state into a short status update.",
      "Ask CavAi to review a route, page, feature, or document with a clear goal.",
      "Ask CavAi to draft a checklist before launch, migration, redesign, or release.",
      "Ask CavAi to help with code only after naming the file, issue, and expected behavior.",
      "Ask CavAi to compare options when you are deciding what to fix first."
    ]),

    p(`Good prompts are direct. Instead of asking “what is wrong with my website,” ask “review the selected site and tell me the first three things I should check before launch.” Instead of asking “fix this,” ask “explain this error, identify the likely cause, and give me the smallest safe fix.” Instead of asking “make this better,” ask “rewrite this section so it is clearer, more professional, and still matches CavBot’s product voice.”`),

    code(`Review the selected site and tell me what needs attention first.

Summarize the latest route and error signals into a short team update.

Explain this 404 recovery issue in plain language and give me the safest next step.

Review this pricing page copy and make it clearer without making it sound generic.

Look at this code snippet, explain the problem, and suggest the smallest safe fix.

Turn these notes into a clean launch checklist.`),

    p(`When workspace context is available, CavAi may be able to use the active project, selected site, current route, page content, uploaded files, CavPad notes, CavCloud files, CavCode files, reports, and signal summaries. The exact context depends on what the user has opened, what the workspace allows, and what the current plan supports.`),

    p(`CavAi should not be treated as a hidden authority over the workspace. It should explain what it can see and help the user act with more clarity. If a signal is missing, stale, incomplete, or unclear, the answer should reflect that. It is better for CavAi to say that more review is needed than to pretend a weak signal is certain.`),

    p(`For website operations, CavAi is most useful after CavBot has real site data. A brand-new workspace may not have enough signals yet. After installing Analytics v5, visit the live site, open important routes, trigger normal user flows, and return to CavBot so CavAi has useful context to work from.`),

    note("Best workflow", "Use CavAi to understand, organize, and prepare the work. Use CavBot modules to verify the original signal before changing production."),

    p(`For writing, CavAi can help turn rough notes into polished content. This can include product copy, documentation, onboarding text, support replies, investor messages, release notes, help center content, internal plans, and website sections. Give CavAi the tone, audience, length, and purpose before asking for the final version.`),

    p(`For technical work, CavAi can help explain an error, draft a fix plan, review a file, compare approaches, or prepare a patch. When the task affects code, name the file, explain the current behavior, explain the desired behavior, and say what must not be changed. This keeps the answer focused and safer to apply.`),

    p(`For CavCode workflows, CavAi should support the developer instead of taking over the project blindly. A good coding workflow is: explain the problem, inspect the file, propose a small change, review diagnostics, run or preview the result, and verify that the fix did not break the surrounding experience.`),

    p(`For image workflows, CavAi can help prepare prompts, improve visual direction, describe what needs to change, and organize creative decisions. Image generation and image editing depend on the available model, plan, and product surface. When using image tools, describe the subject, composition, style, background, lighting, format, and what should stay unchanged.`),

    table(
      ["Situation", "Recommended CavAi request"],
      [
        ["You see a dashboard signal", "Explain what this signal means and what I should check first."],
        ["A route keeps appearing", "Summarize why this route matters and whether it needs a redirect, fix, or review."],
        ["A page has weak SEO", "Review this page and suggest clearer title, description, headings, and page purpose."],
        ["A teammate needs an update", "Turn the current site state into a short professional status update."],
        ["A code issue appears", "Explain the likely cause and give me the smallest safe fix."],
        ["A document is messy", "Rewrite this into clean product documentation without changing the meaning."],
        ["A launch is coming", "Create a launch checklist for this website and separate must-fix items from nice-to-have items."]
      ]
    ),

    p(`CavAi can support faster work, but users should still review important output. Check legal, security, billing, account, production, and customer-facing changes before publishing or applying them. CavAi can help prepare the work, but the user remains responsible for the final decision.`),

    p(`Do not paste passwords, private keys, payment details, customer secrets, private medical information, or sensitive personal data into CavAi unless the product specifically provides a secure, approved workflow for that type of information. Use CavSafe or protected workspace controls for sensitive files when available.`),

    p(`CavAi access may vary by plan, model, feature, file type, image tool, reasoning mode, workspace policy, or account role. Some models and tools may be limited to Premium or Premium+ users. If a feature is unavailable, check the plan, workspace access, selected model, and product surface before assuming something is broken.`),

    p(`If CavAi gives an answer that feels too broad, ask it to narrow the answer. If it gives a plan that feels too large, ask for the smallest safe next step. If it makes an assumption, ask it to separate confirmed facts from assumptions. If it is missing context, provide the exact route, file, signal, or goal.`),

    list([
      "Use clear goals.",
      "Name the page, route, file, or workspace area you are reviewing.",
      "Ask for the format you want: checklist, summary, rewrite, table, plan, or explanation.",
      "Tell CavAi what should stay unchanged.",
      "Ask for the smallest safe next step when working on production issues.",
      "Verify important answers inside the original CavBot module.",
      "Keep secrets and sensitive data out of normal prompts."
    ]),

    note("Core rule", "CavAi helps users move from confusion to clarity. It should explain the work, organize the next step, and keep the user in control.")
  ]
},

     {
  id: "models",
  title: "Models",
  summary: "Choose the right CavAi model for the task.",
  blocks: [
    p(`Models are the different engines CavAi can use to answer, reason, code, create, listen, speak, or generate images. Each model is built for a different kind of work. Some are faster. Some are better for deeper planning. Some are built for code. Some are built for images or voice.`),

    p(`Most users should start with CavAi Auto. Auto lets CavAi choose the best available model for the request based on the task, the workspace context, the selected plan, and the type of output needed. This keeps the experience simple when the user does not need to think about model selection.`),

    p(`Manual model selection is useful when the user knows exactly what kind of work they are doing. A quick question does not need the heaviest model. A complex plan, research task, code review, or file-heavy workflow may need a stronger model. Image work should use Image Studio or Image Edit. Coding work should use Caven or the coding-focused model path.`),

    p(`CavAi model access can depend on plan level, workspace policy, feature availability, and current product limits. Guest preview mode is intentionally restricted. It may limit uploads, advanced models, image tools, deeper reasoning, and other high-cost features until the user signs in or upgrades.`),

    table(
      ["Model", "Best for", "Access and notes"],
      [
        ["CavAi Auto", "Everyday use, general help, workspace questions, summaries, and simple planning.", "Recommended default. CavAi chooses the best available path for the request."],
        ["DeepSeek Chat", "General conversation, explanations, writing help, product questions, and basic summaries.", "Good for standard text tasks that do not need heavy reasoning."],
        ["DeepSeek Reasoner", "Step-by-step thinking, heavier planning, technical breakdowns, and careful reviews.", "Use when the answer needs more structure and deeper reasoning."],
        ["Qwen3.5-Flash", "Fast replies, lightweight questions, quick rewrites, and short summaries.", "Best when speed matters more than depth."],
        ["Qwen3.5-Plus", "Stronger writing, planning, review, and product work.", "Use for more complete answers when the task needs better quality than a quick response."],
        ["Qwen3-Max", "Research-heavy work, complex planning, and deeper answers that need stronger model support.", "Premium+ model. Used for higher-capability workflows when available."],
        ["Caven / Qwen3-Coder", "Code explanation, debugging, refactoring, file review, patch planning, and CavCode work.", "Best for development tasks. Use inside CavCode or when the request is clearly about code."],
        ["CavBot Companion", "Guidance, support, onboarding help, and everyday product assistance.", "Designed for calmer product help and user support."],
        ["Qwen ASR", "Speech-to-text and voice input.", "Used when CavAi needs to understand spoken input."],
        ["Qwen TTS", "Text-to-speech and voice output.", "Used when CavAi needs to speak a response."],
        ["Image Studio", "Generating new images, visuals, brand concepts, and creative assets.", "Requires Premium or Premium+. Use when the task is image generation."],
        ["Image Edit", "Editing uploaded images, changing visual details, and refining existing assets.", "Requires Premium+. Use when the task starts from an existing image."]
      ]
    ),

    p(`Choose the model based on the job. For normal questions, use Auto. For quick work, use a fast text model. For deeper planning, use a reasoning model. For code, use Caven. For images, use Image Studio or Image Edit. For voice, use the speech models.`),

    list([
      "Use CavAi Auto when you want CavAi to choose for you.",
      "Use faster models for short answers, rewrites, and simple summaries.",
      "Use stronger models for planning, research, technical review, and important decisions.",
      "Use Caven when the task involves code, files, diagnostics, or CavCode.",
      "Use Image Studio when creating a new image.",
      "Use Image Edit when changing an existing image.",
      "Use voice models only when the task involves speech input or spoken output."
    ]),

    p(`A stronger model is not always the better choice. Some tasks need speed and clarity, not maximum depth. A simple question, button label, page summary, or short rewrite should not require a heavy model. Save stronger models for work where the extra depth actually matters.`),

    p(`Model availability may change as CavBot improves CavAi. New models may be added, renamed, upgraded, limited, or removed as the platform evolves. The model picker should always be treated as the current source of available options inside the app.`),

    note("Best practice", "Start with CavAi Auto. Switch models only when the task clearly needs speed, deeper reasoning, coding support, image generation, image editing, or voice.")
  ]
},
{
  id: "assistant-memory",
  title: "Memory",
  summary: "Keep useful project context available when CavAi responds.",
  blocks: [
    p(`Memory helps CavAi remember stable project context so it can give better answers over time. It is meant for details that stay true across sessions: what the website is for, which routes matter, how the team prefers to work, what the brand should sound like, and what decisions should carry forward.`),

    p(`Memory should make CavAi more useful without turning it into a place for secrets. The goal is not to store everything. The goal is to keep the right context close enough that CavAi does not have to ask the same basic questions every time you return to the workspace.`),

    p(`Good memory is clear, stable, and practical. It helps CavAi understand the project without guessing. For example, CavAi can remember that a workspace belongs to a SaaS product, that the pricing page is important, that the team wants concise status summaries, or that the brand voice should stay calm and professional.`),

    p(`Bad memory makes the assistant less reliable. Temporary bugs, one-time requests, old launch notes, expired decisions, private credentials, and sensitive customer details should not be stored as long-term memory. If something will be wrong next week, it probably does not belong in memory.`),

    table(
      ["Memory type", "Use it for"],
      [
        ["Project purpose", "What the website, product, company, or workspace is meant to do."],
        ["Important routes", "Pages such as home, pricing, docs, login, checkout, support, contact, dashboard, or product pages."],
        ["Team preferences", "How the team wants summaries, reports, notes, drafts, and recommendations to be written."],
        ["Brand rules", "Voice, tone, naming, formatting, visual standards, and language the brand should avoid."],
        ["Recurring concerns", "Known issues or patterns that keep coming back and should be remembered during review."],
        ["Product decisions", "Stable decisions about features, workflows, positioning, or setup that should guide future answers."]
      ]
    ),

    p(`Memory should not replace the workspace source of truth. If CavAi remembers a route, setting, feature, or decision, that memory still needs to be checked against the actual dashboard, files, docs, settings, reports, or live website when the answer matters.`),

    p(`Use memory when a detail will help future conversations. Do not use memory for information that should stay private, expire quickly, or only matters for one message. CavAi should remember the structure of the work, not every passing detail.`),

    list([
      "Save stable facts about the project, website, product, or workspace.",
      "Save important routes and pages CavAi should understand during review.",
      "Save brand voice, writing standards, and formatting preferences.",
      "Save recurring operational concerns that affect future answers.",
      "Save product decisions that should guide future work.",
      "Do not save passwords, private keys, payment data, or sensitive customer information.",
      "Do not save temporary bugs, one-time tasks, or details that will become outdated quickly."
    ]),

    p(`Memory is especially useful for CavAi workflows that repeat: site reviews, launch checklists, SEO checks, route reviews, error summaries, support drafts, code explanations, product planning, and workspace reports. The more stable context CavAi has, the less time the user spends re-explaining the same project basics.`),

    p(`Memory also helps CavAi stay aligned with the team’s standards. If a team wants clean documentation, short executive summaries, direct technical notes, or a specific product tone, memory can preserve that preference so future responses feel consistent.`),

    note("Memory rule", "Store what should still be true later. Keep secrets, temporary issues, and sensitive customer data out of memory."),

    p(`Review memory when the project changes. If the website is redesigned, the product direction changes, the brand voice changes, a route is removed, a team process changes, or an old decision no longer applies, update memory so CavAi does not keep using outdated context.`),

    p(`Remove memory when it becomes wrong. Old assumptions can be worse than no memory at all. A clean memory layer should help CavAi answer with more accuracy, not lock the workspace into past decisions.`),

    table(
      ["Do", "Avoid"],
      [
        ["Remember the main purpose of the website.", "Remembering a temporary test message."],
        ["Remember that /pricing is a high-value route.", "Remembering a bug that was fixed the same day."],
        ["Remember the team prefers concise status updates.", "Remembering private legal, billing, or customer details."],
        ["Remember brand language rules.", "Remembering passwords, keys, tokens, or credentials."],
        ["Remember stable product decisions.", "Remembering assumptions that have not been confirmed."]
      ]
    ),

    p(`For workspace owners, memory should be treated as a project asset. It helps CavAi understand the workspace the same way a strong teammate would: the purpose, the priorities, the tone, the repeated issues, and the standards that should not be forgotten.`),

    p(`For team members, memory reduces repeated explanation. A teammate can ask CavAi to review a route, draft a support note, summarize a report, or explain a dashboard signal without starting from zero every time.`),

    p(`For sensitive work, memory should be used carefully. CavAi can help summarize, explain, and plan, but users should still verify important decisions before changing access, publishing files, editing billing, deleting data, or applying production changes.`),

    note("Best practice", "Keep memory small, accurate, and useful. A few strong facts are better than a long list of outdated details.")
  ]
},

     {
  id: "agent-workflows",
  title: "Agent workflows",
  summary: "Run repeatable CavAi and Caven workflows for research, fixes, reviews, and summaries.",
  blocks: [
    p(`Agent workflows are repeatable processes that help CavAi or Caven handle work in a clear order. They are useful when the task needs more than a single answer: research, review, planning, code repair, route recovery, launch checks, report summaries, file review, or workspace follow-up.`),

    p(`A workflow gives the assistant a defined path to follow. Instead of asking CavAi to “fix everything” or “review the site,” give it a specific target, a clear goal, and the kind of output you need. The target can be a selected site, route, dashboard signal, report, file, folder, code issue, SEO concern, 404 pattern, or workspace setting.`),

    p(`Use agent workflows when the work needs consistency. A one-off question is fine for a quick explanation. A workflow is better when the team needs the same steps repeated carefully: gather context, review what matters, list findings, propose next steps, and confirm what should be checked before anything changes.`),

    table(
      ["Workflow type", "Use it for"],
      [
        ["Research", "Collect context, compare options, and prepare a clear summary before the team decides."],
        ["Fix planning", "Turn an issue into a safe sequence of steps before editing files or settings."],
        ["Code review", "Review a file, component, error, or proposed change before applying it."],
        ["Route recovery", "Review broken paths, 404 behavior, recovery options, redirects, and visitor impact."],
        ["SEO review", "Check titles, descriptions, headings, canonical structure, and page clarity."],
        ["Workspace summary", "Summarize dashboard signals, reports, notes, files, or recent activity for the team."],
        ["Launch review", "Check important pages, routes, metadata, errors, storage, access, and security before release."]
      ]
    ),

    p(`A good workflow starts with the exact thing being reviewed. Name the route, file, report, site, dashboard area, or issue. Then state the desired result. For example, ask CavAi to turn a report into a short team summary, ask Caven to review one file for a bug, or ask CavAi to build a recovery plan for a repeated missing route.`),

    p(`Do not start with a broad request when the work touches production. If the change affects public pages, protected settings, files, billing, members, API keys, storage, or security, ask for a plan first. The plan should explain what will be checked, what will change, what should not change, and how the result will be verified.`),

    list([
      "Start with the active project, selected site, route, file, report, or signal.",
      "State the goal clearly before asking for output.",
      "Ask for a plan before making changes that touch production.",
      "Keep the workflow focused on one issue or one workstream at a time.",
      "Review the output before applying changes.",
      "Verify the result in the correct CavBot surface after the workflow is done.",
      "Write down important decisions in CavPad when the work needs team follow-up."
    ]),

    p(`CavAi is best for explaining signals, summarizing reports, preparing checklists, comparing options, drafting notes, reviewing website context, and helping the team understand what should happen next. Caven is best for code-focused work: reviewing files, explaining errors, preparing patches, checking components, and helping with development inside CavCode.`),

    p(`A strong workflow should have a beginning, middle, and end. The beginning defines the target. The middle reviews the context and proposes the next step. The end gives the user something usable: a checklist, summary, fix plan, code review, report, decision note, or verification steps.`),

    table(
      ["Weak request", "Better workflow request"],
      [
        ["Fix my website.", "Review the pricing page signals and give me the first five checks before I edit anything."],
        ["Check SEO.", "Review the homepage title, description, headings, and canonical structure. Return only issues that should be fixed."],
        ["Debug this.", "Review this file for the login error. Explain the likely cause, then give the smallest safe fix."],
        ["Summarize everything.", "Summarize the current dashboard signals for the selected site in a short owner update."],
        ["Make it better.", "Review this docs section for clarity, remove weak wording, and keep the structure unchanged."]
      ]
    ),

    p(`For code workflows, keep the scope narrow. Ask Caven to review one file, one error, one component, or one feature area before asking for a larger change. If several files are involved, ask for a file-by-file plan first. This keeps the work easier to verify and reduces the chance of changing something unrelated.`),

    p(`For website workflows, connect the request to the live site context. A route review should include the route. A 404 review should include the missing path. An SEO review should name the page. A report summary should name the site and time period. Clear targets produce cleaner answers.`),

    p(`For workspace workflows, keep ownership clear. If the workflow touches invites, roles, billing, storage, secured files, API keys, or protected settings, the result should be reviewed by the workspace owner or the person responsible for that area.`),

    note("Workflow rule", "Keep each workflow tied to a specific route, file, report, signal, or workspace action. Clear scope makes the output safer and easier to verify."),

    p(`Agent workflows should not be used to bypass review. CavAi and Caven can help prepare the work, but a person should still approve important changes. This is especially important for production pages, billing settings, team access, security controls, storage, public content, and code that will be deployed.`),

    p(`When a workflow produces a recommendation, verify it against the source. If it mentions an error, open Error Intelligence. If it mentions a broken route, open 404 Recovery. If it mentions SEO, inspect the page metadata. If it mentions code, review the file and run the project when possible.`),

    list([
      "Use CavAi for summaries, plans, explanations, reports, and website review.",
      "Use Caven for code review, file repair, debugging, and CavCode work.",
      "Use CavPad to save decisions, follow-ups, and release notes.",
      "Use Reports when the team needs a shareable summary.",
      "Use 404 Recovery for broken route recovery work.",
      "Use Error Intelligence when a workflow points to runtime failures.",
      "Use CavGuard and CavVerify when a workflow reaches protected actions."
    ]),

    p(`A finished workflow should leave the user with a clear result. The result should say what was reviewed, what was found, what should happen next, and how to verify it. If the workflow cannot complete because context is missing, it should say what is missing instead of guessing.`),

    p(`The best workflows are calm and repeatable. They help the team move from confusion to a clean next step: review the signal, understand the issue, choose the safest action, apply the smallest change, and verify the result.`),

    note("Best practice", "Use workflows for work that needs order. Ask for a plan first, apply small changes, then verify the result in CavBot before moving on.")
  ]
},
{
  id: "caven",
  title: "Caven",
  summary: "Build, review, repair, and explain code inside CavCode.",
  blocks: [
    p(`Caven is CavBot’s coding assistant for CavCode. It helps users understand files, review errors, repair broken code, plan changes, generate components, improve pages, inspect APIs, and work through development tasks without leaving the CavBot workspace.`),

    p(`Caven is built for practical coding work. It is not a general chat surface with a code label placed on top. It is meant to work beside the active file, open tabs, diagnostics, project structure, terminal output, and mounted workspace files inside CavCode. The more specific the context, the better Caven can help.`),

    p(`Use Caven when you need help with a real development task: explaining why code is failing, reviewing a component, fixing a TypeScript error, cleaning up markup, improving a page, building a small feature, checking an API route, repairing CSS, writing a safer implementation plan, or understanding how files in a project connect to each other.`),

    table(
      ["Use Caven for", "What Caven should do"],
      [
        ["Code explanation", "Explain what a file, function, component, route, or error is doing in plain language."],
        ["Bug repair", "Find the likely cause of a problem and suggest the smallest safe fix."],
        ["Refactoring", "Clean up code without changing the intended behavior."],
        ["Component work", "Create, revise, or review interface components inside the current project structure."],
        ["Page building", "Help build or improve pages while respecting the existing design system."],
        ["Diagnostics", "Review TypeScript, runtime, console, or build errors and explain what needs attention."],
        ["API review", "Inspect API routes, request handling, response shape, validation, and failure paths."],
        ["Schema checks", "Review data models, fields, naming, relationships, and expected usage."],
        ["UI debugging", "Help identify layout, spacing, interaction, responsive, or state problems."],
        ["Production planning", "Prepare a safe plan before changing multiple files or public-facing behavior."]
      ]
    ),

    p(`Caven works best when the user points to the exact thing that needs attention. Name the file, route, component, error, behavior, or feature. Do not ask it to “fix the app” when the issue is inside one page or one component. A focused request gives Caven a clear target and keeps the answer useful.`),

    p(`A strong Caven request should include four things: what is broken, where it is happening, what should happen instead, and what must not change. This helps Caven protect the existing product while working on the specific problem.`),

    table(
      ["Weak request", "Better Caven request"],
      [
        ["Fix this code.", "Review this login form file. The submit button stays disabled after CavVerify passes. Find the likely cause and give the smallest safe fix."],
        ["Make this page better.", "Clean up the hero section in this page without changing the layout, colors, copy, or responsive behavior."],
        ["Why is it broken?", "Explain this TypeScript error from the active file and tell me which line needs to change."],
        ["Build the dashboard.", "Create the empty state component for this dashboard using the existing card and button styles."],
        ["Rewrite everything.", "Give me a file-by-file plan first. Do not rewrite until I approve the plan."]
      ]
    ),

    p(`For small fixes, Caven can move directly into explanation and repair. For larger work, ask for a plan first. This is especially important when a change touches multiple files, authentication, billing, workspace roles, API keys, protected routes, storage, CavSafe, CavGuard, CavVerify, or anything that can affect production behavior.`),

    list([
      "Use Caven inside CavCode when the active file or workspace files matter.",
      "Name the file, route, component, error, or behavior you want reviewed.",
      "Ask for the smallest safe fix when the issue is narrow.",
      "Ask for a plan first when the change touches multiple files.",
      "Tell Caven what must not change.",
      "Review the proposed change before applying it.",
      "Run diagnostics, preview the UI, or test the flow after the change."
    ]),

    p(`Caven should respect the existing codebase. It should not rename files, change product language, remove working behavior, replace the design system, rewrite unrelated sections, or introduce new architecture unless the user asks for that level of change. The safest Caven work is targeted, readable, and easy to verify.`),

    p(`When working with UI, Caven should preserve the product’s visual direction. If the page already has a design system, Caven should follow it. That includes spacing, typography, buttons, cards, panels, colors, mobile behavior, empty states, loading states, and error states. A fix should not make the interface feel like a different product.`),

    p(`When working with docs, legal pages, public pages, or marketing pages, Caven should protect the writing standard. It should keep the copy clean, direct, and professional. It should remove weak wording, but it should not add inflated claims, unnecessary jargon, or vague product language.`),

    p(`When working with APIs, Caven should check more than the happy path. A good API review looks at request method, input validation, authentication, authorization, response shape, error handling, status codes, logging, rate limits, and whether the route can fail safely.`),

    p(`When working with data models or schemas, Caven should be careful. It should explain what the model does, what relationships exist, what fields are required, and what could break if the model changes. Schema work should be planned before it is applied.`),

    note("Production rule", "For production work, ask Caven for a plan before making wide changes. Apply small patches, review diagnostics, run the project when possible, and verify the result in the UI."),

    p(`Caven can help write new code, but it should also help users understand code. A good answer should explain the cause of the issue, the reason for the fix, and how to verify that the fix worked. The user should not be left with pasted code they do not understand.`),

    p(`Caven should also be honest when context is missing. If the active file is not enough, it should ask for the related file, route, API, component, error message, or console output. It should not pretend to know the full project when only one small piece is visible.`),

    list([
      "If Caven needs another file, provide the related file.",
      "If Caven needs an error, provide the exact error message.",
      "If Caven needs behavior, describe what happens in the browser.",
      "If Caven needs a route, provide the route or page name.",
      "If Caven needs proof, run the page, build, test, or diagnostic check."
    ]),

    p(`Caven is not a replacement for developer review. It can prepare changes, explain risks, and help move faster, but the user still owns the final decision. Review important changes before publishing, deploying, merging, or applying them to a live workspace.`),

    p(`The safest Caven workflow is simple: identify the problem, review the file, ask for the smallest safe fix, apply the change, check diagnostics, preview the result, and confirm the behavior works. For larger changes, start with a plan and approve each step before moving forward.`),

    table(
      ["Step", "Action"],
      [
        ["1. Identify", "Name the file, route, component, error, or behavior."],
        ["2. Explain", "Ask Caven to explain the issue in clear terms."],
        ["3. Plan", "Ask for a plan if the fix touches more than one file."],
        ["4. Patch", "Apply the smallest safe change."],
        ["5. Review", "Check the diff, diagnostics, and visible behavior."],
        ["6. Verify", "Run the page, test the flow, or confirm the UI works."],
        ["7. Document", "Save important decisions or follow-up work in CavPad when needed."]
      ]
    ),

    p(`Use Caven for focused development work inside CavBot. It should help users build with more clarity, repair issues with less guessing, and protect the codebase from careless changes.`),

    note("Coding workflow", "Explain the bug, name the file, state what must not change, then ask Caven for the smallest safe fix.")
  ]
},

     {
  id: "image-studio",
  title: "Image Studio",
  summary: "Create visuals, concepts, and brand-ready image drafts inside CavAi.",
  blocks: [
    p(`Image Studio is CavAi’s image creation surface. It gives users a place to create visuals from written instructions, including product concepts, campaign images, brand explorations, interface artwork, social graphics, hero visuals, editorial imagery, and early creative direction drafts.`),

    p(`Image Studio is built for visual work that starts from a description. The user writes what they want to see, and CavAi uses the Image Studio model lane to produce an image based on that request. In the current app setup, Image Studio routes through Qwen-Image-2.0-Pro and stores Image Studio history through the CavAi image-studio APIs.`),

    p(`Use Image Studio when you need to explore a visual idea before bringing it into a final design tool, campaign, website, deck, product page, article, or brand system. It is useful for fast concept development, but every generated result should still be reviewed before it is used in public-facing work.`),

    table(
      ["Use Image Studio for", "What it helps with"],
      [
        ["Brand concepts", "Explore visual directions for a product, campaign, landing page, or brand moment."],
        ["Website visuals", "Create hero image ideas, section artwork, feature illustrations, and page-supporting visuals."],
        ["Campaign images", "Draft visuals for announcements, launches, social posts, ads, or email campaigns."],
        ["Product illustrations", "Create visual explanations for tools, workflows, features, or product states."],
        ["Editorial imagery", "Create images for articles, research pages, field guides, and long-form content."],
        ["Art direction", "Test mood, lighting, composition, texture, background, and visual tone before final production."],
        ["Creative drafts", "Generate early options that can later be refined, edited, or recreated by a designer."]
      ]
    ),

    p(`A strong Image Studio request should be specific. Describe the subject, setting, style direction, composition, lighting, background, mood, format, and any brand rules that matter. The clearer the request, the easier it is for Image Studio to produce something close to the intended result.`),

    p(`Do not rely on one vague sentence when the image needs to support a real product or brand. A request like “make a cool tech image” is too broad. A stronger request explains what the image is for, what should appear, what should not appear, and how the final image should feel.`),

    table(
      ["Weak request", "Better Image Studio request"],
      [
        ["Make an image for CavBot.", "Create a dark, polished website intelligence visual for CavBot: a calm control-room dashboard, subtle route lines, soft blue signal points, no neon, no cartoon style, clean enterprise feel."],
        ["Make a hero image.", "Create a wide hero image for a SaaS landing page showing website monitoring, route signals, and clean product dashboards in a serious dark interface."],
        ["Make something futuristic.", "Create a refined product illustration with a modern command-center feel, navy background, soft blue highlights, structured panels, and no clutter."],
        ["Make a social post image.", "Create a square launch graphic for CavAi Image Studio with a clean dark background, one elegant generated-image frame, minimal text space, and premium software-brand style."],
        ["Make it look premium.", "Use restrained composition, clean lighting, high-end product design, sharp spacing, no cheap glow effects, no busy background, and no exaggerated sci-fi styling."]
      ]
    ),

    p(`Image Studio should be used with brand control. If the image is for CavBot, keep the visual direction aligned with CavBot’s product identity: serious, clear, modern, calm, and operational. Avoid random neon, noisy sci-fi scenes, childish robot art, cluttered dashboards, fake numbers, unreadable UI, and visuals that make the product feel less professional.`),

    p(`When the image is for a customer-facing page, the request should mention where the image will be used. A homepage hero image needs a different composition than a blog image, a pricing page graphic, a product card, a social preview, or an app empty state. The intended placement should guide the format and level of detail.`),

    list([
      "Describe the subject clearly.",
      "State where the image will be used.",
      "Name the style direction.",
      "Mention the background and setting.",
      "Describe the lighting and mood.",
      "Include the format or aspect ratio when it matters.",
      "Add brand rules that must be respected.",
      "Say what should not appear in the image."
    ]),

    p(`Image Studio is different from Image Edit. Use Image Studio when you want to create a new image from a description. Use Image Edit when you already have an image and want to change it. If the task depends on preserving a real uploaded image, product photo, face, layout, or exact object, Image Edit is the better surface.`),

    table(
      ["Surface", "Use it when"],
      [
        ["Image Studio", "You want to create a new image from written instructions."],
        ["Image Edit", "You already have an image and want to change, improve, remove, add, or restyle something."],
        ["Caven", "You need to build the page, component, or layout where the image will be used."],
        ["CavCloud", "You need to store, organize, preview, or share generated image files."]
      ]
    ),

    p(`For brand work, users should treat Image Studio as a draft tool, not a final approval system. A generated image may be useful, but it should still be checked for brand fit, spelling, visual quality, layout issues, unwanted artifacts, confusing details, and whether the image matches the page or campaign it is meant to support.`),

    p(`For product UI images, review the details carefully. Generated dashboards, buttons, text, charts, and interface panels may look convincing while still being inaccurate or unreadable. Do not use fake interface details as proof of product behavior. Recreate important UI inside the real product or design system when accuracy matters.`),

    note("Review rule", "Generated images should be reviewed before public use. Check brand fit, text quality, visual artifacts, accuracy, and whether the image belongs in the page or campaign where it will appear."),

    p(`Image Studio history helps users return to previous visual work. This is useful for comparing directions, refining a campaign, revisiting a draft, or keeping track of the creative path behind a final image. History should be treated as a working record, not as permanent brand approval.`),

    p(`Users should avoid placing sensitive private information into image requests. Do not include passwords, private keys, confidential customer data, private legal material, payment information, private workspace details, or anything that should not be processed through an image generation workflow.`),

    list([
      "Do not include passwords or private keys.",
      "Do not include payment details.",
      "Do not include confidential customer data.",
      "Do not include private legal or business records.",
      "Do not include sensitive workspace content unless it is safe and necessary.",
      "Do not ask Image Studio to create misleading product evidence or fake proof."
    ]),

    p(`Image Studio access depends on the user’s plan. In the current app gating, Image Studio requires Premium or Premium+. Users without access may see the feature as locked or unavailable until the workspace is on a plan that supports it.`),

    p(`A good Image Studio workflow is simple: define the purpose, write a clear request, generate the image, review the result, refine the prompt if needed, save the best version, and only then use it in a public or production surface.`),

    table(
      ["Step", "Action"],
      [
        ["1. Define", "Decide where the image will be used and what it needs to communicate."],
        ["2. Describe", "Write a clear request with subject, style, composition, lighting, and constraints."],
        ["3. Generate", "Create the first image draft in Image Studio."],
        ["4. Review", "Check quality, brand fit, accuracy, and unwanted artifacts."],
        ["5. Refine", "Adjust the request and generate another version if needed."],
        ["6. Save", "Keep the strongest result in the workspace or CavCloud when appropriate."],
        ["7. Publish", "Use the image only after it has been reviewed for the final context."]
      ]
    ),

    p(`Image Studio should help users move from idea to visual direction faster. It should not replace taste, review, or brand judgment. The strongest results come from clear instructions, careful review, and a user who knows what the image needs to do.`),

    note("Best use", "Use Image Studio to create strong visual drafts. Review every result before using it in a website, campaign, product page, or public brand surface.")
  ]
},

     {
  id: "image-edit",
  title: "Image Edit",
  summary: "Edit uploaded images with clear instructions and careful review.",
  blocks: [
    p(`Image Edit is CavAi’s image editing surface. It is used when a user already has an image and wants to change it, refine it, clean it up, restyle it, remove something, add something, improve quality, adjust a visual detail, or prepare the image for a specific use.`),

    p(`Image Edit is different from Image Studio. Image Studio creates a new image from a written description. Image Edit starts with an uploaded source image. The source image matters. The edit should respect what the user wants to preserve, what should change, and what must not be touched.`),

    p(`In the current app setup, Image Edit routes through Qwen-Image-Edit-Max and requires Premium+. Users without Premium+ access may see the feature as locked, unavailable, or blocked by the plan gate.`),

    table(
      ["Use Image Edit for", "What it helps with"],
      [
        ["Product images", "Clean up, adjust, or refine product visuals before using them on a page or campaign."],
        ["Brand assets", "Improve an existing brand image while keeping the original identity intact."],
        ["Marketing visuals", "Prepare uploaded images for ads, social posts, launch graphics, or email campaigns."],
        ["Website images", "Adjust hero images, section visuals, article images, thumbnails, and page artwork."],
        ["Object changes", "Add, remove, replace, or adjust objects inside an existing image."],
        ["Background changes", "Change, clean, simplify, blur, or replace the background."],
        ["Style changes", "Restyle an image while keeping the main subject recognizable."],
        ["Quality improvements", "Sharpen, clean, brighten, crop, or make an image feel more polished."]
      ]
    ),

    p(`A strong Image Edit request should be direct. The user should explain what image is being edited, what should stay the same, what should change, and what should not be altered. The best edit requests are specific enough that the system does not have to guess.`),

    p(`A weak request leaves too much open. “Make this better” does not explain what better means. A stronger request tells Image Edit what kind of improvement is needed: cleaner lighting, less clutter, sharper subject, darker background, more premium tone, better crop, removed object, restored detail, or a specific style change.`),

    table(
      ["Weak request", "Better Image Edit request"],
      [
        ["Make this image better.", "Clean up the lighting, sharpen the main subject, reduce background clutter, and keep the original colors natural."],
        ["Change the background.", "Replace the background with a clean dark navy studio background, keep the product exactly the same, and do not change its shape or logo."],
        ["Make it premium.", "Keep the subject unchanged, improve the lighting, add a calm high-end product-photo feel, remove visual noise, and avoid neon or exaggerated effects."],
        ["Remove this thing.", "Remove the object on the left side of the image, rebuild the background naturally, and keep the person and main object unchanged."],
        ["Make it look like CavBot.", "Keep the uploaded image structure, adjust the background toward CavBot’s dark navy style, add subtle blue signal-light accents, and avoid clutter or cartoon styling."]
      ]
    ),

    p(`Image Edit should be used when the uploaded image is important. If the user needs the same product, person, layout, logo, object, or composition to remain recognizable, the instruction should say that clearly. If an element must not change, name it directly.`),

    list([
      "State what should stay the same.",
      "State what should change.",
      "State what must not be altered.",
      "Describe the final use of the image.",
      "Mention the desired style or finish.",
      "Mention the background if it matters.",
      "Mention lighting, crop, or color changes if needed.",
      "Review the result before using it publicly."
    ]),

    p(`For product and brand images, preserve accuracy. If the image shows a real product, logo, interface, package, garment, or brand mark, the edit should not change important details unless the user asks for that change. A polished image is not useful if it quietly changes the product.`),

    p(`For website and marketing work, Image Edit can help prepare images for a page section, campaign, launch post, product card, app preview, blog article, or social graphic. The user should include the intended placement so the edit can match the right composition and level of polish.`),

    table(
      ["Placement", "What to request"],
      [
        ["Homepage hero", "Wide composition, strong subject, clean background, enough empty space for text."],
        ["Product page", "Accurate product details, clean lighting, minimal distraction, true shape and color."],
        ["Social post", "Square or vertical crop, strong central image, clear visual focus."],
        ["Blog or research page", "Editorial tone, calm composition, clean background, no distracting elements."],
        ["App preview", "Readable interface, realistic screen details, no fake claims or misleading numbers."],
        ["Brand asset", "Consistent color, clean finish, no distortion of logos or marks."]
      ]
    ),

    p(`Image Edit can also be used for cleanup. Users may ask it to remove unwanted objects, fix small visual distractions, smooth a background, adjust lighting, crop the image, sharpen the subject, or make the image feel more finished without changing the core content.`),

    p(`When removing or adding objects, users should be precise. Name the object, describe where it is, and explain what should happen after removal. For example, “Remove the small cup on the right side of the desk and rebuild the desk surface naturally.” This is stronger than “remove the thing.”`),

    note("Preserve rule", "When the source image matters, say what must stay unchanged. Image Edit should improve the image without quietly changing the parts that make it accurate."),

    p(`Image Edit may be used for style changes, but style changes should still respect the source image. If the user wants a realistic product image, do not ask for a style that turns the product into an illustration. If the user wants an editorial image, mention the tone, lighting, and finish clearly.`),

    p(`For images that include people, users should be careful and respectful. Edits should not be used to misrepresent someone, create deceptive identity changes, or make a person appear to be doing something they did not do. When an image is used publicly, the user should have the right to use and edit it.`),

    p(`Image Edit should not be used to create misleading proof, fake product evidence, false screenshots, deceptive documents, impersonation material, or visuals that make a brand, product, person, or interface appear to show something untrue.`),

    list([
      "Do not use Image Edit to create fake proof.",
      "Do not edit images in a way that misleads people about a real product or person.",
      "Do not alter logos, labels, or interface details unless that is the intended edit.",
      "Do not upload private images unless they are safe and authorized for editing.",
      "Do not include passwords, private keys, payment details, or confidential customer information in images.",
      "Do not use edited images publicly until they have been reviewed."
    ]),

    p(`Users should review every edited image before using it in production. Check the subject, edges, hands, faces, text, logos, shadows, reflections, background, proportions, and any details that could look wrong once the image is placed on a website or campaign.`),

    table(
      ["Review area", "What to check"],
      [
        ["Subject", "The main person, product, object, or scene still looks correct."],
        ["Text", "Any visible words, numbers, labels, or interface text are readable and accurate."],
        ["Logo or brand mark", "The mark is not warped, misspelled, stretched, or changed by accident."],
        ["Edges", "Cutouts, replaced backgrounds, and object removals look natural."],
        ["Lighting", "The lighting matches the scene and does not make the image feel artificial."],
        ["Background", "Removed or replaced areas do not leave strange marks or broken details."],
        ["Accuracy", "The final image does not misrepresent the product, person, or interface."],
        ["Final placement", "The image fits the page, campaign, card, or format where it will be used."]
      ]
    ),

    p(`A good Image Edit workflow is simple: upload the image, describe the exact edit, explain what should stay unchanged, generate the edited version, review the result, refine if needed, and only use the final image after it fits the intended purpose.`),

    table(
      ["Step", "Action"],
      [
        ["1. Upload", "Start with the image that needs editing."],
        ["2. Define", "Decide what the final image should be used for."],
        ["3. Instruct", "Describe what should change and what should stay the same."],
        ["4. Edit", "Run the Image Edit request."],
        ["5. Review", "Check accuracy, quality, artifacts, text, logos, and brand fit."],
        ["6. Refine", "Run a clearer follow-up edit if the result is close but not finished."],
        ["7. Use", "Save or publish only after the image has been reviewed."]
      ]
    ),

    p(`Image Edit is strongest when the user gives a narrow instruction. Large, vague edits can create results that look polished but miss the purpose. Small, clear edits are easier to review and safer for brand, product, and public use.`),

    p(`If the edit needs to become part of a website, campaign, or product surface, store the approved result in the right workspace location after review. CavCloud can be used to organize edited assets, keep final versions easy to find, and separate working drafts from approved files.`),

    note("Best use", "Use Image Edit for precise changes to uploaded images. Tell it what to preserve, what to change, and what the final image is for.")
  ]
},

    ]
  },


  developers: {
    path: "/docs/developers",
    icon: "assets/icons/docs/code-svgrepo-com.svg",
    label: "Developers",
   
    title: "Developers",
    description: "Install Analytics v5, use SDK snippets, send events, manage API keys, understand webhooks, and read summary data.",
    sections: [
     {
  id: "analytics-v5",
  title: "Analytics v5",
  summary: "Install the browser signal layer.",
  blocks: [
    p(`Analytics v5 is the browser signal layer for CavBot. It connects a live website to a CavBot site profile so CavBot can understand what is happening on the site after launch. Once installed, it can send page activity, route changes, browser errors, metadata snapshots, SEO structure, accessibility checks, and selected runtime context into the correct CavBot workspace.`),

    p(`This is one of the most important parts of CavBot. Without Analytics v5, the workspace can still exist, but CavBot has no live website signal to read. The dashboard, route views, error review, SEO checks, accessibility snapshots, reports, 404 recovery views, and CavAi workspace context all become more useful after the site is connected through Analytics v5.`),

    p(`Analytics v5 should be installed once on the website you want CavBot to watch. The best place is the shared layout, global footer, site-wide custom code area, theme body area, or root app template that loads on every public page. Do not install it only on one page unless you only want CavBot to observe that one page.`),

    p(`The runtime should not be duplicated across multiple templates unless the website platform requires that structure. Duplicate installs can create repeated page views, noisy route data, confusing error reports, and harder debugging. A clean install should load once, identify the right project, identify the right site, and send signals from the live origin.`),

    table(
      ["What Analytics v5 observes", "Why it matters"],
      [
        ["Page views", "Shows which pages are being reached after the site is live."],
        ["Route changes", "Helps CavBot understand navigation, including single-page app route changes where supported."],
        ["404 and recovery context", "Helps identify missing routes, repeated broken paths, and recovery behavior."],
        ["Runtime errors", "Shows browser-side issues that may affect real users."],
        ["SEO metadata", "Reads page titles, descriptions, canonical tags, robots signals, headings, and related page structure when available."],
        ["Accessibility snapshots", "Helps detect common issues such as missing alt text, missing form labels, heading problems, and interaction concerns."],
        ["Performance and browser context", "Adds practical runtime context that helps explain how the page behaved."],
        ["Workspace and site identity", "Connects the signal to the correct CavBot project and site profile."]
      ]
    ),

    p(`Install the configuration values before the Analytics v5 script. The configuration tells CavBot where to send the signal and which project and site should receive it. If the configuration is missing, wrong, or placed after the script loads, the signal may not reach the correct workspace.`),

    code('<script>\n  window.CAVBOT_API_URL = "https://app.cavbot.io/api/embed/analytics";\n  window.CAVBOT_PROJECT_KEY = "YOUR_PROJECT_KEY";\n  window.CAVBOT_SITE = "YOUR_SITE_ID";\n  window.CAVBOT_SITE_ID = "YOUR_SITE_ID";\n  window.CAVBOT_SITE_PUBLIC_ID = "YOUR_SITE_ID";\n</script>\n<script src="https://cdn.cavbot.io/sdk/v5/cavai-analytics-v5.min.js" defer></script>'),

    p(`Replace YOUR_PROJECT_KEY and YOUR_SITE_ID with the values shown inside your CavBot workspace. Use the values for the exact site you are connecting. Do not reuse IDs from another website unless the sites are intentionally part of the same monitored setup.`),

    p(`The saved site origin inside CavBot must match the public website where the snippet is installed. If CavBot has https://example.com saved, but the snippet is installed on https://www.example.com, https://app.example.com, a preview domain, or a staging URL, the signal may be rejected, separated, or appear under the wrong context depending on the workspace settings and origin allowlist.`),

    list([
      "Use the public production origin for the main site.",
      "Install Analytics v5 in the shared layout or global custom-code area.",
      "Place the configuration script before the Analytics v5 script.",
      "Use the project key and site ID from the matching CavBot workspace.",
      "Publish the website after installing the snippet.",
      "Visit the live site in a browser after publishing.",
      "Open CavBot and confirm the selected site shows recent activity."
    ]),

    p(`For single-page apps, Analytics v5 is designed to understand route changes after the first page load. This matters for React, Next.js, Vue, app dashboards, and other modern websites where users move between views without a full browser refresh. Route tracking helps CavBot see where visitors are moving, not only where they first landed.`),

    p(`Analytics v5 can also send page structure information that helps CavBot understand SEO and accessibility health. This may include the page title, meta description, canonical URL, robots settings, heading structure, basic page text signals, image alt text checks, form label checks, and other page-level observations when supported by the runtime.`),

    p(`CavBot uses these signals to help the workspace answer practical questions: Did the site receive traffic? Which routes are being reached? Are important pages missing metadata? Are users hitting broken paths? Did a browser error happen on a key route? Does a page have accessibility concerns that should be reviewed?`),

    table(
      ["Surface", "How Analytics v5 supports it"],
      [
        ["Dashboard", "Provides recent site activity and signal context for the selected website."],
        ["Routes", "Shows observed paths and navigation behavior."],
        ["Errors", "Reports browser-side runtime issues and where they happened."],
        ["SEO", "Provides page metadata and structure snapshots."],
        ["A11y", "Provides accessibility-related page checks where supported."],
        ["404 Recovery", "Helps identify broken routes and recovery behavior."],
        ["Reports", "Gives reports the live context they need to summarize site health."],
        ["CavAi", "Gives CavAi better workspace context when answering questions about the selected site."]
      ]
    ),

    p(`Analytics v5 should not be used to collect private information that the workspace does not need. Do not send passwords, private keys, payment details, medical information, private messages, confidential customer data, or sensitive form contents through custom events or page context. CavBot is built to help teams understand website behavior, not to collect unnecessary private data.`),

    p(`If your website uses consent rules, privacy banners, regional privacy requirements, or browser privacy signals, install and configure Analytics v5 in a way that matches your obligations. CavBot should be part of a responsible website setup, not a shortcut around user privacy.`),

    note("Privacy rule", "Only send the information needed to understand website health, route behavior, errors, SEO, accessibility, and recovery. Keep secrets and sensitive user data out of analytics payloads."),

    p(`After installation, test the connection before relying on the dashboard. Open the live website in a browser, visit the homepage, visit two or three important pages, trigger a normal route change if the site is a single-page app, then return to CavBot and select the matching site profile.`),

    list([
      "Visit the homepage.",
      "Visit an important conversion page such as pricing, contact, checkout, signup, or docs.",
      "Visit one content or product page.",
      "Use navigation instead of only refreshing the same page.",
      "Check CavBot for recent activity under the correct site.",
      "Confirm the selected site matches the public origin you visited."
    ]),

    p(`If CavBot does not show activity after installation, start with the basics. Confirm the site was published, the snippet appears in the live page source, the configuration values are present before the script, the browser is not blocking the request, and the public origin matches the saved CavBot site.`),

    table(
      ["Problem", "What to check"],
      [
        ["No activity appears", "Confirm the snippet is present on the live published page, not only in a draft or preview."],
        ["Wrong site appears active", "Check that the site ID belongs to the selected CavBot site profile."],
        ["Signals appear duplicated", "Look for the snippet being installed more than once."],
        ["Route changes are missing", "Confirm the runtime is installed in the shared app layout, not only on the first route."],
        ["Requests are blocked", "Check browser extensions, content blockers, consent rules, network errors, and origin allowlists."],
        ["Metadata looks outdated", "Republish the page, clear cache if needed, then revisit the live route."],
        ["Only one page shows data", "Move the snippet into the global layout or platform-wide custom-code area."]
      ]
    ),

    p(`For website builders, use the global custom-code area whenever possible. Webflow, Wix, Squarespace, Framer, Shopify, WordPress, and similar platforms usually have a site-wide code location. Use that location first so Analytics v5 can run across the pages you actually want CavBot to observe.`),

    p(`For custom websites, place the snippet in the shared HTML layout, app shell, root template, document file, or equivalent layout file that every public route uses. For Next.js and similar frameworks, this usually means the root layout or document-level area where site-wide scripts belong.`),

    p(`For staging and preview environments, decide whether they should be separate sites. A production website, staging website, and app subdomain may need different site profiles if the team wants clean separation. Do not mix test traffic with production traffic unless that is intentional.`),

    note("Developer check", "The public site origin, the saved CavBot site origin, and the API key allowlist must agree."),

    p(`Analytics v5 is the foundation for CavBot’s live website intelligence. Install it cleanly, verify it carefully, and keep the configuration tied to the correct site. Once it is working, CavBot can begin turning live website behavior into clearer routes, cleaner reports, better diagnostics, and more useful CavAi context.`)
  ]
},

     {
  id: "sdk",
  title: "SDK",
  summary: "Use CavBot runtime scripts safely and correctly.",
  blocks: [
    p(`The CavBot SDK is the set of browser scripts that connect a website to CavBot features. These scripts can power Analytics v5, CavAi embed behavior, CavBot widgets, visual surfaces, badges, Arcade installs, recovery experiences, and other CavBot website tools.`),

    p(`Use the SDK when a CavBot feature needs to run on a live website. The script gives CavBot a safe way to load the correct feature, connect it to the correct workspace, and keep the website tied to the right project and site profile.`),

    p(`Most users should not hand-build SDK snippets from memory. Use the generated snippets from CavBot Settings, Integrations, or the setup flow whenever possible. Generated snippets reduce mistakes with project keys, site IDs, API URLs, script order, CDN paths, and feature-specific settings.`),

    table(
      ["SDK surface", "Where it belongs"],
      [
        ["Analytics v5", "Install globally so CavBot can observe the pages and routes you want monitored."],
        ["CavAi embed", "Install where the website needs CavAi or CavBot assistant behavior."],
        ["CavBot Badge", "Place in a footer, trust area, or floating slot where it will not block page controls."],
        ["CavBot Head", "Use in onboarding, empty states, setup screens, or small guided moments."],
        ["CavBot Body", "Use for stronger branded guidance, support, launch, or recovery moments."],
        ["Arcade loader", "Use on the approved Arcade surface or a documented 404 recovery route."],
        ["Widgets", "Place only where the page actually needs that CavBot feature."]
      ]
    ),

    p(`Each SDK install should have a clear purpose. Analytics belongs across the site because it collects website signals. A badge belongs where the visitor should see a small trust marker. Arcade belongs on a recovery route or approved game surface. Visual components belong in the exact product moment where they support the page.`),

    p(`Avoid installing every script everywhere. A clean website should only load the CavBot scripts it needs. Loading unused scripts can make the page heavier, make debugging harder, and create confusion about which feature is responsible for a behavior.`),

    p(`The project key and site ID connect the SDK to the correct CavBot workspace. The public website origin, the saved CavBot site origin, and the API key allowlist should all match. If they do not match, CavBot may reject the request, separate the signal, or show activity under the wrong site context.`),

    list([
      "Use generated snippets whenever CavBot provides them.",
      "Install Analytics v5 globally when the whole site should be monitored.",
      "Install feature scripts only where the feature is needed.",
      "Keep the configuration values above the script that uses them.",
      "Use the project key and site ID from the matching CavBot workspace.",
      "Do not copy SDK settings from another website unless that is intentional.",
      "Review the page on desktop and mobile after installing any visible SDK surface."
    ]),

    p(`Script order matters. Configuration values should load before the feature script that depends on them. For example, Analytics v5 needs the API URL, project key, and site ID before the runtime starts. If those values are missing or loaded too late, the script may not know where to send the signal.`),

    code('<script>\n  window.CAVBOT_API_URL = "https://app.cavbot.io/api/embed/analytics";\n  window.CAVBOT_PROJECT_KEY = "YOUR_PROJECT_KEY";\n  window.CAVBOT_SITE = "YOUR_SITE_ID";\n  window.CAVBOT_SITE_ID = "YOUR_SITE_ID";\n  window.CAVBOT_SITE_PUBLIC_ID = "YOUR_SITE_ID";\n</script>\n<script src="https://cdn.cavbot.io/sdk/v5/cavai-analytics-v5.min.js" defer></script>'),

    p(`For platform installs, place SDK scripts in the site-wide custom-code area when the feature should run on every page. This is usually the right path for Webflow, Wix, Squarespace, Framer, Shopify, WordPress, and similar website builders. For custom apps, place the SDK in the shared layout or root template used by the public routes.`),

    p(`For page-specific features, keep the script close to the page purpose. Do not load Arcade on every page if it is only meant for a 404 route. Do not load a floating badge if the page already has another trust or support widget in the same corner. Do not load visual components where they may cover forms, checkout buttons, menus, or accessibility controls.`),

    table(
      ["Install type", "Recommended placement"],
      [
        ["Global analytics", "Shared layout, root template, global footer, or site-wide custom code."],
        ["CavAi surface", "The page or layout where CavAi should be available."],
        ["Floating badge", "A safe corner or footer area that does not cover important controls."],
        ["Inline badge", "Inside an existing footer, trust row, status area, or support section."],
        ["404 Arcade", "The 404 page, missing-route template, or documented recovery route."],
        ["Visual components", "The exact product moment where the visual guide supports the user."]
      ]
    ),

    p(`SDK scripts should be treated as production code. Review what each script does before publishing. Confirm that the script path is correct, the feature is approved for the page, the project key belongs to the right workspace, and the public website origin is allowed.`),

    p(`Do not paste private keys, passwords, billing details, private customer information, sensitive messages, or internal workspace notes into SDK configuration. Public runtime configuration should only include the values needed for CavBot to identify the project, site, API destination, and selected feature.`),

    note("Security rule", "Use SDK configuration for public runtime identity only. Keep secrets, private keys, passwords, and sensitive user data out of browser scripts."),

    p(`When updating SDK scripts, avoid mixing old and new versions on the same page unless CavBot explicitly documents that setup. A clean version setup makes the website easier to debug and keeps signals easier to trust.`),

    p(`After installing or changing an SDK script, publish the website and test the live page. Open the public site in a browser, check that the visible feature appears correctly, move through the expected route, and confirm CavBot receives the right signal or shows the right surface.`),

    list([
      "Publish the website after adding or changing an SDK script.",
      "Open the live public page, not only the editor preview.",
      "Check the browser console for errors.",
      "Check the network tab if a signal or feature does not load.",
      "Confirm the script is present in the live page source.",
      "Confirm the feature appears only where it should.",
      "Return to CavBot and verify the matching site profile."
    ]),

    table(
      ["Problem", "What to check"],
      [
        ["Feature does not appear", "Confirm the script is present on the live page and the CDN path is correct."],
        ["Analytics does not send activity", "Confirm the API URL, project key, site ID, and saved site origin match."],
        ["Feature appears twice", "Look for the same SDK script or widget markup installed more than once."],
        ["Wrong workspace receives signals", "Check that the project key and site ID belong to the correct CavBot workspace."],
        ["Badge covers page controls", "Move the badge to a safer position or use an inline badge instead."],
        ["Arcade loads on the wrong page", "Move the Arcade loader to the approved 404 or recovery route only."],
        ["The script works in preview but not production", "Confirm the snippet was published to the production domain and the production origin is allowlisted."]
      ]
    ),

    p(`Use SDK scripts with restraint. CavBot features should strengthen the website, not crowd it. A clean install loads the right script, on the right page, for the right reason, with the right project and site values.`),

    p(`The best SDK setup is simple: install Analytics v5 globally, add visible CavBot surfaces only where they help the page, keep Arcade tied to recovery or game surfaces, and verify every install from the live production website.`),

    note("SDK baseline", "Start with the generated snippet, install only what the page needs, publish the site, then verify the feature from the live domain.")
  ]
},

     {
  id: "events",
  title: "Events",
  summary: "Send important website actions into CavBot.",
  blocks: [
    p(`Events are named actions sent from your website into CavBot. They help CavBot understand what visitors actually did beyond a normal page view. A page view can show that someone reached a route. An event can show that they clicked a pricing button, started signup, submitted a form, opened checkout, used search, clicked a recovery link, or started an Arcade game.`),

    p(`Use events for actions that matter to the business, the product, or the visitor journey. The goal is not to track every small click. The goal is to give CavBot the important moments that explain where users move forward, where they hesitate, and where something may need review.`),

    p(`Events are especially useful when a route alone does not tell the full story. For example, a visitor landing on the pricing page is a page view. A visitor clicking a pricing call-to-action is an event. A visitor opening the signup page is a page view. A visitor starting the signup form is an event. A visitor reaching a broken page is a route signal. A visitor clicking a recovery link from that page is an event.`),

    table(
      ["Moment", "Recommended event"],
      [
        ["Visitor clicks a pricing button", "pricing_cta_clicked"],
        ["Visitor starts signup", "signup_started"],
        ["Visitor completes signup", "signup_completed"],
        ["Visitor opens checkout", "checkout_started"],
        ["Visitor submits a contact form", "contact_form_submitted"],
        ["Visitor uses docs search", "docs_search_used"],
        ["Visitor clicks a recovery link", "recovery_link_clicked"],
        ["Visitor starts a CavBot Arcade game", "arcade_game_started"],
        ["Visitor completes an onboarding step", "onboarding_step_completed"]
      ]
    ),

    p(`Good event names should be stable, short, and easy to understand later. Use lowercase words separated by underscores. Write the name as an action that already happened, such as signup_started, checkout_started, or contact_form_submitted. Avoid vague names like click, submit, button, action, test, or event1.`),

    list([
      "Use names that describe the real action.",
      "Keep event names lowercase.",
      "Use underscores between words.",
      "Keep names stable over time.",
      "Avoid changing names after reports depend on them.",
      "Avoid generic names that will be hard to understand later.",
      "Document important event names so the team knows what they mean."
    ]),

    p(`Every event can include small details that help CavBot understand the action. These details should explain the moment without exposing sensitive information. Good details include the plan selected, route path, button label, form step, recovery target, game name, or product area.`),

    code('window.CavBot?.track?.("pricing_cta_clicked", {\n  plan: "pro",\n  route: window.location.pathname\n});'),

    p(`The example above sends a pricing call-to-action event. The event name is pricing_cta_clicked. The details include the plan and the current route. That gives CavBot enough context to understand what happened without collecting anything private.`),

    p(`Keep event details small and safe. Do not send passwords, payment card data, private messages, medical information, personal documents, access tokens, private keys, full form contents, or sensitive customer information. Events should help CavBot understand product behavior, not collect private material.`),

    table(
      ["Good event detail", "Avoid sending"],
      [
        ["Plan name", "Full payment card number"],
        ["Route path", "Password or login credential"],
        ["Button label", "Private message content"],
        ["Form step name", "Full form submission with personal details"],
        ["Recovery target", "Access token or private key"],
        ["Game name", "Sensitive customer record"]
      ]
    ),

    note("Privacy rule", "Events should describe what happened, not expose private user content."),

    p(`Use events when the action helps explain a journey. Important events are usually tied to conversion, signup, checkout, support, search, recovery, onboarding, account creation, feature use, or a major product action. Do not create an event for every mouse movement, hover, scroll, or tiny interface change unless there is a clear reason.`),

    list([
      "Track primary call-to-action clicks.",
      "Track signup and onboarding steps.",
      "Track checkout starts and important payment flow moments.",
      "Track form submissions without sending private form content.",
      "Track search use when search matters to the page.",
      "Track recovery actions from 404 pages or broken routes.",
      "Track Arcade starts, resets, and completion moments when useful."
    ]),

    p(`Events become more useful when the team can compare them with routes, errors, SEO, accessibility, and recovery signals. For example, if users reach the pricing page but do not click the pricing button, the team may review the page copy or layout. If users start signup but do not complete it, the team may review the form. If users click recovery links from a 404 page, the team can see which missing routes still need repair.`),

    p(`For funnels, use a small set of clear events instead of many confusing ones. A signup flow might only need signup_started, signup_step_completed, and signup_completed. A checkout flow might need checkout_started, checkout_step_completed, and checkout_completed. Keep the event set clean enough that reports remain readable.`),

    table(
      ["Flow", "Useful events"],
      [
        ["Signup", "signup_started, signup_step_completed, signup_completed"],
        ["Checkout", "checkout_started, checkout_step_completed, checkout_completed"],
        ["Contact", "contact_form_started, contact_form_submitted"],
        ["Docs", "docs_search_used, docs_result_clicked"],
        ["404 recovery", "recovery_link_clicked, arcade_game_started"],
        ["Onboarding", "onboarding_started, onboarding_step_completed, onboarding_completed"]
      ]
    ),

    p(`When adding a new event, first decide what question it should answer. If the event does not help the team understand behavior, fix a problem, measure a key action, or improve a visitor path, it may not need to exist.`),

    list([
      "What action does this event represent?",
      "Why does the team need to know it happened?",
      "Which route or product area does it belong to?",
      "What small details will make it easier to understand later?",
      "Could any detail expose private or sensitive information?",
      "Will this event name still make sense six months from now?"
    ]),

    p(`Events should be reviewed after major website changes. If a button is renamed, a route changes, a form is rebuilt, or a checkout flow is redesigned, confirm that the related events still fire correctly and still use the intended names.`),

    p(`A broken event can be misleading. If an event stops firing, CavBot may make the action look less active than it really is. If an event fires too many times, the action may look more important than it is. Test events after publishing and confirm they appear in the correct site profile.`),

    table(
      ["Problem", "What to check"],
      [
        ["Event does not appear", "Confirm the CavBot snippet is installed and the event code runs after the user action."],
        ["Event appears under the wrong site", "Check the project key, site ID, and saved site origin."],
        ["Event fires more than once", "Check for duplicate listeners or duplicate script installs."],
        ["Event name looks unclear", "Rename it before the team relies on reports."],
        ["Event details expose too much", "Remove private fields and keep only safe context."],
        ["Events stopped after a redesign", "Confirm the new button, form, or route still calls the event."]
      ]
    ),

    p(`For developers, the safest pattern is to send the event at the exact moment the action succeeds or clearly begins. For example, send signup_started when the visitor actually begins signup, not when the page simply loads. Send contact_form_submitted when the form submission is accepted, not when the visitor only focuses the first field.`),

    code('window.CavBot?.track?.("contact_form_submitted", {\n  route: window.location.pathname,\n  form: "contact",\n  source: "footer"\n});'),

    p(`The event above records that a contact form was submitted from the footer. It does not send the visitor’s name, email, message, or private form content. That is the right pattern: describe the action and keep sensitive data out of the event.`),

    p(`Events should make CavBot clearer. They should help the team see what visitors did, what actions matter, and where a page or flow may need attention. A clean event system is small, stable, safe, and connected to real product behavior.`),

    note("Event baseline", "Track meaningful actions, use stable names, keep details small, and never send sensitive user data.")
  ]
},

     {
  id: "api-keys",
  title: "API keys",
  summary: "Connect CavBot sites, embeds, and protected requests.",
  blocks: [
    p(`API keys connect a CavBot workspace project to the websites, embeds, widgets, and requests that are allowed to send information into CavBot. They help CavBot know which project a request belongs to, which site should receive the signal, and whether the request is coming from an approved origin.`),

    p(`In CavBot, an API key is not just a random string copied into a page. It is part of the trust boundary between a workspace, a site profile, and the public website using CavBot. The key helps CavBot separate one project from another and prevents signals from being mixed between unrelated websites.`),

    p(`API keys are used with site IDs, allowed origins, and request checks. The project key identifies the CavBot project. The site ID identifies the saved website profile. The origin check helps confirm that the request came from a website that is allowed to use that key.`),

    table(
      ["Part", "What it does"],
      [
        ["Project key", "Identifies the CavBot project that should receive the request."],
        ["Site ID", "Identifies the specific website profile inside the workspace."],
        ["Allowed origin", "Limits where browser-side requests are allowed to come from."],
        ["Request headers", "Carry key, site, origin, and runtime context into CavBot."],
        ["Key status", "Shows whether a key is active, rotated, or revoked."]
      ]
    ),

    p(`Use API keys when installing Analytics v5, loading CavBot embeds, connecting site widgets, using CavBot runtime scripts, or sending approved browser-side requests into the platform. The key should match the workspace and site you are actually installing CavBot on.`),

    p(`A normal website install should use the public project key generated for that site or workspace. This is the kind of key that can appear in browser-side configuration because it is meant to identify the public website install. Even then, it should still be scoped carefully and limited to the correct origin.`),

    code('<script>\n  window.CAVBOT_API_URL = "https://app.cavbot.io/api/embed/analytics";\n  window.CAVBOT_PROJECT_KEY = "YOUR_PROJECT_KEY";\n  window.CAVBOT_SITE = "YOUR_SITE_ID";\n  window.CAVBOT_SITE_ID = "YOUR_SITE_ID";\n  window.CAVBOT_SITE_PUBLIC_ID = "YOUR_SITE_ID";\n</script>'),

    p(`The project key and site ID in the snippet must come from the same CavBot workspace context. If the key belongs to one project and the site ID belongs to another, CavBot may reject the request or place the signal in the wrong context. Always copy both values from the same site setup flow.`),

    note("Important", "Only public embed or analytics keys should be used in browser-side code. Secret keys, admin keys, internal tokens, or server-only credentials should never be placed in public HTML, JavaScript, website builders, or client-side source files."),

    p(`CavBot may support different key purposes depending on the workspace and product surface. A public embed key can be used by a website install. A secret or admin-level key, when available, must stay server-side and should only be used by trusted backend systems. Treat every key according to the access it can provide.`),

    table(
      ["Key type", "Where it belongs"],
      [
        ["Public embed or analytics key", "Browser-side install for an approved CavBot site."],
        ["Secret key", "Server-side systems only. Do not expose in public code."],
        ["Admin key", "Restricted internal or administrative use only."],
        ["Rotated key", "Old key that has been replaced and should no longer be used."],
        ["Revoked key", "Disabled key that should not be accepted by CavBot."]
      ]
    ),

    p(`Owners should control sensitive key management. Creating, rotating, or revoking keys can affect whether a production site continues sending signals correctly. If the wrong key is removed or rotated without updating the site, CavBot may stop receiving activity from that website.`),

    p(`Keep each key scoped to the intended site and purpose. A key used for a marketing website should not be reused across unrelated products, client projects, test apps, or personal experiments unless that is an intentional workspace decision.`),

    list([
      "Use one clean key for the intended workspace and site.",
      "Keep the saved site origin and allowed origin aligned.",
      "Do not reuse keys across unrelated websites.",
      "Do not place server-only keys in browser code.",
      "Do not paste keys into public screenshots, support posts, or shared documents.",
      "Rotate keys that were exposed, copied to the wrong place, or used on the wrong origin.",
      "Revoke keys that should no longer have access."
    ]),

    p(`Allowed origins are one of the most important parts of API key safety. They help CavBot decide which website is allowed to use a key. If your production site is https://example.com, the key should be allowed for that origin. If your app also runs on https://app.example.com, that may need to be added separately depending on how the workspace is structured.`),

    table(
      ["Website setup", "Recommended origin handling"],
      [
        ["Single production website", "Allow the exact production origin."],
        ["www and non-www versions", "Use the final public origin after redirects, or allow both only when both are used."],
        ["Marketing site and app subdomain", "Add each origin only if both should send CavBot signals."],
        ["Staging or preview site", "Use a separate site profile or clearly label the environment."],
        ["Local development", "Use only when local testing is required and remove it when finished."]
      ]
    ),

    p(`The origin should be clean. Do not use full page paths, query strings, campaign URLs, or random routes as the allowed origin. The origin is the base website address, such as https://example.com or https://app.example.com.`),

    code('Correct:\nhttps://example.com\nhttps://www.example.com\nhttps://app.example.com\n\nAvoid:\nhttps://example.com/pricing\nhttps://example.com/blog/post-name\nhttps://example.com?utm_source=test'),

    p(`Rotate a key when you want to replace it with a new one while keeping the site connected. Rotation is useful when a key was exposed, copied into the wrong environment, shared with the wrong person, placed in an unapproved repository, or used on a website that should no longer send data.`),

    list([
      "Create or rotate the key in CavBot settings.",
      "Copy the new key from the same workspace and site context.",
      "Replace the old key in the website snippet or backend configuration.",
      "Publish or redeploy the website.",
      "Visit the public site to trigger a fresh signal.",
      "Confirm CavBot is receiving activity from the correct site.",
      "Revoke the old key after the new key is verified."
    ]),

    p(`Do not revoke an active production key before the replacement is installed and verified. If you revoke first, the website may stop sending signals immediately. The safer pattern is to create or rotate first, update the install, verify the new key, then revoke the old one.`),

    note("Rotation rule", "Rotate carefully. Update the live install and verify fresh signals before disabling the old key."),

    p(`Revoke a key when it should no longer work. Revocation is stronger than rotation because it disables access for that key. Use revocation when a key is no longer needed, belongs to a removed site, was used by an old environment, or should be blocked for security reasons.`),

    p(`After revoking a key, any install that still uses it may fail to send data. If a production website stops reporting after a key change, check whether the installed key was revoked, replaced, or copied incorrectly.`),

    table(
      ["Action", "When to use it"],
      [
        ["Create", "A new site, embed, environment, or workspace needs a key."],
        ["Rotate", "A key should be replaced without breaking production unexpectedly."],
        ["Revoke", "A key should stop working and should no longer be accepted."],
        ["Restrict origin", "A key should only work from approved website origins."],
        ["Review", "A workspace owner needs to confirm which keys are still active."]
      ]
    ),

    p(`API key reviews should be part of workspace maintenance. Review keys after adding a new site, removing a site, inviting a new admin, changing agencies or vendors, moving domains, publishing a redesign, or discovering that a key was copied somewhere it should not be.`),

    list([
      "Review active keys regularly.",
      "Remove keys for old test environments.",
      "Confirm production keys still match production origins.",
      "Check who can manage keys in the workspace.",
      "Rotate keys after access changes involving vendors or contractors.",
      "Keep key changes documented when they affect production."
    ]),

    p(`For troubleshooting, start with the basics. Confirm that the snippet is present on the live page, the project key is correct, the site ID is correct, the public origin matches the CavBot site profile, and the key has not been revoked. Then check the browser console and network requests for blocked or rejected calls.`),

    table(
      ["Problem", "What to check"],
      [
        ["No signals appear", "Confirm the snippet is published, the key is active, and the site ID is correct."],
        ["Signals appear under the wrong site", "Check that the project key and site ID came from the same workspace site."],
        ["Requests are rejected", "Check origin allowlist, key status, and request headers."],
        ["Signals stopped after rotation", "Confirm the live website was updated with the new key."],
        ["Only staging sends data", "Check whether the production site has the snippet and an approved origin."],
        ["Duplicate activity appears", "Check for duplicate snippets or multiple installs using the same key."]
      ]
    ),

    p(`API keys should make CavBot connection clear and controlled. A clean key setup keeps website signals organized, protects the workspace from unapproved origins, and gives owners a safe way to replace or disable access when something changes.`),

    note("API key baseline", "Use the right key for the right site, keep origins clean, never expose server-only credentials, rotate carefully, and revoke access that should no longer exist.")
  ]
},

     {
  id: "webhooks",
  title: "Webhooks",
  summary: "Receive trusted event updates from CavBot and connected services.",
  blocks: [
    p(`Webhooks are event messages sent from one system to another when something important happens. In CavBot, webhooks help connected services notify the platform about changes that should be reflected in a workspace, account, subscription, or product flow.`),

    p(`The clearest current example is billing. CavBot uses Stripe webhook handling so the platform can respond when a checkout session completes, a subscription changes, a payment succeeds, a payment fails, a plan updates, or a billing state needs to be refreshed.`),

    p(`Without webhooks, CavBot would have to rely only on what the user sees after checkout. That would be weaker. Webhooks allow the payment provider to send CavBot a trusted server-side event so the workspace can update plan access, subscription status, billing records, and related account state more reliably.`),

    table(
      ["Webhook area", "What it helps CavBot update"],
      [
        ["Checkout", "Confirms when a checkout session has completed or failed."],
        ["Subscriptions", "Updates plan state when a subscription is created, changed, canceled, or renewed."],
        ["Payments", "Records successful payments, failed payments, and payment status changes."],
        ["Billing access", "Helps CavBot unlock, restrict, or refresh plan-based features."],
        ["Account records", "Keeps workspace billing state aligned with the payment provider."]
      ]
    ),

    p(`A webhook is different from a normal browser request. A browser request usually comes from a user clicking a button or loading a page. A webhook comes from a trusted service sending CavBot an event after something happened on that service’s side.`),

    p(`For example, when a customer completes checkout, the browser may return the user to CavBot. That return page is useful, but it should not be the only source of truth. The webhook gives CavBot a direct event from the payment provider so the platform can confirm what actually happened.`),

    note("System source of truth", "For billing, webhook events should be treated as a trusted server-side confirmation path. The success page can show the user what happened, but the webhook is what helps CavBot keep billing state accurate."),

    p(`Webhook handling must be careful because webhook events can affect real accounts, plans, access, and billing state. CavBot should verify that incoming webhook events are authentic before using them. A webhook should not be trusted only because it reaches a public endpoint.`),

    list([
      "Receive the webhook event from the provider.",
      "Verify that the event is authentic.",
      "Read the event type and related customer or subscription data.",
      "Find the matching CavBot account or workspace.",
      "Update billing, subscription, or access state only after verification passes.",
      "Store or acknowledge the event so duplicate deliveries do not create repeated changes.",
      "Return a clear success response when CavBot has handled the event."
    ]),

    p(`Webhook providers may send the same event more than once. CavBot should handle repeated deliveries safely. If a payment event is received twice, the platform should not create two subscriptions, double-count a change, or unlock the wrong workspace. The same event should be safe to process again without causing damage.`),

    p(`Webhook events may also arrive out of order. A delayed event can reach CavBot after a newer event has already been processed. For that reason, billing and subscription updates should be handled with care, using provider timestamps, current subscription state, and the latest known account record where possible.`),

    table(
      ["Risk", "How CavBot should handle it"],
      [
        ["Fake webhook", "Verify the provider signature before processing."],
        ["Duplicate event", "Detect repeated event IDs and avoid double-processing."],
        ["Delayed event", "Compare event timing and current account state before changing access."],
        ["Missing account match", "Log the issue and avoid applying the event to the wrong workspace."],
        ["Failed processing", "Keep enough event context to retry or investigate safely."]
      ]
    ),

    p(`Customer-facing webhook controls may not be available in every CavBot workspace yet. If your workspace does not show a webhook settings page, treat webhooks as internal platform infrastructure used by CavBot and its trusted providers.`),

    p(`If CavBot later exposes customer-managed webhooks, they should be used for external systems that need reliable updates from a workspace. Examples may include sending site alerts to another tool, notifying a team system when a report is ready, sending issue events to an internal dashboard, or syncing certain workspace events to a customer-owned backend.`),

    table(
      ["Future customer webhook", "Possible use"],
      [
        ["Site alert", "Notify an external system when CavBot detects an important site issue."],
        ["Report ready", "Send a message when a workspace report has been generated."],
        ["Security event", "Notify a customer system when a protected action needs review."],
        ["Storage event", "Notify an external workflow when a file or artifact changes."],
        ["Integration event", "Sync selected CavBot activity into another approved business system."]
      ]
    ),

    p(`A good webhook payload should be clear, limited, and useful. It should include the event type, event ID, timestamp, workspace or site reference, and the minimum details needed for the receiving system to understand what happened. It should not include secrets, passwords, private keys, payment card details, or unnecessary personal information.`),

    list([
      "Keep webhook payloads limited to the receiving system’s purpose.",
      "Include stable event names.",
      "Include event IDs for tracking and duplicate protection.",
      "Include timestamps so receivers can understand order.",
      "Avoid sending secrets or private credentials.",
      "Do not send more user data than the receiving system needs.",
      "Document webhook behavior before relying on it in production."
    ]),

    p(`Webhook endpoints should be protected. If a customer-managed webhook feature becomes available, receiving systems should verify the signature or shared secret CavBot provides. The receiving system should also respond quickly, avoid heavy processing during the request, and queue longer work in its own backend.`),

    p(`For reliability, webhook receivers should expect retries. If a receiving system is temporarily down, CavBot or the connected provider may attempt delivery again depending on the webhook system in use. The receiver should handle retries without creating duplicate records or repeated actions.`),

    table(
      ["Receiver responsibility", "Why it matters"],
      [
        ["Verify the webhook", "Confirms the event really came from the expected sender."],
        ["Respond quickly", "Prevents timeouts and repeated delivery attempts."],
        ["Handle duplicates", "Keeps repeated events from causing repeated changes."],
        ["Store event IDs", "Makes investigation and replay safer."],
        ["Limit side effects", "Prevents one webhook from triggering too many uncontrolled actions."]
      ]
    ),

    p(`When troubleshooting webhooks, start with the event source. Confirm that the provider sent the event, that CavBot received it, that signature verification passed, that the event matched the correct account or workspace, and that the final state changed as expected.`),

    table(
      ["Problem", "What to check"],
      [
        ["Plan did not update", "Confirm the billing webhook was received and matched the correct account."],
        ["Checkout succeeded but access is still locked", "Refresh billing state and check whether the subscription event processed."],
        ["Duplicate billing event appears", "Check whether the provider retried delivery and whether CavBot handled the event safely."],
        ["Webhook rejected", "Check signature verification, endpoint configuration, and provider settings."],
        ["Wrong workspace updated", "Check customer, account, project, and subscription mapping."]
      ]
    ),

    p(`Webhooks should make CavBot more reliable, not more fragile. The best webhook design is verified, limited, repeatable, and easy to investigate. Every event should have a clear purpose, a clear source, and a safe path for handling failure.`),

    note("Webhook baseline", "Trust the event only after verification, keep payloads limited, handle duplicates safely, and never let a webhook update the wrong account, workspace, or plan.")
  ]
},

    {
  id: "summary",
  title: "Summary",
  summary: "Read the current state of a selected site in one compact view.",
  blocks: [
    p(`Summary is the compact read layer for CavBot. It gives a workspace a clear snapshot of what CavBot currently knows about the selected site without forcing the user to open every module one by one.`),

    p(`Use Summary when a page, report, dashboard card, or CavAi response needs the current operating state of a website. A summary can help show whether the site is connected, whether recent signals exist, which routes need attention, whether broken pages are appearing, and which focused module should be opened next.`),

    p(`A summary should be treated as a snapshot, not the final answer. It helps the team understand the current state quickly, but important work should still be verified in the source module before changing production.`),

    table(
      ["Summary area", "What it helps explain"],
      [
        ["Selected site", "Shows which website the workspace is currently reviewing."],
        ["Connection state", "Helps confirm whether CavBot has enough recent activity to read the site."],
        ["Routes", "Points to route activity, missing paths, or pages that may need review."],
        ["Errors", "Highlights whether runtime or browser-side issues may need attention."],
        ["SEO", "Points toward metadata, title, description, canonical, heading, or structure concerns."],
        ["A11y", "Highlights accessibility signals that may need a focused review."],
        ["404 recovery", "Shows whether missing routes or recovery paths should be inspected."],
        ["CavAi context", "Gives CavAi a smaller, cleaner picture before it explains or summarizes the site."]
      ]
    ),

    p(`Summary is useful because most teams do not need raw signals first. They need to know what changed, what matters, and where to look next. A clean summary keeps that first review focused.`),

    p(`For example, if Summary points to repeated missing routes, open 404 Recovery. If it points to runtime issues, open Error Intelligence. If it points to weak page structure, open SEO. If it points to accessibility problems, open A11y. Summary should guide the next step instead of pretending to replace it.`),

    note("Important", "Summary helps you decide where to look next. It should not be used as the only source before changing code, redirects, metadata, access settings, billing, or protected workspace configuration."),

    p(`A normal Summary flow starts with the active project and selected site. CavBot reads the current workspace context, checks the latest available site signals, organizes the most useful state into a compact response, and returns that state to the dashboard, report, API layer, or CavAi workflow that requested it.`),

    list([
      "Confirm the active workspace.",
      "Confirm the selected site.",
      "Read the latest available CavBot signals for that site.",
      "Return a compact view of the site state.",
      "Point the user toward the focused module that needs review.",
      "Use the source module to verify details before making changes."
    ]),

    p(`Summary is especially helpful when CavAi needs context. Instead of asking CavAi to reason from a blank page, CavBot can provide a current site snapshot first. That helps CavAi explain the site state more clearly and reduces the chance of a vague answer.`),

    p(`For dashboard use, Summary can help load a clear overview quickly. It can support cards, reports, site status panels, module previews, and empty states that explain what the user should do next.`),

    p(`For developer use, Summary can help confirm whether the selected site and origin are correct before deeper debugging begins. If a site looks empty, the summary can help point toward common setup issues such as a missing snippet, a wrong site ID, an origin mismatch, or no recent browser visit after installation.`),

    table(
      ["When to use Summary", "Why it helps"],
      [
        ["Opening a workspace", "Gives the user a quick sense of the selected site state."],
        ["Asking CavAi about a site", "Provides current workspace context before CavAi answers."],
        ["Reviewing a report", "Creates a compact starting point before reading deeper details."],
        ["Checking setup", "Helps confirm whether CavBot is receiving site activity."],
        ["Triaging issues", "Points toward the module that should be opened first."],
        ["Preparing a status update", "Gives a short view of what needs attention."]
      ]
    ),

    p(`Summary should stay readable. It should not overload the user with every event, every route, every error, or every raw record. The purpose is to give a calm first view of the site, then point to the right place for detail.`),

    p(`A strong summary should answer basic questions clearly: Which site is selected? Is CavBot seeing activity? Are there route issues? Are there errors? Are there SEO or accessibility signals worth reviewing? Are there missing routes or recovery concerns? What should the user open next?`),

    list([
      "Keep summaries short enough to read quickly.",
      "Show the selected site clearly.",
      "Call out missing or stale signal state.",
      "Point to the focused module for deeper review.",
      "Avoid making unsupported claims when the data is incomplete.",
      "Use clear empty states when there are no signals yet."
    ]),

    p(`If Summary shows no data, that does not always mean the site is healthy. It may mean the site has not sent signals yet. The user should confirm that the site origin is correct, the Analytics v5 snippet is installed, the project key and site ID match, and the live site has been visited after publishing.`),

    table(
      ["Problem", "What to check"],
      [
        ["Summary is empty", "Confirm the snippet is installed and the live site has received a real browser visit."],
        ["Wrong site appears", "Check the selected site, primary site, and saved workspace context."],
        ["Signals look stale", "Visit the live site again and confirm CavBot receives new activity."],
        ["Routes are missing", "Confirm the snippet loads on every important page, not only one route."],
        ["CavAi gives a vague answer", "Ask with the selected site, route, module, and goal included."],
        ["A reported issue needs action", "Open the focused module before changing production."]
      ]
    ),

    p(`Summary should be careful with confidence. If CavBot has limited data, the summary should say that the current view is limited. If a signal is missing, stale, or unavailable, it is better to show that clearly than to make the site look healthier than it is.`),

    p(`For production work, never treat Summary as the only review step. If the summary mentions an error, inspect the error. If it mentions a missing route, inspect the route. If it mentions SEO, inspect the page metadata. If it mentions accessibility, test the page. The summary is the doorway, not the full investigation.`),

    p(`The best Summary experience is simple: it tells the user what CavBot can see, what may need attention, and where to go next. That keeps CavBot useful without turning the first view into noise.`),

    note("Summary rule", "Use Summary for quick understanding. Use the focused module for proof, detail, and production decisions.")
  ]
},

    ]
  },


  tools: {
    path: "/docs/tools",
    icon: "assets/icons/docs/devtool-svgrepo-com.svg",
    label: "Developer tools",
    
    title: "Developer tools",
    description: "Use CavCode, CavCloud, CavTools, HTML Viewer, and Cav commands for development and workspace operations.",
    sections: [
     {
  id: "cavcode",
  title: "Code",
  summary: "Open, edit, save, run, and review workspace code inside CavBot.",
  blocks: [
    p(`CavCode is CavBot’s built-in code editor. It gives a workspace a place to open project files, read code, edit files, review problems, run commands, preview output, and use Caven for coding help without leaving the CavBot platform.`),

    p(`Use CavCode when the work belongs close to the workspace: fixing a page, reviewing a file, checking a component, inspecting a bug, testing a small change, reading diagnostics, or preparing a safer edit before publishing.`),

    p(`CavCode is built around a project file tree, editor tabs, diagnostics, search, source control, live preview, run tools, settings, and a terminal command plane. The goal is to make code work readable and controlled inside CavBot, not scattered across disconnected screens.`),

    p(`The editor is designed for real project work. You can open files, keep multiple files in tabs, edit text files, save changes, review warnings and errors, inspect the file tree, search through code, and use Cav commands for deeper workspace actions.`),

    table(
      ["Area", "What it is for"],
      [
        ["Explorer", "Open folders, browse files, and move through the project structure."],
        ["Editor", "Read and edit the active file."],
        ["Tabs", "Switch between files without losing context."],
        ["Problems", "Review diagnostics, warnings, and errors reported for the current workspace."],
        ["Terminal", "Run Cav commands and inspect command output."],
        ["Live / Viewer", "Preview supported HTML or app output when a preview surface is available."],
        ["Run", "Start or inspect project tasks when the workspace supports runtime sessions."],
        ["Settings", "Review editor, workspace, and project behavior."],
        ["Caven", "Ask for code explanation, repair plans, refactors, and file-level help."]
      ]
    ),

    p(`CavCode should be used when you need more control than a normal dashboard gives you. A dashboard can show that something is wrong. CavCode helps you open the file, inspect the source, understand the issue, and make the smallest safe change.`),

    p(`A normal CavCode workflow starts with the file. Open the project, find the file that matters, read the surrounding code, check the Problems panel, make a focused edit, save the file, then verify the result through the preview, run output, diagnostics, or the relevant CavBot module.`),

    list([
      "Open the project or mounted workspace.",
      "Find the file in Explorer.",
      "Read the file before editing.",
      "Check Problems for current diagnostics.",
      "Make the smallest safe change.",
      "Save the file.",
      "Run or preview the result when available.",
      "Verify the change before moving to the next file."
    ]),

    p(`CavCode can work with files stored in the CavCode workspace and, when available, files connected through CavCloud or mounted workspace storage. This helps keep code, files, previews, and assistant context close to the same project.`),

    p(`Saving in CavCode should be treated as a real workspace action. Before changing a file, confirm that the active project, selected workspace, and file path are correct. Do not edit a file only because it appears open. Make sure it is the file you actually intend to change.`),

    note("Save carefully", "Before saving, confirm the file name, folder path, active workspace, and purpose of the change. A clean edit starts with the right file."),

    p(`The Problems panel is where CavCode shows diagnostics for the current codebase when diagnostics are available. Use it to catch syntax errors, missing imports, type issues, warnings, or other problems that should be reviewed before a change is considered finished.`),

    p(`Diagnostics are not a replacement for testing. A file can have no visible problems and still behave incorrectly in the browser. After fixing code, also check the live page, the preview, the route, the console output, or the CavBot module related to the issue.`),

    table(
      ["If you see this", "What to do"],
      [
        ["A syntax error", "Open the file and check the exact line before editing anything else."],
        ["A missing import", "Confirm the package or local file exists before adding a new import."],
        ["A type warning", "Read the expected value and the current value before changing the code."],
        ["A preview issue", "Check the file path, linked assets, console output, and current saved version."],
        ["No diagnostics", "Still test the route or preview before assuming the change is complete."]
      ]
    ),

    p(`The Terminal is used for Cav commands. It can help inspect files, check workspace state, open paths, run supported tasks, review logs, manage codebase actions, and inspect developer output. Use read-only commands first when you are investigating.`),

    p(`Good terminal work is careful. Start with commands that show state, such as listing files, reading a file, checking context, or viewing diagnostics. Use write, remove, restart, restore, commit, or publish actions only when the target is clear.`),

    list([
      "Use Terminal to inspect before changing.",
      "Read command output before running another command.",
      "Avoid destructive commands unless the target is confirmed.",
      "Use exact file paths when opening or editing through commands.",
      "Keep command output as part of the debugging trail when needed."
    ]),

    p(`Caven is the coding assistant inside the CavCode workflow. Use Caven when you need help understanding a file, explaining an error, preparing a fix plan, reviewing a component, improving a page, or making a careful code change.`),

    p(`Caven works best when the request is specific. Name the file, describe the issue, explain what must not change, and ask for the smallest safe fix. A narrow request produces a better coding result than a broad request like “fix everything.”`),

    table(
      ["Good Caven request", "Why it works"],
      [
        ["Explain this file before I edit it.", "Helps you understand the code before making changes."],
        ["Find why this button is not working in this component.", "Keeps the review focused on one behavior."],
        ["Give me a fix plan before changing this route.", "Prevents wide edits before the issue is understood."],
        ["Only fix the validation error. Do not change layout.", "Sets a clear boundary for the edit."],
        ["Review this file for broken imports and missing assets.", "Targets a real code problem."]
      ]
    ),

    p(`CavCode should not be used as a place for blind rewrites. If a change touches multiple files, protected settings, billing, security, storage, authentication, or production behavior, start with a plan. Review the plan, then apply changes one step at a time.`),

    p(`When working on public pages, keep edits small and verify the result visually. A change that looks simple in code can affect layout, mobile behavior, accessibility, SEO metadata, forms, buttons, or navigation.`),

    p(`When working on app code, check the surrounding flow before editing. A component may depend on account state, workspace selection, plan access, site context, local storage, cookies, API routes, or another module. Do not change those flows without understanding what depends on them.`),

    note("Production rule", "For production work, plan first, edit small, save deliberately, run or preview when available, then verify in the real surface."),

    p(`CavCode can also support file review and cleanup. Use it to inspect old files, compare naming patterns, review repeated code, check assets, clean small mistakes, and prepare better structure across a workspace.`),

    p(`Use Live or Viewer surfaces when the file needs visual confirmation. HTML, CSS, image, and page changes should be checked in a preview whenever possible. If the preview does not match the file, confirm that the file was saved, the correct path is open, assets are linked correctly, and the preview is loading the latest version.`),

    table(
      ["Task", "Recommended CavCode surface"],
      [
        ["Find a file", "Explorer or Terminal"],
        ["Edit code", "Editor"],
        ["Review errors", "Problems"],
        ["Ask for a fix plan", "Caven"],
        ["Run a command", "Terminal"],
        ["Preview HTML or visual output", "Live / Viewer"],
        ["Check project settings", "Settings"],
        ["Review many files", "Explorer, Search, and Tabs"]
      ]
    ),

    p(`CavCode becomes more useful when the workspace is organized. Use clear folders, readable file names, stable paths, and focused commits or save points. This makes it easier for Caven, the terminal, diagnostics, and the editor to keep the work understandable.`),

    p(`If CavCode feels out of sync, check the active workspace, the file path, the saved state, the mounted storage source, and any available command output. Most confusion comes from editing the wrong file, previewing an older version, or working in the wrong project context.`),

    list([
      "Confirm the active workspace before editing.",
      "Confirm the file path before saving.",
      "Use Problems before and after changes.",
      "Use Caven for explanation before major edits.",
      "Use Live or Viewer when visual output matters.",
      "Use Terminal for inspection and controlled commands.",
      "Keep production edits small and easy to review."
    ]),

    p(`CavCode is strongest when it is used as a careful development surface: inspect the code, understand the issue, make the smallest safe change, verify the result, and keep the workspace clear for the next person who opens it.`),

    note("Core rule", "CavCode is for controlled code work inside CavBot. Read first, edit carefully, save deliberately, and verify before treating the change as finished.")
  ]
},

     {
  id: "cavcloud",
  title: "Cloud",
  summary: "Store, organize, preview, share, and manage workspace files.",
  blocks: [
    p(`CavCloud is CavBot’s workspace file storage. It gives each workspace a clear place to keep files, folders, uploads, documents, generated outputs, HTML files, project assets, notes, exports, and other working material connected to the project.`),

    p(`Use CavCloud when a file belongs to the workspace and should be easier to find, preview, organize, share, restore, or use inside CavBot. Instead of leaving important files scattered across downloads, local folders, messages, and random drives, CavCloud keeps project material close to the tools that use it.`),

    p(`CavCloud supports folders, files, uploads, text editing, previews, sharing, published files, activity history, search, tree views, versions, trash restore, collaborators, and storage notices. It is designed to work with CavCode, CavCode Viewer, CavPad, CavAi, and other CavBot surfaces that need access to workspace files.`),

    table(
      ["Area", "What it is for"],
      [
        ["Folders", "Organize files by project, client, release, page, asset type, or workflow."],
        ["Uploads", "Add files from your device into the active workspace."],
        ["File preview", "Open supported files without downloading them first."],
        ["Text editing", "Edit supported text-based files directly in the workspace."],
        ["Search", "Find files by name, folder, or visible file context."],
        ["Tree view", "Review the folder structure in a clean project-style layout."],
        ["Versions", "Track file changes when version history is available."],
        ["Trash restore", "Recover files that were removed by mistake when restore is available."],
        ["Sharing", "Give access to selected files or published outputs when the workspace allows it."],
        ["Storage notices", "See when the workspace is approaching its storage limit."]
      ]
    ),

    p(`CavCloud is best for ordinary workspace files. Use it for brand assets, project documents, notes, exports, HTML files, generated pages, screenshots, code-related files, public assets, preview material, and files that teammates may need to review.`),

    p(`CavCloud is not the same as CavSafe. CavCloud is the normal workspace storage layer. CavSafe is for protected files that need stronger control, owner-only access, integrity review, time locks, snapshots, or audit-focused handling. Keep normal files in CavCloud so the workspace stays easy to use. Move sensitive files into CavSafe only when they need stronger protection.`),

    table(
      ["Use CavCloud for", "Use CavSafe for"],
      [
        ["Working documents", "Sensitive business records"],
        ["Brand assets", "Private legal or financial material"],
        ["HTML files and previews", "Files that require owner-only access"],
        ["Generated outputs", "Protected files that need an audit trail"],
        ["Shared project files", "High-value files that should not be broadly available"]
      ]
    ),

    p(`A clean CavCloud workspace starts with good folders. Do not drop every file into one place. Create folders that match how the work is actually reviewed: client files, brand assets, code exports, reports, screenshots, HTML previews, launch material, support files, or project notes.`),

    list([
      "Use clear folder names.",
      "Keep related files together.",
      "Separate public assets from private working files.",
      "Move old files into archive folders when they are no longer active.",
      "Delete duplicates when they create confusion.",
      "Use CavSafe for protected files instead of hiding them inside normal folders."
    ]),

    p(`CavCloud can support CavCode by making workspace files easier to open, preview, and edit when the file type is supported. For example, an HTML file stored in CavCloud can be opened for review, edited in a supported editor flow, or previewed through the viewer when the workspace allows it.`),

    p(`CavCloud can also support CavAi and Caven workflows. When a file is part of the work, the assistant can be given the file context where supported. This is useful for summarizing a document, reviewing a code file, preparing a fix plan, explaining an export, or turning a file into a clearer next step.`),

    p(`When using CavCloud with generated outputs, keep the output connected to the reason it was created. A generated report, HTML page, image, text file, or project export should have a name that makes its purpose clear. Avoid vague file names like final, new, test, or version2 when the file may be reviewed later.`),

    table(
      ["Weak name", "Better name"],
      [
        ["final.html", "pricing-page-final-2026-05.html"],
        ["new-doc.txt", "seo-review-homepage-notes.txt"],
        ["image.png", "cavbot-arcade-preview-card.png"],
        ["export.zip", "website-export-may-2026.zip"],
        ["notes.md", "launch-checklist-cavbot-docs.md"]
      ]
    ),

    p(`Storage limits depend on the workspace plan. Free workspaces include basic CavCloud storage. Premium and Premium+ workspaces include larger storage capacity for heavier projects, more files, and larger operating needs.`),

    table(
      ["Plan", "CavCloud storage"],
      [
        ["Free", "5 GB CavCloud storage"],
        ["Premium", "50 GB CavCloud storage"],
        ["Premium+", "500 GB CavCloud storage"]
      ]
    ),

    p(`Storage notices should be taken seriously. When a workspace gets close to its limit, review large uploads, old exports, repeated screenshots, unused videos, duplicate folders, and files that should be archived or deleted.`),

    note("Storage review", "Before uploading large projects, videos, image sets, site exports, or generated file bundles, check the current workspace storage level."),

    p(`CavCloud sharing should be used carefully. Only share files with people who need access. Before publishing or sharing a file, confirm that it does not contain private notes, keys, customer information, internal drafts, billing records, or protected workspace material.`),

    p(`If a file should be public, make sure the name, content, and folder location are ready for that use. If a file should stay internal, keep it private and review who has workspace access before sharing it with others.`),

    list([
      "Review the file before sharing it.",
      "Confirm the file belongs in CavCloud and not CavSafe.",
      "Check whether the file contains private information.",
      "Use clear names so shared files are easy to understand.",
      "Remove access when a file no longer needs to be shared."
    ]),

    p(`Trash and restore features help prevent small mistakes from becoming permanent losses. If a file is deleted by accident, check the trash or restore area when available. Do not rely on trash as a long-term archive. Important files should be organized, backed up, or protected according to their purpose.`),

    p(`Version history helps when a file changes over time. Use versions to understand what changed, recover from a bad edit, or compare a newer file against an older one. If the file is business-critical, review whether it should also be protected through CavSafe or exported for external backup.`),

    p(`CavCloud activity helps the workspace understand what happened around files. Activity can show uploads, changes, sharing behavior, restore actions, published files, or other file-related events when the system records them.`),

    p(`For teams, CavCloud should be kept clean enough that another teammate can open the workspace and understand where files belong. A messy storage space slows down every future workflow. A clean CavCloud structure makes CavCode, CavAi, previews, reports, and team review easier.`),

    table(
      ["Problem", "What to check"],
      [
        ["File is missing", "Check the current folder, search, trash, and whether the file was uploaded to a different workspace."],
        ["Preview does not load", "Confirm the file type is supported and the file is not corrupted or too large."],
        ["CavCode cannot open the file", "Check whether the file type is editable and whether the workspace mount is available."],
        ["Storage is almost full", "Review large uploads, duplicate exports, videos, image sets, and old project bundles."],
        ["Shared file should not be public", "Remove the share or publish state and move protected material to CavSafe if needed."]
      ]
    ),

    p(`CavCloud should not become a dumping ground. It should be the workspace’s organized file layer. Store what matters, name files clearly, keep folders readable, review storage regularly, and protect sensitive material in CavSafe when stronger controls are needed.`),

    note("Core rule", "Use CavCloud for active workspace files. Keep it organized, review storage before large uploads, and move sensitive files to CavSafe when they need stronger protection.")
  ]
},

    {
  id: "cavtools",
  title: "Terminal",
  summary: "Inspect workspace behavior, commands, files, previews, and developer output.",
  blocks: [
    p(`CavTools is the developer inspection area inside CavBot. It gives builders a focused place to check what is happening inside a workspace before changing code, files, settings, or production behavior.`),

    p(`Use CavTools when something needs a closer look. If a file does not open, a preview does not match the latest edit, a command returns an unexpected result, a workspace action feels stuck, or a developer surface is not behaving correctly, CavTools helps you inspect the state instead of guessing.`),

    p(`CavTools is built for review, testing, and verification. It helps answer practical questions: what command ran, what output came back, which file was referenced, what workspace is active, which site is selected, what recent activity happened, and where the next step should happen.`),

    table(
      ["Area", "What CavTools helps with"],
      [
        ["Workspace context", "Confirm the active project, selected site, current file, and related workspace state."],
        ["Command output", "Read the result of Cav commands, developer actions, checks, and tool responses."],
        ["Recent activity", "Review recent events so you can understand what happened before the current issue."],
        ["File behavior", "Check whether a file opened, saved, previewed, moved, or failed as expected."],
        ["Preview issues", "Investigate why a live view or preview does not match the file you expected."],
        ["Diagnostics", "Review developer-facing messages, warnings, failures, and action results."],
        ["Safe testing", "Test a workflow before making a larger change in CavCode, CavCloud, or workspace settings."]
      ]
    ),

    p(`CavTools should be opened when the normal product screen does not give enough detail. A dashboard can show that something needs attention. CavTools helps you inspect the action behind the result so you can decide what to do next with more confidence.`),

    p(`For example, if a preview is not showing the latest file, CavTools can help you check whether the right file is selected, whether the workspace context is correct, whether the preview action returned an error, or whether the problem belongs in CavCode, CavCloud, the viewer, or the workspace settings.`),

    p(`If a command does not behave as expected, CavTools gives you a place to read the command result clearly. That matters because the answer may not be “the app is broken.” The result may point to a missing file, a wrong path, a locked feature, a permission issue, a workspace mismatch, or an action that needs to be run somewhere else.`),

    p(`CavTools is not the same as CavCode. CavCode is where you write, edit, review, and run code. CavTools is where you inspect the developer workflow around that code. CavCode is for changing the work. CavTools is for checking the work, reading output, and understanding what happened.`),

    p(`CavTools is also not a replacement for the main dashboard. The dashboard is for understanding the website and workspace at a higher level. CavTools is for developer-level inspection when you need to see the details behind a file action, command, preview, runtime message, or workspace behavior.`),

    table(
      ["Use", "Open this surface"],
      [
        ["You need to edit code", "CavCode"],
        ["You need to inspect command output", "CavTools"],
        ["You need to organize files", "CavCloud"],
        ["You need to preview an HTML file", "HTML Viewer"],
        ["You need to review site signals", "Dashboard or focused signal modules"],
        ["You need to understand why a developer action failed", "CavTools"]
      ]
    ),

    p(`A strong CavTools workflow is simple: inspect, confirm, act, and verify. First inspect the current state. Then confirm the project, site, file, command, or action target. Then make the smallest safe change in the correct surface. After that, return to CavTools, CavCode, CavCloud, or the dashboard to verify the result.`),

    list([
      "Open CavTools before changing files or settings when the issue is unclear.",
      "Confirm the active project and selected site before reviewing output.",
      "Read command results carefully before taking action.",
      "Check whether the issue belongs in CavCode, CavCloud, the viewer, dashboard, or workspace settings.",
      "Use read-only checks before running actions that write, delete, restart, replace, restore, or publish.",
      "Return to the correct surface only after you understand what needs to change."
    ]),

    p(`CavTools is especially useful for teams because it makes technical issues easier to explain. Instead of saying something is broken, a developer can say what was checked, what command ran, what result came back, what looks wrong, and which surface should be opened next.`),

    p(`For solo builders, CavTools helps you move faster without making blind changes. You can check the result of a command, confirm that a file exists, verify that the right workspace is active, and understand the next step before touching the code.`),

    note("Best practice", "Use CavTools as your inspection layer. Read first, confirm the target, then make the smallest safe change in the correct surface."),

    p(`CavTools should be used with care around actions that can change the workspace. Reading output is safe. Changing files, deleting files, restarting sessions, replacing content, publishing previews, restoring items, or changing settings should only happen after the target is clear.`),

    table(
      ["Before acting", "Confirm"],
      [
        ["Before opening a file", "The file path and workspace are correct."],
        ["Before running a command", "The command is intended for the active project."],
        ["Before editing a file", "The file is the right file and not an old copy."],
        ["Before deleting or replacing anything", "The item is no longer needed or has a recovery path."],
        ["Before restarting a session", "You understand what session is active and what may be interrupted."],
        ["Before publishing or sharing output", "The file is safe to expose and does not contain private material."]
      ]
    ),

    p(`CavTools can help investigate preview problems. If the viewer is not showing the expected page, check whether the file was saved, whether the correct file is selected, whether linked assets are available, whether the preview route is reading the current file, and whether the output shows an error.`),

    p(`CavTools can also help investigate command problems. If a command returns an error, read the full result before changing anything. The command may be missing a file path, using the wrong workspace, referencing a locked feature, or expecting a task that has not been configured yet.`),

    table(
      ["Problem", "What to check"],
      [
        ["Command returned an error", "Read the output, confirm the command target, and check whether the action is available in the active workspace."],
        ["File will not open", "Confirm the file path, file type, workspace, and whether the file still exists."],
        ["Preview is outdated", "Confirm the file was saved and the viewer is pointed at the current file."],
        ["Action feels stuck", "Check recent activity, command output, and whether a previous action is still pending."],
        ["Wrong site context", "Confirm the selected site before reviewing site-related output."],
        ["Permission issue", "Check role, plan, owner-only restrictions, or protected workflow requirements."]
      ]
    ),

    p(`CavTools should make developer work calmer. It gives you a place to slow down, read the result, and choose the next move. That keeps the workspace from turning into guesswork when something does not behave the way you expected.`),

    p(`Use CavTools when the question is not just “what does the page show?” but “what happened behind this action?” That is where CavTools belongs in the workflow. It turns unclear behavior into a readable result, and a readable result into a safer next step.`),

    note("Core rule", "CavTools is for inspection before action. Use it to understand what happened, then make the change in the right place.")
  ]
},


     {
  id: "html-viewer",
  title: "HTML Viewer",
  summary: "Preview HTML files, assets, and generated pages before publishing.",
  blocks: [
    p(`HTML Viewer is CavBot’s live preview surface for HTML files and related web assets. It lives at /cavcode-viewer and gives users a way to open a saved page, render it in the browser, inspect the result, and confirm that the file behaves the way it should before it is published or shared.`),

    p(`Use HTML Viewer when you need to preview an HTML artifact from CavCloud, CavSafe, CavCode, or a connected workspace file. It is built for generated pages, edited HTML files, saved website sections, exported templates, preview documents, static pages, and files that need to be reviewed visually before the next step.`),

    p(`HTML Viewer can load HTML, CSS, JavaScript, images, video, fonts, JSON, SVG, and other supported assets through CavBot’s file APIs. When a file is opened, the viewer attempts to render the page using the file and its referenced assets so the user can see the page as a working browser preview instead of reading raw source alone.`),

    table(
      ["Use case", "How HTML Viewer helps"],
      [
        ["Preview HTML files", "Open a saved HTML file and see how it renders in the browser."],
        ["Review generated pages", "Check pages created by CavAi, Caven, CavCode, or other workspace tools."],
        ["Inspect layout changes", "Confirm spacing, structure, typography, images, and page flow before publishing."],
        ["Check linked assets", "Verify that CSS, images, scripts, fonts, SVGs, and media files load correctly."],
        ["Test static artifacts", "Review static exports, landing pages, legal pages, docs pages, and HTML templates."],
        ["Support CavCode work", "Preview files edited in CavCode without leaving the CavBot workspace."],
        ["Review protected files", "Preview eligible CavSafe files when the user has the right access."]
      ]
    ),

    p(`HTML Viewer is not the same as CavCode. CavCode is where you write and edit files. HTML Viewer is where you see the result. A strong workflow is to edit in CavCode, save the file, open the file in HTML Viewer, review the page, then return to CavCode if anything needs to be corrected.`),

    p(`HTML Viewer is also not a full production deployment. A file can look correct in the viewer and still need final testing on the real website, real domain, real routing system, and real production environment. Use the viewer as a review step before publishing, not as the final proof that production is complete.`),

    list([
      "Use CavCode to edit the HTML, CSS, or JavaScript.",
      "Save the latest version of the file.",
      "Open the file in HTML Viewer.",
      "Confirm the page renders correctly.",
      "Check that assets load from the expected paths.",
      "Return to CavCode if the preview shows layout, script, or asset problems.",
      "Test again on the real website before treating the work as finished."
    ]),

    p(`The most common HTML Viewer issue is a path problem. If the preview does not look right, check the asset paths first. A page may reference a CSS file, image, script, font, or video that does not exist in the same folder structure, was not uploaded, was moved, or is blocked by the selected storage surface.`),

    table(
      ["Problem", "What to check"],
      [
        ["Styles are missing", "Confirm the CSS file exists and the link path is correct."],
        ["Images do not load", "Check image paths, file names, capitalization, and upload location."],
        ["JavaScript does not run", "Confirm scripts are allowed, paths are correct, and the file does not depend on unavailable production-only code."],
        ["Fonts are missing", "Check font paths, file type, and whether the font file was uploaded."],
        ["Layout looks different", "Confirm the preview file is the latest saved version and all CSS dependencies are present."],
        ["Preview opens the wrong file", "Confirm the selected file path and active workspace before previewing again."],
        ["Protected file will not preview", "Check CavSafe permissions, owner-only access, and whether the file is allowed to be rendered."]
      ]
    ),

    p(`For generated pages, always review the output before publishing. A generated HTML file may have the correct structure but still need human review for copy, spacing, links, alt text, metadata, forms, script behavior, and mobile layout. HTML Viewer gives you a clean place to catch those issues before the file goes public.`),

    p(`For static pages, HTML Viewer is especially useful when reviewing pages such as legal documents, docs pages, landing pages, help pages, status pages, error pages, and marketing sections. These pages often depend on clean structure, stable links, readable text, and careful spacing. The viewer helps you check the result quickly.`),

    p(`When previewing a file from CavCloud, confirm that the file and its assets are stored together in a way the viewer can resolve. If an HTML file references /assets/logo.svg but the asset was uploaded somewhere else, the preview may not match the intended page. Keep related page files organized in the same folder or in a predictable asset structure.`),

    p(`When previewing a file from CavSafe, remember that protected storage may enforce stricter access. A user must have the right permission before the file can be opened or rendered. If the file is sensitive, review whether it should be previewed, shared, published, or moved into ordinary CavCloud storage before exposing it.`),

    note("Safe preview rule", "Use HTML Viewer to inspect the result before publishing. Do not treat a preview as production until the page has also been tested on the real site, with the real route, real assets, and real browser behavior."),

    p(`HTML Viewer should be part of a careful publishing workflow. Preview the file, check the visual result, test links, confirm assets, review mobile behavior, and make sure the page does not expose private content, hidden notes, test keys, internal comments, or unfinished work.`),

    list([
      "Check the page title and visible heading.",
      "Click important links.",
      "Confirm images and icons load.",
      "Review the page on smaller screen widths when possible.",
      "Look for missing CSS, broken layout, or hidden overflow.",
      "Confirm no private notes, test data, or internal comments are exposed.",
      "Verify the final page on the live website after publishing."
    ]),

    p(`If the viewer shows a blank page, start with the source file. Confirm that the HTML file is not empty, that the file type is supported, that the route is opening the correct file, and that any script required to render the page is actually available in the preview environment.`),

    p(`If the viewer shows raw text or broken markup instead of a page, confirm that the file extension and content type are correct. HTML Viewer is meant to render web files as pages, but the file still needs valid HTML structure and a supported loading path.`),

    table(
      ["Before publishing", "Confirm"],
      [
        ["File version", "The preview is showing the latest saved file."],
        ["Asset paths", "CSS, images, fonts, scripts, media, and SVG files resolve correctly."],
        ["Links", "Navigation, buttons, footer links, and page anchors point to the right locations."],
        ["Responsive layout", "The page still works on tablet and mobile widths."],
        ["Private content", "No secrets, internal notes, test credentials, or private files are visible."],
        ["Production route", "The final website route has been tested after publishing."]
      ]
    ),

    p(`HTML Viewer is most valuable when it keeps users from publishing blind. Instead of guessing whether a generated or edited file works, the user can open it, see it, inspect it, and make a cleaner decision before moving forward.`),

    note("Core rule", "Edit in CavCode, organize in CavCloud or CavSafe, preview in HTML Viewer, then verify on the real site before publishing.")
  ]
},

     {
  id: "cav-commands",
  title: "Cav commands",
  summary: "Command dictionary.",
  blocks: [
    p(`Cav is CavBot’s command language for the workspace. It gives users a clear way to ask CavBot to inspect files, open paths, read diagnostics, run tools, check project state, manage code workflows, and review developer output from one command surface.`),

    p(`A Cav command always starts with cav. The word after cav tells CavBot what area you want to work with. For example, cav status checks the current workspace state, cav codebase ls lists files in the codebase area, cav run dev starts a development runtime when that workflow is available, and cav git status checks source-control state.`),

    p(`Cav commands are designed for controlled work inside CavBot. They are not random shell commands and they are not a back door around workspace permissions. They should respect the active project, active site, mounted files, user role, plan access, protected actions, and any safety rules enforced by CavBot.`),

    p(`Use Cav commands when you want a direct, repeatable way to inspect or operate the workspace. They are useful when a button or screen shows the result, but you need to understand the state behind it: which file is open, what path exists, what diagnostics are active, what runtime session is running, what task returned, or what source-control state is present.`),

    table(
      ["Part", "Meaning"],
      [
        ["cav", "The command name. Every Cav command begins with this word."],
        ["Namespace", "The area of CavBot you want to work with, such as codebase, workspace, run, git, debug, task, security, remote, reliability, ui, search, or index."],
        ["Action", "The operation you want to perform, such as list, open, write, status, logs, start, stop, refresh, scan, or export."],
        ["Target", "The file, folder, session, task, route, or setting the command should use."],
        ["Arguments", "Extra values needed by the command, such as a path, task name, session ID, search term, branch name, or line number."]
      ]
    ),

    p(`Most Cav commands follow a simple pattern: cav, then the namespace, then the action, then the target. A file command may need a path. A runtime command may need a session ID. A search command may need a search phrase. A Git command may need a branch, file, or commit message. The command dictionary below shows the supported command shapes.`),

    p(`Some commands only read state. These are the safest commands to run first. Examples include cav status, cav ctx, cav diag, cav codebase ls, cav codebase tree, cav run status, cav task list, cav git status, cav debug status, cav security status, and cav reliability status.`),

    p(`Other commands can change the workspace. These should be used more carefully. Commands that write files, remove files, stage changes, commit work, start or stop processes, restore snapshots, replace text, or change project state should only be used when the target is clear.`),

    list([
      "Use read commands first when you are investigating.",
      "Confirm the active project before running a command.",
      "Confirm the active site when the command depends on a website context.",
      "Confirm the file path before opening, writing, deleting, or replacing anything.",
      "Confirm the session ID before reading logs, stopping a process, or restarting a runtime.",
      "Use write, remove, restore, commit, stop, restart, and replace commands only when you understand the target.",
      "Review the result after a command runs."
    ]),

    p(`Cav commands are especially useful inside CavTools and CavCode. CavTools helps you inspect what happened. CavCode helps you open, edit, save, and review files. The command line connects those surfaces so a user can move quickly without losing the workspace context.`),

    p(`For example, if a file preview looks wrong, you can use Cav commands to inspect the current context, list files in the folder, open the source file, search for a string, check diagnostics, and then return to the viewer after the file is corrected.`),

    p(`For code work, Cav commands can help with file inspection, diagnostics, project services, runtime logs, source control, debugging, indexing, search, templates, and repeatable edit loops. They are meant to support the developer workflow without forcing the user to leave CavBot.`),

    p(`For workspace work, Cav commands can help confirm the current project, active file, active context, mounted workspace state, recent events, and available tools. This makes the workspace easier to inspect when something is unclear.`),

    p(`For security-sensitive work, Cav commands should still respect CavBot’s protections. A command should not be allowed just because a user typed it. Owner-only actions, protected storage, security controls, and restricted workflows should still be governed by account role, workspace policy, CavGuard, CavVerify, and server-side enforcement.`),

    note("Important", "Typing a command should never bypass ownership, roles, protected storage, verification, or workspace safety rules. Cav commands should operate inside the same protection model as the rest of CavBot."),

    p(`Paths matter. When a command asks for a path, use the exact path shown by CavBot. A codebase path, workspace path, CavCloud path, or CavSafe path may refer to different file areas. If the wrong path is used, the command may open the wrong file, fail to find the file, or return a result that does not match what you expected.`),

    table(
      ["Path or target", "How to treat it"],
      [
        ["/codebase", "Use for files in the codebase command area."],
        ["/cavcode", "Use for CavCode project files when the workspace exposes that mount."],
        ["/workspace", "Use for mounted workspace files when available."],
        ["Session ID", "Use only for runtime, task, debug, or process commands that ask for a specific session."],
        ["Task name", "Use only when running a configured workspace task."],
        ["Search text", "Use quotes when the search phrase contains spaces."],
        ["File path with line number", "Use when opening or jumping directly to a file location."]
      ]
    ),

    p(`A good Cav command workflow starts with context. Run cav status or cav ctx first when you are unsure where you are. Then inspect the relevant area with a read command. Only after you understand the state should you run a command that changes files, tasks, runtime sessions, source control, or workspace configuration.`),

    list([
      "Start with cav status or cav ctx.",
      "List the files, tasks, sessions, or events you need to inspect.",
      "Open or read the target before changing it.",
      "Run the smallest command that performs the action you need.",
      "Read the command output carefully.",
      "Verify the result in CavTools, CavCode, HTML Viewer, CavCloud, or the relevant workspace surface."
    ]),

    p(`Command output should be read carefully. A result may tell you that a file was not found, a command is not available, a plan does not allow the action, a session is missing, a path is invalid, a feature is locked, or a protected workflow needs a different route.`),

    p(`Do not treat a failed command as proof that the whole workspace is broken. First check the command spelling, active project, active site, file path, permission level, plan access, and whether the command needs a target argument.`),

    table(
      ["If this happens", "Check this first"],
      [
        ["Command is not recognized", "Check the spelling and confirm the command exists in the dictionary."],
        ["File is not found", "Check the path, folder, mount, and file name capitalization."],
        ["Command returns the wrong context", "Run cav status or cav ctx and confirm the active project and site."],
        ["Runtime logs are missing", "Confirm the session ID and whether the runtime is still active."],
        ["Write command does nothing", "Check permissions, protected storage, file lock state, and whether the command requires a different target."],
        ["Security command is blocked", "Review role, owner access, CavGuard decision, and workspace policy."],
        ["Git command fails", "Check repository state, branch, staged files, and whether Git is available for the mounted workspace."]
      ]
    ),

    p(`Cav commands should be written clearly. Use exact file paths. Use quotes around values with spaces. Do not guess session IDs. Do not run destructive commands against folders or files unless you are certain they are the right target.`),

    p(`The command dictionary below is the source list for the commands currently documented in this section. The rows show the command shape, what it is for, an example command, and what it returns or changes. Leave the command row data unchanged unless the actual command system changes.`),

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

    title: "Security",
    description: "Use CavVerify, CavGuard, CavSafe, audit trails, and risk controls to protect workspace actions and files.",
    sections: [

     {
  id: "caverify",
  title: "CavVerify",
  summary: "CavBot’s own human verification layer for protected platform actions.",
  blocks: [
    p(`CavVerify is CavBot’s built-in human verification system. It is our own verification layer for the platform, designed to protect signups, logins, workspace actions, invites, sensitive changes, and high-trust workflows from bots, abuse, automated scripts, and suspicious activity.`),

    p(`When CavVerify appears, the user is being asked to complete a short verification step before the protected action can continue. The goal is simple: confirm that a real person is present, reduce automated misuse, and keep important CavBot actions protected without sending the user into a confusing or unrelated security flow.`),

    p(`CavVerify works in the same general category as CAPTCHA-style protection, but it is built around CavBot’s own product experience. Instead of using a generic challenge, CavVerify can present a CavBot-branded task such as completing the CavBot wordmark, dragging the correct tile, or using an email code fallback when a visual challenge is not the right path.`),

    p(`The challenge shown to the user is intentionally short. It should not feel like a puzzle wall. It exists to protect the platform at moments where CavBot needs more confidence before allowing the next step. After the challenge is completed, CavBot can issue a temporary verification grant that allows the original action to continue.`),

    p(`CavVerify is not a replacement for account security, workspace roles, passwords, sessions, or permissions. It is a step-up layer. A user still needs the correct account, the correct workspace role, and the correct permission before a protected action should be allowed. CavVerify only helps confirm that the person taking the action is present and has passed the required verification step.`),

    table(
      ["Area", "How CavVerify helps"],
      [
        ["Sign up and log in", "Reduces automated account abuse and protects entry points from repeated bot activity."],
        ["Workspace invites", "Adds a verification checkpoint before sensitive access-related actions."],
        ["Protected actions", "Can be required before actions that affect workspaces, members, files, billing, or security settings."],
        ["High-abuse moments", "Helps slow down scripts, repeated attempts, and suspicious flows."],
        ["Fallback access", "Can offer an email code path when a user cannot complete the visual challenge."]
      ]
    ),

    p(`CavVerify uses a verification session to track the active challenge. When the user starts a protected flow, CavBot can create a challenge session through /api/verify/challenge. After the user completes the challenge, the result is submitted through /api/verify/submit. If the attempt is valid, CavBot can return a short-lived grant for the protected action.`),

    p(`In technical flows, CavVerify may use headers such as x-cavbot-verify-session and x-cavbot-verify-grant. The session identifies the verification attempt. The grant proves that the user completed the challenge recently enough for the original action to continue. These values should be treated as temporary security tokens, not permanent credentials.`),

    p(`A normal CavVerify flow has four parts. First, CavBot decides that a protected action needs verification. Second, CavVerify shows the challenge to the user. Third, the user completes the challenge or chooses an approved fallback such as email code verification. Fourth, CavBot validates the result and allows the original action to continue only if the verification passes.`),

    list([
      "CavBot detects that a protected action needs verification.",
      "CavVerify opens a challenge session.",
      "The user completes the visual challenge or chooses an approved fallback.",
      "The result is submitted to CavBot for validation.",
      "CavBot returns a temporary grant if the attempt passes.",
      "The original protected action retries with the verification grant.",
      "If the grant is missing, expired, or invalid, the action remains blocked."
    ]),

    p(`The visual challenge should be clear and branded. In the current CavVerify experience, the user may be asked to drag the correct tile to complete the CavBot wordmark. This keeps the challenge connected to the CavBot product while still making automated completion harder than a normal button click.`),

    p(`CavVerify also supports a practical fallback path. If a user cannot complete the visual challenge, they can choose the email code option instead. The email code path exists for accessibility, device issues, browser problems, or any situation where the visual challenge is not the best way to verify the user.`),

    note("Accessibility", "CavVerify should never trap a legitimate user. If the visual challenge is difficult to complete, the email code option gives users another approved way to verify themselves."),

    p(`CavVerify may appear during sign up, log in, workspace invitation flows, protected member actions, security-sensitive settings, or other areas where CavBot needs an extra confirmation step. The exact trigger can depend on the action, account state, workspace role, rate of attempts, browser context, platform risk, or product policy.`),

    p(`For users, the correct response is simple: complete the CavVerify challenge before trying the protected action again. If the challenge succeeds, CavBot should continue the original flow. If the challenge fails, expires, or is canceled, the protected action may remain blocked until the user verifies again.`),

    p(`For workspace owners and admins, CavVerify should be understood as a protection layer around sensitive operations. It helps reduce automated abuse, accidental exposure, and unauthorized scripted actions. It does not mean every user is suspicious. It means the action is important enough to require one more check.`),

    p(`For developers, CavVerify should be handled as a server-enforced security step. The frontend can show the challenge and carry the session or grant, but the backend must decide whether the protected action is allowed. A verification result should not be trusted only because the browser says it passed.`),

    list([
      "Do not rely on frontend state alone for verification.",
      "Validate the verification grant on the server before allowing the protected action.",
      "Keep verification grants short-lived.",
      "Bind grants to the intended action where possible.",
      "Do not reuse verification grants across unrelated sensitive actions.",
      "Handle expired, missing, or invalid grants with a clear retry path.",
      "Keep the email code fallback available when the visual challenge cannot be completed."
    ]),

    p(`A failed CavVerify attempt does not always mean the user did something wrong. It can happen if the challenge expired, the browser blocked a required request, the user refreshed the page, the session changed, the network failed, the wrong tile was selected, or the protected action was retried without the required grant.`),

    p(`If CavVerify fails repeatedly, the user should cancel the challenge, refresh the page, try the action again, or use the email code option. If the issue continues, the user should contact support with the page they were on, the action they were trying to complete, their browser, and the approximate time of the issue.`),

    table(
      ["Problem", "What to check"],
      [
        ["Challenge will not open", "Refresh the page and confirm scripts are not blocked by the browser or extension settings."],
        ["Tile drag does not work", "Try again slowly, use a different input device, or select the email code option."],
        ["Verification expires", "Restart the protected action and complete the challenge again."],
        ["Action stays blocked after success", "The grant may not have reached the original request. Retry the action after completing CavVerify."],
        ["Email code does not arrive", "Check spam, confirm the account email, wait briefly, then request a new code if available."]
      ]
    ),

    p(`CavVerify should be used with restraint. If every small action asks for verification, users lose trust in the flow. The best use is for moments that truly need added protection: account entry, abuse-prone actions, role changes, invitations, guarded workspace operations, security settings, and other sensitive platform behavior.`),

    p(`CavVerify should also stay honest. It should not claim to prove more than it actually proves. Passing CavVerify means the user completed the required verification step for that moment. It does not prove identity forever, replace account ownership, replace billing authorization, or override workspace policy.`),

    p(`CavBot may update CavVerify over time as the platform grows. Challenge types, fallback methods, expiration rules, risk triggers, and protected actions may change as CavBot improves account protection and abuse prevention. The purpose should remain the same: protect the platform while keeping the experience understandable for legitimate users.`),

    note("Core rule", "CavVerify confirms presence for protected actions. Permissions still come from the user’s account, role, workspace, plan, and server-side policy.")
  ]
},

     {
  id: "cavguard",
  title: "CavGuard",
  summary: "CavBot’s authorization layer for owner-only actions, protected settings, and restricted platform workflows.",
  blocks: [
    p(`CavGuard is CavBot’s built-in authorization layer. It protects owner-only actions, restricted workspace settings, sensitive platform controls, member management, billing changes, protected files, security settings, and other workflows that should never run just because a button was clicked.`),

    p(`When CavGuard appears, CavBot is telling the user that the requested action is not available under the current account, role, workspace, plan, or policy state. The action may be blocked because the user is not the workspace owner, does not have the required role, is on a limited plan, is working from the wrong workspace, or is attempting a change that requires stronger authorization.`),

    p(`CavGuard is not a visual warning only. It should be understood as a platform decision. The interface can show the message, but the real protection must come from the backend. A protected action should be denied by server-side policy even if someone tries to bypass the button, call the route directly, or manipulate frontend state.`),

    p(`In CavBot, CavGuard is used for software authorization. It decides whether an action is allowed, denied, restricted, or should require another safety step before continuing. It helps keep important workspaces from being changed by the wrong user, the wrong role, the wrong session, or the wrong account state.`),

    p(`CavGuard is especially important because CavBot is not only a dashboard. It includes workspaces, sites, billing, AI tools, files, notes, developer tools, secure storage, team access, verification flows, and platform settings. Some of those actions are harmless. Others can affect access, cost, data, security, or the integrity of a workspace. CavGuard exists to separate those cases clearly.`),

    table(
      ["Area", "How CavGuard protects it"],
      [
        ["Owner-only settings", "Blocks settings changes when the current user is not the workspace owner."],
        ["Team access", "Protects invites, role changes, removals, and membership controls from unauthorized users."],
        ["Billing and plans", "Restricts subscription, plan, payment, and cancellation actions to authorized users."],
        ["Workspace controls", "Prevents unsafe changes to projects, sites, primary site selection, and workspace configuration."],
        ["Security settings", "Protects guardrails, verification settings, protected actions, and sensitive platform rules."],
        ["Files and storage", "Can restrict protected CavCloud, CavSafe, sharing, deletion, restore, and publication workflows."],
        ["AI and command actions", "Can prevent restricted AI, coding, command, or automation workflows from running without permission."]
      ]
    ),

    p(`A CavGuard decision should be direct and understandable. If a user cannot change settings because they are a Member, the message should say that. If the action is owner-only, the message should say that. If a plan does not include the feature, the message should point to plan access. A user should not have to guess why the platform stopped them.`),

    p(`The current CavGuard modal shows this kind of decision clearly. For example, when a Member tries to open an owner-only setting, CavGuard can show “Settings restricted,” explain that the action is available to the workspace owner only, show the current role, and tell the user to ask the owner to apply changes.`),

    note("Core idea", "CavGuard does not exist to punish users. It exists to protect the workspace by making sure only the right account, with the right role, under the right policy, can perform sensitive actions."),

    p(`CavGuard works best when every protected action has a clear rule. The rule should define who can perform the action, what role is required, whether the plan allows it, whether the workspace state allows it, whether verification is needed, and what message should appear if the action is blocked.`),

    list([
      "Check the signed-in user.",
      "Check the active workspace.",
      "Check the user’s role inside that workspace.",
      "Check whether the action is owner-only, admin-only, member-safe, or public.",
      "Check whether the current plan allows the feature.",
      "Check whether workspace policy or guardrails allow the action.",
      "Check whether CavVerify is required before continuing.",
      "Deny the action if the required authorization is missing.",
      "Show a clear reason instead of a vague error."
    ]),

    p(`CavGuard and CavVerify work together, but they are not the same thing. CavVerify confirms that a real person completed a verification step. CavGuard decides whether that person is allowed to perform the action. Passing CavVerify should not override CavGuard. A Member who passes CavVerify is still a Member. They should not gain owner permissions just because they completed a challenge.`),

    table(
      ["Layer", "Purpose"],
      [
        ["CavVerify", "Confirms presence through a human verification step before a protected flow continues."],
        ["CavGuard", "Decides whether the account, role, plan, workspace, and policy allow the action."],
        ["Workspace roles", "Define what the user is allowed to manage inside a project or workspace."],
        ["Plan limits", "Define which features, storage levels, site limits, seats, and advanced modules are available."],
        ["Server policy", "Makes the final decision and prevents bypassing protected actions from the browser."]
      ]
    ),

    p(`For users, a CavGuard block means the action cannot continue from the current account state. The user should read the message, confirm they are in the correct workspace, confirm they are using the correct account, and ask the workspace owner or an authorized admin to make the change when required.`),

    p(`For workspace owners, CavGuard is a protection layer around the business. It helps prevent teammates from changing billing, deleting important resources, modifying security settings, inviting the wrong people, moving protected files, or running actions that should require ownership authority.`),

    p(`For admins, CavGuard creates a clean boundary. Admins may be able to manage operational work, but some decisions should remain with the owner. This keeps authority clear, especially around billing, security, ownership, destructive changes, and sensitive workspace configuration.`),

    p(`For members, CavGuard explains why an action is unavailable without making the experience feel broken. A restricted action is not the same as a broken page. It means the platform recognized the request and intentionally blocked it under the current permissions.`),

    p(`For developers, CavGuard should be implemented as a real authorization system. The button, modal, and page state are only the visible layer. Every sensitive API route should still check the current user, membership, role, workspace, project, plan, and action policy before completing the request.`),

    list([
      "Do not rely on hidden buttons as security.",
      "Do not rely on disabled inputs as security.",
      "Do not trust frontend role state without server validation.",
      "Do not allow direct API calls to bypass CavGuard.",
      "Do not let CavVerify grants replace role checks.",
      "Do not let a plan label in the browser decide entitlement by itself.",
      "Do not perform destructive actions without checking ownership or policy on the server."
    ]),

    p(`CavGuard should be used for actions that can change the workspace, affect access, affect billing, expose protected data, change security posture, delete or publish content, run high-impact tools, or alter how CavBot behaves for a project.`),

    table(
      ["Action type", "Recommended CavGuard behavior"],
      [
        ["Viewing ordinary dashboard data", "Usually allowed for workspace members unless the workspace policy says otherwise."],
        ["Changing workspace settings", "Require owner or authorized admin depending on the setting."],
        ["Changing billing", "Require owner or billing-authorized account."],
        ["Inviting or removing members", "Require owner or authorized admin, with stricter rules for owner changes."],
        ["Changing roles", "Require owner-level approval for sensitive role changes."],
        ["Deleting sites or files", "Require strict role checks and possibly additional confirmation."],
        ["Opening protected storage", "Require the right role, plan, and storage permission."],
        ["Running restricted tools", "Require plan access, workspace permission, and action-level policy."]
      ]
    ),

    p(`A good CavGuard message should explain the decision in plain language. It should name the restricted action, state why it is restricted, show the current role or reason when helpful, and tell the user what to do next. The message should never feel like a generic failure.`),

    list([
      "Name the action that was blocked.",
      "Explain the required role or condition.",
      "Show the current role when useful.",
      "Tell the user who can perform the action.",
      "Avoid technical error language unless the user needs it.",
      "Give a safe next step, such as asking the owner to apply changes.",
      "Keep the message short enough to read, but specific enough to trust."
    ]),

    p(`CavGuard can also help protect plan-governed features. If a user tries to access a feature that belongs to Premium or Premium+, CavGuard can prevent the action and explain that the current plan does not include it. This keeps the product honest and prevents hidden feature failures.`),

    p(`CavGuard should also protect destructive workflows. Deleting a site, removing a teammate, revoking a key, deleting a protected file, changing a security rule, or modifying billing should require more than a casual click. CavGuard gives CavBot a place to slow the action down and require the correct authority.`),

    p(`When CavGuard blocks an action, it does not always mean there is a security incident. It can mean the user is in the wrong workspace, using a teammate account, working under a Member role, missing plan access, trying to change an owner-only setting, or attempting an action that CavBot has intentionally reserved for a higher-trust role.`),

    p(`If a user believes CavGuard blocked them incorrectly, they should first confirm the active account, active workspace, active project, and current role. If those are correct, they should ask the workspace owner to review access. If the issue continues, they should contact support with the page, blocked action, workspace, role, and approximate time.`),

    table(
      ["CavGuard message", "What it usually means"],
      [
        ["Settings restricted", "The current role cannot change this setting."],
        ["Owner only", "Only the workspace owner can perform this action."],
        ["Plan required", "The current subscription does not include this feature."],
        ["Access denied", "The account does not have permission for the requested resource."],
        ["Verification required", "The action may need CavVerify before CavGuard allows it to continue."],
        ["Workspace mismatch", "The action may belong to a different project, site, or workspace context."]
      ]
    ),

    p(`CavGuard should be strict where the action matters and quiet where it does not. If every small click opens a restriction modal, the product becomes frustrating. The best CavGuard experience protects serious actions while keeping normal browsing, reading, reviewing, and low-risk work smooth.`),

    p(`The strongest CavGuard implementation is consistent across the entire platform. A user should not be blocked in one place and allowed to perform the same restricted action somewhere else. The same rule should apply from the page, the modal, the API route, the command surface, the assistant action, and any future automation layer.`),

    p(`CavGuard should also leave an audit trail where the action is sensitive. If someone tries to change a protected setting, remove a member, access protected storage, run a restricted command, or trigger a high-trust workflow, CavBot should be able to record enough context for owners and operators to understand what happened.`),

    list([
      "Protected action requested.",
      "User account and workspace role.",
      "Workspace or project involved.",
      "Reason the action was allowed or blocked.",
      "Whether CavVerify was required or completed.",
      "Timestamp and route or surface where the action happened.",
      "Result shown to the user."
    ]),

    p(`CavGuard is part of CavBot’s trust system. It helps the platform stay safe as more features become connected: AI, code, files, sites, billing, teams, reports, storage, and workspace automation. The more powerful CavBot becomes, the more important it is that sensitive actions are governed clearly.`),

    p(`CavBot may expand CavGuard over time. Future versions may include stronger owner policies, workspace-defined approval rules, more detailed role permissions, deeper audit records, plan-aware enforcement, action approvals, and tighter integration with CavVerify and CavSafe.`),

    note("Core rule", "CavGuard decides authorization. CavVerify can confirm presence, but CavGuard decides whether the action is allowed.")
  ]
},

     {
  id: "cavsafe",
  title: "CavSafe",
  summary: "Protected owner-only storage for sensitive workspace files, secured records, snapshots, and audit-ready file activity.",
  blocks: [
    p(`CavSafe is CavBot’s protected storage area for files that need stronger control than ordinary CavCloud storage. It is built for sensitive workspace material: private business records, protected documents, important assets, security-related files, legal or compliance material, high-value project files, and anything that should not sit in normal team storage without tighter review.`),

    p(`CavCloud is for everyday workspace files. CavSafe is for protected files. That difference matters. A normal design file, exported image, public document, or ordinary project asset belongs in CavCloud. A file that should only be handled by the owner, reviewed carefully, protected from casual sharing, or kept with stronger records belongs in CavSafe.`),

    p(`CavSafe is not included on the Free plan. Free users can use normal CavCloud storage, but protected CavSafe storage starts with paid plans. This keeps secured storage reserved for workspaces that need stronger controls around ownership, access, file history, and protected operations.`),

    table(
      ["Plan", "CavSafe access"],
      [
        ["Free", "No CavSafe access. Use CavCloud for ordinary workspace files."],
        ["Premium", "Owner-only CavSafe access with 10 GB of secured storage."],
        ["Premium+", "Owner-only CavSafe access with 50 GB of secured storage, integrity lock, audit log, time locks, snapshots, and CavSafe analytics."]
      ]
    ),

    p(`On Premium, CavSafe gives the workspace owner a protected storage area with 10 GB of secured storage. This is the right tier for a founder, solo builder, or small team that needs a private place for sensitive files without exposing those files to ordinary workspace access.`),

    p(`On Premium+, CavSafe becomes a deeper protected storage system. Premium+ includes 50 GB of secured storage and adds stronger controls such as integrity lock, audit log, time locks, snapshots, and CavSafe analytics. This is the right tier when the workspace needs more serious file protection, file history, owner oversight, and clearer records around protected activity.`),

    note("Free plan", "Free users do not receive CavSafe access. CavSafe begins on Premium because protected storage requires stronger account, owner, and workspace controls."),

    p(`CavSafe access is owner-only by default. That means protected files should be controlled by the workspace owner, not casually available to every member. The goal is to keep sensitive material separated from normal collaboration while still keeping it inside the CavBot workspace where it can be organized and reviewed.`),

    p(`Owner-only access is important because protected files can carry more risk than ordinary files. A billing document, private contract, security note, sensitive export, protected asset, or internal record should not be handled the same way as a normal image or public project file. CavSafe gives the owner a clear place to keep those files under tighter control.`),

    table(
      ["Feature", "What it means"],
      [
        ["Owner-only access", "Protected files are controlled by the workspace owner instead of being open to ordinary workspace members."],
        ["10 GB secured storage", "Premium workspaces receive 10 GB of CavSafe storage for protected files."],
        ["50 GB secured storage", "Premium+ workspaces receive 50 GB of CavSafe storage for larger protected file needs."],
        ["Integrity lock", "Helps protect important files from being changed without stronger control or review."],
        ["Audit log", "Records important CavSafe activity so the owner can review what happened."],
        ["Time locks", "Allows protected files or actions to be held behind a time-based restriction where supported."],
        ["Snapshots", "Keeps protected file states available for review or recovery where supported."],
        ["CavSafe analytics", "Gives the owner visibility into protected storage usage and activity."]
      ]
    ),

    p(`Use CavSafe when the file needs a stronger boundary. If the file would create a problem if the wrong teammate opened it, shared it, changed it, deleted it, or published it, that file belongs in CavSafe instead of normal CavCloud storage.`),

    list([
      "Use CavSafe for private business records.",
      "Use CavSafe for protected legal or policy documents.",
      "Use CavSafe for security notes or sensitive operational files.",
      "Use CavSafe for high-value brand, product, or company assets.",
      "Use CavSafe for files that should remain under owner control.",
      "Use CavSafe when audit history matters.",
      "Use CavSafe when accidental sharing would create risk."
    ]),

    p(`Do not use CavSafe for every file. Protected storage should stay focused. If every ordinary asset is moved into CavSafe, the workspace becomes harder to use and the protected area loses its purpose. CavSafe should be reserved for files that truly need stronger handling.`),

    list([
      "Keep ordinary images, exports, and drafts in CavCloud.",
      "Keep public documents in CavCloud unless they need owner protection.",
      "Keep everyday collaboration files in CavCloud.",
      "Move a file to CavSafe only when the file needs stronger access control, review, history, or protection."
    ]),

    p(`CavSafe can support folders, protected file organization, gallery views, tree views, private sharing controls, movement between CavCloud and CavSafe, snapshots, time locks, integrity checks, audit records, and owner visibility where the active plan allows those features.`),

    p(`Moving a file into CavSafe should be treated as a deliberate action. The owner should know why the file is protected, what it contains, whether it should remain private, and whether it needs future review. CavSafe is not just another folder. It is the protected area of the workspace.`),

    p(`Moving a file out of CavSafe should also be deliberate. If a protected file is moved back into CavCloud, it may become part of normal workspace storage again depending on the workspace’s sharing and access rules. Before moving a file out, confirm that it no longer needs owner-only protection.`),

    table(
      ["File type", "Recommended location"],
      [
        ["Public brand asset", "CavCloud, unless it is unreleased or sensitive."],
        ["Normal project image", "CavCloud."],
        ["Draft document for team collaboration", "CavCloud."],
        ["Private business record", "CavSafe."],
        ["Security or access note", "CavSafe."],
        ["Sensitive legal or policy file", "CavSafe."],
        ["High-value internal asset", "CavSafe."],
        ["File that needs audit history", "CavSafe, especially on Premium+."]
      ]
    ),

    p(`Integrity lock is for files that should not be casually changed. When a protected file matters, the owner may need confidence that the file was not silently modified or replaced without notice. Integrity lock helps create a stronger boundary around important files.`),

    p(`The audit log gives owners a way to review important CavSafe activity. If a protected file is uploaded, moved, opened, changed, shared, restored, locked, unlocked, or deleted where logging is supported, the audit log can help explain what happened and when.`),

    p(`Time locks are for protected files or actions that should not be immediately changed or released. A time lock can help slow down sensitive operations and reduce accidental or rushed changes. This is useful when a file should remain protected until a certain point or when a sensitive action should not happen instantly.`),

    p(`Snapshots help preserve protected file states. If a file changes, a snapshot can help the owner understand or recover a prior version where supported. This is especially useful for important documents, secured assets, and files that may need review after edits.`),

    p(`CavSafe analytics gives the owner visibility into secured storage. This can include protected storage usage, secured file activity, owner-level review signals, and other CavSafe activity where the plan supports it. The goal is to help the owner understand how the protected storage area is being used.`),

    p(`CavSafe works best with CavGuard. CavGuard should decide who can open, move, delete, share, lock, unlock, or manage protected files. A user should not be able to access CavSafe simply because they found a route or clicked a hidden button. Protected file actions should be authorized by role, plan, workspace policy, and server-side checks.`),

    p(`CavSafe can also work with CavVerify when an action needs an extra confirmation step. CavGuard decides whether the user is allowed. CavVerify can confirm that a real person completed a verification step before the action continues. Passing CavVerify should not override CavSafe permissions.`),

    table(
      ["Protection layer", "Role in CavSafe"],
      [
        ["CavSafe", "Stores protected files under stronger owner-controlled handling."],
        ["CavGuard", "Decides whether the user is allowed to perform the protected file action."],
        ["CavVerify", "Can add a human verification step before a sensitive CavSafe action continues."],
        ["Audit log", "Records important protected storage activity for review."],
        ["Snapshots", "Help preserve protected file states for recovery or review."]
      ]
    ),

    p(`For users, CavSafe should feel clear. If a file is protected, the interface should make that obvious. If access is blocked, the message should explain why. If the owner must take action, the user should know that the owner controls the protected storage area.`),

    p(`For workspace owners, CavSafe is a control point. It gives the owner a place to keep protected material separate from everyday workspace files. Owners should review what belongs in CavSafe, remove files that no longer need protection, and avoid letting secured storage become cluttered.`),

    p(`For teams, CavSafe creates a cleaner division between normal collaboration and sensitive material. A team can still use CavCloud for everyday work while the owner keeps important records, secured assets, and protected files in CavSafe.`),

    p(`For developers, CavSafe should be treated as a protected file system. Do not rely on frontend visibility alone. Every sensitive file action should be checked by the backend before it completes. If a user does not have access, the request should fail even if the user tries to call the file endpoint directly.`),

    list([
      "Check the signed-in user before allowing CavSafe access.",
      "Check that the active plan includes CavSafe.",
      "Check that the user is the workspace owner or has the required protected access.",
      "Check the workspace and project scope.",
      "Check the exact file or folder being requested.",
      "Block direct API access when authorization is missing.",
      "Record important protected file actions where audit logging is supported.",
      "Use clear messages when access is denied."
    ]),

    p(`A denied CavSafe request does not always mean something is broken. It may mean the user is on the Free plan, the workspace does not include CavSafe, the user is not the owner, the file is protected, the action requires a higher plan, or the workspace policy does not allow the requested operation.`),

    table(
      ["Message or state", "What it usually means"],
      [
        ["No CavSafe access", "The current plan does not include CavSafe."],
        ["Owner-only storage", "The protected file area is controlled by the workspace owner."],
        ["Upgrade required", "The requested CavSafe feature belongs to a higher plan."],
        ["Action restricted", "The user does not have permission to perform that protected file action."],
        ["File locked", "The file may be protected by integrity lock, time lock, or another secured state."],
        ["Audit available", "The action may be recorded for owner review."]
      ]
    ),

    p(`If a legitimate user cannot access a CavSafe file, they should first confirm the active account, workspace, plan, and role. If the user is not the owner, they should ask the owner to review the file or perform the action. If the owner still cannot access CavSafe, they should contact support with the workspace, file name, action attempted, browser, and approximate time.`),

    p(`CavSafe should remain honest in the product. It should not promise that files are impossible to lose, impossible to compromise, or permanently immune from all risk. It is a stronger protected storage area with owner-only access, plan-based limits, secured workflows, and review features. It reduces risk, but it does not replace responsible account security, careful sharing, strong passwords, or good workspace management.`),

    p(`As CavBot grows, CavSafe can become the trusted storage layer for more serious workspace operations. The purpose should remain simple: keep protected files separate, owner-controlled, reviewable, and handled with more care than ordinary workspace files.`),

    note("Core rule", "Use CavCloud for everyday files. Use CavSafe for protected files that need owner control, stronger review, and a clearer record of activity.")
  ]
},

     {
  id: "audit-trail",
  title: "Audit trail",
  summary: "Review important workspace, storage, security, and owner-level actions recorded by CavBot.",
  blocks: [
    p(`Audit trail is CavBot’s record of important actions across a workspace. It helps owners and teams understand what happened, who performed the action, what was affected, when it happened, and whether the action succeeded, failed, or was blocked.`),

    p(`A workspace can change quickly. Members may be invited, roles may be adjusted, files may be moved, secured storage may be opened, settings may be changed, and protected actions may be attempted. The audit trail gives those moments a written record so the team does not have to rely on memory, screenshots, or guesswork.`),

    p(`Use audit trail when you need a clear history of sensitive or important activity. It is especially useful when reviewing access changes, billing-related actions, workspace settings, CavCloud activity, CavSafe file events, protected actions, time locks, integrity updates, and security-related decisions made by CavBot.`),

    table(
      ["Area", "What the audit trail helps review"],
      [
        ["Account actions", "Important changes connected to account access, profile state, sessions, or administrative activity."],
        ["Workspace actions", "Changes involving projects, sites, members, roles, invites, settings, and workspace ownership."],
        ["CavCloud activity", "File uploads, movement, publishing, collaboration changes, and other important storage actions."],
        ["CavSafe activity", "Protected file access attempts, secured file movement, time locks, snapshots, integrity updates, and owner-only file actions."],
        ["Security actions", "CavGuard decisions, CavVerify-related steps, restricted actions, blocked requests, and sensitive command activity."],
        ["Plan or access changes", "Plan-related access changes, feature restrictions, seat limits, and actions that affect what the workspace can use."]
      ]
    ),

    p(`A good audit entry should answer five simple questions: who acted, what they did, what they acted on, when it happened, and what the result was. If those details are clear, the team can review the event without needing to reconstruct the entire situation from scattered clues.`),

    list([
      "Who performed the action.",
      "What action was attempted or completed.",
      "What account, workspace, file, site, member, setting, or feature was affected.",
      "When the action happened.",
      "Whether the action succeeded, failed, was blocked, or required review.",
      "Any useful context around the action, such as plan, role, workspace, or protected file state."
    ]),

    p(`Audit trail is not only for incidents. It is also useful for ordinary review. A founder can check who changed a setting. An owner can see when a protected file was moved. A team can confirm whether a member invite was sent. A support review can check whether a user was blocked by role, plan, or security rules.`),

    p(`The audit trail is most valuable when something feels unclear. If a file is missing, a member cannot access a workspace, a protected action was blocked, a setting changed, a secured file was opened, or a plan feature appears restricted, the audit trail should be one of the first places to check.`),

    note("Core purpose", "Audit trail exists to make important actions reviewable. It does not replace permissions, security checks, or owner approval. It gives the workspace a clear record of what happened."),

    p(`Audit records should be treated as a serious part of the workspace. They help protect trust between owners, admins, members, and the platform. When an action affects access, files, protected storage, billing, security, or workspace control, CavBot should preserve enough detail for the owner to understand the event later.`),

    table(
      ["Question", "Where audit trail helps"],
      [
        ["Who changed this?", "Check the actor tied to the recorded event."],
        ["What changed?", "Review the action name and affected target."],
        ["When did it happen?", "Check the timestamp on the audit entry."],
        ["Did it succeed?", "Review the result or status of the action."],
        ["Was it blocked?", "Look for CavGuard, permission, plan, role, or verification-related records."],
        ["Was a protected file involved?", "Check CavSafe-related entries such as access attempts, moves, locks, snapshots, or integrity updates."]
      ]
    ),

    p(`For workspace owners, audit trail provides oversight. It gives the owner a way to review important changes without needing to watch every screen in real time. If the workspace grows, this record becomes even more important because more people and more tools can affect the project.`),

    p(`For admins, audit trail helps explain what changed during setup, support, or operations. If a user asks why access changed or why a feature is blocked, the audit trail can show the action history instead of forcing the admin to guess.`),

    p(`For members, audit trail creates accountability around shared work. Members may not control sensitive settings, but their important workspace actions can still be part of the record when those actions affect files, collaboration, storage, or project state.`),

    p(`For protected storage, the audit trail is especially important. CavSafe files may contain sensitive business, legal, security, or high-value project material. Actions around those files should be more visible to the owner than ordinary file activity.`),

    list([
      "Review audit trail after changing workspace roles.",
      "Review audit trail after inviting or removing members.",
      "Review audit trail after moving files into or out of CavSafe.",
      "Review audit trail after using time locks, snapshots, or integrity lock.",
      "Review audit trail after a protected action is blocked.",
      "Review audit trail when a user reports missing access.",
      "Review audit trail when a file, setting, or workspace state does not look right."
    ]),

    p(`An audit entry should not be treated as blame by default. Many records simply show normal work: a user uploaded a file, an owner changed a setting, an admin invited a teammate, or CavGuard blocked an action because the user did not have the right role. The record helps the team understand the event clearly.`),

    p(`A blocked action can be just as important as a completed action. If CavGuard blocks a request, the audit trail can help show that the platform protected the workspace. The user may have been in the wrong account, missing owner access, using the wrong plan, trying to open a protected file, or attempting an action that required approval.`),

    p(`Audit trail also helps with support. If a user contacts support about access, files, billing, workspace behavior, or protected actions, the audit record can help narrow the issue. A clean record makes support faster because it shows what happened before the user reached out.`),

    table(
      ["Event type", "Why it matters"],
      [
        ["Member invited", "Shows when access was offered and who initiated it."],
        ["Role changed", "Shows who adjusted a user’s level of control."],
        ["Site added or removed", "Shows changes to the websites connected to the workspace."],
        ["File published", "Shows when a file or artifact became available outside normal private storage."],
        ["CavSafe access attempted", "Shows review activity around protected files."],
        ["File moved into CavSafe", "Shows when a file became protected."],
        ["File moved out of CavSafe", "Shows when a protected file returned to ordinary storage."],
        ["Time lock changed", "Shows protected timing rules around a file or action."],
        ["Integrity update", "Shows changes tied to protected file trust or file state."],
        ["Security action blocked", "Shows when CavBot stopped a request before it could continue."]
      ]
    ),

    p(`Audit trail should be read carefully. One entry rarely tells the whole story. A full review may require looking at several entries around the same time, checking the active workspace, confirming the user role, reviewing the affected file or site, and understanding what action the user was trying to complete.`),

    p(`When reviewing an issue, start with the time of the problem. Then look for entries before and after that moment. This can reveal whether the issue came from a role change, a plan limit, a file move, a blocked action, a settings update, a removed site, or another workspace event.`),

    list([
      "Start with the approximate time of the issue.",
      "Check the actor connected to the entry.",
      "Check the target that was affected.",
      "Read the result of the action.",
      "Look for nearby entries before and after the event.",
      "Confirm the active workspace and site.",
      "Check whether the action involved CavGuard, CavVerify, CavCloud, CavSafe, billing, members, or settings."
    ]),

    p(`Audit trail should not expose more information than needed. The record should be useful, but it should not become a place where private file contents, passwords, full secrets, payment details, or sensitive personal data are displayed unnecessarily. The goal is to record the action, not to leak the material involved in the action.`),

    p(`For developers, audit trail should be enforced from the server side. A sensitive action should not depend only on what the browser shows. If a workspace action changes access, files, protected storage, billing, settings, security, or ownership, the backend should decide whether it is allowed and write the audit record after the decision is made.`),

    list([
      "Record important owner, admin, and workspace actions.",
      "Record protected file activity where CavSafe is involved.",
      "Record blocked sensitive actions when the block matters for review.",
      "Do not record passwords, full secrets, or unnecessary private content.",
      "Include enough context for the owner to understand what happened.",
      "Keep audit records consistent so they are easy to read later.",
      "Make failed and blocked actions clear, not silent."
    ]),

    p(`A strong audit record should be plain. It should not hide behind unclear labels. If a member was removed, say that. If a protected file was moved, say that. If an action was blocked because the user was not the owner, say that. The owner should be able to understand the record without needing engineering help.`),

    table(
      ["Audit field", "Plain meaning"],
      [
        ["Actor", "The user or system that performed the action."],
        ["Action", "What was attempted or completed."],
        ["Target", "The account, file, site, member, setting, or workspace item affected."],
        ["Result", "Whether the action succeeded, failed, was denied, or needs review."],
        ["Time", "When the action happened."],
        ["Context", "Useful surrounding details such as role, plan, workspace, site, or protected file state."]
      ]
    ),

    p(`Audit trail should be kept separate from ordinary notifications. A notification tells the user something happened. An audit entry preserves a record for later review. Both can be useful, but they serve different purposes. Notifications are for attention. Audit trail is for accountability and history.`),

    p(`CavBot may continue expanding the audit trail as the platform grows. New product surfaces, protected actions, CavSafe features, CavCode actions, billing controls, collaboration tools, and owner settings may add new audit records over time. The goal should remain the same: important actions should be clear, reviewable, and tied to the right workspace context.`),

    note("Best practice", "When something important changes, check the audit trail before guessing. The record should show who acted, what changed, what was affected, when it happened, and what CavBot did with the request.")
  ]
},

      {
  id: "risk-controls",
  title: "Risk Controls",
  summary: "Configure workspace guardrails for origins, alerts, deletion, access, and protected actions.",
  blocks: [
    p(`Risk Controls are CavBot’s workspace guardrails. They help owners and admins reduce unsafe behavior before it becomes a bigger problem. These controls protect how websites connect to CavBot, how unknown origins are handled, how error spikes are surfaced, how deletions are confirmed, and how sensitive workspace actions are reviewed.`),

    p(`A workspace is not only a dashboard. It contains sites, project keys, members, files, secured storage, AI workflows, reports, routes, analytics signals, and settings that can affect the way a business operates. Risk Controls give the workspace a safer operating posture by making important boundaries explicit.`),

    p(`Use Risk Controls when a workspace has real production websites, customer-facing routes, team members, protected files, billing access, or any environment where accidental changes could create confusion, data noise, access problems, or loss of trust.`),

    p(`The main Risk Controls in CavBot include blockUnknownOrigins, enforceAllowlist, alertOn404Spike, alertOnJsSpike, and strictDeletion. Each control has a different purpose, but together they help keep the workspace clean, predictable, and safer to operate.`),

    table(
      ["Control", "What it protects"],
      [
        ["blockUnknownOrigins", "Prevents unexpected website origins from sending signals into the workspace."],
        ["enforceAllowlist", "Limits activity to approved origins connected to the workspace or API key."],
        ["alertOn404Spike", "Warns the team when broken-route activity increases beyond normal behavior."],
        ["alertOnJsSpike", "Warns the team when JavaScript error activity increases and may affect real users."],
        ["strictDeletion", "Makes destructive actions more deliberate before sites, files, or important workspace data are removed."]
      ]
    ),

    p(`Unknown origins are one of the first risks a workspace should control. A production workspace should know which websites are allowed to send signals. If an unrelated domain, test page, copied snippet, or unauthorized environment starts sending data, it can pollute reports and make the workspace harder to trust.`),

    p(`blockUnknownOrigins helps prevent that problem. When this control is active, CavBot can reject or restrict signals from origins that are not recognized by the workspace. This keeps dashboards, route data, error views, SEO snapshots, and reports tied to the sites the owner actually approved.`),

    p(`enforceAllowlist goes a step further. It makes the allowed-origin list part of the operating rules for the workspace. If a site is not on the list, it should not be treated as a valid source for production signals. This is especially important for teams that use staging domains, preview links, local builds, client demos, and separate app subdomains.`),

    table(
      ["Origin situation", "Recommended action"],
      [
        ["Production website", "Add it as an approved site and keep it allowlisted."],
        ["App subdomain", "Add it as a separate approved origin if it should be monitored separately."],
        ["Staging or preview domain", "Allow it only when the team intentionally wants staging data."],
        ["Localhost", "Use only for testing. Do not mix it with production reporting unless clearly separated."],
        ["Unknown domain", "Block or review before allowing signals into the workspace."],
        ["Copied snippet on the wrong site", "Remove the snippet or reject the origin before it affects reporting."]
      ]
    ),

    p(`404 spike alerts protect the visitor experience. A sudden increase in broken routes can mean a campaign link is wrong, a page was deleted, a migration missed redirects, a navigation item is broken, or an external link is still sending users to an old path.`),

    p(`alertOn404Spike helps CavBot bring that pattern forward. A single missing page may not require immediate action. A spike in broken pages can affect trust, search performance, support, and conversion. When the alert is active, the team has a better chance of catching the issue before it becomes a quiet loss.`),

    p(`JavaScript error spike alerts protect live product behavior. A sudden increase in browser errors can mean a deploy introduced a bug, a script failed, a third-party dependency changed, a form broke, a checkout step stopped working, or a logged-in surface is no longer stable.`),

    p(`alertOnJsSpike helps the team review those changes quickly. The purpose is not to create noise. The purpose is to make sure the team sees unusual error activity while it is still fresh enough to investigate.`),

    note("Signal quality", "A spike alert is not the final diagnosis. It is a reason to open the affected module, review the route, check the timestamp, and confirm whether real users are affected."),

    p(`strictDeletion makes removal actions more deliberate. Deleting a site, file, secured file, workspace item, or important record should not feel like clicking an ordinary button. Deletion can affect reports, history, storage, protected files, and team access. Strict deletion helps slow the action down before something important is removed.`),

    p(`When strictDeletion is enabled, CavBot should require clearer confirmation before destructive actions. This can include confirmation text, owner-only access, CavGuard review, CavVerify confirmation, or another protected path depending on the action.`),

    list([
      "Use strict deletion before removing production sites.",
      "Use strict deletion before deleting workspace files that may still matter.",
      "Use strict deletion around CavSafe-protected material.",
      "Use strict deletion before removing members, keys, or important workspace settings.",
      "Use strict deletion when a workspace has more than one teammate.",
      "Use strict deletion when the workspace contains client, business, legal, or launch-critical material."
    ]),

    p(`Risk Controls should be reviewed before inviting new members. A new member can change how the workspace operates, especially if they receive admin access. Before adding people, confirm which sites are approved, which origins can send data, which storage areas are protected, which API keys are active, and which actions require owner approval.`),

    p(`Risk Controls also work with CavGuard. CavGuard decides whether a protected action should continue, be blocked, or require a safer path. Risk Controls define some of the workspace rules that CavGuard can enforce. Together, they help prevent owner-only actions, restricted settings, and sensitive changes from being treated like ordinary clicks.`),

    p(`CavVerify can also support Risk Controls when a sensitive action needs an extra confirmation step. For example, a workspace may require verification before an invite, a settings change, a deletion, or another protected action can continue. CavVerify confirms user presence, while CavGuard and Risk Controls decide whether the action is allowed.`),

    table(
      ["Layer", "Role in protection"],
      [
        ["Risk Controls", "Define the workspace guardrails and safety preferences."],
        ["CavGuard", "Enforces protected-action decisions based on role, plan, policy, and workspace state."],
        ["CavVerify", "Confirms user presence before a protected action continues."],
        ["Audit trail", "Records important actions so the owner can review what happened later."],
        ["CavSafe", "Protects sensitive files with owner-only access and stronger controls."]
      ]
    ),

    p(`API keys should be reviewed as part of Risk Controls. A key should be connected to the right project, the right site, and the right allowed origins. If a key is copied into the wrong website or used in an unapproved environment, CavBot may receive signals that do not belong in the workspace.`),

    list([
      "Confirm each API key belongs to the correct project.",
      "Confirm each key is used only on approved sites.",
      "Review origin allowlists after adding a new domain or subdomain.",
      "Rotate a key if it was exposed, copied to the wrong place, or used outside its intended scope.",
      "Remove old keys that are no longer used.",
      "Do not reuse the same key across unrelated websites unless that is intentional and documented."
    ]),

    p(`Risk Controls should be especially strict for production workspaces. A production workspace should not accept random origins, silent script copies, unclear member access, casual deletion, or unknown protected-file movement. The more important the website, the cleaner these controls should be.`),

    p(`For early testing, a workspace may be more flexible. A builder may temporarily allow a staging origin, test a preview domain, or keep deletion easier while the project is still being shaped. Once the site becomes public or customer-facing, Risk Controls should be tightened.`),

    table(
      ["Workspace stage", "Recommended posture"],
      [
        ["Early testing", "Allow controlled experimentation, but keep test origins clearly labeled."],
        ["Pre-launch", "Review allowed origins, keys, members, deletion rules, and protected storage before launch."],
        ["Production", "Block unknown origins, enforce allowlists, keep spike alerts on, and use strict deletion."],
        ["Team workspace", "Review roles, invites, audit trail, API keys, and protected actions regularly."],
        ["Client or business-critical workspace", "Use the strictest safe posture and document major access or deletion changes."]
      ]
    ),

    p(`Risk Controls help prevent messy data. If the wrong origin sends signals, dashboards may show routes that do not belong to the site. If staging data mixes with production data, reports may become harder to trust. If old keys stay active, retired environments may continue sending noise. Clean controls keep CavBot’s view of the site more reliable.`),

    p(`Risk Controls also help prevent operational mistakes. A teammate may not realize they are removing a production site, deleting a protected file, changing access, or using the wrong environment. Guardrails do not replace judgment, but they make the safest path easier to follow.`),

    note("Production rule", "For production websites, keep unknown origins blocked, allowlists enforced, 404 spike alerts enabled, JavaScript spike alerts enabled, and strict deletion turned on."),

    p(`A blocked action should be treated as useful information. If CavBot blocks a request, it may be protecting the workspace because the user is not the owner, the origin is not approved, the plan does not allow the action, the key is not valid, the action needs verification, or the deletion requires stronger confirmation.`),

    p(`Do not bypass a blocked action without understanding why it was blocked. First check the user role, workspace, selected site, API key, origin, plan, CavGuard decision, and any audit trail entry tied to the attempt.`),

    list([
      "Check whether the user has the correct role.",
      "Check whether the correct workspace is active.",
      "Check whether the correct site is selected.",
      "Check whether the origin is approved.",
      "Check whether the API key belongs to the project.",
      "Check whether the plan allows the feature.",
      "Check whether CavVerify is required.",
      "Check whether strict deletion is blocking a destructive action.",
      "Check the audit trail for the recorded decision."
    ]),

    p(`Owners should review Risk Controls regularly. A good review is simple: confirm the active sites, confirm the primary site, confirm the origin allowlist, confirm active API keys, confirm member roles, confirm CavSafe access, confirm deletion rules, and confirm alerts are enabled for production.`),

    p(`Admins should understand Risk Controls before making workspace changes. An admin may have permission to operate parts of the workspace, but owner-only settings, billing changes, protected files, key rotation, and destructive actions may still require stricter review.`),

    p(`Members should understand that Risk Controls are not personal restrictions. They exist to protect the workspace. If a member sees a blocked action, the correct next step is to ask an owner or admin to review the action, not to work around the control.`),

    table(
      ["Role", "How Risk Controls apply"],
      [
        ["Owner", "Can review and decide the workspace safety posture."],
        ["Admin", "Can help operate the workspace, but may still be blocked from owner-only or protected actions."],
        ["Member", "Can use allowed workspace areas while sensitive actions remain protected."],
        ["System", "Can block, require verification, record events, or enforce guardrails based on workspace rules."]
      ]
    ),

    p(`Risk Controls should be documented inside the team’s operating habits. If the workspace is used for a real business, everyone should know which site is production, which domains are approved, who can invite members, who can delete files, who can access CavSafe, and who can change protected settings.`),

    p(`When a new site is added, review Risk Controls immediately. Add the correct origin, confirm the snippet uses the right project key and site ID, check the allowlist, visit the live site, and confirm signals appear under the expected site profile.`),

    p(`When a site is removed, use strict deletion. Confirm that the site is no longer needed, check whether reports or history still matter, make sure no production snippet still points to the site, and review whether any API keys should be rotated or revoked.`),

    p(`When a team member leaves, review Risk Controls again. Remove access if needed, revoke stale invites, check API keys, review protected file access, check recent audit entries, and confirm that no owner-only responsibilities are still tied to the wrong person.`),

    list([
      "Review controls after adding a new site.",
      "Review controls after removing a site.",
      "Review controls after changing team roles.",
      "Review controls after a launch or migration.",
      "Review controls after suspicious activity.",
      "Review controls after rotating API keys.",
      "Review controls before giving admin access.",
      "Review controls before moving sensitive files into or out of CavSafe."
    ]),

    p(`Risk Controls are strongest when they are paired with clear ownership. Someone should know who owns the workspace, who owns production, who approves new origins, who manages API keys, who controls billing, who reviews audit trail, and who can approve protected actions.`),

    p(`CavBot may expand Risk Controls over time as the platform grows. New controls may be added for AI workflows, CavCode actions, CavCloud publishing, CavSafe movement, billing changes, model access, team permissions, and production-impacting operations.`),

    p(`The goal should remain simple: make the workspace safer without making normal work confusing. Risk Controls should stop obvious mistakes, slow down sensitive actions, alert the team when something unusual happens, and preserve a clear record when important actions are attempted.`),

    note("Best practice", "Turn on the strictest controls for production workspaces. Keep test environments separate, keep origins clean, keep alerts active, and make destructive actions deliberate.")
  ]
}

    ]
  },


  integrations: {
  path: "/docs/integrations",
  icon: "assets/icons/docs/integrations-svgrepo-com.svg",
  label: "Integrations",
  title: "Integrations",
  description: "Install CavBot on Webflow, Shopify, Wix, Framer, WordPress, Squarespace, or custom HTML sites.",
  sections: [
    {
      id: "webflow",
      title: "Webflow",
      summary: "Install CavBot in Webflow project code.",
      blocks: integrationBlocks(
        "Webflow",
        "Use Webflow when your marketing site, CMS pages, landing pages, portfolio, or business website is managed through the Webflow Designer and published to a Webflow staging domain or a custom production domain.",
        "Use Project Settings custom code when CavBot should run across the full site. Place the generated CavBot snippet in the footer or body area so it loads on every monitored page. Use Page Settings only when a specific page needs a separate install.",
        "Publishing only to staging and then checking the production domain, pasting the snippet into one page when the whole site should be monitored, using the wrong saved origin, forgetting to publish after adding the code, or using an API key that does not allow the public Webflow domain.",
        "Webflow sites often have more than one publish target. A site may exist on a webflow.io staging domain and also on a custom domain. CavBot should be connected to the public domain your visitors actually use. If you test on staging, make sure staging is also saved or allowlisted where your workspace expects it.",
        [
          "Confirm the saved CavBot site origin matches the Webflow domain you are testing.",
          "Publish the Webflow project after adding the snippet.",
          "Open the live published site, not only the Designer preview.",
          "Visit the homepage and at least two important routes.",
          "Check CavBot for recent route activity under the same site profile.",
          "Review Webflow custom code placement if only one page is sending data."
        ],
        [
          ["No activity appears", "Confirm the project was published and that you are testing the same domain saved in CavBot."],
          ["Only one page appears", "Move the snippet from a page-only field to the global project custom code area."],
          ["Signals appear under the wrong site", "Check the site ID, project key, and saved origin."],
          ["The snippet is missing from the live page", "Publish Webflow again and inspect the live page source."],
          ["The wrong domain is being checked", "Compare the Webflow staging domain, custom domain, and CavBot saved site origin."]
        ]
      )
    },

    {
      id: "shopify",
      title: "Shopify",
      summary: "Install CavBot in a Shopify theme.",
      blocks: integrationBlocks(
        "Shopify",
        "Use Shopify when CavBot needs to monitor a storefront, product pages, collections, cart-adjacent pages, customer-facing content, and the routes visitors use before checkout.",
        "Place the generated CavBot snippet in the shared theme layout, usually before the closing body tag. Avoid editing checkout files unless your Shopify plan, permissions, and Shopify policy allow that work.",
        "Installing only on one template, testing a preview theme while checking production, editing the wrong theme, forgetting to publish the active theme, using a store origin that is not allowlisted, or expecting checkout pages to behave like normal storefront pages when the plan does not allow checkout customization.",
        "Shopify themes can have preview versions, duplicate themes, and live themes. Make sure the snippet is installed in the active theme that customers actually see. For most storefronts, install CavBot on the public storefront pages first, then review checkout-related limits separately.",
        [
          "Confirm the active Shopify theme contains the CavBot snippet.",
          "Publish or save the theme changes before testing.",
          "Open the public storefront domain in a browser.",
          "Visit the homepage, product page, collection page, cart page, and a known missing route if testing recovery.",
          "Check CavBot for activity under the matching Shopify origin.",
          "Confirm the API key allows the public storefront domain."
        ],
        [
          ["No storefront activity appears", "Confirm the snippet is in the active live theme, not only a preview theme."],
          ["Product pages are missing", "Check whether the snippet is placed in the shared layout instead of one template."],
          ["Checkout pages are not tracked", "Review Shopify checkout customization limits for the current Shopify plan."],
          ["Signals appear on the wrong domain", "Check myshopify.com, custom domain, and saved CavBot origin."],
          ["Theme update removed the code", "Recheck the active theme layout after theme changes or replacements."]
        ]
      )
    },

    {
      id: "wix",
      title: "Wix",
      summary: "Install CavBot through Wix custom code.",
      blocks: integrationBlocks(
        "Wix",
        "Use Wix when the website is managed through Wix pages, Wix business tools, Wix storefronts, or Wix site builder controls.",
        "Use the Wix Settings custom code area for the site. Apply the snippet to all pages where CavBot should run. The code should be enabled, published, and placed where Wix allows external scripts to load across the site.",
        "Adding code to a visual element instead of the global custom code area, leaving the custom code disabled, publishing to a domain different from the saved CavBot origin, installing on only one page by mistake, or checking CavBot before Wix has published the changes.",
        "Wix separates editing from publishing. A snippet can exist in the editor but still not appear on the public website until the site is published. Always test the live public URL after publishing, not only the editor preview.",
        [
          "Confirm the CavBot snippet is enabled in Wix custom code.",
          "Apply the code to the pages CavBot should monitor.",
          "Publish the Wix site after adding the code.",
          "Open the public Wix or custom domain in a browser.",
          "Visit several real pages so CavBot can receive activity.",
          "Check CavBot under the site profile that matches the live Wix domain."
        ],
        [
          ["No activity appears", "Confirm the Wix custom code is enabled and the site was published."],
          ["Only some pages appear", "Check whether the code was applied to all pages or only selected pages."],
          ["Wrong domain appears", "Compare the Wix domain, custom domain, and CavBot saved origin."],
          ["Script does not appear in source", "Reopen Wix custom code settings and confirm placement and publish state."],
          ["Browser blocks the request", "Check browser extensions, custom privacy settings, and API key origin rules."]
        ]
      )
    },

    {
      id: "framer",
      title: "Framer",
      summary: "Install CavBot through Framer custom code.",
      blocks: integrationBlocks(
        "Framer",
        "Use Framer when the site is a design-driven marketing page, launch page, portfolio, product page, or public brand website built and published through Framer.",
        "Use Framer site custom code, preferably near the end of the body area. Until a dedicated Framer integration is exposed in the workspace, use the custom HTML install path.",
        "Assuming the coming-soon integration has a finished one-click connection, publishing only a preview while checking production, saving the wrong origin, missing the API-key allowlist, or pasting the snippet somewhere that does not load on the live published site.",
        "Framer sites are often tested in preview before they are published to a production domain. CavBot should be verified on the live domain that visitors use. If the site uses both a Framer preview URL and a custom domain, confirm which one is saved inside CavBot.",
        [
          "Confirm the Framer site custom code contains the generated CavBot snippet.",
          "Publish the Framer site after adding the snippet.",
          "Open the live public domain instead of only the editor preview.",
          "Visit the homepage and important landing pages.",
          "Check CavBot for recent activity under the same site origin.",
          "Review API key allowlist settings if the domain does not send data."
        ],
        [
          ["No activity appears", "Confirm the site was published and the snippet is present on the live page."],
          ["Preview works but production does not", "Add or allowlist the production domain and test the live domain."],
          ["Production works but preview does not", "Add or allowlist the preview domain only if you intend to monitor it."],
          ["Wrong site receives signals", "Check the site ID and saved origin in the installed snippet."],
          ["Dedicated integration is unavailable", "Use the custom HTML path until the Framer-specific flow is released."]
        ]
      )
    },

    {
      id: "wordpress",
      title: "WordPress",
      summary: "Install CavBot in WordPress templates or plugins.",
      blocks: integrationBlocks(
        "WordPress",
        "Use WordPress when the website is managed through themes, plugins, posts, pages, templates, WooCommerce, or a WordPress-based CMS setup.",
        "Use a trusted header/footer code plugin, the theme footer, or a child theme layout that loads on every monitored page. Avoid editing a parent theme directly if updates may overwrite the change.",
        "Editing a parent theme that later updates, installing only on one page, caching old markup, forgetting to purge cache, pasting the snippet into content where scripts are stripped, using the wrong domain, or installing in a template that does not load across the site.",
        "WordPress installs can be affected by themes, plugins, page builders, cache plugins, security plugins, and CDN layers. After adding CavBot, clear relevant caches and inspect the live page source so you know the public page contains the current snippet.",
        [
          "Confirm the snippet is placed in a global theme or header/footer area.",
          "Use a child theme or trusted code plugin when possible.",
          "Save changes and clear site, plugin, and CDN cache if needed.",
          "Open the live public WordPress domain in a browser.",
          "Visit posts, pages, product pages, and important templates.",
          "Check CavBot for recent activity under the correct origin."
        ],
        [
          ["No activity appears", "Confirm the live page source contains the snippet after cache is cleared."],
          ["Only some pages appear", "Check whether the snippet is missing from certain templates."],
          ["Code disappeared after update", "Move the snippet to a child theme or trusted code plugin."],
          ["Signals are delayed", "Purge cache and test in a fresh browser session."],
          ["Security plugin blocks the script", "Review plugin rules, script restrictions, and allowed external domains."]
        ]
      )
    },

    {
      id: "squarespace",
      title: "Squarespace",
      summary: "Install CavBot through Squarespace code injection.",
      blocks: integrationBlocks(
        "Squarespace",
        "Use Squarespace when the website is a managed business site, portfolio, landing page, content site, or storefront built through Squarespace.",
        "Use the Squarespace Code Injection area for the site footer or body area. Until a dedicated Squarespace integration is exposed in the workspace, use the custom code path.",
        "Using page-only injection when the full site should be monitored, checking before publishing, using a non-allowlisted origin, pasting the snippet into a content block instead of the code injection area, or testing a different domain than the one saved in CavBot.",
        "Squarespace can serve a built-in Squarespace domain and a connected custom domain. CavBot should normally be connected to the custom public domain. If you test both, make sure the workspace expects both origins.",
        [
          "Confirm the snippet is placed in the site-wide Code Injection area.",
          "Save and publish the Squarespace changes.",
          "Open the live public domain in a browser.",
          "Visit the homepage, contact page, product or service pages, and any important landing pages.",
          "Check CavBot for recent activity on the matching site profile.",
          "Review origin allowlist settings if signals do not appear."
        ],
        [
          ["No activity appears", "Confirm the snippet is in site-wide code injection and the site was published."],
          ["Only one page appears", "Check whether the snippet was placed in page-specific code instead of global code."],
          ["Wrong domain is being tracked", "Compare the Squarespace domain, custom domain, and saved CavBot origin."],
          ["Snippet is visible in editor but not live", "Save, publish, and inspect the public page source."],
          ["Dedicated integration is unavailable", "Use the custom code path until the Squarespace-specific flow is released."]
        ]
      )
    },

    {
      id: "custom-html",
      title: "Custom HTML",
      summary: "Install CavBot directly in your site.",
      blocks: integrationBlocks(
        "Custom HTML",
        "Use Custom HTML for hand-built sites, static sites, custom frameworks, self-hosted pages, internal frameworks, and any platform where you control the shared page template.",
        "Place the generated CavBot snippet in the shared HTML layout before the closing body tag, or in the equivalent root layout for the framework. The configuration values should appear before the runtime script.",
        "Loading the runtime script before the configuration values, duplicating the snippet, omitting the production domain from the API key allowlist, installing only on one route, committing the wrong site ID, testing localhost while expecting production signals, or forgetting to deploy after adding the code.",
        "Custom installs give you the most control, but they also require the most care. Make sure the snippet is installed once in the shared layout, deployed to the correct environment, and connected to the same project key, site ID, and origin saved inside CavBot.",
        [
          "Confirm the snippet is in the shared layout or root template.",
          "Confirm configuration values load before the runtime script.",
          "Deploy the site after adding the snippet.",
          "Open the public production origin in a browser.",
          "Visit important routes and one known missing route if testing 404 behavior.",
          "Check CavBot for activity on the matching site profile."
        ],
        [
          ["No activity appears", "Confirm the deployed page source contains the snippet and the correct configuration values."],
          ["Runtime loads before config", "Move the configuration script above the CavBot runtime script."],
          ["Duplicate activity appears", "Remove duplicate installs from nested layouts, templates, or page components."],
          ["Signals appear under the wrong site", "Check project key, site ID, public site ID, and saved origin."],
          ["Local testing does not appear in production", "Test the deployed production origin and confirm the API key allows that origin."]
        ]
      )
    }
  ]
},



  billing: {
    path: "/docs/billing",
    icon: "assets/icons/docs/pay-svgrepo-com.svg",
    label: "Billing and plans",
   
    title: "Billing and plans",
    description: "Understand plans, trial behavior, checkout, Stripe portal, seats, and cancellation.",
   
     sections: [
     {
  id: "plans",
  title: "Plans",
  summary: "Compare CavBot plan tiers, limits, storage, seats, and included access.",
  blocks: [
    p(`CavBot currently has three main plan tiers. The public plan names are CavTower, CavControl, and CavElite. In some product screens, billing logic, or internal access checks, these same tiers may also appear as Free, Premium, and Premium+. Both naming systems refer to the same plan structure.`),

    p(`CavTower is the entry plan. CavControl is the main paid plan for growing workspaces. CavElite is the highest current plan for teams that need more capacity, more protected storage, and full access to advanced workspace modules.`),

    p(`The plan names are meant to feel like CavBot products, while the tier labels help users understand access quickly. For example, CavTower maps to Free, CavControl maps to Premium, and CavElite maps to Premium+. When reading plan access inside the app, use the tier label to understand what is unlocked. When reading marketing or billing pages, use the CavBot plan name.`),

    table(
      ["Plan name", "Tier label", "What it is"],
      [
        ["CavTower", "Free", "The starting plan for one website, basic workspace access, and early setup."],
        ["CavControl", "Premium", "The main paid plan for teams that need more sites, more storage, protected files, and core intelligence modules."],
        ["CavElite", "Premium+", "The highest current plan for larger workspaces that need expanded limits, full module access, and stronger storage protections."]
      ]
    ),

    p(`Choose a plan based on the size of the workspace, the number of websites being monitored, the number of people who need access, the amount of storage required, and the level of protection the team needs around files, signals, and sensitive actions.`),

    p(`A small project may only need CavTower at the beginning. A growing business with multiple sites and real operational needs should review CavControl. A serious workspace with more websites, more seats, protected storage, accessibility review, deeper insights, and stronger file controls should review CavElite.`),

    table(
      ["Plan", "Monthly", "Annual", "Websites", "Seats", "CavCloud", "CavSafe", "Included access"],
      [
        ["CavTower", "$0", "$0", "1", "4", "5 GB", "Not included", "Dashboard, routing, Control Room, and badge widgets."],
        ["CavControl", "$19.99", "$199.99", "6", "8", "50 GB", "10 GB", "Errors, SEO, protected storage, and expanded workspace capacity."],
        ["CavElite", "$39.99", "$399.99", "20", "16", "500 GB", "50 GB", "Errors, SEO, Accessibility, Insights, advanced CavSafe features, and the highest current workspace limits."]
      ]
    ),

    p(`CavTower is best for testing CavBot, connecting a first website, reviewing the dashboard, and understanding the basic workspace experience before upgrading.`),

    p(`CavControl is best for users who are ready to operate CavBot as a serious website intelligence workspace. It gives the team more sites, more seats, more CavCloud storage, access to CavSafe, and important signal modules such as Errors and SEO.`),

    p(`CavElite is best for teams that need the full current CavBot experience. It increases website limits, seat limits, CavCloud storage, CavSafe storage, and unlocks the advanced modules intended for deeper review, better protection, and stronger workspace visibility.`),

    table(
      ["Plan", "Best for"],
      [
        ["CavTower", "A first website, early testing, personal setup, or a small workspace that is not ready for paid access yet."],
        ["CavControl", "A growing workspace with multiple sites, team members, protected files, and core monitoring needs."],
        ["CavElite", "A larger or more serious workspace that needs higher limits, full module access, and stronger file protection."]
      ]
    ),

    p(`CavSafe access begins on CavControl. CavTower includes CavCloud storage, but it does not include CavSafe secured storage. CavControl includes owner-only CavSafe storage for protected workspace files. CavElite expands CavSafe capacity and includes stronger CavSafe capabilities where available.`),

    p(`Plan access also affects which modules are available inside the workspace. If a module is locked, the user should review the current plan, billing status, workspace role, and plan requirements before assuming the feature is broken.`),

    list([
      "Use CavTower for a first website or early workspace setup.",
      "Use CavControl when the workspace needs more sites, more seats, more storage, and core paid modules.",
      "Use CavElite when the workspace needs the highest current limits and full advanced module access.",
      "Review CavSafe access before storing protected files.",
      "Review seat limits before inviting more teammates.",
      "Review website limits before adding more monitored sites.",
      "Check billing status if a paid feature appears locked."
    ]),

    p(`CavBot does not currently list a separate Enterprise plan in this plan table. Enterprise access may be considered later if user needs clearly show that larger teams require custom limits, custom security review, dedicated onboarding, higher storage, advanced administration, or specialized support.`),

    p(`User feedback will help determine whether CavBot should add an Enterprise plan. Until then, CavTower, CavControl, and CavElite are the three plan tiers users should compare when choosing access.`),

    note("Plan naming", "CavTower, CavControl, and CavElite are the public CavBot plan names. Free, Premium, and Premium+ are the tier labels used to make access rules easier to understand inside the product."),

    note("Billing check", "If the plan table and the billing screen ever disagree, use the live billing screen as the source of truth before upgrading, downgrading, or changing workspace access.")
  ]
},

   {
  id: "trial",
  title: "Trial",
  summary: "Try CavBot with full Premium+ access for 14 days.",
  blocks: [
    p(`CavBot includes a 14-day trial so new users can test the platform before choosing a paid plan. During the trial, the workspace receives Premium+ access, which gives the user enough room to explore CavBot’s strongest features, connect real sites, review signals, test protected storage, and understand how the product fits their workflow.`),

    p(`The trial is designed to be useful, not decorative. A user should not spend the trial only clicking through pages. The best trial experience comes from connecting a real website, installing the CavBot snippet, opening the dashboard, reviewing site activity, testing reports, exploring CavAi, opening CavCode, organizing files in CavCloud, and checking how the workspace behaves with real context.`),

    p(`Because the trial uses Premium+ access, users can evaluate the full CavBot experience before deciding whether CavTower, CavControl, or CavElite is the right long-term plan. This helps a user understand the difference between basic access, paid workspace access, and the highest current CavBot tier.`),

    table(
      ["Trial access", "What it gives you"],
      [
        ["Length", "14 days to explore CavBot before choosing a paid plan."],
        ["Effective access", "Premium+ access during the trial period."],
        ["Best use", "Connect a real site, install the snippet, review signals, and test the main workspace flow."],
        ["Storage review", "Explore CavCloud and CavSafe so you understand normal storage and protected storage."],
        ["Decision point", "Use the trial to decide which plan fits the workspace after the trial ends."]
      ]
    ),

    p(`Start the trial by setting up the workspace carefully. Add the correct site origin, confirm the selected site, install the CavBot snippet where the website can load it, publish the site, then visit the public website so CavBot can begin receiving activity.`),

    p(`After setup, review the workspace as if it were already in production. Check whether the dashboard receives activity, whether the connected site is correct, whether reports make sense, whether module access is unlocked, and whether the workspace has the storage and team capacity needed for the way you work.`),

    list([
      "Add the real website you want CavBot to monitor.",
      "Install the CavBot snippet on the live site.",
      "Visit the public site after publishing.",
      "Confirm CavBot receives activity.",
      "Open the dashboard and review the site state.",
      "Test reports, CavAi, CavCode, CavCloud, CavSafe, and protected workspace actions.",
      "Review which features matter most before choosing a plan."
    ]),

    p(`Use the trial to test practical workflows. For example, review a route with missing metadata, check a broken page, inspect an error, ask CavAi for a summary, open CavCode for a file review, upload a project asset to CavCloud, and place protected material in CavSafe when the file needs stronger protection.`),

    p(`The trial should also help owners understand workspace limits. Invite only the people who need to test the product, review seat access, check site capacity, and confirm whether the workspace needs the higher limits available in CavElite after the trial ends.`),

    table(
      ["What to test", "Why it matters"],
      [
        ["Site connection", "Confirms CavBot is watching the correct website."],
        ["Snippet install", "Confirms the live site can send activity to CavBot."],
        ["Dashboard review", "Shows whether CavBot is receiving useful site context."],
        ["Reports", "Helps the team understand how CavBot summarizes site health."],
        ["CavAi", "Lets users test assistant help with real workspace context."],
        ["CavCode", "Lets builders inspect and work with code-related flows."],
        ["CavCloud", "Tests normal workspace storage for files and assets."],
        ["CavSafe", "Tests protected storage for sensitive workspace files."],
        ["Security features", "Shows how protected actions, verification, and audit history behave."]
      ]
    ),

    p(`When the 14-day trial ends, the workspace moves back to the plan selected by the account. If no paid plan is selected, the workspace should continue on the free tier and paid features may become locked. Features that were available during the trial may require CavControl or CavElite after the trial period is over.`),

    p(`Before the trial ends, review what the workspace actually used. Check the number of sites, seats, storage needs, protected files, reports, and advanced modules that mattered during testing. This makes the plan decision clearer and prevents choosing a plan based only on the plan table.`),

    list([
      "Choose CavTower if the workspace only needs a basic first-site setup.",
      "Choose CavControl if the workspace needs more sites, more seats, core paid modules, and protected storage.",
      "Choose CavElite if the workspace needs the highest current limits, full module access, and stronger CavSafe capacity.",
      "Review billing before the trial ends if the workspace should keep paid access.",
      "Expect paid features to lock if the trial ends without an active paid plan."
    ]),

    p(`A trial is not a permanent plan. It is a temporary way to understand CavBot with the strongest current access before deciding what the workspace truly needs. Use the 14 days to test the platform with real work, not empty setup.`),

    note("Trial rule", "The 14-day trial gives users Premium+ access so they can test CavBot properly before choosing a long-term plan."),

    note("Before the trial ends", "Review sites, seats, storage, protected files, reports, and module access. Choose the plan that matches what the workspace actually needs.")
  ]
},


     {
  id: "checkout",
  title: "Checkout",
  summary: "Choose a plan, confirm billing details, and complete payment through Stripe.",
  blocks: [
    p(`Checkout is the payment flow used when a workspace owner or approved admin chooses a paid CavBot plan. It connects the selected plan, billing cycle, workspace account, and Stripe payment session so the customer can complete payment in a secure checkout experience.`),

    p(`Checkout should always begin from an official CavBot billing surface, such as the Plan page or Settings billing area. Users should not start checkout from a copied link, an old session, or a route that was not created for the current workspace. This helps make sure the correct workspace, plan, billing cycle, and customer record are used.`),

    p(`Before continuing to payment, review the selected plan carefully. Confirm the plan name, monthly or annual billing cycle, price, included limits, workspace access, and any feature differences. A workspace should enter checkout only after the customer understands what they are buying and which workspace the subscription will apply to.`),

    table(
      ["Checkout step", "What to confirm"],
      [
        ["Workspace", "The customer is signed in to the correct CavBot workspace."],
        ["Plan", "The selected plan matches the workspace needs."],
        ["Billing cycle", "Monthly or annual billing is correct before payment begins."],
        ["Price", "The displayed amount matches the chosen plan and billing cycle."],
        ["Access", "The user starting checkout has permission to manage billing."],
        ["Return path", "The user can return to CavBot after checkout succeeds or fails."]
      ]
    ),

    p(`CavBot uses Stripe to complete payment. When checkout starts, CavBot creates a payment session and sends the customer into the correct Stripe flow. Stripe handles the secure payment page, payment method collection, tax or billing details when required, and the final payment confirmation.`),

    p(`The app may use checkout routes such as /api/billing/checkout, /api/billing/checkout-session, /api/billing/checkout-embedded, and /api/stripe/checkout. These routes should be treated as system payment routes. Users normally do not need to open them directly. The Plan and Settings billing screens should create the correct checkout session for them.`),

    table(
      ["Route", "Purpose"],
      [
        ["/api/billing/checkout", "Starts a standard billing checkout flow."],
        ["/api/billing/checkout-session", "Creates or retrieves a checkout session for the selected plan."],
        ["/api/billing/checkout-embedded", "Supports an embedded checkout flow when the app uses one."],
        ["/api/stripe/checkout", "Connects CavBot billing actions to Stripe checkout handling."]
      ]
    ),

    p(`Only trusted billing screens should call these routes. The customer-facing experience should stay simple: choose a plan, confirm the billing cycle, continue to Stripe, complete payment, and return to CavBot.`),

    p(`After payment, Stripe sends the customer back to CavBot through a success or return route. CavBot then refreshes the workspace billing state so the new plan can appear in the product. In most cases, the plan update should appear quickly after checkout is completed.`),

    p(`If the plan does not update immediately, it does not always mean the payment failed. The billing event may still be processing, the page may need to refresh, or the Stripe webhook may need a moment to complete. Refresh the billing page first before starting another checkout session.`),

    list([
      "Start checkout from the Plan page or Settings billing area.",
      "Confirm the selected workspace before payment.",
      "Confirm the selected plan and billing cycle.",
      "Complete payment in the Stripe checkout flow.",
      "Return to CavBot after checkout.",
      "Refresh billing state if the plan does not update immediately.",
      "Avoid starting a second checkout session before confirming the first result."
    ]),

    p(`Checkout permissions should be controlled carefully. Billing changes affect the entire workspace, so CavBot should limit checkout access to the owner or approved admins. Members should be able to view plan information when allowed, but they should not be able to change the paid subscription unless the workspace policy allows it.`),

    note("Billing access", "Checkout should be started by the workspace owner or an approved admin. Paid plan changes should not be treated like ordinary workspace actions."),

    p(`A completed checkout can change which features are available to the workspace. After upgrading, modules, limits, seats, storage, protected storage, reports, and other plan-based features may unlock based on the selected plan. After a failed, canceled, or incomplete checkout, the workspace should remain on its previous plan.`),

    table(
      ["Checkout result", "What happens"],
      [
        ["Success", "The customer returns to CavBot and the workspace billing state should update."],
        ["Canceled", "The customer returns without completing payment and the plan should not change."],
        ["Payment failed", "Stripe may ask for another payment method or return the customer to CavBot."],
        ["Session expired", "The customer should start a new checkout session from the billing screen."],
        ["Plan not updated yet", "Refresh billing state and allow the Stripe event to finish processing."]
      ]
    ),

    p(`Do not treat a checkout redirect alone as proof that the plan changed. CavBot should confirm the subscription state through trusted billing records and Stripe webhook events before unlocking paid access permanently. This keeps billing state accurate even when a browser closes, a user refreshes, or a payment takes longer to complete.`),

    p(`Stripe webhooks help CavBot receive billing updates after checkout. These events can confirm subscription creation, plan changes, payment status, cancellation state, and other billing lifecycle changes. The app should use those events to keep the workspace plan aligned with the actual Stripe subscription.`),

    p(`If checkout succeeds but the workspace still appears locked, review the billing page, refresh the session, and confirm the payment completed in Stripe. If the issue continues, contact support with the workspace name, account email, selected plan, billing cycle, approximate checkout time, and any visible error message.`),

    table(
      ["Problem", "What to check"],
      [
        ["Checkout will not start", "Confirm the user has billing permission and the selected plan is valid."],
        ["Wrong plan appears", "Return to the Plan page and restart checkout with the correct plan."],
        ["Wrong billing cycle appears", "Switch monthly or annual before continuing to Stripe."],
        ["Payment fails", "Check the payment method, billing details, or Stripe error message."],
        ["Checkout was canceled", "Start a new checkout session from the official billing screen."],
        ["Plan does not update", "Refresh billing state and confirm the Stripe webhook completed."],
        ["User is in the wrong workspace", "Switch to the correct workspace before starting checkout again."]
      ]
    ),

    p(`For annual billing, users should review the full yearly amount before continuing. For monthly billing, users should confirm the recurring monthly price. CavBot should make the billing cycle visible before checkout so the customer does not accidentally choose the wrong payment schedule.`),

    p(`For security, checkout sessions should be short-lived and tied to the current workspace. If a session expires, the user should return to the billing screen and start again. Old checkout links should not be reused for later purchases or shared with another account.`),

    list([
      "Do not reuse old checkout links.",
      "Do not share checkout sessions between accounts.",
      "Do not unlock paid features from browser state alone.",
      "Confirm billing state after payment completes.",
      "Use Stripe records and webhook events as the source of truth for paid access.",
      "Keep checkout tied to the correct workspace and customer account."
    ]),

    p(`A clean checkout flow should feel direct. The user chooses a plan, confirms the billing cycle, completes payment, returns to CavBot, and sees the workspace updated. If anything interrupts that path, the billing screen should clearly show whether the customer should retry, wait, refresh, or contact support.`),

    note("Checkout rule", "Start from the official billing screen, confirm the plan before payment, and rely on confirmed billing state before unlocking paid access.")
  ]
},

     
     {
  id: "seats",
  title: "Seats",
  summary: "Understand how many people can access a workspace under each plan.",
  blocks: [
    p(`Seats control how many people can belong to a CavBot workspace under the current plan. A seat represents a person with workspace access, whether they are an owner, admin, or member. Seat limits help keep access clear, controlled, and aligned with the plan the workspace is using.`),

    p(`Each plan includes a set number of seats. Free includes 4 seats. Premium includes 8 seats. Premium+ includes 16 seats. When a workspace reaches its seat limit, new invitations may be blocked until a seat is available or the workspace moves to a plan with a higher limit.`),

    table(
      ["Plan", "Seat limit", "What it means"],
      [
        ["Free", "4 seats", "Best for a small team, founder setup, or early website workspace."],
        ["Premium", "8 seats", "Best for a growing team that needs more people reviewing sites, reports, files, and settings."],
        ["Premium+", "16 seats", "Best for a larger workspace with more team members, deeper access needs, and more protected workflows."]
      ]
    ),

    p(`Before inviting someone, review the current member list and any pending invites. A pending invite may still matter because it represents a person who has been offered access, even if they have not accepted yet. This helps prevent a workspace from sending more invitations than the plan is meant to support.`),

    p(`If the workspace has reached its seat limit, CavBot may block the invite and return a PLAN_SEAT_LIMIT result. This means the plan does not currently have enough available seats for the new invitation. The owner or admin should review active members, pending invites, and the plan limit before trying again.`),

    table(
      ["Seat state", "How to treat it"],
      [
        ["Active member", "Counts as real workspace access."],
        ["Pending invite", "Should be reviewed before sending more invites."],
        ["Revoked invite", "Should not be treated as active access."],
        ["Expired invite", "Should not be treated as active access."],
        ["Removed member", "No longer has workspace access."]
      ]
    ),

    p(`Seat management should be handled carefully because workspace access affects sites, files, reports, settings, and protected actions. A clean member list makes it easier to understand who can see the workspace, who can make changes, and who should be removed when access is no longer needed.`),

    list([
      "Review active members before sending new invites.",
      "Review pending invites before assuming seats are available.",
      "Remove people who no longer need workspace access.",
      "Revoke old invites that should no longer be accepted.",
      "Use the right role for each person instead of giving everyone admin access.",
      "Upgrade the plan when the workspace needs more seats than the current plan allows."
    ]),

    p(`Owners should keep the member list current. If a teammate leaves the project, changes role, no longer works on the website, or no longer needs access to CavBot, remove or adjust their access. This keeps the workspace easier to manage and reduces unnecessary exposure.`),

    p(`Admins should invite people only when access is needed for real work. A seat should not be used casually for someone who only needs a screenshot, exported report, or short update. When possible, share the right output instead of giving full workspace access.`),

    note("Access rule", "A seat gives a person access to the workspace. Keep seats limited to people who actually need to work inside CavBot."),

    p(`Seat limits work together with roles. The seat limit controls how many people can join the workspace. Roles control what those people are allowed to do after they join. Adding more seats does not mean every person should receive the same level of access.`),

    table(
      ["Role", "Typical use"],
      [
        ["Owner", "Controls the workspace, billing, sensitive settings, and highest-trust actions."],
        ["Admin", "Helps manage the workspace, team, sites, and important settings where allowed."],
        ["Member", "Uses the workspace for assigned work without full owner-level control."]
      ]
    ),

    p(`If an invite fails because of a seat limit, start by checking whether the workspace has unused pending invites. Revoke any invite that is no longer needed. Then review active members and remove anyone who should no longer have access. If the team still needs more people in the workspace, move to a plan with a higher seat limit.`),

    table(
      ["Problem", "What to check"],
      [
        ["Invite fails with PLAN_SEAT_LIMIT", "Review active members, pending invites, and the current plan limit."],
        ["A person never accepted their invite", "Resend the invite if needed or revoke it if access is no longer needed."],
        ["The wrong person was invited", "Revoke the invite and send a new one to the correct email."],
        ["A former teammate still appears", "Remove the member from the workspace."],
        ["The team needs more access", "Upgrade to a plan with a higher seat limit."]
      ]
    ),

    p(`A healthy workspace should have a clear access list. The owner should know who belongs to the workspace, what role each person has, which invites are still open, and whether the current plan has enough seats for the team.`),

    note("Seat rule", "Keep the member list clean before upgrading, inviting, or changing roles. Clear access is safer than crowded access.")
  ]
},

      {
  id: "cancel-a-plan",
  title: "Cancel a plan",
  summary: "Cancel, downgrade, or review billing changes before they affect the workspace.",
  blocks: [
    p(`Canceling a plan changes how much access the workspace has after the billing change takes effect. CavBot keeps the workspace, but the workspace must follow the limits of the plan it returns to. This can affect websites, seats, storage, protected files, reports, and advanced product areas.`),


    p(`A cancellation should be handled by the workspace owner or an authorized billing user. Billing changes affect the entire workspace, not only the person who clicks the button. Before canceling or downgrading, review what the workspace currently uses and what will remain available under the new plan.`),


    p(`Canceling a plan is different from deleting a workspace. Canceling changes the billing status and plan access. It does not automatically erase the workspace, remove every site, delete every file, or remove every teammate. The workspace remains, but CavBot may lock features, limit capacity, or require cleanup when usage is above the new plan limit.`),


    table(
      ["Change", "What it means"],
      [
        ["Cancel", "Stop paid plan access according to the billing terms and return the workspace to the correct remaining plan state."],
        ["Downgrade", "Move from a higher plan to a lower plan with fewer limits or fewer advanced features."],
        ["Upgrade later", "Move back to a higher plan when the workspace needs more sites, seats, storage, or product access."],
        ["Delete workspace", "A separate action that removes the workspace itself, if the product allows it and the owner confirms it."]
      ]
    ),


    p(`Before confirming a cancellation or downgrade, check the workspace carefully. A workspace that is using more than the lower plan allows may need cleanup. This can include reducing the number of websites, removing unused members, clearing old storage, moving protected files, or accepting that some product areas will become locked.`),


    list([
      "Review how many websites are connected.",
      "Review how many members and pending invites exist.",
      "Review CavCloud storage usage.",
      "Review CavSafe storage usage, if the workspace uses protected storage.",
      "Review which reports, modules, or protected areas the team depends on.",
      "Download or save anything the team needs before access changes.",
      "Tell teammates before changing the plan if their access may be affected."
    ]),


    p(`Plan changes can affect daily work. A team may lose access to higher plan features, additional storage, larger team limits, protected file tools, advanced reports, or selected product areas. Locked areas may still appear in the app so users understand what changed, but the workspace may need a higher plan to use them again.`),


    table(
      ["Area", "What may change after cancellation or downgrade"],
      [
        ["Websites", "The workspace may need to stay within the website limit of the lower plan."],
        ["Seats", "The workspace may need to reduce members or stop sending new invites."],
        ["CavCloud", "Storage access may be limited by the lower plan’s storage allowance."],
        ["CavSafe", "Protected storage access may be reduced or locked depending on the plan."],
        ["Reports", "Advanced reports or deeper views may no longer be available."],
        ["Modules", "Some product areas may move into a locked state."],
        ["Team access", "Teammates may keep basic access, but certain actions can become unavailable."]
      ]
    ),


    p(`If usage is above the new plan limit, the owner should decide what stays and what can be removed. Do not wait until after the plan changes to understand the impact. Clean up the workspace first when possible, especially if the team depends on files, reports, or connected sites for active work.`),


    p(`For storage, review both normal workspace files and protected files. CavCloud is used for general workspace storage. CavSafe is used for files that need stronger protection. If the lower plan does not support the same storage level, decide which files should be downloaded, moved, archived, deleted, or kept under a higher plan.`),


    p(`For team access, review active members and pending invites. Remove people who no longer need access before downgrading. Revoke old invites that should not remain open. A clean member list prevents confusion after the billing change takes effect.`),


    p(`For websites, review connected site profiles. If the new plan allows fewer websites, decide which sites matter most. Keep the production sites, active customer sites, or highest-priority projects first. Remove test sites, retired sites, duplicate origins, or old setups that no longer need CavBot coverage.`),


    note("Before canceling", "Review sites, seats, storage, protected files, and active product areas before confirming the plan change. A clean workspace makes the downgrade safer."),


    p(`Cancellation may not always remove paid access immediately. Depending on the billing state, the workspace may keep access until the end of the current billing period. If access remains for a short time after canceling, use that time to export important material, clean up usage, and prepare the workspace for the lower plan.`),


    p(`After the plan change, reopen the workspace and confirm the new state. Check billing, plan name, site access, member access, storage, locked areas, and any notices shown by CavBot. If something still appears wrong after the billing change, refresh the workspace and check the billing screen again.`),


    table(
      ["After the change", "What to confirm"],
      [
        ["Plan status", "The workspace shows the expected plan."],
        ["Billing state", "The billing screen reflects the cancellation or downgrade."],
        ["Sites", "The connected websites match the new plan limit."],
        ["Seats", "The member list and invites are within the plan limit."],
        ["Storage", "CavCloud and CavSafe usage are within the available allowance."],
        ["Locked areas", "Any locked product areas match the new plan."],
        ["Team awareness", "Teammates know what access changed."]
      ]
    ),


    p(`If the plan does not update right away, wait briefly, refresh the billing page, and check again. Billing systems can take a moment to confirm the change. If the issue continues, contact support with the workspace name, billing email, selected plan, approximate time of the change, and any error message shown by the app.`),


    table(
      ["Problem", "What to check"],
      [
        ["Plan still looks active", "Refresh the billing page and confirm whether access continues until the billing period ends."],
        ["Feature is locked after downgrade", "Check whether the feature belongs to the previous higher plan."],
        ["Invite fails after downgrade", "Review the new seat limit and pending invites."],
        ["Site cannot be added", "Review the new website limit."],
        ["Storage warning appears", "Review CavCloud and CavSafe usage under the new plan."],
        ["Billing page shows an error", "Contact support with the workspace, billing email, and time of the issue."]
      ]
    ),


    p(`Canceling should be deliberate, not rushed. If the workspace still depends on advanced access, storage, protected files, larger team limits, or more connected websites, consider cleaning up first or moving to the plan that matches the team’s actual usage.`),


    p(`A healthy cancellation flow gives the owner a clear picture before the change, keeps the workspace intact after the change, and makes the remaining limits easy to understand. The goal is not to trap the customer. The goal is to make sure the workspace does not lose important access unexpectedly.`),


    note("Plan change rule", "Canceling or downgrading affects the whole workspace. Review usage first, confirm the impact, then make the change.")
  ]
}


    ]
  },


  assets: {
    path: "/docs/assets",
    icon: "assets/logo/cavbot-logomark.svg",
    label: "CavBot assets",
    
    title: "CavBot assets",
    description: "Install CavBot visual surfaces for badges, compact CavBot presence, guided moments, Arcade recovery, and brand resources.",
    sections: [
     {
  id: "cavbot-badge",
  title: "Badge",
  summary: "Show a compact CavBot trust marker.",
  blocks: [
    p(`The CavBot Badge is a compact trust marker that can be added to a website when CavBot is present. It gives visitors a small, visible sign that the site is connected to CavBot without changing the main page flow, blocking content, or turning the page into a support widget.`),

    p(`Use the badge when a website should show a quiet CavBot presence. It is best for pages where trust, support, reliability, or product confidence matters, but where the visitor still needs to focus on the page itself.`),

    p(`The badge is loaded from the CavBot CDN. This keeps the install lightweight and makes the badge easier to update without copying the full component into a customer website. The page only needs the badge stylesheet and the badge slot.`),

    code('<link rel="stylesheet" href="https://cdn.cavbot.io/sdk/ui/v1/cavbot-badge-inline.css">\n\n<div\n  data-cavbot-cdn-floating-badge="1"\n  data-cavbot-cdn-slot="badge"\n  aria-hidden="true"\n  style="position:fixed;right:24px;bottom:24px;z-index:9999;"></div>'),

    p(`The floating badge appears near the bottom-right corner of the page by default. This placement works well for many marketing sites, dashboards, help pages, docs pages, and recovery pages because it stays visible without interrupting the primary content.`),

    p(`Before using the floating version, check the page on desktop, tablet, and mobile. A badge that looks fine on a wide screen can cover important controls on a small screen if the page already has chat widgets, cookie banners, checkout controls, sticky buttons, support launchers, or mobile navigation.`),

    table(
      ["Placement", "Use it when"],
      [
        ["Floating bottom-right", "The page has enough clear space and no important controls in that corner."],
        ["Footer", "The badge should feel like a trust mark instead of a persistent overlay."],
        ["Support area", "The page already has help, contact, status, or support content."],
        ["Status surface", "The site wants to show CavBot presence near reliability or trust information."],
        ["Recovery page", "The badge supports a 404, fallback, or guided recovery experience."]
      ]
    ),

    p(`The badge should support the page, not compete with it. It should not cover forms, payment buttons, checkout steps, login fields, navigation, accessibility controls, cookie consent controls, chat launchers, or any element a visitor needs in order to complete the page.`),

    list([
      "Use the badge where it can remain visible without blocking important content.",
      "Keep the badge away from checkout, login, signup, and form controls.",
      "Review the page on mobile after install.",
      "Avoid placing the badge on top of another floating widget.",
      "Use a footer or inline placement when the page is already crowded.",
      "Keep the badge small and stable so it feels trustworthy, not distracting."
    ]),

    p(`The badge should be treated as a trust marker, not the main call to action. The visitor should still understand the page’s real purpose first, whether that is reading a document, starting a trial, completing checkout, contacting support, or returning from a broken route.`),

    p(`Do not use the badge as a replacement for clear support links, privacy information, security statements, or status pages. It can point to CavBot presence, but the website should still provide the information visitors need in the correct page areas.`),

    p(`For accessibility, the badge slot in the basic floating example is marked aria-hidden because it is decorative in that placement. If you turn the badge into an interactive link or support entry point, update the markup so screen readers receive a clear label and keyboard users can reach it properly.`),

    note("Accessibility", "Decorative badge placements can stay hidden from assistive technology. Interactive badge placements must have a clear label, keyboard focus, and a real destination or action."),

    p(`The badge should also respect the visual tone of the website. On a serious business page, it should feel calm and restrained. On a docs page, it should not distract from reading. On a recovery page, it can help show that CavBot is part of the experience, but it should not make the page feel crowded.`),

    table(
      ["Do", "Avoid"],
      [
        ["Place the badge in a clean, low-friction area.", "Placing it over buttons, inputs, menus, or consent controls."],
        ["Use the CDN install when available.", "Copying internal badge source into the website manually."],
        ["Review mobile placement after publishing.", "Assuming desktop placement works everywhere."],
        ["Keep it quiet and consistent.", "Turning the badge into a loud visual element."],
        ["Use inline placement when the page is crowded.", "Stacking the badge on top of other floating widgets."]
      ]
    ),

    p(`After installing the badge, publish the site and open the live page. Confirm that the stylesheet loads, the badge appears in the intended place, the page layout does not shift, and no important control is blocked.`),

    list([
      "Open the live page after publishing.",
      "Confirm the badge appears.",
      "Confirm the badge does not cover key controls.",
      "Test desktop and mobile widths.",
      "Check pages with cookie banners, chat widgets, sticky CTAs, and mobile menus.",
      "Move the badge to an inline or footer position if the floating placement creates friction."
    ]),

    p(`If the badge does not appear, confirm that the CDN stylesheet URL is correct, the badge slot is present in the page HTML, the page was published, the browser is not blocking the asset, and the badge container is not hidden by page CSS.`),

    table(
      ["Problem", "What to check"],
      [
        ["Badge does not show", "Confirm the stylesheet and badge slot are both present on the live page."],
        ["Badge appears unstyled", "Confirm the CDN stylesheet loaded successfully."],
        ["Badge covers another widget", "Move the badge, reduce the overlap, or use an inline/footer placement."],
        ["Badge is hidden behind content", "Review z-index, parent overflow, and page stacking context."],
        ["Badge looks wrong on mobile", "Adjust placement or avoid the floating badge on small screens."]
      ]
    ),

    p(`Use the CavBot Badge with restraint. Its purpose is to show CavBot presence clearly and quietly. The best badge placement gives visitors confidence without asking them to think about the badge at all.`),

    note("Core rule", "The badge should be visible, calm, and out of the way. It should support trust without interrupting the visitor’s task.")
  ]
},

    {
  id: "cavbot-head",
  title: "Head",
  summary: "Use a compact CavBot visual for guidance, setup, status, and empty states.",
  blocks: [
    p(`CavBot Head is the compact CavBot visual component. It gives a page a small CavBot presence without using the larger full-body character. Use it when the page needs a calm visual anchor for onboarding, setup confirmation, empty states, guidance moments, success states, waiting states, or lightweight status surfaces.`),

    p(`The component is meant to support the page state. It should help the interface feel clearer, warmer, and more connected to CavBot, but it should never replace the actual instructions, labels, forms, buttons, warnings, or next steps the user needs.`),

    p(`CavBot Head works best in moments where the user needs reassurance or orientation. For example, it can appear when a workspace has no sites yet, when a setup step has been completed, when a user needs to connect a site, when a page is waiting for data, or when CavBot is giving a small status cue.`),

    table(
      ["Use case", "How CavBot Head helps"],
      [
        ["Onboarding", "Adds a small CavBot presence while the user sets up the workspace."],
        ["Empty states", "Makes a blank or unused area feel intentional instead of unfinished."],
        ["Setup confirmation", "Supports success messages after a site, file, key, or workspace action is completed."],
        ["Guidance moments", "Helps draw attention to instructions without turning the page into a full assistant screen."],
        ["Status surfaces", "Gives lightweight visual feedback when a page is loading, waiting, or ready for review."]
      ]
    ),

    code('<link rel="stylesheet" href="https://cdn.cavbot.io/sdk/ui/v1/cavbot-head-orbit.css">\n\n<div data-cavbot-head-orbit></div>'),

    p(`The component is loaded from the CavBot CDN. Use the documented stylesheet and component slot when adding CavBot Head to a public page or supported product surface. This keeps the install clean and avoids copying internal visual source files into a website.`),

    p(`CavBot Head should be placed near the message it supports. If the page is explaining an empty state, place it close to the empty-state copy. If the page is confirming setup, place it near the confirmation message. If the page is guiding a user toward the next action, keep it close enough that the user understands why the visual is there.`),

    list([
      "Use CavBot Head for small guidance and status moments.",
      "Place it near the message or state it supports.",
      "Keep the main instructions and buttons clear.",
      "Keep enough spacing around the component.",
      "Test the layout on desktop and mobile.",
      "Use CavBot Body instead when the page needs a larger branded visual presence."
    ]),

    p(`CavBot Head should not compete with the primary action. It should not sit on top of buttons, forms, navigation, menus, checkout controls, login fields, cookie banners, support widgets, or accessibility controls. If the page already has several visual elements, keep the component smaller or remove it.`),

    table(
      ["Good placement", "Avoid"],
      [
        ["Beside an empty-state message.", "Over a form field or button."],
        ["Above a short setup confirmation.", "Inside a crowded toolbar."],
        ["Near onboarding instructions.", "On top of mobile navigation."],
        ["Inside a calm status card.", "Competing with charts, tables, or dense dashboard content."],
        ["In a centered guidance section.", "Floating without a clear reason."]
      ]
    ),

    p(`Use CavBot Head when the page benefits from a compact CavBot identity. Do not add it only to decorate the page. If the visual does not help the user understand the page, confirm a state, or feel guided through a moment, the page may not need it.`),

    p(`For accessibility, do not rely on the visual component to communicate important information. Any important message must also appear as real text. A user should be able to understand the page even if the visual does not load, is hidden, or is not announced by assistive technology.`),

    note("Accessibility", "CavBot Head can support a message, but the message itself must be written in text. Do not make the visual the only source of meaning."),

    p(`On small screens, review the component carefully. A visual that feels balanced on desktop may crowd the page on mobile. Keep the component away from sticky buttons, mobile menus, sign-in controls, and any action the user needs to complete the flow.`),

    p(`If the component is used on a loading or waiting state, make sure the page also explains what is happening. The user should know whether CavBot is loading data, checking a workspace, preparing a preview, confirming setup, or waiting for an action to finish.`),

    table(
      ["State", "Recommended page copy"],
      [
        ["Loading", "Explain what CavBot is loading."],
        ["Empty state", "Explain what is missing and what the user should do next."],
        ["Success", "Confirm what was completed."],
        ["Setup", "Explain the next step clearly."],
        ["Waiting", "Tell the user what CavBot is waiting for."]
      ]
    ),

    p(`CavBot Head is different from CavBot Body. CavBot Head is compact and should be used for smaller moments. CavBot Body is larger and should be reserved for stronger branded scenes, launch states, guided recovery screens, and pages where the visual is meant to be a major part of the layout.`),

    p(`If CavBot Head does not appear after installation, confirm that the CDN stylesheet is loading, the component slot is present, the page was published, the browser is not blocking the asset, and local page CSS is not hiding the component.`),

    table(
      ["Problem", "What to check"],
      [
        ["Component does not show", "Confirm the stylesheet and component slot are both present on the live page."],
        ["Component appears unstyled", "Confirm the CDN stylesheet loaded successfully."],
        ["Component crowds the layout", "Add spacing, reduce the surrounding content, or move it to a calmer section."],
        ["Component overlaps controls", "Move it away from forms, buttons, navigation, and sticky page elements."],
        ["Component looks wrong on mobile", "Adjust placement or remove it from the small-screen layout."]
      ]
    ),

    p(`Use CavBot Head with restraint. It should make the page feel more intentional, not heavier. The strongest use is simple: a compact CavBot presence, a clear message, and an obvious next step.`),

    note("Layout", "Keep enough space around the component so it does not crowd the page or compete with primary actions.")
  ]
},

{
  id: "cavbot-body",
  title: "Body",
  summary: "Use the larger CavBot visual.",
  blocks: [
    p(`CavBot Body is the larger CavBot visual presence for pages that need a stronger guide, recovery anchor, or branded product moment. It is designed for moments where a small badge or compact head is not enough to support the message on the page.`),

    p(`Use CavBot Body when the page needs CavBot to feel present as a guide, not just as a quiet trust marker. It can support onboarding, launch states, recovery screens, empty states, help pages, product walkthroughs, 404 experiences, and moments where the user needs orientation.`),

    p(`CavBot Body should not be placed on every page. It is a heavier visual asset than the badge or head, so it should be used only when the page has enough space and the experience benefits from a clear CavBot presence.`),

    code('<link rel="stylesheet" href="https://cdn.cavbot.io/sdk/ui/v1/cavbot-full-body.css">\n\n<div data-cavbot-full-body></div>'),

    p(`The basic install loads the CavBot Body stylesheet from the CavBot CDN and places the body component where the page should render it. The component should be placed inside a section with enough room around it, not squeezed into a crowded layout or placed over important content.`),

    p(`CavBot Body works best when it supports a clear message. For example, it can appear beside a setup instruction, above a recovery action, inside a helpful empty state, or near a page that explains what the user should do next.`),

    table(
      ["Placement", "Use it when"],
      [
        ["Onboarding section", "A new user needs guidance before connecting a website or starting setup."],
        ["Empty state", "A workspace, dashboard, or tool has no data yet and needs a clear next step."],
        ["Recovery page", "A broken route, 404 page, or fallback state needs a stronger CavBot presence."],
        ["Support page", "The page is guiding a user toward help, contact, status, or troubleshooting."],
        ["Launch state", "A feature, site, or workspace has just been created and the user needs orientation."],
        ["Product walkthrough", "The page is explaining how CavBot helps the user move through a task."]
      ]
    ),

    p(`Do not use CavBot Body as decoration only. If the page does not need a guide, use the Badge or CavBot Head instead. CavBot Body should earn its space by helping the user understand the page, recover from a problem, or continue a workflow.`),

    list([
      "Use CavBot Body when the page needs a stronger CavBot guide.",
      "Keep enough space around the visual.",
      "Place it near useful copy, buttons, or recovery actions.",
      "Avoid using it on dense pages where it crowds the content.",
      "Review the layout on desktop, tablet, and mobile.",
      "Use CavBot Head or Badge when the page only needs a smaller presence."
    ]),

    p(`CavBot Body should not hide the main action. If the page asks the user to connect a site, install a snippet, contact support, return home, open a dashboard, or complete setup, that action should remain easier to notice than the visual.`),

    p(`On smaller screens, CavBot Body needs extra care. A large visual can quickly crowd text, buttons, forms, cards, menus, or sticky navigation. If the component makes the page harder to read or use on mobile, reduce its size, move it lower on the page, or replace it with CavBot Head.`),

    note("Mobile review", "Always check CavBot Body on mobile. If it crowds the page, use a smaller placement or switch to CavBot Head."),

    p(`CavBot Body is different from the badge, head, and Arcade. The badge is a small trust marker. CavBot Head is a compact guide for lighter moments. CavBot Body is for stronger guided moments. Arcade is for playable or recovery experiences.`),

    table(
      ["Asset", "Best use"],
      [
        ["Badge", "Small CavBot trust marker."],
        ["CavBot Head", "Compact guidance, onboarding, empty states, or small product moments."],
        ["CavBot Body", "Larger guided moments, recovery screens, launch states, and stronger branded surfaces."],
        ["Arcade", "Playable experiences and 404 recovery moments."]
      ]
    ),

    p(`When using CavBot Body on a recovery page, pair it with clear recovery links. A visitor should always have a simple way to return home, search, contact support, open docs, visit pricing, or continue to another useful route.`),

    p(`When using CavBot Body in onboarding, keep the instructions direct. The visual should make the page feel guided, but the text still needs to explain exactly what the user should do next.`),

    p(`When using CavBot Body in a product surface, avoid placing it where it competes with the actual tool. A dashboard, editor, report, or settings page should keep the work area clear. CavBot Body belongs in states where guidance is needed, not where the user is already working inside a dense interface.`),

    table(
      ["Do", "Avoid"],
      [
        ["Use it beside clear guidance or recovery copy.", "Using it as decoration without a purpose."],
        ["Keep the main action visible.", "Letting the visual overpower the button or instruction."],
        ["Use it on onboarding, support, launch, and recovery pages.", "Adding it to every page by default."],
        ["Test mobile layout after publishing.", "Assuming the desktop layout works on small screens."],
        ["Switch to CavBot Head when space is tight.", "Forcing the full body into crowded sections."]
      ]
    ),

    p(`For accessibility, the visual should not replace real text. The page still needs readable headings, clear instructions, visible buttons, and proper link text. If CavBot Body is decorative, it can remain hidden from assistive technology. If it becomes interactive, it must have a clear label, keyboard focus, and a real action.`),

    note("Accessibility", "CavBot Body can support the experience visually, but the page still needs clear text, proper buttons, and usable navigation."),

    p(`After installing CavBot Body, publish the page and review the live version. Check that the stylesheet loads, the visual appears in the correct place, the layout does not shift unexpectedly, and the component does not cover or crowd important controls.`),

    list([
      "Open the live page after publishing.",
      "Confirm the CavBot Body stylesheet loads.",
      "Confirm the visual appears where expected.",
      "Check that the main action is still clear.",
      "Test desktop, tablet, and mobile widths.",
      "Confirm the visual does not cover text, buttons, forms, or navigation.",
      "Use CavBot Head instead if the full body feels too heavy."
    ]),

    p(`If CavBot Body does not appear, confirm that the CDN stylesheet URL is correct, the component slot is present in the page HTML, the page has been published, and no page CSS is hiding or overriding the component.`),

    table(
      ["Problem", "What to check"],
      [
        ["Body does not show", "Confirm the stylesheet and component slot are both present on the live page."],
        ["Body appears unstyled", "Confirm the CDN stylesheet loaded successfully."],
        ["Body is too large", "Move it to a wider section, reduce the placement size, or use CavBot Head."],
        ["Body crowds mobile content", "Change the mobile layout or replace it with a smaller CavBot asset."],
        ["Body covers a button or form", "Move the component away from the primary action."],
        ["Body feels distracting", "Use Badge or CavBot Head instead."]
      ]
    ),

    p(`Use CavBot Body with restraint. It should make a page feel guided, clear, and intentional. It should never make the page feel crowded, heavy, or harder to use.`),

    note("Use carefully", "CavBot Body should strengthen the page. It should not hide the main action, crowd the layout, or make the experience feel heavy.")
  ]
},

   {
  id: "arcade-404",
  title: "CavBot Arcade",
  summary: "Play CavBot Arcade games inside the platform and use selected games for better 404 recovery.",
  blocks: [
    p(`CavBot Arcade is the interactive game hub inside CavBot. It gives users a place to open, explore, preview, and play CavBot Arcade games directly from the platform without installing anything on a website first.`),

    p(`Arcade has two connected roles. First, it is a playable product surface inside CavBot where users can experience the full game collection. Second, it can support broken-page recovery when a team chooses to install an Arcade experience on a live 404 page.`),

    p(`Inside the CavBot platform, all six CavBot Arcade games are available to play at any time. Free, Premium, and Premium+ users can open Arcade, choose a game, test the controls, learn the pacing, compare the experience, and decide which game feels right before using it on a public website.`),

    p(`This matters because a 404 recovery experience should not be chosen blindly. A game that feels right for a playful product may not fit a serious business page. Arcade lets owners, admins, designers, developers, and support teams review the experience first, then decide whether it belongs on a live route.`),

    table(
      ["Arcade use", "What it means"],
      [
        ["Play inside CavBot", "Users can open Arcade and play the full game collection directly from the platform."],
        ["Preview before install", "Teams can test the experience before choosing a game for a public 404 page."],
        ["Demo for teammates", "Owners, admins, developers, designers, and support teams can review the game flow together."],
        ["404 recovery", "A selected Arcade game can be used on a missing page to help visitors recover."],
        ["Product discovery", "Users can understand what CavBot Arcade offers before using it on a live site."]
      ]
    ),

    p(`Arcade should be understood as a product surface first. It is a place to play, test, and understand the games. The 404 recovery use case is an extension of that experience, not the only reason Arcade exists.`),

    p(`When Arcade is used for broken-page recovery, the goal is to improve a moment that would otherwise feel like a dead end. A visitor who reaches a missing route should not be left with only a cold “Page Not Found” message and no clear path forward. Arcade can make that moment feel more intentional while still helping the visitor return to the site.`),

    p(`A 404 page appears when a visitor reaches a route the website cannot find. This can happen because a page was deleted, a link was typed wrong, a campaign URL changed, a product route moved, a redirect was missed, or an old link still exists somewhere on the internet.`),

    p(`Most broken-page experiences end the visitor’s path too quickly. Arcade gives teams a way to soften that moment without pretending the problem does not exist. The page can still say the route was not found, but it can also give the visitor something useful, branded, and clear to do next.`),

    p(`A strong Arcade recovery page has three parts: a clear message, a useful recovery path, and an optional game experience. The message explains that the page could not be found. The recovery path gives visitors somewhere useful to go. The Arcade experience makes the broken moment feel designed instead of abandoned.`),

    table(
      ["404 recovery part", "Purpose"],
      [
        ["Clear message", "Tell the visitor that the page was not found without blaming them."],
        ["Recovery links", "Give the visitor a direct path back to a useful page."],
        ["Arcade game", "Add a short, branded interaction that makes the broken moment feel more intentional."],
        ["Tracking context", "Let CavBot understand that the visitor reached a missing route."],
        ["Follow-up review", "Help the team decide whether the route needs a redirect, restore, or link fix."]
      ]
    ),

    p(`The game should never become a wall. Visitors should not feel trapped, confused, or forced to play before they can continue. Recovery links should stay visible, the page should still explain that the route was not found, and the visitor should always have a simple way back.`),

    list([
      "Use Arcade inside CavBot to play and preview the full game collection.",
      "Use Arcade before installation to decide which game fits a website.",
      "Use Arcade on a 404 page when a missing route needs a better recovery moment.",
      "Use clear recovery links so visitors can return home, search, contact support, or continue to another page.",
      "Use 404 Recovery after launch to review which missing routes still need repair.",
      "Do not use Arcade as a replacement for fixing important broken links."
    ]),

    p(`Plan access affects which Arcade games can be selected for a live website recovery install. The in-platform Arcade play area stays open to the full game collection, but public 404 installs follow plan limits.`),

    table(
      ["Plan", "Arcade inside CavBot", "Live 404 game selection"],
      [
        ["Free", "All six games are playable inside Arcade.", "1 installable 404 game can be selected for a website."],
        ["Premium", "All six games are playable inside Arcade.", "3 installable 404 games can be selected for a website."],
        ["Premium+", "All six games are playable inside Arcade.", "All 6 installable 404 games can be selected for a website."]
      ]
    ),

    note("Plan rule", "All six games are playable inside CavBot Arcade. Plan limits apply to which games can be selected for a public 404 recovery install."),

    p(`The difference is important. Playing games inside Arcade is always available across plans. Selecting which games can be installed publicly on a live 404 page depends on the active plan.`),

    p(`Use Arcade inside CavBot when you want to test controls, compare game styles, review pacing, show teammates the experience, or decide whether a game fits a public website before installing it.`),

    p(`Use Arcade on a public website when a broken page needs a stronger recovery experience. This is useful for websites with old links, campaign URLs, moved content, deleted routes, mistyped URLs, product pages that changed, or support links that still receive traffic.`),

    table(
      ["Situation", "How Arcade helps"],
      [
        ["Old links still receive visits", "The visitor gets a better recovery moment while the team reviews the route."],
        ["Campaign URLs are mistyped", "The page can guide visitors back to the right destination."],
        ["Content was moved", "Arcade can protect the experience until a redirect is added."],
        ["A product route no longer exists", "The visitor can recover instead of landing on a dead end."],
        ["A team wants a branded 404 page", "The missing-page experience feels intentional instead of unfinished."]
      ]
    ),

    p(`Arcade should never be used to ignore broken routes. If a missing URL receives repeated visits, the team should still decide whether to restore the page, add a redirect, fix the internal link, update a campaign URL, or remove the source of the bad path.`),

    p(`The best recovery experience combines Arcade with clear navigation. The visitor should always have a direct way to return home, open search, visit pricing, contact support, view docs, open the dashboard, or continue to another important page.`),

    list([
      "Add a clear Home link.",
      "Add a useful Search or Docs link when the site has documentation.",
      "Add Support or Contact when the visitor may need help.",
      "Add Pricing, Dashboard, Product, or Account links when those routes matter to the business.",
      "Keep the recovery actions visible near the game.",
      "Do not make the game the only way forward."
    ]),

    p(`The right game depends on the website. A playful brand may use a faster or more expressive game. A serious business page may need a calmer game, more direct copy, and stronger recovery links. The best choice is the one that helps the visitor recover without making the website feel careless.`),

    table(
      ["Website type", "Arcade direction"],
      [
        ["Startup or product site", "Use a clear recovery layout with a game that feels modern and light."],
        ["Developer product", "Keep the copy direct and include docs, dashboard, or support links."],
        ["Storefront", "Keep product search, collections, cart, and support paths easy to reach."],
        ["Portfolio or brand site", "Use Arcade as a polished branded moment with simple return links."],
        ["Serious business site", "Use a calmer Arcade experience and keep recovery actions clear."]
      ]
    ),

    p(`When using Arcade as a website recovery surface, install it through the approved CavBot runtime or CDN loader. This keeps the public install cleaner and avoids copying the full game runtime directly into customer-facing source files when the production setup is meant to load the experience remotely.`),

    p(`After installing Arcade on a 404 route, open the live missing-page URL and test the experience as a visitor would. Confirm that the game loads, the controls work, the layout does not break on mobile, the recovery links are visible, and CavBot records the recovery context.`),

    table(
      ["After install", "What to verify"],
      [
        ["Game loads", "The selected Arcade experience appears on the live 404 page."],
        ["Controls work", "The visitor can play, reset, or continue without confusion."],
        ["Recovery links are visible", "The visitor has a clear way back to a useful route."],
        ["Mobile layout works", "The game does not crowd the page or hide buttons on small screens."],
        ["CavBot records context", "The recovery moment can be reviewed inside CavBot."],
        ["404 route still gets reviewed", "The team checks whether the missing path needs a redirect or repair."]
      ]
    ),

    p(`After launch, review 404 Recovery. Arcade improves the visitor experience, but 404 Recovery helps the team understand which broken routes are still happening, how often they appear, and whether the route deserves a fix.`),

    p(`A route that appears once may be a typo. A route that appears repeatedly may point to a real problem. It may be linked from a menu, old campaign, search result, email, social post, third-party page, or saved bookmark. Repeated 404s should be reviewed instead of ignored.`),

    table(
      ["404 pattern", "What it may mean"],
      [
        ["One random missing route", "A visitor may have typed the URL incorrectly."],
        ["Repeated missing product page", "A product route may have been moved or deleted without a redirect."],
        ["Repeated campaign path", "A campaign link may be wrong or outdated."],
        ["Old blog or docs route", "Content may have moved without a redirect."],
        ["Missing asset path", "An image, script, stylesheet, or file may be referenced incorrectly."],
        ["Many similar broken routes", "A site migration, slug change, or routing rule may need review."]
      ]
    ),

    p(`When 404 Recovery shows repeated activity, decide what the route deserves. Some routes should be redirected. Some should be restored. Some should be fixed at the source link. Some should remain as 404s if the path is invalid and not useful.`),

    list([
      "Redirect the route when the content moved to a new location.",
      "Restore the route when the page still matters.",
      "Fix the source link when the website is pointing visitors to the wrong URL.",
      "Update campaign URLs when ads, emails, or social posts are sending bad traffic.",
      "Leave the route as a 404 when it is clearly invalid and does not deserve a destination.",
      "Keep Arcade active when the missing-page experience should remain polished."
    ]),

    p(`Arcade and 404 Recovery work best together. Arcade protects the visitor experience in the moment. 404 Recovery helps the team understand what needs to be repaired after the visit happens.`),

    note("Recovery rule", "Arcade improves the broken-page experience, but the team should still fix repeated missing routes through redirects, restored pages, or corrected links."),

    p(`If Arcade does not appear on the live 404 page, check that the website was published, the correct recovery route is being tested, the Arcade loader is present, the browser is not blocking the asset, and the selected game is allowed for the workspace plan.`),

    table(
      ["Problem", "What to check"],
      [
        ["Arcade does not show", "Confirm the approved runtime or CDN loader is present on the live recovery page."],
        ["Wrong game appears", "Check the selected game in the CavBot Arcade or 404 recovery settings."],
        ["Game appears but controls fail", "Test the page in another browser and confirm scripts are not blocked."],
        ["Game crowds mobile layout", "Adjust the 404 page layout or choose a simpler recovery placement."],
        ["Recovery links are missing", "Add clear links back to useful pages."],
        ["Repeated broken route continues", "Review the route in 404 Recovery and decide whether to redirect, restore, or fix the source link."]
      ]
    ),

    p(`For developers, the 404 page should be treated like a real route. It should load reliably, work on mobile, include the approved Arcade loader, preserve recovery links, avoid blocking navigation, and send enough context for CavBot to understand that a recovery moment happened.`),

    p(`For owners and admins, the 404 page should be reviewed as part of site quality. A polished 404 page protects trust, but it does not remove the need to keep links, redirects, campaigns, and important routes clean.`),

    p(`For visitors, the experience should be simple. They reached a page that does not exist, but the site gives them a clear way forward. Arcade can make that moment feel less frustrating, but the recovery path should always stay obvious.`),

    table(
      ["Audience", "What Arcade should provide"],
      [
        ["Visitor", "A clear, low-friction way to recover from a missing page."],
        ["Owner", "A more polished 404 experience and a signal that the route needs review."],
        ["Developer", "A controlled recovery surface that can be installed, tested, and verified."],
        ["Support team", "A cleaner page to send visitors back from when links fail."],
        ["Marketing team", "A safer fallback when old campaign links still receive traffic."]
      ]
    ),

    p(`Arcade also supports product demos and team review. A founder, developer, designer, or support lead can open Arcade inside CavBot, play through the games, and decide which experience feels appropriate before it ever touches a production page.`),

    p(`Arcade should feel designed, not random. The game should match the page, the recovery links should be clear, and the visitor should understand how to leave the broken moment without friction.`),

    p(`When using Arcade only inside CavBot, no install is required. Open the Arcade, choose a game, and start playing. This is the simplest way to explore the full CavBot Arcade collection.`),

    p(`When using Arcade on a public 404 page, treat it like part of the website experience. Test it carefully, keep recovery actions visible, review 404 Recovery after launch, and repair any route that continues to receive meaningful traffic.`),

    note("Core rule", "Arcade should make broken moments feel intentional, but the real goal is recovery: help visitors continue, help teams see what happened, and help the website stay easier to trust.")
  ]
},

  {
  id: "brand-resources",
  title: "Brand resources",
  summary: "Use approved CavBot brand files and follow CavBot brand usage rules.",
  blocks: [
    p(`Brand resources are the approved CavBot files, marks, visuals, and usage guidance made available for public and product-facing use. These resources help keep CavBot’s identity consistent across websites, documents, product surfaces, press materials, demos, integrations, and partner references.`),

    p(`The approved CavBot brand resource location is brand.cavbot.io. Use that site as the primary source for CavBot marks, logotypes, product visuals, brand files, and brand guidance. When an approved CDN asset or documented brand resource exists, use that version instead of copying internal source files, screenshots, draft files, design exports, or private app assets into a public website.`),

    p(`CavBot brand assets should be treated as controlled brand materials. They may be used to identify CavBot, show that a website uses CavBot, present CavBot in a product integration, reference CavBot in documentation, or display approved trust and platform visuals. They should not be changed, distorted, misrepresented, or used in a way that creates confusion about CavBot, its ownership, its products, or its relationship to another company.`),

    table(
      ["Resource", "Approved use"],
      [
        ["CavBot marks", "Use approved logos and logotypes to identify CavBot clearly."],
        ["Product visuals", "Use approved product images or screenshots when showing CavBot in context."],
        ["CDN assets", "Use documented CDN badge, body, and product surfaces when available."],
        ["Press and media files", "Use approved files for articles, founder materials, demos, and public mentions."],
        ["Developer assets", "Use documented assets for integrations, embeds, badges, and installation surfaces."]
      ]
    ),

    p(`All public use of CavBot brand resources should be accurate. A CavBot mark should only appear where CavBot is actually being referenced, integrated, installed, discussed, documented, or represented. Do not use CavBot marks to suggest sponsorship, certification, partnership, approval, security review, or official endorsement unless CavBot has clearly granted that relationship.`),

    p(`When using CavBot marks publicly, keep the mark clear, readable, and aligned with approved brand usage. Do not stretch, compress, skew, recolor, crop, outline, rotate, add effects, place the mark inside a different shape, cover part of the mark, or place it on backgrounds that make it hard to read.`),

    list([
      "Use approved files from brand.cavbot.io.",
      "Use documented CDN assets when a CDN version exists.",
      "Keep CavBot marks clear and readable.",
      "Do not stretch, recolor, distort, crop, or modify the mark.",
      "Do not copy private source files into public websites.",
      "Do not imply partnership, certification, or endorsement without approval.",
      "Do not use CavBot brand assets in a misleading, harmful, or confusing way."
    ]),

    p(`The CavBot Badge, CavBot Body, Arcade surfaces, and other documented visual installs should be loaded through the approved CDN or runtime path when available. This keeps public installs cleaner, reduces version drift, and prevents teams from pasting internal implementation files into customer-facing websites.`),

    p(`Do not use internal CavBot source files as brand resources. Internal files may contain development paths, private naming, unfinished visuals, implementation details, or assets that were not approved for public use. Public brand usage should come from the brand site, approved CDN paths, or documented install snippets.`),

    note("Approved source", "Use brand.cavbot.io and documented CDN assets as the source of truth for public CavBot brand usage."),

    p(`CavBot brand resources may be used in documentation, integration pages, partner references, press materials, launch posts, product walkthroughs, customer implementation pages, and internal team materials when the use is clear, accurate, and respectful of the CavBot identity.`),

    table(
      ["Use case", "Guidance"],
      [
        ["Website integration", "Use approved badge or documented CavBot visual surfaces."],
        ["Documentation", "Use the CavBot name and approved marks when explaining an integration or workflow."],
        ["Press or media", "Use approved brand files and avoid editing the mark."],
        ["Product screenshots", "Use current visuals that accurately represent the product state."],
        ["Partner reference", "Only imply partnership if that relationship has been approved."],
        ["Internal decks", "Use approved assets so team materials stay consistent."]
      ]
    ),

    p(`Do not use CavBot brand resources in a way that damages trust, creates confusion, or presents CavBot as something it is not. Do not use the brand in connection with unlawful activity, deceptive products, impersonation, malware, spam, abusive automation, misleading claims, or products that falsely suggest CavBot is monitoring, securing, verifying, or approving something it does not actually support.`),

    p(`Do not combine CavBot marks with another company’s name, logo, icon, mascot, slogan, or product identity in a way that creates a new joint mark unless CavBot has approved that use. The CavBot mark should remain separate, recognizable, and clearly tied to CavBot.`),

    table(
      ["Do", "Avoid"],
      [
        ["Use the official CavBot files.", "Using screenshots, drafts, or private source exports as public assets."],
        ["Keep the mark readable.", "Placing the logo on busy, low-contrast, or unclear backgrounds."],
        ["Use the CDN badge when documented.", "Copying internal badge code into a public site."],
        ["Describe the integration accurately.", "Claiming CavBot endorsement without approval."],
        ["Keep CavBot visually separate from other marks.", "Creating a combined logo or fake partnership mark."],
        ["Review public pages after install.", "Publishing brand assets without checking placement and readability."]
      ]
    ),

    p(`When showing CavBot inside a product, do not make the brand appear larger than the actual relationship. If CavBot is installed as a badge, show it as a badge. If CavBot is used as an analytics, monitoring, recovery, or assistant layer, describe that role clearly. Do not present CavBot as the owner of another website, the operator of another company, or the final authority over a third-party service unless that is formally true.`),

    p(`When using screenshots, product previews, or interface visuals, make sure the image reflects a real or approved CavBot product state. Do not publish outdated, broken, misleading, unfinished, or private admin views unless they are clearly approved for that purpose.`),

    p(`Screenshots should not expose private data, user emails, API keys, workspace secrets, billing details, customer records, private project names, unreleased features, or internal staff tools. Redact sensitive information before using any CavBot product image publicly.`),

    list([
      "Check screenshots for private data before publishing.",
      "Remove API keys, emails, billing data, and customer details.",
      "Do not show private admin surfaces unless they are approved.",
      "Use current product visuals when possible.",
      "Avoid screenshots that misrepresent what CavBot currently offers."
    ]),

    p(`Brand resources should also be used with accessibility in mind. Marks should have enough contrast against the background. Text inside brand visuals should remain readable. Interactive brand placements should have clear labels, keyboard access, and a real destination or action when they are used as links or controls.`),

    note("Accessibility", "A decorative CavBot mark can stay visually quiet. An interactive CavBot mark must be clear, labeled, reachable by keyboard, and understandable to assistive technology."),

    p(`CavBot brand resources should not replace required legal, privacy, security, or support information. A CavBot Badge can show presence, but it should not be used as a substitute for clear terms, privacy notices, security pages, help links, status information, or customer support paths.`),

    p(`For developer installs, use generated snippets and documented CDN references whenever possible. Generated snippets reduce mistakes in asset paths, project keys, site IDs, placement, script order, and version handling. Manual asset use should be reserved for cases where the platform requires manual placement.`),

    table(
      ["Problem", "What to check"],
      [
        ["Logo looks stretched", "Use the original file and preserve its proportions."],
        ["Logo is hard to read", "Move it to a cleaner background or use an approved version with better contrast."],
        ["Badge does not match the docs", "Confirm the CDN path and install snippet are the documented version."],
        ["Asset looks outdated", "Return to brand.cavbot.io and download the current approved file."],
        ["Public page implies endorsement", "Rewrite the copy so the relationship is accurate."],
        ["Screenshot exposes private data", "Remove the image, redact the information, and republish only after review."]
      ]
    ),

    p(`If a use case is not clearly covered by the approved brand resources, use restraint. Do not invent new CavBot logos, unofficial color systems, unapproved mascots, altered icons, fake badges, partner seals, certification marks, or trust labels. If the public page needs a CavBot mark, use the approved asset closest to the purpose.`),

    p(`CavBot may update its brand resources over time. Logos, product visuals, CDN paths, badge styles, screenshots, and usage guidance may change as the platform grows. Teams should review brand assets before major launches, public announcements, integration releases, investor materials, or customer-facing documentation updates.`),

    p(`The safest rule is simple: use the approved CavBot asset, keep it clear, describe CavBot honestly, and do not modify the brand to fit a use that has not been approved.`),

    note("Core rule", "CavBot brand resources must stay approved, accurate, readable, and honest. Use the official source, preserve the mark, and do not imply a relationship CavBot has not granted.")
  ]
},


    ]
  },


  resources: {
    path: "/docs/resources",
    icon: "assets/icons/docs/image-combiner-svgrepo-com3.svg",
    label: "More docs",
   
    title: "More docs",
    description: "Find support, status, releases, and community information.",
    sections: [
     {
  id: "support",
  title: "Support",
  summary: "Get help with CavBot issues, access, billing, sites, snippets, and workspace behavior.",
  blocks: [
    p(`Support is the help path for CavBot issues that need review, troubleshooting, or account assistance. Use Support when something in the workspace is not working as expected, a teammate cannot access the right project, a site will not connect, a snippet fails verification, billing needs review, or a module shows an error that the team cannot resolve from the dashboard.`),

    p(`A strong support request explains what happened, where it happened, when it happened, and what the user was trying to do. The more exact the report is, the easier it is to review the issue without guessing. Support should not have to reconstruct the workspace state from a vague message.`),

    p(`Before sending a request, check the basics. Confirm the correct workspace is selected, the correct site is active, the user is signed into the expected account, the plan allows the feature, and the page has been refreshed after any recent change. Many access, install, and module issues come from a workspace mismatch, an old browser state, or the wrong site selection.`),

    table(
      ["Support area", "Use Support when"],
      [
        ["Account access", "A user cannot sign in, cannot reach the right workspace, or sees the wrong account state."],
        ["Workspace access", "A teammate cannot access the correct project, role, module, file, or setting."],
        ["Site connection", "A site will not connect, verify, publish activity, or match the expected origin."],
        ["Snippet install", "Analytics v5, SDK, badge, Arcade, or other runtime snippets do not load or verify."],
        ["Billing", "A plan, checkout, subscription, invoice, downgrade, upgrade, or payment state needs review."],
        ["Modules", "Console, 404 Recovery, Error Intelligence, A11y, CavAi, CavCode, CavCloud, CavSafe, or another surface shows unexpected behavior."]
      ]
    ),

    p(`A good support request should include the workspace name or project, the site origin, the route where the issue happened, the approximate time of the issue, the browser and device being used, and any request ID, error code, message, or screenshot that helps explain the problem.`),

    list([
      "Include the workspace or project affected by the issue.",
      "Include the site origin, such as https://example.com.",
      "Include the route where the problem happened.",
      "Include the approximate time of the issue.",
      "Include the browser, device, and operating system when relevant.",
      "Include any request ID, error code, warning, or visible message.",
      "Include screenshots only when they help explain the issue.",
      "Avoid sending passwords, API secrets, private keys, payment details, or private customer data."
    ]),

    p(`For site connection issues, include the public origin saved in CavBot and the public origin where the snippet is installed. These values must match the intended website. If the site was recently added, renamed, moved, or reconnected, mention that in the request.`),

    p(`For snippet issues, include the page where the snippet was installed, the type of snippet being used, and whether the issue appears in the browser console or network panel. Do not send private keys or secrets. If a project key appears in a public install snippet, include only what Support needs to identify the site and workspace.`),

    table(
      ["Issue type", "Details to include"],
      [
        ["Site will not verify", "Site origin, installed route, publish status, browser, and any verification message."],
        ["Analytics not appearing", "Site origin, install page, snippet type, time tested, and whether requests appear in the network panel."],
        ["Badge or visual asset missing", "Live URL, installed snippet, page placement, and whether the CDN asset loads."],
        ["Arcade or 404 recovery issue", "Missing route tested, selected game, plan, live URL, and whether recovery links appear."],
        ["CavAi or Caven issue", "Prompt goal, selected workspace or file, model or mode used, and what result looked wrong."],
        ["CavCode issue", "File path, action attempted, error shown, and whether the issue happens after refresh."],
        ["CavCloud or CavSafe issue", "File or folder name, action attempted, access role, and whether the item is protected or time-locked."],
        ["Billing issue", "Plan shown, action attempted, checkout or invoice state, and approximate time of the billing event."]
      ]
    ),

    p(`For access problems, confirm the user’s role before opening a support request. Some actions are owner-only. Some modules require Premium or Premium+. Some protected actions may require CavVerify or may be blocked by CavGuard until the right role, plan, or workspace state is present.`),

    p(`For billing problems, include what the user expected to happen and what CavBot shows now. Support should know whether the request is about upgrading, downgrading, checkout, subscription state, invoice review, payment failure, trial access, or a feature that appears locked after a plan change.`),

    p(`For storage issues, identify whether the file is in CavCloud or CavSafe. CavSafe has stricter access rules and may include owner-only access, integrity protection, time locks, snapshots, audit history, or plan-specific controls. A file that behaves differently in CavSafe may not be broken; it may be protected.`),

    note("Do not send secrets", "Never include passwords, private keys, payment card data, private customer records, authentication tokens, or sensitive production secrets in a support request."),

    p(`Screenshots can help when the issue is visual, confusing, or hard to describe. Before sending a screenshot, review it for private information. Remove or hide passwords, API keys, billing details, customer emails, private files, internal notes, and anything the support team does not need to see.`),

    p(`A support request should be specific enough for someone else to repeat the issue. Instead of saying “the site does not work,” explain which site, which route, what action was attempted, what happened, and what result was expected.`),

    table(
      ["Weak request", "Better request"],
      [
        ["My site is broken.", "The site https://example.com is not showing Analytics v5 activity after publishing the snippet on /pricing at about 3:20 PM."],
        ["CavAi gave a bad answer.", "CavAi was asked to summarize the selected 404 route, but it referenced the wrong site after switching workspaces."],
        ["The file will not open.", "The file /brand/launch.html in CavCloud opens a blank preview in HTML Viewer after the latest upload."],
        ["Billing is wrong.", "The workspace shows Premium locked after checkout completed, and the upgrade happened around 2:00 PM."],
        ["My teammate cannot access it.", "The invited admin can sign in but cannot open CavSafe files in the selected workspace."]
      ]
    ),

    p(`When reporting a problem that happens after a recent change, mention the change. This can include adding a site, rotating an API key, changing a plan, inviting a teammate, moving a file, changing a role, installing a snippet, publishing a website, restoring a file, or updating a protected setting.`),

    list([
      "Mention recent site changes.",
      "Mention recent role or invite changes.",
      "Mention recent billing or plan changes.",
      "Mention recent snippet installs or updates.",
      "Mention recent file moves, restores, or deletes.",
      "Mention recent API key rotation or origin allowlist changes."
    ]),

    p(`If an issue affects production, say that clearly. A production issue should include the live URL, the affected route, what users may be experiencing, and whether the issue blocks signups, checkout, contact forms, support, documentation, dashboard access, or other important user paths.`),

    p(`If the issue is urgent, keep the request focused. Start with the affected workspace, site, route, impact, and time. Add screenshots or extra context after the important facts are clear.`),

    table(
      ["Priority", "Example"],
      [
        ["High", "Production checkout, signup, login, dashboard access, site verification, or live recovery is blocked."],
        ["Medium", "A module, file preview, install check, teammate access, or report is not behaving as expected."],
        ["Low", "A question about setup, documentation, placement, plan limits, or best practice needs clarification."]
      ]
    ),

    p(`Support is not a replacement for workspace ownership. Owners and admins should still review roles, sites, files, plan access, audit history, risk controls, and installed snippets before escalating. A support request is strongest when the team has already checked the obvious causes and can explain what remains unclear.`),

    p(`After support responds, keep the same issue in the same thread when possible. Sending the same issue in multiple places can split the context and slow down review. If something changes, reply with the new detail, the time it changed, and whether the original problem is still happening.`),

    p(`When the issue is resolved, review the workspace state again. Confirm the site connects, the snippet verifies, the module loads, the teammate has the right access, the plan is correct, or the file opens as expected. If the fix affects a public website, test the live route after publishing.`),

    note("Best request", "Tell Support what happened, where it happened, when it happened, what you expected, and what changed recently. Keep private secrets out of the request."),

    p(`Use Support whenever the next step is no longer clear from the workspace itself. A clear request helps CavBot review the issue faster, protect sensitive information, and guide the user back to the correct surface without unnecessary back-and-forth.`)
  ]
},

      {
  id: "status",
  title: "Status",
  summary: "Check CavBot service health before changing workspace, site, or install settings.",
  blocks: [
    p(`Status is the CavBot service health surface. Use it to understand whether a problem is coming from CavBot itself, a connected CavBot service, a CDN asset, a workspace setting, a site install, or a local browser issue.`),

    p(`Check Status before making changes when multiple CavBot areas appear unavailable at the same time. If CavAi, CavCode, CavCloud, Analytics v5, the HTML Viewer, Arcade, or CDN-loaded assets are all behaving unexpectedly, the issue may not be your workspace configuration. Status helps you slow down and confirm the platform condition before changing keys, snippets, files, roles, or site settings.`),

    p(`The Status page can cover core CavBot surfaces such as CavBot Analytics v5, CavAi v3, CavTools, CavCode, CavCode Viewer, CavCloud, CavSafe, Arcade, CDN assets, authentication, billing, and related platform routes. It gives users a clearer place to check whether CavBot is operating normally or whether a known issue is already being reviewed.`),

    table(
      ["Status area", "What it helps you understand"],
      [
        ["CavBot app", "Whether the main CavBot platform is loading and responding normally."],
        ["Analytics v5", "Whether browser signals, route activity, and site events can reach CavBot."],
        ["CavAi v3", "Whether assistant responses, workspace context, models, and CavAi tools are available."],
        ["CavTools", "Whether developer inspection, command output, and workspace checks are working."],
        ["CavCode", "Whether the browser editor, file actions, diagnostics, and coding surface are available."],
        ["CavCode Viewer", "Whether HTML previews, mounted files, and rendered assets can be viewed correctly."],
        ["CavCloud", "Whether workspace files, folders, uploads, previews, sharing, and storage actions are working."],
        ["CavSafe", "Whether protected storage, owner-only access, locks, snapshots, and secure file actions are working."],
        ["Arcade", "Whether CavBot Arcade games and 404 recovery experiences are available."],
        ["CDN assets", "Whether badges, body visuals, Arcade loaders, SDK files, and public assets can load from the CDN."],
        ["Billing", "Whether checkout, subscriptions, upgrades, downgrades, and plan state updates are working."],
        ["Authentication", "Whether sign in, sessions, account access, and protected routes are working."]
      ]
    ),

    p(`Status is especially important when an issue looks larger than one page. A single broken snippet may be a local install problem. A single missing file may be a storage or permission issue. But several unavailable services at once can point to a wider incident, maintenance window, network problem, CDN delay, or platform-side issue.`),

    list([
      "Check Status before rotating API keys.",
      "Check Status before reinstalling snippets.",
      "Check Status before changing origin allowlists.",
      "Check Status before deleting and reconnecting a site.",
      "Check Status before assuming a file, module, or plan is broken.",
      "Check Status when several CavBot services appear unavailable at the same time."
    ]),

    p(`A healthy Status page does not mean every workspace is configured correctly. It means the CavBot services listed there are not currently reporting a known service-wide problem. If Status is healthy but your workspace still has an issue, continue troubleshooting the affected area directly.`),

    p(`If Status shows a known incident, avoid making unnecessary changes to your own configuration while the incident is active. Do not immediately replace snippets, rotate keys, delete sites, move files, change roles, or rebuild a working install unless the incident notes specifically ask for that action.`),

    table(
      ["Status condition", "What it means"],
      [
        ["Operational", "The service is expected to be working normally."],
        ["Degraded", "The service is available, but slower or less reliable than expected."],
        ["Partial outage", "Some users, routes, regions, or features may be affected."],
        ["Major outage", "A major service area is unavailable or severely affected."],
        ["Maintenance", "Work is planned or in progress and may affect availability."],
        ["Investigating", "The issue has been detected and CavBot is reviewing the cause."],
        ["Monitoring", "A fix or recovery step is in place and the service is being watched."],
        ["Resolved", "The incident has ended, but users should still verify their own workspace if needed."]
      ]
    ),

    p(`Use the incident history when a problem happened earlier. A service may be healthy now, but a past incident may explain why a signal was delayed, a page did not load, a checkout update took longer, or a CDN asset failed during a specific time window.`),

    p(`When reviewing an incident, compare the incident time with the time your issue happened. If the times match, the incident may explain the behavior. If the times do not match, continue troubleshooting the workspace, browser, site install, plan access, or affected module.`),

    table(
      ["If this is affected", "Review next"],
      [
        ["Analytics v5 is delayed or missing", "Check Integrations, Analytics v5, API Keys, Events, and the installed snippet."],
        ["A badge, body visual, SDK, or Arcade install does not load", "Check Assets, SDK, Arcade, CDN snippet placement, and browser console output."],
        ["CavAi does not respond correctly", "Check CavAi, Models, Assistant Memory, Agent Workflows, and workspace context."],
        ["Caven or CavCode has issues", "Check CavCode, Caven, CavTools, Cav Commands, and the active file or workspace."],
        ["HTML preview is wrong", "Check HTML Viewer, CavCloud, CavSafe, file paths, assets, and the selected file version."],
        ["A file cannot be opened or moved", "Check CavCloud, CavSafe, permissions, plan access, locks, and audit history."],
        ["A protected action is blocked", "Check Security, CavVerify, CavGuard, Risk Controls, roles, and plan access."],
        ["Billing or plan access looks wrong", "Check Billing, plan state, checkout history, and Support if the state does not update."],
        ["A user cannot access the right workspace", "Check roles, invites, authentication, workspace selection, and Support."]
      ]
    ),

    p(`Status should be part of the first review step, not the last one. It can save time by showing whether the platform is already aware of a wider issue. It also helps prevent unnecessary changes that can make a clean workspace harder to diagnose.`),

    p(`For example, if Analytics v5 stops showing new activity across several sites, check Status before reinstalling the script. If CDN badges disappear on multiple pages, check Status before rewriting the asset placement. If CavAi, CavCode, and CavCloud all feel unavailable, check Status before assuming the workspace is broken.`),

    note("Before changing configuration", "If Status shows an active incident for the affected service, wait for the next update before making major workspace, snippet, key, file, or site changes."),

    p(`If Status is operational and the issue only affects one workspace, one site, one file, one browser, one route, or one user, the next step is focused troubleshooting. Open the docs for the affected area and verify the configuration there.`),

    list([
      "Use Integrations when a snippet, SDK, badge, or Analytics v5 install needs review.",
      "Use Security when a protected action, role, CavVerify step, or CavGuard decision needs review.",
      "Use Developer tools when CavCode, CavTools, Cav Commands, or HTML Viewer needs review.",
      "Use Storage docs when CavCloud or CavSafe files, folders, locks, previews, or permissions need review.",
      "Use Billing docs when plan access, checkout, upgrades, downgrades, or invoices need review.",
      "Use Support when Status is healthy but the issue remains unclear after focused troubleshooting."
    ]),

    p(`When contacting Support about a Status-related issue, include the affected service, the workspace, the site origin, the route or file involved, the approximate time of the issue, and whether Status showed an incident at that time.`),

    table(
      ["Support detail", "Why it matters"],
      [
        ["Affected service", "Shows whether the issue belongs to CavAi, Analytics, CavCode, CavCloud, Arcade, billing, or another area."],
        ["Workspace", "Helps identify the correct project and account context."],
        ["Site origin", "Helps compare the issue against the saved CavBot site and installed public website."],
        ["Route or file", "Shows the exact place where the problem appeared."],
        ["Time of issue", "Allows comparison with incident history or service updates."],
        ["Error or request ID", "Helps trace the specific failure when available."],
        ["Status condition seen", "Shows whether the user already checked for a known incident."]
      ]
    ),

    p(`Status should be treated as a source of truth for current CavBot service health, but not as the only troubleshooting tool. It tells you whether a wider CavBot service problem is known. It does not replace workspace checks, install checks, browser checks, plan checks, or permission review.`),

    p(`A good workflow is simple: check Status, read any active incident, avoid unnecessary configuration changes, then continue with the focused docs if the service is healthy. If the issue is still unclear, open Support with the details needed for a clean review.`),

    note("Core rule", "Check Status before making major changes. If CavBot is already reporting an incident, wait for the service update. If Status is healthy, troubleshoot the affected workspace area directly.")
  ]
},

     {
  id: "releases",
  title: "Releases",
  summary: "Follow CavBot product changes, updates, fixes, and required user actions.",
  blocks: [
    p(`Releases explain what changed in CavBot and what users may need to review after an update. Use this section to understand new features, product improvements, interface changes, plan updates, security changes, storage updates, billing changes, integration updates, and fixes that may affect how a workspace behaves.`),

    p(`A release note should help users answer three simple questions: what changed, why it matters, and whether they need to do anything. Some updates are quiet improvements that require no action. Other updates may require users to review a setting, update an installed script, check a connected site, confirm a plan change, or verify that a workflow still behaves as expected.`),

    p(`Read release notes whenever CavBot changes in a way that may affect your workspace, your website, your team, your files, your billing state, your developer tools, or your protected actions. Release notes are especially useful after larger updates because they give owners and admins a clear place to review what changed before assuming something is broken.`),

    table(
      ["Release detail", "What to look for"],
      [
        ["What changed", "The feature, fix, setting, page, workflow, or product behavior that was updated."],
        ["Who is affected", "Whether the change applies to all users, specific plans, workspace owners, admins, members, or certain install types."],
        ["Action required", "Whether the user needs to update anything, review a setting, reconnect a site, publish again, or verify behavior."],
        ["Plan impact", "Whether the update changes what Free, Premium, or Premium+ users can access."],
        ["Workspace impact", "Whether the change affects roles, permissions, protected actions, files, storage, reports, or team workflows."],
        ["Website impact", "Whether the change affects installed scripts, public pages, badges, recovery pages, tracking, or connected site behavior."],
        ["Known limits", "Anything that is still being improved, rolled out gradually, or not available to every workspace yet."]
      ]
    ),

    p(`When reading a release, start with the parts that affect your own workspace. If the update mentions plans, confirm your current plan. If it mentions installed website code, confirm the live site is using the current install instructions. If it mentions roles or protected actions, confirm the right people still have the correct access. If it mentions storage or files, confirm important files still open, preview, move, and restore as expected.`),

    list([
      "Review the release summary first.",
      "Check whether the update affects your plan.",
      "Check whether the update affects your workspace role or permissions.",
      "Check whether any site install instructions changed.",
      "Check whether connected websites need to be republished.",
      "Check whether important files, reports, or modules still behave correctly.",
      "Follow any required action listed in the release note."
    ]),

    p(`For small releases, a quick review may be enough. For larger releases, owners and admins should open the workspace and confirm that the most important areas still behave correctly. This may include the selected site, installed scripts, team access, storage, billing state, reports, security settings, and any public website surface connected to CavBot.`),

    p(`A release note is not the same as a support ticket or an incident notice. A release note explains a planned product change or completed improvement. A support ticket is used when your workspace has a specific problem. An incident notice is used when a CavBot service has an active service-health issue.`),

    table(
      ["If you are trying to understand", "Use"],
      [
        ["What changed in CavBot", "Releases"],
        ["Whether CavBot services are currently healthy", "Status"],
        ["Why your workspace has a specific issue", "Support"],
        ["How to use a feature", "Docs"],
        ["Whether a protected action was blocked", "Security and audit history"],
        ["Whether a plan gives access to a feature", "Billing and plan details"]
      ]
    ),

    p(`After a larger release, test the paths that matter most to your workspace. Sign in, open the active workspace, confirm the selected site, review important settings, open a few key modules, check public website installs if needed, and confirm that owner-only or protected actions still behave as expected.`),

    list([
      "Open the workspace after the update.",
      "Confirm the correct site is selected.",
      "Review important settings if the release mentions configuration changes.",
      "Check installed website code if the release mentions public site behavior.",
      "Verify billing or plan access if the release mentions plans.",
      "Review team access if the release mentions roles or permissions.",
      "Contact support if the release says the feature is available but your workspace does not reflect it."
    ]),

    p(`Some releases may roll out gradually. If a release note says a feature is being released in stages, it may not appear in every workspace at the same time. Wait for the rollout window described in the note before treating the missing feature as an error.`),

    p(`If a release requires action, complete the action carefully and verify the result. Do not rotate keys, reinstall scripts, delete sites, change roles, or move files unless the release note clearly says that step is needed for your workspace.`),

    note("Release review", "For major updates, review your workspace before making changes. Confirm what changed, check whether action is required, and only update settings or installs when the release note calls for it."),

    p(`Use release notes as a steady record of CavBot’s progress. They help teams understand what improved, what changed, what needs attention, and how to keep the workspace clean after product updates.`)
  ]
},

     {
  id: "community",
  title: "Community",
  summary: "A planned CavBot space for shared learning, questions, and product updates.",
  blocks: [
    p(`CavBot Community is a planned space for CavBot users, builders, teams, and early customers to learn from one another as the platform grows. It is intended to become a place for setup guidance, product conversation, shared workflows, release discussions, feature feedback, and practical examples from real CavBot workspaces.`),

    p(`The community is not fully open yet. CavBot is preparing this surface carefully so it can feel useful from the beginning instead of becoming a loose message board with scattered answers. The goal is to create a clear, organized space where users can find help, understand product patterns, and follow the direction of the platform.`),

    p(`When available, the community will support shared learning around CavBot setup, site connections, workspace organization, docs improvements, product usage, recovery patterns, developer workflows, and common questions from teams using CavBot in real projects.`),

    table(
      ["Community area", "Purpose"],
      [
        ["Setup patterns", "Share how users connect sites, organize workspaces, and prepare CavBot for real websites."],
        ["Product questions", "Ask practical questions about CavBot features, pages, tools, and workflows."],
        ["User examples", "Show how teams are using CavBot across websites, docs, storage, code, recovery, and support flows."],
        ["Feature feedback", "Give CavBot clearer insight into what users need, what feels confusing, and what should improve next."],
        ["Release discussion", "Help users understand larger product changes after release notes are published."],
        ["Learning resources", "Collect guides, walkthroughs, examples, and recommended setup practices in one place."]
      ]
    ),

    p(`Community will be designed for learning and product conversation. It should help users understand CavBot more clearly, see how others are using it, and discover better ways to set up their own workspace.`),

    p(`Until the community is live, users should continue using the main support and status paths for important issues. A planned community page can tell users what is coming, but it should not replace the current help flow for account access, billing questions, service health, security concerns, workspace problems, or production-related issues.`),

    list([
      "Use Support for account, billing, workspace, access, and production issues.",
      "Use Status to check whether CavBot services are healthy.",
      "Use Docs for setup instructions and product guidance.",
      "Use Releases to follow product updates and required actions.",
      "Use Community, once available, for shared learning, examples, questions, and product conversation."
    ]),

    p(`The community should stay practical. Good community posts should include the product area, the workspace context, the goal, what was tried, and what kind of answer would be helpful. Clear questions make it easier for other users and the CavBot team to respond with useful guidance.`),

    p(`CavBot Community should also protect user trust. Users should not post passwords, private keys, payment information, sensitive customer data, private files, confidential contracts, or anything that should only be handled through private support.`),

    note("Coming soon", "CavBot Community is planned as a shared learning space. Until it is officially available, use Support for workspace-specific help and Status for service health."),

    p(`This section exists so users know that a CavBot community space is part of the product direction. As CavBot grows, the community will become another way for users to learn, compare workflows, share feedback, and follow the platform’s evolution.`)
  ]
}

    ]
  }
};


function integrationBlocks(name, when, placement, mistakes, platformGuidance, verificationChecks, troubleshootingRows) {
  return [
    p(`${name} installation connects a published website to CavBot. After the CavBot snippet is installed correctly, CavBot can receive page activity, route activity, browser error context, page metadata snapshots, accessibility snapshots, 404 recovery context, and other supported website signals for the saved site profile.`),

    p(`Use this integration when the website is already built or managed in ${name} and you want CavBot to monitor the public site from the visitor side. The goal is to install CavBot once in the correct shared location, publish the website, visit the live domain, and confirm that the matching CavBot site begins receiving activity.`),

    p(`Before installing anything, confirm the website origin. The origin is the public domain CavBot uses to match the website to the saved site profile. For example, https://example.com and https://www.example.com are different origins. A staging domain, preview domain, app subdomain, and storefront domain may also be different origins.`),

    table(
      ["Setup item", "What to confirm"],
      [
        ["CavBot site", "The saved site origin matches the public website you are about to test."],
        ["Project key", "The snippet belongs to the correct CavBot workspace project."],
        ["Site ID", "The snippet points to the correct saved site profile."],
        ["Public domain", "The domain you visit in the browser is the same domain CavBot expects."],
        ["API key access", "The key allows the origin where the snippet is installed."],
        ["Publish state", "The website has been published after the snippet was added."]
      ]
    ),

    p(`When to use it: ${when}`),

    p(`Where to paste the snippet: ${placement}`),

    p(platformGuidance),

    p(`Install CavBot in the shared area that loads across the pages you want to monitor. For most websites, this means the global footer, body area, shared theme layout, project custom-code field, root layout, or platform-wide code injection area. Avoid installing the same base snippet in multiple places unless the platform requires separate templates and you understand the result.`),

    note("Install rule", "Use one clean global install first. Add page-specific badges, widgets, or Arcade recovery surfaces only after the base CavBot signal is verified."),

    p(`A clean install has two parts. First, the configuration values must be present so CavBot knows which project and site the page belongs to. Second, the CavBot runtime script must load after those values. If the runtime loads before the configuration, CavBot may not know where to send the activity.`),

    table(
      ["Install step", "What to do"],
      [
        ["1. Confirm the site", "Open CavBot and verify the saved site origin before touching the website."],
        ["2. Copy the generated snippet", "Use the snippet generated by CavBot for the selected site."],
        ["3. Paste into the shared location", "Use the platform-wide code area or shared layout for the pages CavBot should monitor."],
        ["4. Publish or deploy", "Save changes and publish the website so the snippet appears on the live page."],
        ["5. Visit the public site", "Open the live domain in a browser and visit real routes."],
        ["6. Check CavBot", "Return to CavBot and confirm activity appears under the matching site profile."]
      ]
    ),

    p(`Do not rely on editor previews alone. Many website platforms show a preview that is not the same as the public site. CavBot should be verified from the live page visitors actually reach. If you also want to test staging or preview domains, save or allow those origins intentionally.`),

    list([
      "Install the generated CavBot snippet exactly as provided.",
      "Keep the configuration values before the runtime script.",
      "Install the base signal once in the shared layout or global code area.",
      "Publish or deploy after adding the snippet.",
      "Visit the public website in a real browser after publishing.",
      "Check CavBot under the same site profile and origin.",
      "Do not duplicate the base snippet across multiple templates unless required."
    ]),

    p(`Common mistakes: ${mistakes}`),

    p(`After publishing, test the website like a visitor. Open the public domain, move through a few real pages, and trigger the kind of activity you expect CavBot to understand. For a marketing site, visit the homepage, pricing page, product page, contact page, and docs page if they exist. For a storefront, visit product, collection, cart, and support pages. For 404 recovery, open a known missing route and confirm the recovery page behaves correctly.`),

    p(`What to verify after installation:`),

    list(verificationChecks),

    p(`If CavBot does not show activity, inspect the live page source first. Confirm that the snippet appears on the public page, the configuration values are correct, the runtime script loads after the configuration, the browser is not blocking the request, the API key is active, and the saved CavBot site origin matches the live domain.`),

    table(
      ["Problem", "What to check"],
      troubleshootingRows
    ),

    p(`If only some pages appear in CavBot, the snippet may be installed in a page-specific area instead of the shared site layout. Move the base install to the platform-wide location when the whole site should be monitored. Use page-level installs only when the team intentionally wants CavBot on a smaller set of pages.`),

    p(`If activity appears under the wrong site, review the project key, site ID, public site ID, and saved origin in the snippet. A copied snippet from another workspace or another site can make the install look broken even when the script is technically loading.`),

    p(`If the site was recently moved, redesigned, or migrated, verify the domain again. A platform may keep old preview domains, staging URLs, www and non-www versions, or app subdomains active at the same time. CavBot needs the domain that matches the website being reviewed.`),

    table(
      ["After install, open", "Reason"],
      [
        ["Dashboard", "Confirm the selected site is the one receiving activity."],
        ["Routes", "Confirm real page paths are appearing under the saved site."],
        ["Errors", "Check whether browser issues appear after the snippet is live."],
        ["SEO", "Review whether page metadata snapshots are being collected."],
        ["A11y", "Review accessibility snapshots for important pages."],
        ["404 Recovery", "Confirm missing routes and recovery behavior when testing 404 pages."]
      ]
    ),

    p(`For teams, the safest pattern is simple: install once, publish, visit the live site, confirm activity, then add optional surfaces. Do not start with every badge, widget, Arcade install, and custom surface at the same time. Base signal verification should come first.`),

    note("Verification rule", "The public site origin, the saved CavBot site origin, the snippet site ID, and the API key allowlist must agree before CavBot can reliably connect activity to the right site."),

    p(`Once the base install is verified, continue with Website signals to review activity, Assets to add badges or visual surfaces, Arcade to configure 404 recovery, and Security to review API keys, origins, and protected workspace controls.`)
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
  if ((path === "/docs" || path === "/docs.html") && hashId && docs[hashId]) return hashId;
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
      leftNav.innerHTML = '<div class="docs-nav-group" data-docs-nav-section="' + route + '">' +
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
      prose.innerHTML = "";
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
    if (docs[id]) {
      const route = id;
      const cat = categoryForRoute(route);
      if (body.getAttribute("data-docs-route") !== route) renderArticle(route);
      setActive(cat.sections[0].id);
      if (replace && window.history) {
        window.history.replaceState(null, "", "/docs.html#" + route);
      }
      if (shouldScroll) {
        const target = document.querySelector(".docs-article-header") || document.querySelector(".docs-article");
        if (target) {
          const top = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - headerOffset());
          window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
        }
      }
      syncExternalDocLinks();
      return;
    }

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
    const route = pathToRoute[parsedPath] || ((parsedPath === "/docs" || parsedPath === "/docs.html") && hashId ? docs[hashId] ? hashId : sectionToRoute[hashId] : "");
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
