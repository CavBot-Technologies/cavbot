 (function () {
      var cards = Array.prototype.slice.call(document.querySelectorAll('.research-card'));
      var input = document.getElementById('researchSearch');
      var count = document.getElementById('resultCount');
      var totalCount = document.getElementById('totalCount');
      var grid = document.getElementById('researchGrid');

      var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-button[data-filter]'));
      var sortSelect = document.getElementById('sortSelect');

      function normalizeTags(tagStr) {
        return (tagStr || '')
          .toLowerCase()
          .split(',')
          .map(function (t) { return t.trim(); })
          .filter(Boolean);
      }

      function labelForFilter(f) {
        if (f === 'all') return 'Showing all';
        if (f === 'field-guide') return 'Showing FIELD GUIDES';
        return 'Showing ' + f.toUpperCase();
      }

      var activeFilter = 'all';

      function applyFilterAndSearch() {
        var f = (activeFilter || 'all').toLowerCase();
        var q = (input && input.value ? input.value : '').trim().toLowerCase();
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

        if (count) {
          if (!q) count.textContent = labelForFilter(f);
          else count.textContent = shown + ' match' + (shown === 1 ? '' : 'es');
        }

        if (totalCount) totalCount.textContent = String(cards.length);
      }

      function sortCards() {
        if (!sortSelect || !grid) return;

        var mode = sortSelect.value || 'newest';

        cards.sort(function (a, b) {
          var aTitle = (a.getAttribute('data-title') || '').toLowerCase();
          var bTitle = (b.getAttribute('data-title') || '').toLowerCase();
          var aDate = new Date(a.getAttribute('data-date') || '1970-01-01').getTime();
          var bDate = new Date(b.getAttribute('data-date') || '1970-01-01').getTime();

          if (mode === 'oldest') return aDate - bDate;
          if (mode === 'az') return aTitle.localeCompare(bTitle);
          return bDate - aDate;
        });

        cards.forEach(function (c) { grid.appendChild(c); });
      }

      filterButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          activeFilter = btn.getAttribute('data-filter') || 'all';
          filterButtons.forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
          applyFilterAndSearch();
        });
      });

      if (input) {
        input.addEventListener('input', function () {
          applyFilterAndSearch();
        });
      }

      if (sortSelect) {
        sortSelect.addEventListener('change', function () {
          sortCards();
          applyFilterAndSearch();
        });
      }

      sortCards();
      applyFilterAndSearch();
    })();
