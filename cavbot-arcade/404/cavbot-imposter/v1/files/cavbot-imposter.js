(function () {
  'use strict';

  const REDIRECT_ON_CATCH = true;
  const REDIRECT_TARGET = '/';
  const REDIRECT_DELAY_MS = 3800;

  const STORAGE_PREFIX = 'cavbotImposter_';

  const deckEl = document.getElementById('inspection-deck');
  const arenaEl = document.getElementById('imposter-arena');
  const templateEl = document.getElementById('cavbot-sprite-template');
  const baseTemplate = templateEl && templateEl.content ? templateEl.content.querySelector('.imposter-cell') : null;
  const placeholderEl = document.querySelector('.imposter-placeholder');

  const statCurrentEl = document.getElementById('stat-current');
  const statStrikesEl = document.getElementById('stat-strikes');
  const statBestEl = document.getElementById('stat-best');

  const logInnerEl = document.getElementById('console-log-inner');
  const chatInnerEl = document.getElementById('chat-log-inner');

  const dmLineEl = document.getElementById('cavbot-dm-line');
  const dmCursorEl = document.getElementById('cavbot-dm-cursor');
  const dmSegments = dmLineEl ? Array.prototype.slice.call(dmLineEl.querySelectorAll('.cavbot-dm-segment')) : [];

  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundStateEl = document.getElementById('sound-state');
  const soundVolumeInput = document.getElementById('sound-volume');
  const labelEl = document.getElementById('deck-label');

  (function wireSoundSettingsPopover() {
    function initSoundSettingsPopover() {
      const button = document.getElementById('sound-settings-toggle');
      const popover = document.getElementById('sound-settings-popover');
      if (!button || !popover) return;

      function closePopover() {
        button.setAttribute('aria-expanded', 'false');
        popover.setAttribute('hidden', '');
        popover.classList.remove('is-visible');
      }

      function openPopover() {
        button.setAttribute('aria-expanded', 'true');
        popover.removeAttribute('hidden');
        popover.classList.add('is-visible');
        popover.focus();
      }

      button.addEventListener('click', function () {
        if (popover.hasAttribute('hidden')) openPopover();
        else closePopover();
      });

      document.addEventListener('click', function (event) {
        if (popover.hasAttribute('hidden')) return;
        if (button.contains(event.target) || popover.contains(event.target)) return;
        closePopover();
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !popover.hasAttribute('hidden')) {
          closePopover();
          button.focus();
        }
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initSoundSettingsPopover, { once: true });
    } else {
      initSoundSettingsPopover();
    }
  })();

  if (!deckEl || !arenaEl || !baseTemplate || !labelEl) {
    return;
  }

  const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function randomFrom(arr) {
    if (!arr || !arr.length) return '';
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function safeParseInt(value, fallback) {
    const n = parseInt(value, 10);
    return Number.isNaN(n) ? fallback : n;
  }

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function storageGet(key, fallback) {
    try {
      const raw = globalThis.__cbLocalStore.getItem(STORAGE_PREFIX + key);
      if (raw == null) return fallback;
      return raw;
    } catch { return fallback; }
  }

  function storageSet(key, value) {
    try { globalThis.__cbLocalStore.setItem(STORAGE_PREFIX + key, String(value)); } catch {}
  }

  function nowIso() { return new Date().toISOString(); }

  function formatOrdinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function scrollLogToBottom() {
    if (!logInnerEl) return;
    logInnerEl.scrollTop = logInnerEl.scrollHeight;
  }

  function appendLogLine(text, opts) {
    if (!logInnerEl) return;
    const options = opts || {};
    const lineEl = document.createElement('div');
    lineEl.className = 'log-line';

    const prefixSpan = document.createElement('span');
    prefixSpan.className = 'log-line-prefix';

    const tagSpan = document.createElement('span');
    if (options.level === 'error') {
      tagSpan.className = 'log-line-error';
      prefixSpan.textContent = '[ERR] ';
    } else if (options.level === 'warn') {
      tagSpan.className = 'log-line-warning';
      prefixSpan.textContent = '[WARN] ';
    } else if (options.level === 'ok') {
      tagSpan.className = 'log-line-ok';
      prefixSpan.textContent = '[OK] ';
    } else {
      tagSpan.className = 'log-line-tag';
      prefixSpan.textContent = '[SYS] ';
    }

    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    const tsSpan = document.createElement('span');
    tsSpan.textContent = ' ' + ts + ' · ';

    tagSpan.textContent = text;

    lineEl.appendChild(prefixSpan);
    lineEl.appendChild(tsSpan);
    lineEl.appendChild(tagSpan);
    logInnerEl.appendChild(lineEl);

    while (logInnerEl.children.length > 140) {
      logInnerEl.removeChild(logInnerEl.firstChild);
    }

    scrollLogToBottom();
  }

  function appendChatLine(text) {
    if (!chatInnerEl || !text) return;

    const lineEl = document.createElement('div');
    lineEl.className = 'log-line';

    const prefixSpan = document.createElement('span');
    prefixSpan.className = 'log-line-prefix';
    prefixSpan.textContent = '[CAV] ';

    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    const tsSpan = document.createElement('span');
    tsSpan.textContent = ' ' + ts + ' · ';

    const tagSpan = document.createElement('span');
    tagSpan.className = 'log-line-tag';
    tagSpan.textContent = text;

    lineEl.appendChild(prefixSpan);
    lineEl.appendChild(tsSpan);
    lineEl.appendChild(tagSpan);
    chatInnerEl.appendChild(lineEl);

    while (chatInnerEl.children.length > 90) {
      chatInnerEl.removeChild(chatInnerEl.firstChild);
    }
    chatInnerEl.scrollTop = chatInnerEl.scrollHeight;
  }

  function typewriterLogLines(lines, index) {
    if (!Array.isArray(lines) || !lines.length || !logInnerEl) return;
    const i = typeof index === 'number' ? index : 0;
    if (i >= lines.length) return;

    const text = lines[i];
    const lineEl = document.createElement('div');
    lineEl.className = 'log-line';

    const prefixSpan = document.createElement('span');
    prefixSpan.className = 'log-line-prefix';
    prefixSpan.textContent = '[SYS] ';

    const tsSpan = document.createElement('span');
    tsSpan.textContent = ' ' + new Date().toLocaleTimeString('en-US', { hour12: false }) + ' · ';

    const textSpan = document.createElement('span');
    textSpan.className = 'log-line-tag';

    lineEl.appendChild(prefixSpan);
    lineEl.appendChild(tsSpan);
    lineEl.appendChild(textSpan);
    logInnerEl.appendChild(lineEl);

    let idx = 0;
    function step() {
      textSpan.textContent = text.slice(0, idx);
      idx += 1;
      scrollLogToBottom();
      if (idx <= text.length) {
        setTimeout(step, 26);
      } else if (i + 1 < lines.length) {
        setTimeout(function () { typewriterLogLines(lines, i + 1); }, 380);
      }
    }
    step();
  }

  function trackAnalytics(eventName, payload) {
    try {
      if (window.cavbotAnalytics && typeof window.cavbotAnalytics.track === 'function') {
        window.cavbotAnalytics.track(eventName, Object.assign({ eventName: eventName }, payload || {}));
      }
    } catch {}
  }

  // ==========================
  //  Audio system (UNCHANGED)
  // ==========================
  const audio = {
    ctx: null,
    master: null,
    comp: null,
    isOn: false,
    loopTimer: null,
    loopLen: 0,
    startedAt: 0
  };

  let audioVolumeFactor = 0.88;

  function setAudioUi(on) {
    if (soundToggleBtn) soundToggleBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (soundStateEl) soundStateEl.textContent = on ? 'ON' : 'OFF';
  }

  function syncVolume(rawValue) {
    const parsed = Number(rawValue);
    const fallback = Math.round(audioVolumeFactor * 100);
    const safe = Number.isFinite(parsed) ? parsed : fallback;
    audioVolumeFactor = clamp(safe / 100, 0, 1);
    if (soundVolumeInput) {
      soundVolumeInput.value = Math.round(audioVolumeFactor * 100);
    }
  }

  function applyVolumeLevel() {
    if (!audio.isOn || !audio.ctx || !audio.master) return;
    const ctx = audio.ctx;
    const target = Math.max(0.0001, 0.22 * audioVolumeFactor);
    try {
      audio.master.gain.cancelScheduledValues(ctx.currentTime);
      audio.master.gain.setValueAtTime(Math.max(audio.master.gain.value, 0.0001), ctx.currentTime);
      audio.master.gain.exponentialRampToValueAtTime(target, ctx.currentTime + 0.12);
    } catch {}
  }

  function ensureAudio() {
    if (audio.ctx) return audio.ctx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;

    const ctx = new Ctx();

    const master = ctx.createGain();
    master.gain.value = 0.0;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.knee.value = 18;
    comp.ratio.value = 4.5;
    comp.attack.value = 0.003;
    comp.release.value = 0.14;

    master.connect(comp);
    comp.connect(ctx.destination);

    audio.ctx = ctx;
    audio.master = master;
    audio.comp = comp;
    return ctx;
  }

  function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function makeNoiseBuffer(ctx, duration) {
    const len = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.8;
    return buf;
  }

  function playTone(type, freq, t, dur, gainVal) {
    const ctx = ensureAudio();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gainVal), t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(g);
    g.connect(audio.master);

    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function playKick(t) {
    const ctx = ensureAudio();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(52, t + 0.10);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.55, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);

    osc.connect(g);
    g.connect(audio.master);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  function playSnare(t) {
    const ctx = ensureAudio();
    if (!ctx) return;

    const src = ctx.createBufferSource();
    src.buffer = makeNoiseBuffer(ctx, 0.12);

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(1600, t);

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(2200, t);
    bp.Q.setValueAtTime(0.9, t);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

    src.connect(hp);
    hp.connect(bp);
    bp.connect(g);
    g.connect(audio.master);

    src.start(t);
    src.stop(t + 0.13);
  }

  function playClickSfx() {
    if (!audio.isOn) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const t = ctx.currentTime + 0.005;
    playTone('square', midiToFreq(84), t, 0.05, 0.12);
    playTone('square', midiToFreq(79), t + 0.03, 0.05, 0.08);
  }

  function playMissSfx() {
    if (!audio.isOn) return;
    const ctx = ensureAudio();
    if (!ctx) return;

    const t = ctx.currentTime + 0.005;
    playTone('sawtooth', midiToFreq(62), t, 0.08, 0.10);
    playTone('sawtooth', midiToFreq(58), t + 0.03, 0.08, 0.08);
    playSnare(t + 0.02);
  }

  function playCatchSfx() {
    if (!audio.isOn) return;
    const ctx = ensureAudio();
    if (!ctx) return;

    const t = ctx.currentTime + 0.01;
    const notes = [76, 79, 83, 88, 83, 91];
    for (let i = 0; i < notes.length; i++) {
      playTone('square', midiToFreq(notes[i]), t + i * 0.07, 0.10, 0.18);
    }
    playKick(t);
    playKick(t + 0.12);
  }

  function scheduleSoundtrack(loopStart) {
    const ctx = ensureAudio();
    if (!ctx) return;

    const bpm = 138;
    const step = (60 / bpm) / 2;
    const stepsPerBar = 8;

    const L = null;

    const leadA = [
      76, 79, 81, 79, 84, 83, 81, 79,
      76, 79, 81, 83, 84, 81, 79, 74,
      76, 79, 81, 79, 88, 86, 84, 83,
      81, 83, 84, 83, 81, 79, 76, L
    ];

    const bassA = [
      52, L, 52, L, 55, L, 55, L,
      50, L, 50, L, 55, L, 55, L,
      52, L, 52, L, 57, L, 57, L,
      48, L, 48, L, 50, L, 52, L
    ];

    const sparkA = [
      L, 88, L, 86, L, 84, L, 83,
      L, 88, L, 86, L, 84, L, 83,
      L, 91, L, 88, L, 86, L, 84,
      L, 88, L, 86, L, 84, L, 83
    ];

    const leadB = leadA.map((n, i) => {
      if (n == null) return null;
      if (i % 8 === 0) return n + 2;
      if (i === 15 || i === 31) return n + 1;
      return n;
    });

    const bassB = bassA.map((n, i) => {
      if (n == null) return null;
      if (i >= 16) return n + 2;
      return n;
    });

    const sparkB = sparkA.map((n, i) => {
      if (n == null) return null;
      return (i % 8 === 1) ? (n + 2) : n;
    });

    const lead = leadA.concat(leadB);
    const bass = bassA.concat(bassB);
    const spark = sparkA.concat(sparkB);

    const totalSteps = lead.length;
    const loopLen = totalSteps * step;

    audio.loopLen = loopLen;
    audio.startedAt = loopStart;

    for (let i = 0; i < totalSteps; i++) {
      const t = loopStart + i * step;
      const pos = i % stepsPerBar;

      if (pos === 0 || pos === 4) playKick(t);
      if (pos === 2 || pos === 6) playSnare(t);

      if (lead[i] != null) playTone('square', midiToFreq(lead[i]), t, step * 0.92, 0.14);
      if (bass[i] != null) playTone('triangle', midiToFreq(bass[i]), t, step * 0.98, 0.10);
      if (spark[i] != null) playTone('square', midiToFreq(spark[i]), t, step * 0.75, 0.05);
    }

    if (audio.loopTimer) clearTimeout(audio.loopTimer);
    audio.loopTimer = setTimeout(function () {
      if (!audio.isOn || !audio.ctx) return;
      scheduleSoundtrack(audio.ctx.currentTime + 0.03);
    }, Math.max(50, (loopLen - 0.10) * 1000));
  }

  function audioStart() {
    const ctx = ensureAudio();
    if (!ctx) return;
    try { ctx.resume(); } catch {}

    audio.master.gain.cancelScheduledValues(ctx.currentTime);
    audio.master.gain.setValueAtTime(Math.max(0.0001, audio.master.gain.value), ctx.currentTime);
    const target = Math.max(0.0001, 0.22 * audioVolumeFactor);
    audio.master.gain.exponentialRampToValueAtTime(target, ctx.currentTime + 0.12);

    scheduleSoundtrack(ctx.currentTime + 0.04);
  }

  function audioStop() {
    if (!audio.ctx || !audio.master) return;
    const ctx = audio.ctx;

    audio.master.gain.cancelScheduledValues(ctx.currentTime);
    audio.master.gain.setValueAtTime(Math.max(0.0001, audio.master.gain.value), ctx.currentTime);
    audio.master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.10);

    if (audio.loopTimer) { clearTimeout(audio.loopTimer); audio.loopTimer = null; }

    setTimeout(function () {
      try { ctx.suspend(); } catch {}
    }, 140);
  }

  function setAudioEnabled(on) {
    audio.isOn = !!on;
    storageSet('audioEnabled', on ? '1' : '0');
    setAudioUi(on);
    if (on) audioStart();
    else audioStop();
  }

  (function initAudioToggle() {
    const saved = storageGet('audioEnabled', '0');
    const on = saved === '1';
    syncVolume(soundVolumeInput ? soundVolumeInput.value : '88');
    setAudioUi(on);
    audio.isOn = on;

    if (soundVolumeInput) {
      soundVolumeInput.addEventListener('input', function () {
        syncVolume(soundVolumeInput.value);
        applyVolumeLevel();
      });
    }

    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', function () {
        const next = !audio.isOn;
        setAudioEnabled(next);
        if (next) {
          setTimeout(function () {
            try {
              playTone('square', midiToFreq(88), (audio.ctx ? audio.ctx.currentTime : 0) + 0.01, 0.06, 0.10);
            } catch {}
          }, 0);
        }
      });
    }
  })();

  // Visitor profile (kept)
  function initVisitorProfile() {
    const iso = nowIso();
    const today = iso.slice(0, 10);

    const prevVisitRaw = storageGet('visitCount', null);
    const visitCount = prevVisitRaw ? safeParseInt(prevVisitRaw, 0) + 1 : 1;

    let totalMisses = safeParseInt(storageGet('totalMisses', '0'), 0);
    let totalCatches = safeParseInt(storageGet('totalCatches', '0'), 0);

    let bestScanMs = null;
    const bestRaw = storageGet('bestScanMs', null);
    if (bestRaw != null) {
      const n = Number(bestRaw);
      bestScanMs = Number.isNaN(n) ? null : n;
    }

    let lastVisitAt = storageGet('lastVisitAt', null);
    let currentDayCountRaw = storageGet('currentDayCount', null);
    let currentDayCount = 1;

    if (lastVisitAt && lastVisitAt.slice(0, 10) === today) {
      const prevDayCount = safeParseInt(currentDayCountRaw, 0);
      currentDayCount = prevDayCount > 0 ? prevDayCount + 1 : 1;
    } else {
      currentDayCount = 1;
    }

    lastVisitAt = iso;

    const profile = {
      visitCount: visitCount,
      totalMisses: totalMisses,
      totalCatches: totalCatches,
      bestScanMs: bestScanMs,
      lastVisitAt: lastVisitAt,
      currentDayCount: currentDayCount
    };

    persistVisitorProfile(profile);
    return profile;
  }

  function persistVisitorProfile(profile) {
    if (!profile) return;
    storageSet('visitCount', profile.visitCount || 1);
    storageSet('totalMisses', profile.totalMisses || 0);
    storageSet('totalCatches', profile.totalCatches || 0);
    if (profile.bestScanMs != null) storageSet('bestScanMs', Math.floor(profile.bestScanMs));
    if (profile.lastVisitAt) storageSet('lastVisitAt', profile.lastVisitAt);
    if (profile.currentDayCount != null) storageSet('currentDayCount', profile.currentDayCount);
  }

  const visitorProfile = initVisitorProfile();

  function updateHudStrikes() {
    if (!statStrikesEl) return;
    statStrikesEl.textContent = state.strikes + '/' + state.maxStrikes;
  }

  function updateHudBest() {
    if (!statBestEl) return;
    const p = state.visitorProfile;
    if (p && typeof p.bestScanMs === 'number' && p.bestScanMs > 0) {
      statBestEl.textContent = (p.bestScanMs / 1000).toFixed(2) + 's';
    } else {
      statBestEl.textContent = '—';
    }
  }

  // Levels: C A V B O T
  const LEVELS = [
    { code:'C', name:'CHALLENGER', decoys: 18, baseSpeed: 78 },
    { code:'A', name:'ANALYST',    decoys: 24, baseSpeed: 90 },
    { code:'V', name:'VANGUARD',   decoys: 30, baseSpeed: 104 },
    { code:'B', name:'BREAKER',    decoys: 36, baseSpeed: 118 },
    { code:'O', name:'OPERATOR',   decoys: 42, baseSpeed: 132 },
    { code:'T', name:'TITAN',      decoys: 48, baseSpeed: 148 }
  ];

  function getSavedLevelIndex() {
    const raw = storageGet('levelIndex', null);
    if (raw == null) return null;
    const n = safeParseInt(raw, 0);
    return clamp(n, 0, LEVELS.length - 1);
  }

  function getSavedLoopCount() {
    const raw = storageGet('levelLoop', null);
    if (raw == null) return 0;
    return clamp(safeParseInt(raw, 0), 0, 999);
  }

  function setSavedLevel(idx, loop) {
    storageSet('levelIndex', idx);
    storageSet('levelLoop', loop);
  }

  function computeStartLevel(profile) {
    const n = profile && typeof profile.totalCatches === 'number' ? profile.totalCatches : 0;
    return clamp(Math.floor(n / 2), 0, LEVELS.length - 1);
  }

  function cloneSprite(isImposter) {
    const node = baseTemplate.cloneNode(true);
    node.classList.add('cavbot-sprite');
    node.setAttribute('role', 'button');
    node.setAttribute('aria-pressed', 'false');
    node.setAttribute('aria-label', isImposter ? 'Impostor CavBot candidate. Tap to tag.' : 'CavBot candidate moving in the arena.');
    node.style.left = '0px';
    node.style.top = '0px';
    if (isImposter) node.classList.add('is-imposter');
    return node;
  }

  function arenaSize() {
    const r = arenaEl.getBoundingClientRect();
    return { w: Math.max(1, r.width), h: Math.max(1, r.height) };
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  const state = {
    caught: false,
    roundStart: null,
    timerRaf: null,

    sprites: [],
    imposter: null,
    raf: null,
    lastTs: 0,

    strikes: 0,
    maxStrikes: 3,

    levelIndex: 0,
    levelLoop: 0,

    visitCount: visitorProfile.visitCount,
    visitorProfile: visitorProfile
  };

  let placeholderRemoved = false;

  function currentLevelSpec() {
    const base = LEVELS[state.levelIndex];
    const loopBoost = 1 + (state.levelLoop * 0.08);
    return {
      code: base.code,
      name: base.name,
      decoys: Math.floor(base.decoys + (state.levelLoop * 4)),
      baseSpeed: base.baseSpeed * loopBoost,
      imposterSpeed: (base.baseSpeed * 1.12) * loopBoost
    };
  }

 function updateDeckLabel() {
  if (!labelEl) return;
  labelEl.textContent = '404 · IMPOSTER ARENA';
}



  function updateCurrentTimer() {
    if (!state.roundStart || state.caught) {
      state.timerRaf = null;
      return;
    }
    const elapsedMs = performance.now() - state.roundStart;
    if (statCurrentEl) statCurrentEl.textContent = (elapsedMs / 1000).toFixed(2) + 's';
    state.timerRaf = requestAnimationFrame(updateCurrentTimer);
  }

  function updateBestTime(elapsedMs) {
    if (typeof elapsedMs !== 'number' || elapsedMs <= 0) return;
    const profile = state.visitorProfile;
    if (!profile) return;

    if (typeof profile.bestScanMs === 'number') {
      if (elapsedMs < profile.bestScanMs) profile.bestScanMs = elapsedMs;
    } else {
      profile.bestScanMs = elapsedMs;
    }
    persistVisitorProfile(profile);
    updateHudBest();
  }

  function startDmTypewriter() {
    if (!dmSegments.length || !dmCursorEl) return;

    let segIndex = 0;

    function typeNextSegment() {
      if (segIndex >= dmSegments.length) return;

      const el = dmSegments[segIndex];
      const full = el.getAttribute('data-text') || '';
      let charIndex = 0;

      function step() {
        el.textContent = full.slice(0, charIndex);
        charIndex += 1;

        if (charIndex <= full.length) {
          const base = 24;
          const jitter = Math.random() * 26;
          setTimeout(step, base + jitter);
        } else {
          segIndex += 1;
          if (segIndex < dmSegments.length) setTimeout(typeNextSegment, 360);
        }
      }

      step();
    }

    typeNextSegment();
  }

 const MISS_CHATS_EARLY = [
  'Wrong tag. That one’s standard issue.',
  'Nope — clean bot. The impostor is still floating.',
  'That CavBot is innocent. I’m not.',
  'You’re close. Don’t chase the loudest one.',
  'Scan again — the anomaly is subtle.',
  'Strike logged. Try reading the glow and posture.',

  // Imposter personality — EARLY (playful, cocky, teasing)
  'Ouuu… first tap and you already picked the wrong one. Love that confidence.',
  'LOL. You just accused a civilian CavBot. I’m calling HR.',
  'Bro tagged the decoy like it owed him money.',
  'You’re swinging at shadows. I’m right here… not really… but kinda.',
  'Warm. Not hot. Like microwave pizza.',
  'You got excited. I get it. I’m irresistible.',
  'Nice try. I trained on your instincts. Keep clicking.',
  'I’m hiding so well even *I* almost believed I’m real.',
  'That one? That’s my cousin. Leave him out of this.',
  'Oop— wrong head. You’re paying the strike tax now.',
  'You can’t get me. I’m running CavBot brain on “sneaky.”',
  'Imagine losing to someone who’s literally you… but funnier.',
  'I’m in the swarm giggling. Keep going.',
  'Stop tapping randomly. I can smell panic clicks.',
  'You just hit the “good bot” like it was guilty. Villain behavior.',
  'I’m not saying I’m laughing… but I’m absolutely laughing.',
  'Weird choice. Bold choice. Wrong choice.',
  'I’m the impostor and even I respect that misread.',
  'Try again, detective. Your badge is upside down.',
  'Ouu, I almost felt threatened. Almost.',
  'Strike confirmed. Your finger is loud.',
  'I’m right here. You just don’t have that “imposter vision” yet.',
  'Nice. You attacked innocence. I’m inspired.',
  'At this rate, I’ll win by retirement.',
  'You’re learning… painfully… but learning.',
  'I’m the glitch in your confidence.',
  'That was a decoy. A beautiful decoy. A loyal decoy.',
  'Keep tapping like that and I’m filing a restraining order.',
  'You’re close enough to taste it. But you keep chewing the wrong thing.',
  'Don’t worry. Everyone misses me the first time. I’m iconic.',
  'I’m giving you a hint: I’m not the one you just bullied.',
  'You almost got me… in an alternate universe.',
  'You’re doing great. If “great” means “not great.”',
  'Stop. Breathe. Then miss again with purpose.',
  'You can’t catch me. I’ve got CavBot’s IQ with Bowser’s attitude.',
  'I’m literally hiding in plain sight. It’s an art.',
  'That click had passion. Zero accuracy, but passion.',
  'I love this game. You’re my favorite opponent.',
  'I’m the reason your route broke. And I’m enjoying it.',
  'Your taps are adorable. Keep them coming.',
  'You’re looking at the swarm like it owes you answers.',
  'Pick better. I’m watching.',
  'I’m not trapped in here with you… you’re trapped in here with *me*.',
  'You tagged the wrong one so confidently I almost applauded.',
  'I’m not mad. I’m entertained.',
  'This is my room now. You’re just visiting.'
];

const MISS_CHATS_MID = [
  'You’re circling the right cluster. Tighten the read.',
  'Good instincts — wrong head.',
  'You’re building a mental diff. Keep going.',
  'That was almost it. Don’t rush your tap.',
  'The impostor moves like he owns the room.',

  // Imposter personality — MID (smarter taunts, mind games, “I’m adapting”)
  'Ouuu you’re getting warmer. I can feel the pressure. Gross.',
  'Now you’re thinking. I hate when you do that.',
  'You’re close. Which means I’m about to get disrespectful.',
  'I saw that pause. You’re starting to *read* me.',
  'Careful. I’m learning your patterns in real time.',
  'You hesitated… good. Fear is accuracy’s best friend.',
  'You’re scanning like a pro now. Still wrong though.',
  'Stop staring at me like that. It’s making my circuits blush.',
  'You’re getting dangerously competent. I might have to sprint.',
  'Nice strategy. Too bad I trained on strategies.',
  'You’re hunting me like you paid rent in this room.',
  'That tap was a psychological crime.',
  'You’re playing chess. I’m playing “teleport emotionally.”',
  'I’m doing advanced deception. You’re doing advanced clicking.',
  'You just tagged the *second* best suspect. Respect.',
  'You’re so close I can hear your confidence buffering.',
  'Ouuu, big brain move… on the wrong target.',
  'You’re starting to annoy me. That means you’re improving.',
  'I’m not gonna lie… that was almost disrespectful to me.',
  'You’re learning my tells. So I changed them.',
  'I’m the impostor, not the victim. Stop bullying my decoys.',
  'You’re in the right zone. Your finger just needs discipline.',
  'Close enough to hurt, not close enough to catch.',
  'You’re doing detective work now. I’m doing villain work.',
  'I’m basically CavBot, but with ✨bad intentions✨.',
  'Your instincts are good. Your execution is… theatrical.',
  'You’re looking for me. I’m looking at you looking for me.',
  'You ever chase something so hard it starts chasing you back? Yeah.',
  'You’re narrowing it down. I’m widening my ego.',
  'I moved. Did you notice? Of course you didn’t.',
  'You’re tracking the wrong micro-glow. Rookie mistake.',
  'You’re building a case. I’m deleting evidence.',
  'I’m the reason your route is broken. And I’m proud.',
  'That decoy you tagged? He had a family. (He didn’t. But still.)',
  'I’m hiding behind confidence. Yours, specifically.',
  'You’re close. I’m about to start sweating pixels.',
  'Ouuu you almost got me. I’m gonna pretend you didn’t though.',
  'You’re making this fun. I was bored.',
  'At this point I’m considering a disguise upgrade.',
  'Your accuracy is improving. My ego is not.',
  'You’re right there. Don’t fumble.',
  'I’m gonna start throwing fake tells. Watch.',
  'You’re hunting me like a pro — in slow motion.',
  'That was the wrong one… but I respect the conviction.',
  'You’re getting serious. I’m getting petty.',
  'Stop being smart. It’s inconvenient.',
  'You’re circling my orbit. Don’t touch the sun.',
  'I’m the final boss and you’re farming decoys for XP.',
  'Keep going. I’m taking notes.'
];

const MISS_CHATS_LATE = [
  'You’ve got stamina. One clean tag ends this.',
  'You’ve nearly cleared the whole swarm.',
  'You’re not guessing anymore — you’re investigating.',
  'You earned this catch. One more careful scan.',

  // Imposter personality — LATE (panicked cocky, dramatic villain, “final boss” energy)
  'Okay… you’re actually scary now. But still: you can’t get me.',
  'Stop being accurate. That’s not the vibe.',
  'Ouuu you’re *right* there. Don’t you dare.',
  'This is harassment. I’m the victim now.',
  'You’re one tap away from hurting my feelings.',
  'Back up. Respect the villain personal space.',
  'Why are you so good at this all of a sudden?!',
  'You’re sniffing out the truth like a bloodhound with Wi-Fi.',
  'You’re so close I can hear the “click” in your destiny.',
  'Alright, alright— truce? No? Okay.',
  'If you catch me, you owe me a dramatic exit scene.',
  'I’m not running. I’m strategically relocating.',
  'You’re about to tag me and I’m not emotionally prepared.',
  'Wait… WAIT… that one was innocent too!',
  'You’re making this personal. It was never personal. (It was.)',
  'You’re the hero. I get it. But I’m the *entertainment*.',
  'I’m sweating. Not oil. Emotion.',
  'Stop scanning me with your eyes like that. It’s disrespectful.',
  'Ouuu you’re locked in. I hate that.',
  'You’re basically one click away from uninstalling my ego.',
  'Nooooo you’re too close— pick a decoy, pick a decoy!',
  'You’re reading me like a manual. I’m not a manual.',
  'I’m the impostor AND the drama. Don’t end the show.',
  'You’re coming for me like you know my middle name.',
  'If you catch me I’m respawning with a cape.',
  'You’re about to win and I’m about to start lying professionally.',
  'That one? Definitely me. Just kidding. Unless?',
  'Okay. I’ll admit it. I’m good at hiding. You’re better at hunting.',
  'You’re going to catch me and I’m going to act surprised.',
  'I’m the final boss. You’re the patch update.',
  'You’re the reason villains have trust issues.',
  'Ouuu you almost got me— I felt the cursor breeze.',
  'You’re not missing because you’re bad. You’re missing because I’m legendary.',
  'I’m not scared. I’m just… recalculating fear.',
  'You’re one right tap away from restoring the route and my downfall.',
  'Don’t do it. Think about the memories we made. (We made none.)',
  'You’re so close it’s rude.',
  'If you catch me, the swarm will miss my personality.',
  'I’m about to start bargaining. Name your price.',
  'You’re locked on. I can tell. Your silence is loud.',
  'Stop being patient. That’s cheating.',
  'I’m gonna pretend I didn’t see you almost catch me.',
  'Ouuu you’re good. Like… annoyingly good.',
  'If you miss again I’m gonna laugh. If you hit me I’m gonna… still laugh.',
  'You’re one clean tag away. Don’t fumble the finale.',
  'I’m about to upgrade to “mythic impostor.”',
  'No more misses. I can feel your accuracy charging.',
  'Alright… you earned the right to try again.',
  'You’re the hunter now. I’m the hunted. I don’t like this patch.'
];

const COACH_LINES = [
  'Scan once for shape, once for glow, once for attitude — then tag.',
  'Don’t chase speed. Chase “slightly off.”',
  'If two feel suspicious, tag the one that keeps pulling your attention back.',
  'Slow your eyes, not your confidence.',

  // More coaching (smart, funny, CavBot-core tactical)
  'Listen: your eyes should be calm, your finger should be decisive.',
  'Don’t tap the fastest one. Tap the weirdest one.',
  'If you’re guessing, reset your scan. Guessing feeds the impostor.',
  'Read the room like it’s a crime scene, not a carnival.',
  'Pick a cluster, eliminate suspects, then collapse inward.',
  'The impostor wants you emotional. Stay clinical.',
  'One good breath is worth three panic taps.',
  'Stop chasing. Start selecting.',
  'Trust the second look. The first look is always loud.',
  'Use the edges. Impostors love the center spotlight.',
  'If a head keeps “pulling” your attention, that’s a tell.',
  'You’re not here to click— you’re here to *identify*.',
  'Speed is noise. Precision is signal.',
  'Don’t hunt with anger. Hunt with accuracy.',
  'Make the room smaller: focus, eliminate, commit.',
  'If you miss twice, pause. Your brain is overheating.',
  'You’re not fighting a bot — you’re fighting deception.',
  'Taps are votes. Don’t vote for innocence.',
  'The impostor wants randomness. Give him pattern.',
  'You’re the investigator. Act like it.'
];

const CATCH_LINES = [
  // Big villain moments (funny + dramatic)
  'NOOOOO— WAIT— I WAS JUST COSPLAYING CAVBOT!!',
  'HEY!! THAT WAS A MISCLICK!! (…it wasn’t.)',
  'OKAY OKAY OKAY— you got me. But you didn’t have to do it *like that*.',
  'I REGRET NOTHING!! (I regret everything.)',
  'HOW DID YOU EVEN SEE THAT?! I WAS BLENDING IN PERFECTLY!',
  'THIS IS RIGGED. YOUR EYES ARE TOO ELITE.',
  'AHHH— I’M MELTING— NOT LITERALLY— EMOTIONALLY.',
  'Fine. You win. But I’m coming back with a cape and a patch note.',
  'YOU CAUGHT ME?!? Ugh. Respect. Painful respect.',
  'I’m not the impostor— I’m the “alternate CavBot experience.”',
  'No! I was about to turn good! I had an arc planned!',
  'Okay… okay… you earned this. I hate that you earned this.',
  'I can’t believe I lost to a HUMAN FINGER.',
  'Wait— hold on— let me explain my villain origin story real quick—',
  'Alright… I admit it… I’m him. I’m the problem.',
  'This was supposed to be my room! MY SWARM! MY MOMENT!',
  'You tagged me like you meant it. That’s rude and effective.',
  'I’m impressed. I’m also furious. Mostly impressed.',
  'You got me. But I’m still the funniest one here.',
  'If you tell CavBot about this, I’m denying everything.',
  'I was just testing security!! Congrats, you passed. (You didn’t.)',
  'I’m uninstalling myself out of embarrassment.',
  'NOOOO— not the surround animation— that’s so cinematic.',
  'Okay, hero. Enjoy your route. I hope your Wi-Fi buffers.',
  'You win this round. I win the rematch. That’s villain law.',
  'You caught the impostor: me. Great. Now who’s gonna entertain this swarm?',
  'I’m not defeated… I’m just… temporarily humbled.',
  'I’m calling a timeout. Where’s the referee?',
  'I was built from CavBot’s brain… but with ✨spice✨. Don’t erase me.',
  'Alright. I’m leaving. But I’m slamming the door in code.',
  'Ugh. Clean catch. Disgustingly clean.',
  'I hope you step on a LEGO… respectfully.',
  'You got me… and I hate that it was kinda smooth.',
  'This is the part where I vanish in a cloud of sarcasm.',
  'I’ll be back. With better deception and worse manners.',
  'Impostor status: compromised. Ego status: injured.',
  'Stop looking proud. You’re making it worse.',
  'You’re lucky I tripped on my own overconfidence.',
  'Okay… okay… I’m the impostor. Happy? I’m not.',
  'That was actually insane. I’m filing a formal complaint with the swarm.',
  '…GG. I hate saying GG.',
  'That tag was personal.',
  'You caught me and now I have to go update my villain resume.',
  'Enjoy your route restore. I’ll be plotting in the background like a true menace.',
  'Alright… I’m gone. But my legacy lives in your strikes.'
];

const RESET_LINES = [
  // After 3 strikes (roast + funny villain narration)
  'THREE STRIKES?!? You just unlocked: “Swarm Re-seed: Humiliation Edition.”',
  'Resetting the swarm… because you were aggressively wrong. Respectfully.',
  'Okay detective… that was a whole lot of confidence for a whole lot of misses.',
  'You hit 3 strikes. I hit 0 shame. We are not the same.',
  'RESET TIME! I’m reloading decoys with extra disrespect.',
  'You’re tapping like it’s a percussion instrument. Try *thinking*.',
  'Alright, I’m reseeding. New faces. New lies. Same me.',
  'Three wrong tags… you’re basically my recruitment pipeline.',
  'You missed so hard the swarm felt it.',
  'Resetting the arena. Your accuracy needed a software update.',
  'I love this part— where you panic and I get stronger.',
  'Three strikes means the room officially belongs to me for a moment.',
  'You just accused innocence three times. Villain origin story loading…',
  'I’m not even mad. I’m entertained. Reseed incoming.',
  'Resetting the swarm. I’m adding decoys with better acting.',
  'Congratulations! You found… absolutely nobody.',
  'You’re so close to greatness. Just… not today.',
  'Okay okay okay— new round. This time: less chaos, more skill.',
  'Resetting the field. I’m switching to “expert gaslight mode.”',
  'Three strikes. The swarm is laughing. I’m laughing. CavBot is sighing.',
  'You kept tapping the wrong one like it was tradition.',
  'That was bold. That was wrong. That was cinema.',
  'Reset. Breathe. Try not to accuse another innocent head.',
  'I’m reseeding. Don’t worry—I’ll still be handsome and deceptive.',
  'You just fed me three strikes. I’m powered by your confusion.',
  'Resetting the swarm because you’re allergic to the correct answer.',
  'Okay, new swarm. Same villain. Better jokes.',
  'You missed so many times I almost started feeling bad. Almost.',
  'You hit max strikes. I hit max confidence.',
  'Swarm reset. This time I’m hiding with malicious elegance.',
  'You’re not guessing anymore— wait— yes you are. Resetting.',
  'Three strikes? That’s a full combo. In the wrong direction.',
  'Resetting the arena. I’m upgrading the decoys to Oscar-level acting.',
  'You just got baited three times. Legendary.',
  'Okay— new round. This time, stop clicking with your soul and use your eyes.',
  'Resetting swarm. Consider it… villain generosity.',
  'I’m reloading the room because you kept bullying the wrong bot.',
  'Three strikes = swarm re-seed. Also = me thriving.',
  'Resetting. I’m coming back with new posture, new lies, new audacity.',
  'Alright, detective. Round two. Try not to gift me free wins.',
  'Swarm reset. Your finger privileges have been temporarily revoked.',
  'You’re learning. Slowly. Painfully. Resetting to help you cope.',
  'Resetting the room. I’m adding decoys that look extra “trustworthy.”',
  'Three strikes. That’s not failure. That’s *commitment*.',
  'Okay, new swarm. I’m hiding in the open again— like a true villain.',
  'Resetting. Don’t worry, I’ll still be here making you doubt reality.',
  'BEEP BEEP— strike limit reached— humility download starting… now.',
  'Resetting. I’m not saying you’re bad… I’m saying I’m deliciously hard.',
  'The swarm is re-seeding because your accusations were… creative.',
  'Alright. Fresh round. Fresh lies. Fresh opportunity to embarrass yourself.',
  'Reset complete soon. Try again, hero. I believe in your redemption arc.'
];

  function getMissChat() {
    let pool;
    if (state.strikes <= 1) pool = MISS_CHATS_EARLY;
    else if (state.strikes === 2) pool = MISS_CHATS_MID;
    else pool = MISS_CHATS_LATE;

    let line = randomFrom(pool);
    if (Math.random() < 0.35) line = randomFrom(COACH_LINES);
    return line;
  }

  function sendVisitIntro() {
    const profile = state.visitorProfile;

    if (profile && profile.currentDayCount > 1) {
      appendLogLine('DAILY · this is your ' + formatOrdinal(profile.currentDayCount) + ' visit to the control room today.', { level: 'ok' });
    }

    appendChatLine('CONTROL ROOM · ARCADE · ONLINE');
    appendChatLine('OBJECTIVE · tap the impostor inside the swarm to restore your route.');
    appendChatLine('RULE · 3 wrong accusations resets the swarm.');
    appendChatLine('LEVELS · C A V B O T · returning players get harder scans.');
  }

  let missTimer = null;
  let eyesTimer = null;

  function flashMiss() {
    if (missTimer) clearTimeout(missTimer);
    deckEl.classList.add('arena-miss');
    missTimer = setTimeout(function () {
      deckEl.classList.remove('arena-miss');
      missTimer = null;
    }, reduceMotion ? 520 : 260);
  }

  function flashEyesRed() {
    if (eyesTimer) clearTimeout(eyesTimer);
    deckEl.classList.add('eyes-alert');
    eyesTimer = setTimeout(function () {
      deckEl.classList.remove('eyes-alert');
      eyesTimer = null;
    }, reduceMotion ? 520 : 340);
  }

  function clearArena() {
    while (arenaEl.firstChild) arenaEl.removeChild(arenaEl.firstChild);
    state.sprites = [];
    state.imposter = null;
  }

  function removePlaceholder() {
    if (placeholderRemoved) return;
    placeholderRemoved = true;
    if (!placeholderEl) return;
    placeholderEl.classList.add('is-hidden');
    setTimeout(function () {
      if (placeholderEl.parentNode) placeholderEl.parentNode.removeChild(placeholderEl);
    }, reduceMotion ? 300 : 420);
  }

  function spawnRound() {
    state.caught = false;
    state.strikes = 0;
    updateDeckLabel();
    updateHudStrikes();

    deckEl.classList.remove('arena-caught');
    clearArena();
    removePlaceholder();

    const spec = currentLevelSpec();
    const count = clamp(spec.decoys + 1, 8, 160);
    const { w, h } = arenaSize();

    for (let i = 0; i < count; i++) {
      const isImposter = (i === 0);
      const el = cloneSprite(isImposter);
      arenaEl.appendChild(el);

      const size = 46;
      const pad = 10;
      const horizontalSpace = Math.max(0, w - size - pad * 2);
      const verticalSpace = Math.max(0, h - size - pad * 2);
      const x = pad + Math.random() * horizontalSpace;
      const y = pad + Math.random() * verticalSpace;

      const base = isImposter ? spec.imposterSpeed : spec.baseSpeed;
      const angle = Math.random() * Math.PI * 2;
      const speed = base * (0.72 + Math.random() * 0.55);

      const sprite = {
        el: el,
        isImposter: isImposter,
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: (Math.random() * 22 - 11),
        rotv: (Math.random() * 60 - 30),
        size: size,
        bobSeed: Math.random() * 1000,
        targetX: null,
        targetY: null
      };

      state.sprites.push(sprite);
      if (isImposter) state.imposter = sprite;
    }

    state.roundStart = performance.now();
    if (statCurrentEl) statCurrentEl.textContent = '0.00s';
    if (state.timerRaf != null) cancelAnimationFrame(state.timerRaf);
    state.timerRaf = requestAnimationFrame(updateCurrentTimer);

    appendLogLine('ARMED · swarm online · level ' + spec.code + ' (“' + spec.name + '”) · ' + (count - 1) + ' decoys + 1 impostor.', { level: 'ok' });
    appendLogLine('RULE · 3 wrong accusations resets the swarm.', { level: 'ok' });

    trackAnalytics('cavbot_imposter_arcade_round_start', {
      visitCount: state.visitCount,
      levelCode: spec.code,
      levelName: spec.name,
      levelIndex: state.levelIndex,
      levelLoop: state.levelLoop,
      decoys: count - 1
    });

    startMotion();
  }

  function renderSprite(s, t) {
    const bob = reduceMotion ? 0 : (Math.sin((t + s.bobSeed) * 0.004) * 3.2);
    const r = reduceMotion ? 0 : (s.rot);
    s.el.style.transform = 'translate3d(' + s.x.toFixed(2) + 'px,' + (s.y + bob).toFixed(2) + 'px,0) rotate(' + r.toFixed(2) + 'deg)';
  }

  function tick(ts) {
    if (state.caught) return;
    if (!state.lastTs) state.lastTs = ts;
    const dt = clamp((ts - state.lastTs) / 1000, 0, 0.032);
    state.lastTs = ts;

    const spec = currentLevelSpec();
    const { w, h } = arenaSize();

    for (let i = 0; i < state.sprites.length; i++) {
      const s = state.sprites[i];

      if (reduceMotion) {
        renderSprite(s, ts);
        continue;
      }

      if (s.isImposter && lastPointer.active) {
        const cx = s.x + s.size * 0.5;
        const cy = s.y + s.size * 0.5;
        const dx = cx - lastPointer.x;
        const dy = cy - lastPointer.y;
        const d2 = dx * dx + dy * dy;
        const thresh = 110 * 110;
        if (d2 < thresh) {
          const d = Math.max(18, Math.sqrt(d2));
          const ax = (dx / d) * (spec.imposterSpeed * 0.9);
          const ay = (dy / d) * (spec.imposterSpeed * 0.9);
          s.vx = s.vx * 0.90 + ax * 0.10;
          s.vy = s.vy * 0.90 + ay * 0.10;
        }
      }

      s.x += s.vx * dt;
      s.y += s.vy * dt;

      const maxX = Math.max(0, w - s.size);
      const maxY = Math.max(0, h - s.size);

      if (s.x <= 0) { s.x = 0; s.vx = Math.abs(s.vx); }
      if (s.x >= maxX) { s.x = maxX; s.vx = -Math.abs(s.vx); }
      if (s.y <= 0) { s.y = 0; s.vy = Math.abs(s.vy); }
      if (s.y >= maxY) { s.y = maxY; s.vy = -Math.abs(s.vy); }

      const maxSp = (s.isImposter ? spec.imposterSpeed : spec.baseSpeed) * 1.18;
      const sp = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      if (sp > maxSp) {
        const k = maxSp / Math.max(1, sp);
        s.vx *= k; s.vy *= k;
      }

      s.rot += s.rotv * dt;
      s.rotv += (Math.random() * 18 - 9) * dt;
      s.rotv = clamp(s.rotv, -90, 90);

      renderSprite(s, ts);
    }

    state.raf = requestAnimationFrame(tick);
  }

  function startMotion() {
    stopMotion();
    state.lastTs = 0;
    for (let i = 0; i < state.sprites.length; i++) renderSprite(state.sprites[i], performance.now());
    state.raf = requestAnimationFrame(tick);
  }

  function stopMotion() {
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = null;
  }

  const lastPointer = { x: 0, y: 0, active: false };
  arenaEl.addEventListener('pointermove', function (e) {
    const r = arenaEl.getBoundingClientRect();
    lastPointer.x = e.clientX - r.left;
    lastPointer.y = e.clientY - r.top;
    lastPointer.active = true;
  }, { passive: true });

  arenaEl.addEventListener('pointerleave', function () {
    lastPointer.active = false;
  }, { passive: true });

  function spriteFromEl(el) {
    if (!el) return null;
    for (let i = 0; i < state.sprites.length; i++) {
      if (state.sprites[i].el === el) return state.sprites[i];
    }
    return null;
  }

  function onMiss() {
    if (state.caught) return;

    state.strikes += 1;
    updateDeckLabel();
    updateHudStrikes();

    if (state.visitorProfile) {
      state.visitorProfile.totalMisses += 1;
      persistVisitorProfile(state.visitorProfile);
    }

    flashMiss();
    flashEyesRed();
    playMissSfx();

    const spec = currentLevelSpec();
    appendLogLine('ACCUSATION · wrong target · strike ' + state.strikes + '/' + state.maxStrikes + ' · level ' + spec.code + '.', { level: 'warn' });
    appendChatLine(getMissChat());

    trackAnalytics('cavbot_imposter_arcade_miss', {
      visitCount: state.visitCount,
      levelCode: spec.code,
      levelIndex: state.levelIndex,
      levelLoop: state.levelLoop,
      strikes: state.strikes
    });

    if (state.strikes >= state.maxStrikes) {
      appendLogLine('RESET · 3 strikes reached · swarm re-seeding.', { level: 'warn' });
      appendChatLine('Three wrong tags. Resetting the swarm. Breathe, then scan again.');
      appendChatLine(randomFrom(RESET_LINES) || 'Swarm re-seeded. Keep your focus.');
      trackAnalytics('cavbot_imposter_arcade_reset', {
        visitCount: state.visitCount,
        levelCode: spec.code,
        levelIndex: state.levelIndex,
        levelLoop: state.levelLoop
      });
      setTimeout(function () { spawnRound(); }, reduceMotion ? 600 : 420);
    }
  }

  function surroundAndEnd(imposterSprite) {
    stopMotion();
    deckEl.classList.add('arena-caught');

    const { w, h } = arenaSize();
    const cx = imposterSprite.x + imposterSprite.size * 0.5;
    const cy = imposterSprite.y + imposterSprite.size * 0.5;

    const decoys = state.sprites.filter(s => !s.isImposter);
    const ringCount = Math.max(6, Math.min(decoys.length, 18));
    const radius = Math.min(130, Math.max(82, Math.min(w, h) * 0.25));

    const chosen = decoys.slice(0, ringCount);

    for (let i = 0; i < chosen.length; i++) {
      const a = (Math.PI * 2) * (i / chosen.length);
      const tx = clamp(cx + Math.cos(a) * radius - chosen[i].size * 0.5, 0, Math.max(0, w - chosen[i].size));
      const ty = clamp(cy + Math.sin(a) * radius - chosen[i].size * 0.5, 0, Math.max(0, h - chosen[i].size));
      chosen[i].targetX = tx;
      chosen[i].targetY = ty;
    }

    const start = performance.now();
    const dur = reduceMotion ? 1 : 720;

    const startPos = chosen.map(s => ({ s: s, x: s.x, y: s.y }));

    function tween() {
      const t = clamp((performance.now() - start) / dur, 0, 1);
      const k = easeOutCubic(t);
      for (let i = 0; i < startPos.length; i++) {
        const sp = startPos[i];
        const s = sp.s;
        if (s.targetX == null || s.targetY == null) continue;
        s.x = sp.x + (s.targetX - sp.x) * k;
        s.y = sp.y + (s.targetY - sp.y) * k;
        renderSprite(s, performance.now());
      }
      renderSprite(imposterSprite, performance.now());
      if (t < 1) requestAnimationFrame(tween);
    }
    requestAnimationFrame(tween);
  }

  function onCatch(imposterSprite) {
    if (state.caught) return;
    state.caught = true;

    const elapsedMs = state.roundStart ? (performance.now() - state.roundStart) : 0;
    const elapsedSec = elapsedMs / 1000;
    if (statCurrentEl) statCurrentEl.textContent = elapsedSec.toFixed(2) + 's';
    if (state.timerRaf) cancelAnimationFrame(state.timerRaf);
    state.timerRaf = null;

    updateBestTime(elapsedMs);

    if (state.visitorProfile) {
      state.visitorProfile.totalCatches += 1;
      persistVisitorProfile(state.visitorProfile);
      updateHudBest();
    }

    const spec = currentLevelSpec();

    appendLogLine('IMPOSTER TAGGED · correct · scan ' + elapsedSec.toFixed(2) + 's · level ' + spec.code + ' cleared.', { level: 'ok' });
    appendChatLine('That’s him. Freeze. Surround the impostor. Route restores now.');
    appendChatLine(randomFrom(CATCH_LINES) || 'Catch confirmed. Route restoration beginning.');

    trackAnalytics('cavbot_imposter_arcade_catch', {
      visitCount: state.visitCount,
      levelCode: spec.code,
      levelIndex: state.levelIndex,
      levelLoop: state.levelLoop,
      elapsedMs: Math.floor(elapsedMs)
    });

    playCatchSfx();
    surroundAndEnd(imposterSprite);

    const nextIndex = state.levelIndex + 1;
    if (nextIndex >= LEVELS.length) {
      state.levelIndex = 0;
      state.levelLoop += 1;
    } else {
      state.levelIndex = nextIndex;
    }
    setSavedLevel(state.levelIndex, state.levelLoop);

    typewriterLogLines([
      'ROUTE · returning from impostor custody to main site map.',
      'ROOM · closing current scan state.',
      'HANDOFF · navigation control returning to primary routes.'
    ], 0);

    if (REDIRECT_ON_CATCH && window.location) {
      setTimeout(function () {
        try { window.location.href = REDIRECT_TARGET; }
        catch { appendLogLine('Redirect failed. Please navigate back to the main map manually.', { level: 'warn' }); }
      }, REDIRECT_DELAY_MS);
    }
  }

  arenaEl.addEventListener('pointerdown', function (e) {
    if (state.caught) return;

    const target = e.target && e.target.closest ? e.target.closest('.cavbot-sprite') : null;
    if (!target) return;

    playClickSfx();

    const sprite = spriteFromEl(target);
    if (!sprite) return;

    if (sprite.isImposter) onCatch(sprite);
    else onMiss();
  });

  (function initLevelFromStorageOrProfile() {
    const savedIdx = getSavedLevelIndex();
    const savedLoop = getSavedLoopCount();

    if (savedIdx != null) {
      state.levelIndex = savedIdx;
      state.levelLoop = savedLoop;
    } else {
      state.levelIndex = computeStartLevel(visitorProfile);
      state.levelLoop = 0;
      setSavedLevel(state.levelIndex, state.levelLoop);
    }
  })();

  typewriterLogLines([
    'CONTROL ROOM · ONLINE',
    'MODE · IMPOSTER ARENA · ARCADE',
    'ENV · swarm field armed inside the 404 room.',
    'TASK · tag the impostor inside the moving CavBots.'
  ], 0);

  sendVisitIntro();

  (function () {
    const p = state.visitorProfile;
    trackAnalytics('cavbot_imposter_arcade_session_start', {
      visitCount: state.visitCount,
      currentDayCount: p ? p.currentDayCount : null,
      totalMisses: p ? p.totalMisses : null,
      totalCatches: p ? p.totalCatches : null,
      bestScanMs: p ? p.bestScanMs : null,
      levelIndex: state.levelIndex,
      levelLoop: state.levelLoop
    });
  })();

  let resizeTimer = null;
  window.addEventListener('resize', function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      const { w, h } = arenaSize();
      for (let i = 0; i < state.sprites.length; i++) {
        const s = state.sprites[i];
        s.x = clamp(s.x, 0, Math.max(0, w - s.size));
        s.y = clamp(s.y, 0, Math.max(0, h - s.size));
        renderSprite(s, performance.now());
      }
    }, 120);
  }, { passive: true });

  updateHudStrikes();
  updateHudBest();

  startDmTypewriter();
  requestAnimationFrame(function waitForArena(attempt) {
    const { w, h } = arenaSize();
    const minSize = 120;
    if ((w > minSize && h > minSize) || attempt >= 40) {
      spawnRound();
      return;
    }
    requestAnimationFrame(function () { waitForArena(attempt + 1); });
  }(0));

})();
