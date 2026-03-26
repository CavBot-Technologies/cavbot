 // GLOBAL CTA BUTTONS (turn “buttons” into real links without changing system CSS)
    (function () {
      var ctas = document.querySelectorAll('[data-cta-href]');
      if (!ctas.length) return;
      ctas.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var href = btn.getAttribute('data-cta-href');
          if (href) window.location.href = href;
        });
      });
    })();

    // HELP FILTERS + SEARCH (grid + popular list + suggestions) + dropdown sync
    (function () {
      const filterButtons = document.querySelectorAll('[data-help-filter]');
      const filterSelect = document.getElementById('help-filter-select');
      const cards = document.querySelectorAll('.topic-card');
      const searchInput = document.getElementById('help-search-input');
      const suggestions = document.getElementById('search-suggestions');
      const popularItems = document.querySelectorAll('#help-popular-list .popular-item');

      function setActiveFilter(filter) {
        filterButtons.forEach(function (b) {
          const isMatch = (b.getAttribute('data-help-filter') === filter);
          b.classList.toggle('is-active', isMatch);
          b.setAttribute('aria-selected', isMatch ? 'true' : 'false');
        });
        if (filterSelect) filterSelect.value = filter;
      }

      function getActiveFilter() {
        if (filterSelect) {
          return filterSelect.value || 'all';
        }
        const active = document.querySelector('.btn-chip.is-active');
        return active ? active.getAttribute('data-help-filter') : 'all';
      }

      function applyFilters() {
        const filter = getActiveFilter();
        const q = (searchInput && searchInput.value ? searchInput.value : '').toLowerCase().trim();

        cards.forEach(function (card) {
          const category = card.getAttribute('data-help-category') || '';
          const searchText = (card.getAttribute('data-help-search') || '').toLowerCase();
          const titleText = (card.querySelector('.topic-title')?.textContent || '').toLowerCase();

          const matchesFilter = (filter === 'all') || (category === filter);
          const matchesSearch = !q || searchText.includes(q) || titleText.includes(q);

          card.classList.toggle('is-hidden', !(matchesFilter && matchesSearch));
        });

        popularItems.forEach(function (item) {
          const s = (item.getAttribute('data-search') || '').toLowerCase();
          item.style.display = (!q || s.includes(q)) ? '' : 'none';
        });
      }

      function closeSuggestions() {
        if (!suggestions) return;
        suggestions.classList.remove('is-open');
        if (searchInput) searchInput.setAttribute('aria-expanded', 'false');
        suggestions.innerHTML = '';
      }

      function openSuggestions() {
        if (!suggestions) return;
        suggestions.classList.add('is-open');
        if (searchInput) searchInput.setAttribute('aria-expanded', 'true');
      }

      function buildSuggestions() {
        if (!searchInput || !suggestions) return;
        const q = (searchInput.value || '').toLowerCase().trim();

        if (!q || q.length < 2) {
          closeSuggestions();
          return;
        }

        const pool = [];

        cards.forEach(function (card) {
          const title = card.querySelector('.topic-title') ? card.querySelector('.topic-title').textContent.trim() : 'Topic';
          const cat = (card.getAttribute('data-help-category') || 'topic').replace('-', ' ');
          const searchText = (card.getAttribute('data-help-search') || '').toLowerCase();
          if (searchText.includes(q) || title.toLowerCase().includes(q)) {
            pool.push({ title: title, tag: cat.toUpperCase(), href: '#topic-grid' });
          }
        });

        popularItems.forEach(function (item) {
          const title = item.querySelector('.popular-title') ? item.querySelector('.popular-title').textContent.trim() : 'Answer';
          const cat = item.querySelector('.popular-cat') ? item.querySelector('.popular-cat').textContent.trim() : 'POPULAR';
          const s = (item.getAttribute('data-search') || '').toLowerCase();
          const link = item.querySelector('a') ? item.querySelector('a').getAttribute('href') : '#topic-grid';
          if (s.includes(q) || title.toLowerCase().includes(q)) {
            pool.push({ title: title, tag: cat.toUpperCase(), href: link || '#topic-grid' });
          }
        });

        const top = pool.slice(0, 6);
        if (!top.length) {
          closeSuggestions();
          return;
        }

        suggestions.innerHTML = top.map(function (x) {
          return (
            '<div class="suggestion-item" role="option" data-href="' + x.href + '">' +
              '<span class="suggestion-tag">' + x.tag + '</span>' +
              '<span class="suggestion-title">' + x.title + '</span>' +
            '</div>'
          );
        }).join('');

        openSuggestions();

        suggestions.querySelectorAll('.suggestion-item').forEach(function (row) {
          row.addEventListener('click', function () {
            const href = row.getAttribute('data-href') || '#topic-grid';
            closeSuggestions();
            window.location.hash = href.replace('#', '');
          });
        });
      }

      filterButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          const filter = btn.getAttribute('data-help-filter') || 'all';
          setActiveFilter(filter);
          applyFilters();
        });
      });

      if (filterSelect) {
        filterSelect.addEventListener('change', function () {
          const filter = filterSelect.value || 'all';
          setActiveFilter(filter);
          applyFilters();
        });
      }

      if (searchInput) {
        searchInput.addEventListener('input', function () {
          applyFilters();
          buildSuggestions();
        });

        searchInput.addEventListener('blur', function () {
          setTimeout(closeSuggestions, 120);
        });

        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') closeSuggestions();
        });
      }

      setActiveFilter('all');
      applyFilters();
    })();

    function setModalLock(nextLocked) {
      document.documentElement.classList.toggle('modal-open', !!nextLocked);
      document.body.classList.toggle('modal-open', !!nextLocked);
    }

    function anyHelpModalOpen() {
      return !!document.querySelector('.topic-modal.is-open, .faq-modal.is-open');
    }

    // TOPIC MODAL — “mini-epub” reader behavior (scroll panel + progress + focus trap)
    (function () {
      const modal = document.getElementById('topic-modal');
      const backdrop = modal ? modal.querySelector('.topic-modal-backdrop') : null;
      const closeBtn = modal ? modal.querySelector('.topic-modal-close') : null;

      const titleEl = document.getElementById('topic-modal-title');
      const subtitleEl = document.getElementById('topic-modal-subtitle');
      const contentEl = document.getElementById('topic-modal-content');
      const progressBar = document.getElementById('topic-modal-progress-bar');

      if (!modal || !titleEl || !contentEl) return;

      let lastFocus = null;

      const TOPICS = {
        "connect-guide": {
          title: "Connect your first project surface",
          subtitle: "A calm, minimal rollout: one route, clean signal, fast proof.",
          body: `
            <div class="reader">
              <div class="reader-kicker">Overview</div>
              <p>
                This guide connects CavBot to a single high-value journey — not everything at once.
                The goal is to produce <strong>clean, readable signal</strong> in Command Center within the first session.
              </p>

              <div class="reader-block">
                <h3>What you’ll need</h3>
                <ul class="reader-list reader-checklist">
                  <li>Your primary domain and deployment environment (prod first).</li>
                  <li>One route that matters (checkout, signup, booking, request-form).</li>
                  <li>Access to where you can paste one script or enable one integration.</li>
                </ul>
              </div>

              <hr>

              <h3>Step 1 — choose the “first monitored” route</h3>
              <p>
                Pick a route that has real cost if it fails. Don’t start with a blog page. Start with a journey.
                If you’re unsure, pick the route that your business would miss tomorrow.
              </p>

              <div class="reader-block">
                <div class="reader-kicker">Examples</div>
                <ul class="reader-list">
                  <li><strong>/checkout</strong> or <strong>/cart</strong> (revenue)</li>
                  <li><strong>/signup</strong> or <strong>/start</strong> (activation)</li>
                  <li><strong>/book</strong> or <strong>/contact</strong> (lead flow)</li>
                </ul>
              </div>

              <h3>Step 2 — connect CavBot to the surface</h3>
              <p>
                Install once. Verify once. Avoid stacking scripts during onboarding.
                If you already ship <strong>cavbot-analytics.js</strong> site-wide, you’re usually done.
              </p>

              <div class="reader-code"># Verify (mentally) your expected behavior
- Page loads without layout shift
- Command Center stays clean (no repeated errors)
- Traffic begins to appear over time
- 404 + referrer signals are visible on the surface</div>

              <hr>

              <h3>Step 3 — verify signal (first success)</h3>
              <p>
                The first success state is simple: you can see the route, you can see a small amount of signal,
                and you can describe what “normal” looks like for that journey.
              </p>

              <div class="reader-callout">
                <strong>Best practice:</strong> don’t expand your rollout on the same day you connect.
                Let your baseline settle, then widen the net.
              </div>

              <div class="reader-block">
                <h3>Common pitfalls</h3>
                <ul class="reader-list">
                  <li>Connecting to “everything” and flooding the first Command Center view with noise.</li>
                  <li>Starting in staging only and forgetting that production behavior differs.</li>
                  <li>Treating 404 volume as severity without journey context.</li>
                </ul>
              </div>

              <h3>Next steps</h3>
              <p>
                Once the surface is connected, your next move is a watchlist: define what can’t fail.
                That’s where alerts start to mean something.
              </p>
            </div>
          `
        },

        "watchlist-guide": {
          title: "Build your route watchlist",
          subtitle: "Define what cannot fail — then let CavBot prioritize impact over volume.",
          body: `
            <div class="reader">
              <div class="reader-kicker">Why watchlists matter</div>
              <p>
                A watchlist is your <strong>priority surface</strong>.
                It tells CavBot which journeys deserve escalation rules, and which ones should remain informational.
              </p>

              <div class="reader-block">
                <h3>Watchlist principles</h3>
                <ul class="reader-list">
                  <li>Choose journeys with cost: revenue, onboarding, booking, retention.</li>
                  <li>Prefer complete flows (start → finish), not isolated pages.</li>
                  <li>Keep it small at first: 5 routes beats 50 routes.</li>
                </ul>
              </div>

              <hr>

              <h3>Step-by-step</h3>
              <div class="reader-block">
                <div class="reader-kicker">Step 01</div>
                <p>List your top 3 business journeys and write them in route form.</p>
              </div>
              <div class="reader-block">
                <div class="reader-kicker">Step 02</div>
                <p>Mark which route breaks revenue vs which route breaks trust vs which route breaks navigation.</p>
              </div>
              <div class="reader-block">
                <div class="reader-kicker">Step 03</div>
                <p>For each route, define the “pain threshold” (how long / how many errors before escalation).</p>
              </div>

              <div class="reader-code"># Example watchlist (starter)
1) /checkout        — revenue risk
2) /signup          — activation risk
3) /pricing         — conversion path
4) /docs/get-started — onboarding trust
5) /account         — retention surface</div>

              <div class="reader-callout">
                <strong>Tip:</strong> If a route is “important” but not “critical,” keep it monitored without paging.
                Your calm comes from separating visibility from escalation.
              </div>

              <hr>

              <h3>Outcome</h3>
              <p>
                A watchlist reduces noise and makes severity honest. Alerts become trustworthy because
                they’re tied to impact — not random spikes.
              </p>
            </div>
          `
        },

        "signals-guide": {
          title: "Read signals and set escalation rules",
          subtitle: "Turn monitoring into operations: define good, define risky, define escalation.",
          body: `
            <div class="reader">
              <div class="reader-kicker">The goal</div>
              <p>
                CavBot isn’t here to spam. It’s here to route a meaningful issue to the correct lane.
                That requires a small amount of structure up front.
              </p>

              <div class="reader-block">
                <h3>Signals you standardize</h3>
                <ul class="reader-list">
                  <li><strong>404 severity</strong> based on journey impact + referrer quality.</li>
                  <li><strong>Structure drift</strong> (titles, canonicals, crawl traps) that harms discovery quietly.</li>
                  <li><strong>Runtime feel</strong> changes that correlate with conversion drops.</li>
                </ul>
              </div>

              <hr>

              <h3>Define three thresholds (starter)</h3>
              <div class="reader-block">
                <div class="reader-kicker">Monitor</div>
                <p>Visible in Command Center, no escalation. Used for early warning and trend spotting.</p>
              </div>
              <div class="reader-block">
                <div class="reader-kicker">Escalate</div>
                <p>Routes on your watchlist showing abnormal behavior for a sustained window.</p>
              </div>
              <div class="reader-block">
                <div class="reader-kicker">Critical</div>
                <p>Watchlist journey blocked, high-quality referrers, clear repro, user impact present.</p>
              </div>

              <div class="reader-code"># A clean incident note (what support can act on)
Route: /checkout
Time window: 10:24–10:41 PT
What changed: deploy 2.1.14
Repro: add item → checkout → payment fails
Impact: ~18% users blocked</div>

              <div class="reader-callout">
                <strong>Best practice:</strong> build a runbook once.
                Every escalation should read like the same format — calm, measurable, reproducible.
              </div>

              <hr>

              <h3>Next steps</h3>
              <p>
                Once thresholds exist, the Help Center becomes a real tool:
                guides become your standard operating language and incidents become consistent.
              </p>
            </div>
          `
        },

        "onboarding-overview": {
          title: "Onboarding: first project → first signals",
          subtitle: "A one-week onboarding model that proves value without overbuilding.",
          body: `
            <div class="reader">
              <div class="reader-kicker">Week 01 — the minimum viable rollout</div>
              <p>
                The first week is not about perfection. It’s about <strong>signal clarity</strong>.
                You connect one surface, define one watchlist, and align on what “good” looks like.
              </p>

              <div class="reader-block">
                <h3>Day 1</h3>
                <ul class="reader-list reader-checklist">
                  <li>Connect one project surface (production).</li>
                  <li>Verify that the route appears consistently.</li>
                  <li>Confirm no console errors or double-instrumentation.</li>
                </ul>
              </div>

              <div class="reader-block">
                <h3>Day 2–3</h3>
                <ul class="reader-list">
                  <li>Build a 3–5 route watchlist.</li>
                  <li>Define monitor vs escalate vs critical.</li>
                  <li>Decide which lane owns what (support vs pilots vs security).</li>
                </ul>
              </div>

              <div class="reader-block">
                <h3>Day 4–7</h3>
                <ul class="reader-list">
                  <li>Review trends, not just spikes.</li>
                  <li>Adjust thresholds only once baseline is stable.</li>
                  <li>Add the next surface only if clarity remains high.</li>
                </ul>
              </div>

              <hr>

              <h3>Success looks like</h3>
              <div class="reader-callout">
                You can point to one Command Center view and explain: <strong>what changed</strong>, <strong>why it matters</strong>,
                and <strong>what action should happen next</strong>.
              </div>

              <h3>If you get stuck</h3>
              <p>
                Route questions once through the Contact Map. This page is built to prevent duplicate emailing and confusion.
              </p>
            </div>
          `
        },

        "routes-404-docs": {
          title: "404s as a product surface",
          subtitle: "Severity is context: journeys, referrers, intent — not raw volume.",
          body: `
            <div class="reader">
              <div class="reader-kicker">Definition</div>
              <p>
                A 404 is a dead end. But the business impact depends on where it appears.
                CavBot treats 404s as a <strong>surface</strong>: a break in navigation, trust, or conversion.
              </p>

              <div class="reader-block">
                <h3>What makes a 404 critical</h3>
                <ul class="reader-list">
                  <li>It breaks a watchlist journey (checkout, signup, booking).</li>
                  <li>It spikes from quality referrers (search, campaign, partner).</li>
                  <li>It appears newly after a change (deploy, CMS, navigation).</li>
                </ul>
              </div>

              <hr>

              <h3>Triage workflow</h3>
              <div class="reader-block">
                <div class="reader-kicker">01 · Identify</div>
                <p>Which route is failing, and for which journey?</p>
              </div>
              <div class="reader-block">
                <div class="reader-kicker">02 · Context</div>
                <p>Where did users come from? Campaign? Search? Internal navigation?</p>
              </div>
              <div class="reader-block">
                <div class="reader-kicker">03 · Fix path</div>
                <p>Redirect, restore, or repair navigation — choose the smallest correct action.</p>
              </div>

              <div class="reader-callout">
                <strong>Guideline:</strong> redirect when the destination exists,
                restore when content was removed incorrectly, repair when navigation generates bad URLs.
              </div>

              <h3>Next steps</h3>
              <p>
                If a 404 is blocking a watchlist flow right now, use the <strong>Incident lane</strong> with timestamps + repro.
              </p>
            </div>
          `
        },

        "seo-structure-docs": {
          title: "Structure alerts: what CavBot flags first",
          subtitle: "Quiet risks that hurt discovery: metadata drift, canonical conflicts, crawl traps.",
          body: `
            <div class="reader">
              <div class="reader-kicker">What “structure” means</div>
              <p>
                Structure is the set of signals search engines use to understand your pages: titles, descriptions,
                canonicals, index directives, and crawl behavior.
              </p>

              <div class="reader-block">
                <h3>First alerts you’ll see</h3>
                <ul class="reader-list">
                  <li><strong>Title/description drift:</strong> duplicated or inconsistent messaging across key pages.</li>
                  <li><strong>Canonical conflicts:</strong> multiple URLs claiming to be “the real page.”</li>
                  <li><strong>Crawl traps:</strong> infinite filters/params creating thin, indexable surfaces.</li>
                </ul>
              </div>

              <hr>

              <h3>Fix patterns (starter)</h3>
              <div class="reader-block">
                <div class="reader-kicker">Titles</div>
                <p>Make titles unique per page. Keep them consistent with the page’s primary intent.</p>
              </div>
              <div class="reader-block">
                <div class="reader-kicker">Canonicals</div>
                <p>Choose one URL version (www/non-www, slash/no-slash) and point canonicals consistently.</p>
              </div>
              <div class="reader-block">
                <div class="reader-kicker">Index hygiene</div>
                <p>Keep utility pages out of the index unless they serve real user discovery intent.</p>
              </div>

              <div class="reader-callout">
                <strong>Rule:</strong> if a page can generate infinite variants (filters/params), it needs a crawl strategy.
              </div>

              <h3>Next steps</h3>
              <p>
                If you’re unsure whether a signal is “fix now” or “monitor,” route it through General Support with the URL.
              </p>
            </div>
          `
        },

        "seo-examples": {
          title: "SEO structure examples",
          subtitle: "Concrete patterns CavBot calls out — and what ‘good’ looks like.",
          body: `
            <div class="reader">
              <div class="reader-kicker">Example 1 — duplicate titles</div>
              <p>
                If two key pages share nearly the same title, discovery weakens.
                CavBot will flag overlap when it appears on important routes.
              </p>

              <div class="reader-code">&lt;title&gt;CavBot — Modern Reliability&lt;/title&gt;
&lt;!-- should be unique per page intent --&gt;
&lt;title&gt;CavBot Pricing — Plans &amp; Limits&lt;/title&gt;</div>

              <hr>

              <div class="reader-kicker">Example 2 — canonical mismatch</div>
              <p>
                The canonical should point to the primary URL version. Mixed canonicals create ambiguity.
              </p>

              <div class="reader-code">&lt;link rel="canonical" href="https://cavbot.io/pricing" /&gt;
&lt;!-- avoid switching between www/non-www across pages --&gt;</div>

              <hr>

              <div class="reader-kicker">Example 3 — crawl traps</div>
              <p>
                Indexable parameter pages can create a crawl sink. If filters are needed, keep index control deliberate.
              </p>

              <div class="reader-code">/products?color=blue&amp;size=m&amp;sort=popular
# Usually: noindex OR canonical to base category OR parameter strategy</div>

              <div class="reader-callout">
                If you want, you can add a dedicated “Structure checklist” page later — this modal stays as the fast primer.
              </div>
            </div>
          `
        },

        "billing-faq": {
          title: "Billing FAQ — invoices, receipts, and plan changes",
          subtitle: "Finance-grade routing: clear details, fast resolution, no back-and-forth.",
          body: `
            <div class="reader">
              <div class="reader-kicker">Fast answers</div>
              <div class="reader-block">
                <ul class="reader-list">
                  <li><strong>Receipts / invoices:</strong> include org/workspace name + invoice ID (if available).</li>
                  <li><strong>Plan changes:</strong> include requested plan and effective date.</li>
                  <li><strong>PO notes:</strong> include the exact text finance needs on the invoice.</li>
                  <li><strong>Limits questions:</strong> include which plan and what you’re hitting (requests, seats, surfaces).</li>
                </ul>
              </div>

              <hr>

              <h3>Perfect billing email</h3>
              <div class="reader-code">Subject: Billing · Invoice request · [Org Name]
Org/workspace: CavBot Studio
Invoice ID: INV-1042 (if available)
Request: PDF receipt + PO note
Effective date: Jan 01, 2026
Contact: finance@yourcompany.com</div>

              <div class="reader-callout">
                Billing is routed through the Contact Map so finance requests don’t collide with support triage.
              </div>
            </div>
          `
        },

        "security-template": {
          title: "Security disclosure template",
          subtitle: "Responsible, reproducible reports are the fastest path to a fix.",
          body: `
            <div class="reader">
              <div class="reader-kicker">What to include</div>
              <div class="reader-block">
                <ul class="reader-list">
                  <li><strong>Summary:</strong> one sentence describing the risk.</li>
                  <li><strong>Affected surface:</strong> exact route / URL / feature area.</li>
                  <li><strong>Reproduction:</strong> steps, expected vs actual, environment details.</li>
                  <li><strong>Evidence:</strong> logs/screenshots you can safely share.</li>
                  <li><strong>Impact guess:</strong> auth bypass? data exposure? service interruption?</li>
                </ul>
              </div>

              <hr>

              <h3>Paste-ready email</h3>
              <div class="reader-code">To: security@cavbot.io
Subject: Security disclosure · [Short title]

Summary:
Affected surface:
Reproduction steps:
Expected vs actual:
Environment:
Evidence:
Impact:</div>

              <div class="reader-callout">
                We confirm receipt, validate impact, and coordinate a fix path.
                Keep reports factual, short, and reproducible — that’s what gets fixed fastest.
              </div>
            </div>
          `
        },

        "policy-faq": {
          title: "Policy FAQ — privacy, DPAs, and data requests",
          subtitle: "Keep it jurisdiction-clear: GDPR/CCPA, scope, verification, and timelines.",
          body: `
            <div class="reader">
              <div class="reader-kicker">For data requests (export / deletion)</div>
              <div class="reader-block">
                <ul class="reader-list">
                  <li>Include jurisdiction (GDPR/CCPA), org/workspace name, and exact request.</li>
                  <li>Include scope: which workspace or data surface is involved.</li>
                  <li>Include a verification contact to avoid delays.</li>
                </ul>
              </div>

              <hr>

              <h3>For contracts (DPA / legal)</h3>
              <p>
                State what your org requires, your deadline, and whether you have a security questionnaire.
                The fastest path is clarity: requirements + timeline + owner.
              </p>

              <div class="reader-code">Subject: Legal · DPA request · [Org Name]
Jurisdiction: GDPR
Workspace: [Name]
Request: DPA review + signature workflow
Deadline: [Date]
Docs: attached / link
Owner: legal@yourcompany.com</div>

              <div class="reader-callout">
                Policy requests live in one place so the support lane stays operational and fast.
              </div>
            </div>
          `
        },

        "status-page": {
          title: "Status (Operational) — what this becomes",
          subtitle: "A clean incident language: identifiers, timelines, resolution notes — not vague updates.",
          body: `
            <div class="reader">
              <div class="reader-kicker">Today</div>
              <p>
                The system is marked <strong>Operational</strong>. If you’re seeing critical impact on a core journey,
                use the Incident lane with timestamps + route + what changed.
              </p>

              <div class="reader-block">
                <h3>When to escalate</h3>
                <ul class="reader-list">
                  <li>Watchlist route blocked (checkout/signup/account).</li>
                  <li>Sharp new spike tied to high-quality referrers.</li>
                  <li>Issue began after a specific change (deploy/CMS/config).</li>
                </ul>
              </div>

              <hr>

              <div class="reader-kicker">Soon</div>
              <p>
                This becomes the public Status page: incident identifiers, degraded performance notes, and resolution timelines —
                all written in measurable language.
              </p>

              <div class="reader-callout">
                The best status updates are boring: <strong>what happened</strong>, <strong>who’s affected</strong>, <strong>what changed</strong>, <strong>ETA</strong>.
              </div>
            </div>
          `
        }
      };

      function getFocusable(container) {
        if (!container) return [];
        return Array.prototype.slice.call(
          container.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select, details summary, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(function (el) {
          return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        });
      }

      function trapTab(e, container) {
        if (e.key !== 'Tab') return;
        const focusables = getFocusable(container);
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }

      function updateProgress() {
        if (!contentEl || !progressBar) return;
        const max = contentEl.scrollHeight - contentEl.clientHeight;
        const pct = max > 0 ? Math.min(1, Math.max(0, contentEl.scrollTop / max)) : 0;
        progressBar.style.width = (pct * 100).toFixed(1) + '%';
      }
      function openTopic(key) {
        const data = TOPICS[key];
        if (!data) return;

        lastFocus = document.activeElement;

        titleEl.textContent = data.title;
        if (subtitleEl) subtitleEl.textContent = data.subtitle || 'A structured guide built to be read end-to-end.';

        contentEl.innerHTML = data.body;

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        setModalLock(true);

        // reset reader scroll + progress
        contentEl.scrollTop = 0;
        updateProgress();

        setTimeout(function () { closeBtn && closeBtn.focus(); }, 0);
      }

      function closeTopic() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        if (!anyHelpModalOpen()) setModalLock(false);
        if (progressBar) progressBar.style.width = '0%';
        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
      }

      document.querySelectorAll('[data-help-modal]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          const key = btn.getAttribute('data-help-modal');
          openTopic(key);
        });
      });

      // Reader progress
      contentEl.addEventListener('scroll', updateProgress);

      // Back to topics / contact from inside modal (closes first, then navigates)
      modal.querySelectorAll('[data-modal-jump]').forEach(function (a) {
        a.addEventListener('click', function () {
          closeTopic();
        });
      });

      if (backdrop) backdrop.addEventListener('click', closeTopic);
      if (closeBtn) closeBtn.addEventListener('click', closeTopic);

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeTopic();
        if (modal.classList.contains('is-open')) trapTab(e, modal.querySelector('.topic-modal-panel'));
      });
    })();

    // FAQ MODAL (preview) + focus trap
    (function () {
      const openA = document.getElementById('open-faqs-btn');
      const openB = document.getElementById('open-faqs-btn-2');
      const openC = document.getElementById('open-faqs-btn-3');
      const modal = document.getElementById('faq-modal');
      if (!modal) return;

      const backdrop = modal.querySelector('.faq-modal-backdrop');
      const closeBtn = modal.querySelector('.faq-modal-close');
      const faqList = modal.querySelector('.faq-list');

      let lastFocus = null;

      function getFocusable(container) {
        if (!container) return [];
        return Array.prototype.slice.call(
          container.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select, details summary, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(function (el) {
          return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        });
      }

      function trapTab(e, container) {
        if (e.key !== 'Tab') return;
        const focusables = getFocusable(container);
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }

      function openModal() {
        lastFocus = document.activeElement;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        setModalLock(true);
        if (faqList) faqList.scrollTop = 0;
        setTimeout(function () { closeBtn && closeBtn.focus(); }, 0);
      }
      function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        if (!anyHelpModalOpen()) setModalLock(false);
        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
      }

      if (openA) openA.addEventListener('click', openModal);
      if (openB) openB.addEventListener('click', openModal);
      if (openC) openC.addEventListener('click', openModal);
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      if (backdrop) backdrop.addEventListener('click', closeModal);

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
        if (modal.classList.contains('is-open')) trapTab(e, modal.querySelector('.faq-modal-panel'));
      });
    })();
