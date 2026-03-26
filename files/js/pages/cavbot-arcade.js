  (function(){
      var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var isCoarse = window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;

      function logEvent(name, payload){
        try{ console.log('[CavBot Arcade]', name, payload || {}); }catch(e){}
      }

      // Rotate hint
      var rotateHint = document.getElementById('rotateHint');
      var rotateDismiss = document.getElementById('rotateDismiss');
      var rotateTimer = null;

      function shouldSuggestRotate(){
        if (!rotateHint) return false;
        var small = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
        var portrait = window.matchMedia && window.matchMedia('(orientation: portrait)').matches;
        return small && portrait;
      }
      function showRotateHint(){
        if (!rotateHint) return;
        if (!shouldSuggestRotate()) return;
        rotateHint.classList.add('is-on');
        window.clearTimeout(rotateTimer);
        rotateTimer = window.setTimeout(function(){
          rotateHint.classList.remove('is-on');
        }, 4200);
      }
      if (rotateDismiss){
        rotateDismiss.addEventListener('click', function(){
          rotateHint.classList.remove('is-on');
          window.clearTimeout(rotateTimer);
        });
      }

     // Video previews (cards)
function initVideoPreviews(){
  var previews = document.querySelectorAll('[data-preview]');
  previews.forEach(function(preview){
    /*  skip image-only tile */
    if (preview.hasAttribute('data-image-only')) return;

    var videoSrc = preview.getAttribute('data-video');
    var video = preview.querySelector('video');
    if (!video || !videoSrc) return;

    var armed = false;
    var failed = false;

    function armVideo(){
      if (prefersReduced || isCoarse) return;
      if (failed || armed) return;
      armed = true;

      video.src = videoSrc;
      video.load();

      video.addEventListener('canplay', function(){
        preview.classList.add('is-video-ready');
        try{ video.currentTime = 0; video.play(); }catch(e){}
      }, {once:true});

      video.addEventListener('error', function(){
        failed = true;
        preview.classList.remove('is-video-ready');
        try{
          video.pause();
          video.removeAttribute('src');
          video.load();
        }catch(e){}
      }, {once:true});
    }

    function disarmVideo(){
      if (!armed || failed) return;
      preview.classList.remove('is-video-ready');
      try{
        video.pause();
        video.currentTime = 0;
        video.removeAttribute('src');
        video.load();
      }catch(e){}
      armed = false;
    }

    preview.addEventListener('mouseenter', armVideo);
    preview.addEventListener('focusin', armVideo);
    preview.addEventListener('mouseleave', disarmVideo);
    preview.addEventListener('focusout', disarmVideo);
  });
}

// Hero preview (tablet)
function initHeroPreview(){
  var hero = document.querySelector('[data-hero-preview]');
  if (!hero) return;

  /*  if you ever mark hero image-only, skip */
  if (hero.hasAttribute('data-image-only')) return;

  var videoSrc = hero.getAttribute('data-video');
  var video = hero.querySelector('video');
  if (!video || !videoSrc) return;

  var armed = false;
  var failed = false;

  function arm(){
    if (prefersReduced) return;
    if (failed || armed) return;
    armed = true;
    video.src = videoSrc;
    video.load();

    video.addEventListener('canplay', function(){
      hero.classList.add('is-video-ready');
      try{ video.currentTime = 0; video.play(); }catch(e){}
    }, {once:true});

    video.addEventListener('error', function(){
      failed = true;
      hero.classList.remove('is-video-ready');
    }, {once:true});
  }

  function disarm(){
    if (!armed || failed) return;
    hero.classList.remove('is-video-ready');
    try{
      video.pause();
      video.currentTime = 0;
      video.removeAttribute('src');
      video.load();
    }catch(e){}
    armed = false;
  }

  hero.addEventListener('mouseenter', arm);
  hero.addEventListener('pointerenter', arm);
  hero.addEventListener('focusin', arm);
  hero.addEventListener('mouseleave', disarm);
  hero.addEventListener('pointerleave', disarm);
  hero.addEventListener('focusout', disarm);

  // Touch fallback for coarse pointers
  hero.addEventListener('pointerdown', function(){
    if (!isCoarse) return;
    if (armed) return;
    arm();
  }, {passive:true});
}

// Play clicks + rotate helper
document.querySelectorAll('[data-play]').forEach(function(a){
  a.addEventListener('click', function(){
    var game = a.getAttribute('data-game');
    var url = a.getAttribute('data-play-url') || a.getAttribute('href');
    logEvent('play_click', {game: game, url: url});
    if (shouldSuggestRotate()) showRotateHint();
  });
});

      // =========================
      // Tutorials (6 games) — FINAL (Game Book passports, v1.0.0 everywhere)
      // =========================
      var SHIELD_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z"></path><path d="M9 12l2 2 4-4"></path></svg>';

      var TUTORIALS = {
        "futbol-cavbot": { /* ... unchanged ... */ title:"Fútbol CavBot", reading:"~4–6 min read", pill:"Fútbol CavBot",
          chapters:[{id:"passport",label:"Game Book"},{id:"overview",label:"Overview"},{id:"controls",label:"Controls"},{id:"objective",label:"Objective"},{id:"scoring",label:"Scoring"},{id:"sound",label:"Sound"},{id:"telemetry",label:"Telemetry"},{id:"tips",label:"Tips"},{id:"version",label:"Version"}],
          html: document.querySelector('script[data-tutorial-fallback]') ? '' : `
            <h2 id="passport">Game Book</h2>
            <div class="passport-card">
              <div class="passport-head">
                <strong>Game Book</strong>
                <span class="secure-badge">${SHIELD_SVG} Secured</span>
              </div>
              <div class="passport-grid">
                <div class="passport-item"><span class="meta-chip">ID</span><span class="meta-value">futbol-cavbot</span></div>
                <div class="passport-item"><span class="meta-chip">Tutorial</span><span class="meta-value">FC Recovery</span></div>
                <div class="passport-item"><span class="meta-chip">Version</span><span class="meta-value">v1.0.0</span></div>
                <div class="passport-item"><span class="meta-chip">Mode</span><span class="meta-value">Quick Round</span></div>
                <div class="passport-item"><span class="meta-chip">Powered by</span><span class="meta-value">CavBot</span></div>
                <div class="passport-item"><span class="meta-chip">Built on</span><span class="meta-value">CavAi</span></div>
              </div>
            </div>
            <p>This reader is built like a compact field manual — calm, precise, and readable while you’re already inside the experience.</p>

            <h2 id="overview">Overview</h2>
            <p>Fútbol CavBot is a compact command-surface match built inside the grid. The vibe is deliberate: clean collisions, short rounds, and feedback that never screams.</p>
            <p>The goal is not realism — it’s rhythm. A 404 moment becomes an intentional recovery surface with a micro-game that still emits usable signal.</p>
            <div class="callout">
              <strong>Session feel</strong>
              <p>Quick rounds · Calm UI · Clear hits · Optional sound · Structured telemetry</p>
            </div>

            <h2 id="controls">Controls</h2>
            <p>Controls are tuned to feel fair. If you’re on mobile, rotate to landscape for the cleanest aiming lane.</p>
            <div class="callout">
              <strong>Desktop</strong>
              <p><span class="kbd">Hover</span> to steer · <span class="kbd">Click</span> to commit an action when prompted</p>
            </div>
            <div class="callout">
              <strong>Touch</strong>
              <p><span class="kbd">Tap</span> / <span class="kbd">Drag</span> to steer · keep movements small for stability</p>
            </div>
            <ul>
              <li>Small corrections beat big swings.</li>
              <li>Let the ball come to you — don’t chase into corners.</li>
              <li>When in doubt, center your position and reset the rhythm.</li>
            </ul>

            <h2 id="objective">Objective</h2>
            <p>Your objective is to score cleanly and repeatedly. Each goal is a “route restored” moment — a reset in both gameplay and the story of recovery.</p>
            <p>Rounds are short by design. The loop is: aim → commit → confirm → reset.</p>

            <h2 id="scoring">Scoring</h2>
            <p>Scoring is intentionally simple so the player can stay calm. You’re rewarded for precision and timing, not spam clicking.</p>
            <ul>
              <li>Goal scored → confirmation pulse (no harsh flashes).</li>
              <li>Ball resets cleanly for the next play.</li>
              <li>Streaks are tracked when enabled by the build.</li>
            </ul>

            <h2 id="sound">Sound</h2>
            <p>Sound is always optional. The game is fully playable in silence with identical mechanics and outcomes.</p>
            <ul>
              <li>Mobile browsers may require a first tap before audio can play.</li>
              <li>If you prefer quiet, leave sound disabled — nothing breaks.</li>
            </ul>

            <h2 id="telemetry">Telemetry</h2>
            <p>Every round can emit lightweight events. These are designed to be clean enough to ignore, but structured enough to be useful inside CavBot.</p>
            <div class="callout">
              <strong>Example events</strong>
              <p><span class="kbd">goal_scored</span> · <span class="kbd">round_start</span> · <span class="kbd">round_reset</span> · <span class="kbd">route_restored</span></p>
            </div>
            <p>Telemetry stays high-level. No identity. No personal profiling. Just interaction signal tied to the recovery surface.</p>

            <h2 id="tips">Tips</h2>
            <div class="callout">
              <strong>Rhythm</strong>
              <p>Use small adjustments. Don’t chase — align and commit.</p>
            </div>
            <div class="callout">
              <strong>Control</strong>
              <p>In tight moments, re-center. Calm beats speed. Precision beats panic.</p>
            </div>

            <h2 id="version">Version</h2>
            <p><span class="kbd">Build</span> v1.0.0 · Powered by CavBot · Built on CavAi.</p>
          `
        },

        "pick-the-imposter": { /* unchanged */ title:"Pick The Imposter", reading:"~4–6 min read", pill:"Imposter",
          chapters:[{id:"passport",label:"Game Book"},{id:"overview",label:"Overview"},{id:"how",label:"How to win"},{id:"reads",label:"Reading the grid"},{id:"sound",label:"Sound"},{id:"telemetry",label:"Telemetry"},{id:"tips",label:"Tips"},{id:"version",label:"Version"}],
          html: `
            <h2 id="passport">Game Book</h2>
            <div class="passport-card">
              <div class="passport-head">
                <strong>Game Book</strong>
                <span class="secure-badge">${SHIELD_SVG} Secured</span>
              </div>
              <div class="passport-grid">
                <div class="passport-item"><span class="meta-chip">ID</span><span class="meta-value">pick-the-imposter</span></div>
                <div class="passport-item"><span class="meta-chip">Tutorial</span><span class="meta-value">Signal Verification</span></div>
                <div class="passport-item"><span class="meta-chip">Version</span><span class="meta-value">v1.0.0</span></div>
                <div class="passport-item"><span class="meta-chip">Mode</span><span class="meta-value">Quick Round</span></div>
                <div class="passport-item"><span class="meta-chip">Powered by</span><span class="meta-value">CavBot</span></div>
                <div class="passport-item"><span class="meta-chip">Built on</span><span class="meta-value">CavAi</span></div>
              </div>
            </div>
            <p>This is a fast-read game with premium pacing. You’re not hunting for chaos — you’re verifying signal.</p>

            <h2 id="overview">Overview</h2>
            <p>Multiple units appear. Only one is the imposter. Your job is to pick the false signal and restore the route.</p>

            <h2 id="how">How to win</h2>
            <ul>
              <li>Tap/click the unit that looks “off”.</li>
              <li>Correct → route restored pulse.</li>
              <li>Wrong → brief destabilize, then reset.</li>
            </ul>

            <h2 id="reads">Reading the grid</h2>
            <p>Imposters are usually subtle. They might be slightly misaligned, tinted, delayed, or rhythm-breaking compared to the others.</p>
            <div class="callout">
              <strong>Focus</strong>
              <p>Scan once, then commit. Second scans can create doubt.</p>
            </div>

            <h2 id="sound">Sound</h2>
            <p>Sound is optional. If enabled, it stays minimal: confirm tones, soft error taps, clean resets.</p>

            <h2 id="telemetry">Telemetry</h2>
            <p>Events are structured around decisions. This is a “choice” game — so the signal is naturally clean.</p>
            <div class="callout">
              <strong>Example events</strong>
              <p><span class="kbd">imposter_picked</span> · <span class="kbd">pick_correct</span> · <span class="kbd">pick_wrong</span> · <span class="kbd">route_restored</span></p>
            </div>

            <h2 id="tips">Tips</h2>
            <div class="callout"><strong>First instinct</strong><p>Your first instinct is usually correct. Don’t overthink.</p></div>

            <h2 id="version">Version</h2>
            <p><span class="kbd">Build</span> v1.0.0 · Powered by CavBot · Built on CavAi.</p>
          `
        },

        "signal-chase": { /* unchanged */ title:"Signal Chase", reading:"~4–6 min read", pill:"Signal Chase",
          chapters:[{id:"passport",label:"Game Book"},{id:"overview",label:"Overview"},{id:"collect",label:"Collect"},{id:"sequence",label:"Sequence"},{id:"sound",label:"Sound"},{id:"telemetry",label:"Telemetry"},{id:"tips",label:"Tips"},{id:"version",label:"Version"}],
          html: `
            <h2 id="passport">Game Book</h2>
            <div class="passport-card">
              <div class="passport-head">
                <strong>Game Book</strong>
                <span class="secure-badge">${SHIELD_SVG} Secured</span>
              </div>
              <div class="passport-grid">
                <div class="passport-item"><span class="meta-chip">ID</span><span class="meta-value">signal-chase</span></div>
                <div class="passport-item"><span class="meta-chip">Tutorial</span><span class="meta-value">Beacon Recovery</span></div>
                <div class="passport-item"><span class="meta-chip">Version</span><span class="meta-value">v1.0.0</span></div>
                <div class="passport-item"><span class="meta-chip">Mode</span><span class="meta-value">Quick Round</span></div>
                <div class="passport-item"><span class="meta-chip">Powered by</span><span class="meta-value">CavBot</span></div>
                <div class="passport-item"><span class="meta-chip">Built on</span><span class="meta-value">CavAi</span></div>
              </div>
            </div>
            <p>Signal Chase is the calmest game in the set — a sweep, a clear, a restore. It’s designed to feel like cleaning up the grid.</p>

            <h2 id="overview">Overview</h2>
            <p>Sweep a dark field and stabilize beacons. Each cleared signal reveals the correct journey back.</p>

            <h2 id="collect">Collect</h2>
            <div class="callout"><strong>Desktop</strong><p>Move into beacon zones. Click to confirm if required by the build.</p></div>
            <div class="callout"><strong>Touch</strong><p>Tap targets directly or drag toward them depending on build.</p></div>

            <h2 id="sequence">Sequence</h2>
            <p>Beacons may be grouped or sequenced. The intention is simple: recover enough signal to “unlock the path.”</p>

            <h2 id="sound">Sound</h2>
            <p>Sound is optional. If enabled, you’ll hear soft confirmation tones on beacon clears.</p>

            <h2 id="telemetry">Telemetry</h2>
            <p>Signal Chase emits “cleanup” style events — perfect for a recovery surface.</p>
            <div class="callout">
              <strong>Example events</strong>
              <p><span class="kbd">beacon_cleared</span> · <span class="kbd">beacon_missed</span> · <span class="kbd">sequence_complete</span> · <span class="kbd">route_restored</span></p>
            </div>

            <h2 id="tips">Tips</h2>
            <div class="callout"><strong>Pathing</strong><p>Use a consistent sweep pattern: left-to-right, then reset.</p></div>

            <h2 id="version">Version</h2>
            <p><span class="kbd">Build</span> v1.0.0 · Powered by CavBot · Built on CavAi.</p>
          `
        },

        "tennis-cavbot": { /* unchanged */ title:"Tennis CavBot", reading:"~5–7 min read", pill:"Tennis",
          chapters:[{id:"passport",label:"Game Book"},{id:"overview",label:"Overview"},{id:"serve",label:"Serve"},{id:"rally",label:"Rally"},{id:"scoring",label:"Scoring"},{id:"sound",label:"Sound"},{id:"telemetry",label:"Telemetry"},{id:"tips",label:"Tips"},{id:"version",label:"Version"}],
          html: `
            <h2 id="passport">Game Book</h2>
            <div class="passport-card">
              <div class="passport-head">
                <strong>Game Book</strong>
                <span class="secure-badge">${SHIELD_SVG} Secured</span>
              </div>
              <div class="passport-grid">
                <div class="passport-item"><span class="meta-chip">ID</span><span class="meta-value">tennis-cavbot</span></div>
                <div class="passport-item"><span class="meta-chip">Tutorial</span><span class="meta-value">Control-Room Rally</span></div>
                <div class="passport-item"><span class="meta-chip">Version</span><span class="meta-value">v1.0.0</span></div>
                <div class="passport-item"><span class="meta-chip">Mode</span><span class="meta-value">First to 5</span></div>
                <div class="passport-item"><span class="meta-chip">Powered by</span><span class="meta-value">CavBot</span></div>
                <div class="passport-item"><span class="meta-chip">Built on</span><span class="meta-value">CavAi</span></div>
              </div>
            </div>
            <p>This is a premium micro-match: serve, rally, first to 5. Clean feedback, readable pacing, and a command-surface UI vibe.</p>

            <h2 id="overview">Overview</h2>
            <p>Tennis CavBot is built around rhythm. It should feel like a calm duel — not a frantic arcade scramble.</p>

            <h2 id="serve">Serve</h2>
            <div class="callout"><strong>Desktop</strong><p><span class="kbd">Hover</span> to aim · <span class="kbd">Click</span> to release into play</p></div>
            <div class="callout"><strong>Mobile</strong><p><span class="kbd">Touch + hold</span> to aim · release to serve</p></div>

            <h2 id="rally">Rally</h2>
            <p>Once the rally begins, your goal is consistency. Read the bounce, reposition early, and return with calm intent.</p>

            <h2 id="scoring">Scoring</h2>
            <p>Scoring is simple and readable: win a rally = +1 point. First to 5 wins.</p>

            <h2 id="sound">Sound</h2>
            <p>Sound is optional. If enabled, it is restrained: soft hits, small confirmations, no noise loops.</p>

            <h2 id="telemetry">Telemetry</h2>
            <p>Tennis is naturally event-rich, but CavBot keeps it clean. Only the useful moments are captured.</p>
            <div class="callout">
              <strong>Example events</strong>
              <p><span class="kbd">serve_start</span> · <span class="kbd">rally_hit</span> · <span class="kbd">rally_max</span> · <span class="kbd">match_win</span></p>
            </div>

            <h2 id="tips">Tips</h2>
            <div class="callout"><strong>Stay centered</strong><p>Most points are lost by drifting too far left or right.</p></div>

            <h2 id="version">Version</h2>
            <p><span class="kbd">Build</span> v1.0.0 · Powered by CavBot · Built on CavAi.</p>
          `
        },

        "catch-cavbot": { /* unchanged */ title:"Catch CavBot", reading:"~4–6 min read", pill:"Catch",
          chapters:[{id:"passport",label:"Game Book"},{id:"overview",label:"Overview"},{id:"catch",label:"How to catch"},{id:"timing",label:"Timing"},{id:"sound",label:"Sound"},{id:"telemetry",label:"Telemetry"},{id:"tips",label:"Tips"},{id:"version",label:"Version"}],
          html: `
            <h2 id="passport">Game Book</h2>
            <div class="passport-card">
              <div class="passport-head">
                <strong>Game Book</strong>
                <span class="secure-badge">${SHIELD_SVG} Secured</span>
              </div>
              <div class="passport-grid">
                <div class="passport-item"><span class="meta-chip">ID</span><span class="meta-value">catch-cavbot</span></div>
                <div class="passport-item"><span class="meta-chip">Tutorial</span><span class="meta-value">Reaction Recovery</span></div>
                <div class="passport-item"><span class="meta-chip">Version</span><span class="meta-value">v1.0.0</span></div>
                <div class="passport-item"><span class="meta-chip">Mode</span><span class="meta-value">Quick Round</span></div>
                <div class="passport-item"><span class="meta-chip">Powered by</span><span class="meta-value">CavBot</span></div>
                <div class="passport-item"><span class="meta-chip">Built on</span><span class="meta-value">CavAi</span></div>
              </div>
            </div>
            <p>Catch CavBot is a micro-reaction game designed to be fair and calm. It’s a 404 recovery moment turned into a short, intentional interaction.</p>

            <h2 id="overview">Overview</h2>
            <p>CavBot moves inside the grid. Your job is simple: catch him cleanly. The feel is everything — smooth motion, fair hits, calm feedback.</p>

            <h2 id="catch">How to catch</h2>
            <div class="callout">
              <strong>Action</strong>
              <p>Tap/click directly on CavBot. The hit area is tuned to feel fair.</p>
            </div>
            <ul>
              <li>Tap where CavBot will be — not where he was.</li>
              <li>Don’t spam tap; it reduces accuracy.</li>
              <li>On mobile, use a single thumb lane for consistency.</li>
            </ul>

            <h2 id="timing">Timing</h2>
            <p>Catches are easiest during direction changes. When CavBot pivots, his path becomes predictable for a moment.</p>
            <div class="callout">
              <strong>Timing rule</strong>
              <p>Aim for the landing spot. Let CavBot come to your tap.</p>
            </div>

            <h2 id="sound">Sound</h2>
            <p>Sound is optional. If enabled, catches confirm with a soft ping and misses remain subtle.</p>

            <h2 id="telemetry">Telemetry</h2>
            <p>Catch emits simple, high-signal events — ideal for recovery analytics.</p>
            <div class="callout">
              <strong>Example events</strong>
              <p><span class="kbd">catch_hit</span> · <span class="kbd">catch_miss</span> · <span class="kbd">streak_max</span> · <span class="kbd">round_reset</span></p>
            </div>

            <h2 id="tips">Tips</h2>
            <div class="callout"><strong>Accuracy</strong><p>One clean tap beats five panicked taps.</p></div>

            <h2 id="version">Version</h2>
            <p><span class="kbd">Build</span> v1.0.0 · Powered by CavBot · Built on CavAi.</p>
          `
        },

        "cache-sweep": { /* unchanged */ title:"Cache Sweep", reading:"~4–6 min read", pill:"Cache Sweep",
          chapters:[{id:"passport",label:"Game Book"},{id:"overview",label:"Overview"},{id:"mechanics",label:"Mechanics"},{id:"sound",label:"Sound"},{id:"telemetry",label:"Telemetry"},{id:"notes",label:"Notes"},{id:"version",label:"Version"}],
          html: `
            <h2 id="passport">Game Book</h2>
            <div class="passport-card">
              <div class="passport-head">
                <strong>Game Book</strong>
                <span class="secure-badge">${SHIELD_SVG} Secured</span>
              </div>
              <div class="passport-grid">
                <div class="passport-item"><span class="meta-chip">ID</span><span class="meta-value">cache-sweep</span></div>
                <div class="passport-item"><span class="meta-chip">Tutorial</span><span class="meta-value">Cache Recovery</span></div>
                <div class="passport-item"><span class="meta-chip">Version</span><span class="meta-value">v1.0.0</span></div>
                <div class="passport-item"><span class="meta-chip">Mode</span><span class="meta-value">Quick Round</span></div>
                <div class="passport-item"><span class="meta-chip">Powered by</span><span class="meta-value">CavBot</span></div>
                <div class="passport-item"><span class="meta-chip">Built on</span><span class="meta-value">CavAi</span></div>
              </div>
            </div>
            <p>This is a “coming soon” build. The Game Book stays complete so the reader always feels premium.</p>

            <h2 id="overview">Overview</h2>
            <p>Cache Sweep is a whack-style recovery game for stale cache blobs. You hit stale (orange) and protect fresh (blue).</p>

            <h2 id="mechanics">Mechanics</h2>
            <ul>
              <li>Hit orange = correct.</li>
              <li>Hit blue = wrong.</li>
              <li>Wrong hits may cause a brief visual destabilize (intentional).</li>
              <li>Rounds reset quickly so the player stays calm.</li>
            </ul>

            <h2 id="sound">Sound</h2>
            <p>Sound is optional. If enabled, stale hits confirm softly and wrong hits remain subtle.</p>

            <h2 id="telemetry">Telemetry</h2>
            <ul>
              <li><span class="kbd">cache_hit_correct</span> — correct hit</li>
              <li><span class="kbd">cache_hit_wrong</span> — wrong hit</li>
              <li><span class="kbd">streak_max</span> — best streak</li>
              <li><span class="kbd">round_reset</span> — loop reset</li>
            </ul>

            <h2 id="notes">Notes</h2>
            <p>When the game ships, this section expands with final tuning notes and a short “why it exists” entry.</p>

            <h2 id="version">Version</h2>
            <p><span class="kbd">Build</span> v1.0.0 · Powered by CavBot · Built on CavAi.</p>
          `
        }
      };

      // =========================
      // Tutorial modal (LIGHTBOX + INTERNAL SCROLL)
      // =========================
      var modal = document.getElementById('tutorialModal');
      var readerTitle = document.getElementById('readerTitle');
      var readerContent = document.getElementById('readerContent');
      var readerProgress = document.getElementById('readerProgress');
      var readerProgressText = document.getElementById('readerProgressText');
      var readerGamePill = document.getElementById('readerGamePill');
      var chapterList = document.getElementById('chapterList');
      var readerBody = document.getElementById('readerBody');

      var lastFocus = null;
      var activeGame = null;
      var activeChapterIndex = 0;
      var chapterObserver = null;

      function clamp(n,min,max){ return Math.max(min, Math.min(max,n)); }

      function lockScroll(){
        document.documentElement.classList.add('modal-lock');
        document.body.classList.add('modal-lock');
      }
      function unlockScroll(){
        document.documentElement.classList.remove('modal-lock');
        document.body.classList.remove('modal-lock');
      }

      function setHashTutorial(gameKey){
        try{
          var newHash = 'tutorial=' + encodeURIComponent(gameKey);
          history.replaceState(null, '', '#' + newHash);
        }catch(e){}
      }
      function clearHashTutorial(){
        try{
          if (location.hash && location.hash.indexOf('#tutorial=') === 0){
            history.replaceState(null, '', location.pathname + location.search);
          }
        }catch(e){}
      }

      function computeScrollProgress(){
        if (!readerBody) return 0;
        var max = readerBody.scrollHeight - readerBody.clientHeight;
        if (max <= 0) return 100;
        return (readerBody.scrollTop / max) * 100;
      }

      function setProgress(pct){
        var p = clamp(pct, 0, 100);
        if (readerProgress) readerProgress.style.width = p.toFixed(1) + '%';
        if (readerProgressText) readerProgressText.textContent = Math.round(p) + '%';
      }

      function buildChapters(tutorial){
        if (!chapterList) return;
        chapterList.innerHTML = '';
        (tutorial.chapters || []).forEach(function(ch, idx){
          var li = document.createElement('li');
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'chapter-btn' + (idx === 0 ? ' is-active' : '');
          btn.textContent = ch.label;
          btn.addEventListener('click', function(){
            goToChapter(idx, true);
          });
          li.appendChild(btn);
          chapterList.appendChild(li);
        });
        activeChapterIndex = 0;
      }

      function markActiveChapter(idx){
        var buttons = chapterList ? chapterList.querySelectorAll('.chapter-btn') : [];
        buttons.forEach(function(b, i){
          if (i === idx) b.classList.add('is-active');
          else b.classList.remove('is-active');
        });
      }

      function goToChapter(idx, userInitiated){
        var tutorial = TUTORIALS[activeGame];
        if (!tutorial || !tutorial.chapters || !tutorial.chapters.length) return;

        idx = clamp(idx, 0, tutorial.chapters.length - 1);
        activeChapterIndex = idx;
        markActiveChapter(idx);

        var id = tutorial.chapters[idx].id;
        var target = readerContent ? readerContent.querySelector('#' + (window.CSS && CSS.escape ? CSS.escape(id) : id)) : null;
        if (target){
          target.scrollIntoView({behavior: userInitiated ? 'smooth' : 'auto', block: 'start'});
        }
      }

      function attachChapterSpy(){
        if (!readerBody || !readerContent || !activeGame) return;
        if (chapterObserver) { try{ chapterObserver.disconnect(); }catch(e){} chapterObserver = null; }

        var tutorial = TUTORIALS[activeGame];
        if (!tutorial || !tutorial.chapters) return;

        var nodes = [];
        tutorial.chapters.forEach(function(ch, idx){
          var id = ch.id;
          var el = readerContent.querySelector('#' + (window.CSS && CSS.escape ? CSS.escape(id) : id));
          if (!el) return;
          el.setAttribute('data-chapter-index', String(idx));
          nodes.push(el);
        });
        if (!nodes.length) return;

        chapterObserver = new IntersectionObserver(function(entries){
          var visible = entries.filter(function(e){ return e.isIntersecting; });
          if (!visible.length) return;

          visible.sort(function(a,b){
            return Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top);
          });

          var idxStr = visible[0].target.getAttribute('data-chapter-index');
          var idx = parseInt(idxStr, 10);
          if (!isNaN(idx) && idx !== activeChapterIndex){
            activeChapterIndex = idx;
            markActiveChapter(idx);
          }
        }, {
          root: readerBody,
          threshold: [0.35, 0.55],
          rootMargin: "-12% 0px -70% 0px"
        });

        nodes.forEach(function(n){ chapterObserver.observe(n); });
      }

      function openTutorial(gameKey, opener){
        if (!modal || !readerContent || !readerTitle) return;
        var t = TUTORIALS[gameKey];
        if (!t) return;

        lastFocus = opener || document.activeElement;
        activeGame = gameKey;

        readerTitle.textContent = t.title || 'Tutorial';
        if (readerGamePill) readerGamePill.textContent = (t.pill || gameKey);

        readerContent.innerHTML = t.html || '';
        buildChapters(t);

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden','false');

        lockScroll();

        if (readerBody){
          readerBody.scrollTop = 0;
          try{ readerBody.focus({preventScroll:true}); }catch(e){ try{ readerBody.focus(); }catch(_){} }
        }
        setProgress(0);

        window.setTimeout(function(){ attachChapterSpy(); }, 30);

        setHashTutorial(gameKey);
        logEvent('tutorial_open', {game: gameKey});
      }

      function closeTutorial(){
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden','true');
        clearHashTutorial();

        unlockScroll();

        if (chapterObserver) { try{ chapterObserver.disconnect(); }catch(e){} chapterObserver = null; }

        if (lastFocus && typeof lastFocus.focus === 'function'){
          try{ lastFocus.focus({preventScroll:true}); }catch(e){ try{ lastFocus.focus(); }catch(_){} }
        }
      }

      function parseTutorialHash(){
        if (!location.hash) return null;
        if (location.hash.indexOf('#tutorial=') !== 0) return null;
        try{
          return decodeURIComponent(location.hash.replace('#tutorial=',''));
        }catch(e){
          return null;
        }
      }

      // Wire open buttons
      document.querySelectorAll('[data-open-tutorial]').forEach(function(btn){
        btn.addEventListener('click', function(e){
          e.preventDefault();
          var key = btn.getAttribute('data-open-tutorial') || btn.getAttribute('data-game');
          if (!key) return;
          openTutorial(key, btn);
        });
      });

      if (modal){
        modal.querySelectorAll('[data-close-modal]').forEach(function(el){
          el.addEventListener('click', function(e){
            e.preventDefault();
            closeTutorial();
          });
        });
        var backdrop = modal.querySelector('.modal-backdrop');
        if (backdrop) backdrop.addEventListener('click', closeTutorial);
      }

      // progress tracks readerBody scroll
      if (readerBody){
        readerBody.addEventListener('scroll', function(){
          setProgress(computeScrollProgress());
        }, {passive:true});
      }

      window.addEventListener('keydown', function(e){
        if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) closeTutorial();
      });

      // Auto-open from deep link (#tutorial=gameKey)
      var deep = parseTutorialHash();
      if (deep && TUTORIALS[deep]){
        window.setTimeout(function(){ openTutorial(deep, null); }, 60);
      }

      // Init
      initVideoPreviews();
      initHeroPreview();

      // Rotate helper (still used)
      function initRotateAuto(){
        if (shouldSuggestRotate()) showRotateHint();
      }
      initRotateAuto();
    })();
    
