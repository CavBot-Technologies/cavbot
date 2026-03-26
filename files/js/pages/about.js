  // DIGITIZED METRIC ANIMATION (unchanged)
    (function setupMetricDigitAnimation() {
      var cards = document.querySelectorAll('[data-metric-card]');
      if (!cards.length) return;

      function animateCard(card) {
        if (card.classList.contains('is-live')) return;
        card.classList.add('is-live');

        var numEl = card.querySelector('.culture-metric-value-number');
        if (!numEl) return;

        var target = parseFloat(numEl.getAttribute('data-value'));
        if (isNaN(target)) return;

        var sign = target < 0 ? '-' : (numEl.textContent.trim().startsWith('+') ? '+' : '');
        var absTarget = Math.abs(target);
        var current = 0;
        var startTime = null;
        var duration = 900; // ms

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3); // ease-out
          current = Math.round(absTarget * eased);

          numEl.textContent = sign + current;

          if (progress < 1) {
            window.requestAnimationFrame(step);
          } else {
            numEl.textContent = sign + absTarget;
          }
        }

        window.requestAnimationFrame(step);
      }

      if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCard(entry.target);
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.4
        });

        cards.forEach(function (card) { observer.observe(card); });
      } else {
        // Fallback: animate all on load
        cards.forEach(animateCard);
      }
    })();