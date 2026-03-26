 // Press filtering + search (FIXED: cards can always re-appear after being hidden)
    (function () {
      var select = document.getElementById('filterSelect');
      var input = document.getElementById('pressSearch');
      var count = document.getElementById('resultCount');
      var empty = document.getElementById('emptyState');

      var cards = Array.prototype.slice.call(document.querySelectorAll('.story-card'));
      var placeholders = cards.filter(function (c) { return c.getAttribute('data-placeholder') === 'true'; });
      var realCards = cards.filter(function (c) { return c.getAttribute('data-placeholder') !== 'true'; });

      function labelForFilter(f) {
        if (f === 'all') return 'Showing all';
        if (f === 'release') return 'Showing press releases';
        if (f === 'resources') return 'Showing resources';
        return 'Showing ' + String(f || '').toUpperCase();
      }

      function applyFilter() {
        var f = (select ? select.value : 'all').toLowerCase();
        var q = (input ? input.value : '').trim().toLowerCase();
        var shown = 0;

        realCards.forEach(function (card) {
          var kind = (card.getAttribute('data-kind') || '').toLowerCase();
          var title = (card.getAttribute('data-title') || '').toLowerCase();

          var kindOk = (f === 'all') ? true : (kind === f);
          var searchOk = q ? (title.indexOf(q) !== -1) : true;

          var show = kindOk && searchOk;
          card.hidden = !show;
          if (show) shown++;
        });

        // keep placeholders permanently hidden
        placeholders.forEach(function (p) { p.hidden = true; });

        if (q) count.textContent = shown + ' match' + (shown === 1 ? '' : 'es');
        else count.textContent = labelForFilter(f);

        if (empty) empty.style.display = (shown === 0) ? 'block' : 'none';
      }

      if (select) select.addEventListener('change', applyFilter);
      if (input) input.addEventListener('input', applyFilter);

      applyFilter(); // initial paint (no delayed “only after load” bug)
    })();

    // Story media image binding (uses data-image)
    (function () {
      var media = Array.prototype.slice.call(document.querySelectorAll('.story-media[data-image]'));
      media.forEach(function (el) {
        var url = el.getAttribute('data-image');
        if (!url) return;
        // set CSS var so the ::before can use it
        el.style.setProperty('--story-media-img', 'url("' + url.replace(/"/g, '\\"') + '")');
      });
    })();