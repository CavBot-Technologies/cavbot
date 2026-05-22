# Introduction to CavBot

> Documentation Index
> Fetch the complete documentation index at: https://cavbot.io/docs/llms.txt
> Use this file to discover available CavBot pages before exploring further.

CavBot is a website intelligence platform for teams that need clearer visibility after launch. It connects your website, reads production signals, and helps you understand what broke, what changed, and what needs attention next.

Websites are no longer static pages. They are live systems made of routes, scripts, search visibility, user sessions, forms, dashboards, embedded tools, and production behavior. CavBot gives those systems a command layer.

Once a website is connected, CavBot can begin organizing signals around the site profile: broken routes, JavaScript errors, SEO structure, accessibility snapshots, route behavior, and workspace context.

CavBot does not replace your analytics stack. It sits beside it as an operational intelligence layer: a place to see what needs attention, understand why it matters, and move toward the next action.

## Overview

CavBot helps you monitor and understand a website after it is live. The first setup flow is simple:

1. Create your CavBot account.
2. Add your website as a site profile.
3. Install the CavBot Analytics v5 snippet.
4. Open the dashboard and confirm signals are arriving.
5. Use CavAi, reports, and modules to understand what needs attention.

Every website belongs to a workspace, and every workspace can contain one or more site profiles. A site profile represents a real website origin, such as `https://example.com`.

Use CavBot when the website is important enough that broken pages, weak metadata, route loops, or client-side errors should not sit unseen. It is built for post-launch work: the practical stage where a site has real visitors, real routes, and real consequences when something breaks.

## How CavBot works

CavBot starts with a site profile. The profile gives CavBot a stable place to organize signals from the website. After the snippet is installed, CavBot can receive events from the browser and connect them to the selected project and site.

- Workspace: the command center for a project or team.
- Site: the website origin CavBot watches.
- Snippet: the browser-side Analytics v5 script installed on the website.
- Signals: events and snapshots CavBot uses to understand the site.
- Modules: focused views for errors, SEO, routes, accessibility, reports, and site operations.

The site profile is the anchor. The Analytics v5 snippet sends browser-side activity to CavBot, including page visits, route changes, runtime errors, and selected context about the active site. CavBot stores those signals under the workspace and connects them to modules such as Dashboard, Errors, Routes, SEO, A11y, Reports, and 404 Control Room.

## Choose an entrypoint

If you are setting up CavBot for the first time, start with the account, then add the website, then install the snippet. Do not start with reports or CavAi until the workspace has a real site profile.

If you already have a workspace and a saved site, jump directly to the snippet. After the first browser visit, open the dashboard and confirm the selected site is receiving signals.

## Core concepts

- Workspace: the main container for a project, company, or team using CavBot.
- Site profile: a saved website origin connected to a workspace.
- Primary site: the main website CavBot opens first when a workspace has multiple sites.
- Signal: a browser, route, SEO, accessibility, or runtime event CavBot can use for intelligence.
- Analytics v5: the CavBot browser-side signal layer installed on a website.
- CavAi: the assistant layer that can use CavBot context to explain signals and guide next actions.

## Create your account

Your CavBot account gives you access to the app, workspaces, sites, reports, and CavAi features. Use an email address you can keep long term, especially if the workspace will belong to a business or team.

1. Go to the CavBot app.
2. Create an account or sign in.
3. Complete the required profile information.
4. Open the default workspace.
5. Confirm that you can access the Command Center.

Keep ownership access tied to the founder, company owner, or primary technical lead. Team members can be invited later from workspace settings.

## Add your first website

A site profile tells CavBot which website belongs to the workspace. Use the public origin of your website, not a random route.

Correct examples:

```text
https://example.com
https://www.example.com
https://app.example.com
```

Avoid adding full paths as the main site origin:

```text
https://example.com/pricing
https://example.com/blog/post-name
https://example.com?ref=test
```

After the site is saved, CavBot can use it across dashboards, reports, route intelligence, SEO checks, error views, and CavAi workspace context.

## Install the snippet

The Analytics v5 snippet connects your live website to CavBot. Install it near the end of the page body or through the custom code area of your website platform.

```html
<script>
  window.CAVBOT_API_URL = "https://app.cavbot.io/api/embed/analytics";
  window.CAVBOT_PROJECT_KEY = "YOUR_PROJECT_KEY";
  window.CAVBOT_SITE_ID = "YOUR_SITE_ID";
</script>
<script src="/cavai/cavai-analytics-v5.js" defer></script>
```

Replace `YOUR_PROJECT_KEY` and `YOUR_SITE_ID` with the values shown in your CavBot workspace.

## Launch checklist

- Your account is created and you can sign in.
- Your workspace exists and opens correctly.
- Your website origin is saved as a site profile.
- Your primary site is selected.
- The Analytics v5 snippet is installed on the website.
- You visited the website after installing the snippet.
- The dashboard shows the selected site.
- Initial signals are visible or the empty state clearly explains what to do next.

## CavBot Analytics v5

CavBot Analytics v5 is the browser-side signal layer for CavBot. It connects a live website to a CavBot site profile so the platform can understand page visits, route changes, runtime errors, recovery moments, and the basic context needed to review site health.

It identifies the CavBot project and site that should receive website signals, sends browser-side route activity, and supports dashboard, routes, reports, 404 recovery, and CavAi workspace context.

After installing the snippet, open the website, visit a few important routes, then return to CavBot and confirm the dashboard is receiving signals.

## Events

Events are named actions that help CavBot understand what happened on the website beyond a page view. Use them for moments your team cares about: form submissions, checkout starts, pricing clicks, sign-up attempts, recovery actions, or feature interactions.

Use short, stable event names such as `signup_started`, `pricing_cta_clicked`, or `checkout_opened`. Add only the context needed to understand the action later. Do not send passwords, payment details, private messages, or sensitive customer data.

## Summary

Summary is the read layer for current CavBot results. It gives a compact view of the selected site, including dashboard state, route health, recent issues, and operational context CavBot has already organized.

Use summaries to check whether a site is receiving signals, review current concerns, and give CavAi or internal tools the current site context before answering a question.

## CavAi v3

CavAi v3 is the assistant layer inside CavBot. It helps explain website signals, summarize workspace context, draft next steps, and answer questions about the site or project without forcing the team to read every raw signal first.

Ask clear questions with the site and goal in mind, such as “Summarize the current issues for this site and tell me what to check first.”

## Assistant memory

Assistant memory is the project context CavAi can use when responding. It helps the assistant remember stable facts about a workspace, such as the site purpose, important routes, team preferences, and recurring operational concerns.

Do not store passwords, private keys, payment data, sensitive customer information, or temporary details that will become wrong quickly.

## Agent workflows

Agent workflows are repeatable tasks that use CavBot context to help with site operations. They are useful for weekly site health summaries, broken route reviews, SEO checks, 404 recovery summaries, and launch checklist reviews.

A good workflow has a clear input, a clear output, and a clear stopping point. Sensitive actions should still be confirmed by a person.

## 404 Arcade

404 Arcade gives a broken page a better recovery moment. Instead of leaving visitors on a dead end, a site can show an interactive game or recovery surface while guiding the visitor back to a useful route.

It is not a replacement for fixing broken links. It is a recovery layer for visitors who still reach a missing page.

## CavBot Badge

The CavBot Badge is a compact trust marker that can appear on a website when CavBot is connected. Use it in low-friction places such as a footer, support surface, status area, or bottom corner.

## CavBot Head

CavBot Head is a compact visual component for product moments where a small CavBot presence is useful, such as dashboard empty states, setup confirmation screens, and help surfaces.

## CavBot Body

CavBot Body is the larger CavBot visual presence for guided product moments. Use it for onboarding, launch states, recovery screens, or branded support moments where the visitor needs orientation.

## Go deeper

- Review error tracking.
- Read Analytics v5 docs.
- Use the Command Center.
- Open 404 Control Room.
- Use CavAi with workspace context.
