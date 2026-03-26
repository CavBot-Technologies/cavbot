 // Archive filtering + search (dropdown + input)
    (function () {
      var select = document.getElementById('filterSelect');
      var cards = Array.prototype.slice.call(document.querySelectorAll('.story-card'));
      var input = document.getElementById('newsSearch');
      var count = document.getElementById('resultCount');

      function normalizeTags(tagStr) {
        return (tagStr || '')
          .toLowerCase()
          .split(',')
          .map(function (t) { return t.trim(); })
          .filter(Boolean);
      }

      function labelForFilter(f) {
        if (f === 'all') return 'Showing all';
        if (f === 'arcade') return 'Showing 404 LAB';
        if (f === 'media') return 'Showing MEDIA KIT';
        return 'Showing ' + f.toUpperCase();
      }

      function applyFilter(filter, query) {
        var f = (filter || 'all').toLowerCase();
        var q = (query || '').trim().toLowerCase();
        var shown = 0;

        cards.forEach(function (card) {
          var tags = normalizeTags(card.getAttribute('data-tags'));
          var title = (card.getAttribute('data-title') || '').toLowerCase();

          var tagOk = (f === 'all') ? true : (tags.indexOf(f) !== -1);
          var searchOk = q ? (title.indexOf(q) !== -1) : true;

          var show = tagOk && searchOk;
          card.hidden = !show;
          if (show) shown++;
        });

        if (!q) {
          count.textContent = labelForFilter(f);
        } else {
          count.textContent = shown + ' match' + (shown === 1 ? '' : 'es');
        }
      }

      if (select) {
        select.addEventListener('change', function () {
          applyFilter(select.value, input ? input.value : '');
        });
      }

      if (input) {
        input.addEventListener('input', function () {
          applyFilter(select ? select.value : 'all', input.value);
        });
      }

      applyFilter(select ? select.value : 'all', '');
    })();