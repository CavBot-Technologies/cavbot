 (function () {
      var buttons = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-type]'));
      var input = document.getElementById('newsSearch');
      var count = document.getElementById('resultCount');

      function applyFilter(filter, query) {
        var q = (query || '').trim().toLowerCase();
        var shown = 0;

        cards.forEach(function (card) {
          var type = (card.getAttribute('data-type') || '').toLowerCase();
          var title = (card.getAttribute('data-title') || '').toLowerCase();
          var typeOk = (filter === 'all') ? true : (type === filter);
          var searchOk = q ? (title.indexOf(q) !== -1) : true;

          var show = typeOk && searchOk;
          card.hidden = !show;
          if (show) shown++;
        });

        if (!q && filter === 'all') count.textContent = 'Showing all';
        else if (!q) count.textContent = 'Showing ' + filter.toUpperCase();
        else count.textContent = shown + ' match' + (shown === 1 ? '' : 'es');
      }

      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          buttons.forEach(function (b) { b.setAttribute('aria-selected', 'false'); });
          btn.setAttribute('aria-selected', 'true');
          applyFilter(btn.getAttribute('data-filter') || 'all', input ? input.value : '');
        });
      });

      if (input) {
        input.addEventListener('input', function () {
          var active = document.querySelector('.filter-btn[aria-selected="true"]');
          applyFilter(active ? active.getAttribute('data-filter') : 'all', input.value);
        });
      }

      applyFilter('all', '');
    })();