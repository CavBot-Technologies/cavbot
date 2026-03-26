 // GLOBAL CTA BUTTONS (safe, no conflict)
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

    // Assembly mode: true in-place build sequence with swipe dots.
    (function () {
      const toggle = document.getElementById('assemblyToggle');
      const hint = document.getElementById('assemblyHint');
      const assembly = document.getElementById('assembly');
      const stack = document.getElementById('assemblyStack');
      const dotsWrap = document.getElementById('assemblyDots');
      const layers = Array.from(document.querySelectorAll('[data-assembly-layer]'));

      if (!toggle || !hint || !assembly || !stack || !dotsWrap || !layers.length) return;

      const BUILD_MASK_PIECES = 6;
      const PIECE_DELAY_MS = 120;
      const PIECE_ANIM_MS = 520;
      const BUILD_STEP_MS = PIECE_ANIM_MS + ((BUILD_MASK_PIECES - 1) * PIECE_DELAY_MS) + 140;
      const BUILD_GAP_MS = 220;

      const buildLabels = {
        badge: 'Assembling identity module…',
        head: 'Assembling head module…',
        body: 'Assembling execution module…'
      };

      let isOn = false;
      let isRunningBuild = false;
      let idx = Math.max(0, layers.findIndex((layer) => layer.getAttribute('data-assembly-layer') === 'head'));
      let seqTimers = [];
      let touchStartX = null;

      function clearSeq() {
        while (seqTimers.length) {
          clearTimeout(seqTimers.pop());
        }
      }

      function resetBuildState() {
        layers.forEach((layer) => {
          layer.classList.remove('is-building');
          layer.classList.remove('is-built');
        });
      }

      function ensureBuildMasks() {
        layers.forEach((layer) => {
          const viewport = layer.querySelector('.assembly-viewport');
          if (!viewport || viewport.querySelector('.assembly-build-mask')) return;

          const mask = document.createElement('div');
          mask.className = 'assembly-build-mask';
          mask.setAttribute('aria-hidden', 'true');

          for (let i = 0; i < BUILD_MASK_PIECES; i += 1) {
            mask.appendChild(document.createElement('span'));
          }

          viewport.appendChild(mask);
        });
      }

      function updateHint() {
        const key = layers[idx].getAttribute('data-assembly-layer') || 'layer';
        if (!isOn) {
          hint.textContent = 'Swipe left or right to browse layers. Enable Assembly mode for guided build.';
          return;
        }

        if (isRunningBuild) {
          hint.textContent = buildLabels[key] || 'Assembling layer…';
          return;
        }

        hint.textContent = 'Assembly complete. Swipe left or right to inspect each layer.';
      }

      function updateDots() {
        const dots = Array.from(dotsWrap.querySelectorAll('.assembly-dot'));
        dots.forEach((dot, dotIndex) => {
          const isCurrent = dotIndex === idx;
          dot.classList.toggle('is-current', isCurrent);
          dot.setAttribute('aria-selected', String(isCurrent));
          dot.tabIndex = isCurrent ? 0 : -1;
        });
      }

      function setStep(i, options) {
        const opts = options || {};
        const building = Boolean(opts.building);
        idx = Math.max(0, Math.min(layers.length - 1, i));

        layers.forEach((l, n) => {
          const isCurrent = n === idx;
          l.classList.toggle('is-step', isCurrent);
          l.classList.toggle('is-active', isCurrent);
          l.classList.toggle('is-building', isCurrent && building);
          l.setAttribute('aria-hidden', String(!isCurrent));
        });
        updateDots();
        updateHint();
      }

      function jumpBy(delta) {
        if (isRunningBuild) return;
        clearSeq();
        setStep(idx + delta);
      }

      function buildDots() {
        dotsWrap.innerHTML = '';
        layers.forEach((layer, layerIndex) => {
          const key = layer.getAttribute('data-assembly-layer') || ('layer ' + (layerIndex + 1));
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'assembly-dot';
          dot.setAttribute('role', 'tab');
          dot.setAttribute('aria-controls', layer.id);
          dot.setAttribute('aria-label', 'Show ' + key + ' layer');
          dot.addEventListener('click', () => {
            if (isRunningBuild) return;
            clearSeq();
            setStep(layerIndex);
          });
          dotsWrap.appendChild(dot);
        });
      }

      function runBuildSequence() {
        clearSeq();
        resetBuildState();
        isRunningBuild = true;

        let delay = 0;
        layers.forEach((layer, layerIndex) => {
          seqTimers.push(setTimeout(() => {
            setStep(layerIndex, { building: true });
          }, delay));

          seqTimers.push(setTimeout(() => {
            layer.classList.remove('is-building');
            layer.classList.add('is-built');
            setStep(layerIndex);
          }, delay + BUILD_STEP_MS));

          delay += BUILD_STEP_MS + BUILD_GAP_MS;
        });

        seqTimers.push(setTimeout(() => {
          isRunningBuild = false;
          setStep(layers.length - 1);
        }, delay));
      }

      function setNormalMode() {
        clearSeq();
        isRunningBuild = false;
        resetBuildState();
        const headIndex = Math.max(0, layers.findIndex((layer) => layer.getAttribute('data-assembly-layer') === 'head'));
        setStep(headIndex);
      }

      toggle.addEventListener('click', () => {
        isOn = !isOn;
        document.body.classList.toggle('is-assembly-mode', isOn);
        toggle.setAttribute('aria-pressed', String(isOn));
        toggle.textContent = isOn ? 'Assembly mode: On' : 'Assembly mode';

        if (isOn) {
          assembly.scrollIntoView({ behavior: 'smooth', block: 'center' });
          runBuildSequence();
        } else {
          setNormalMode();
        }
      });

      stack.addEventListener('touchstart', (event) => {
        touchStartX = event.changedTouches[0].clientX;
      }, { passive: true });

      stack.addEventListener('touchend', (event) => {
        if (touchStartX === null) return;
        const deltaX = event.changedTouches[0].clientX - touchStartX;
        touchStartX = null;
        if (Math.abs(deltaX) < 36) return;
        jumpBy(deltaX < 0 ? 1 : -1);
      }, { passive: true });

      stack.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          jumpBy(1);
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          jumpBy(-1);
        }
      });

      // Initialize
      ensureBuildMasks();
      buildDots();
      stack.tabIndex = 0;
      setNormalMode();
    })();
