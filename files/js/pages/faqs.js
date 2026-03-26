 // GLOBAL CTA BUTTONS
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

    // FAQ ENGINE: filters + search + suggestions + counts + open/close visible
    (function () {
      const DEFAULT_FILTER = 'all';
      const filterButtons = document.querySelectorAll('[data-faq-filter]');
      const filterSelect = document.getElementById('faq-filter-select');
      const faqStack = document.getElementById('faq-stack');

      const searchInput = document.getElementById('faq-search-input');
      const suggestions = document.getElementById('faq-suggestions');

      const sections = document.querySelectorAll('[data-faq-section]');
      const items = document.querySelectorAll('[data-faq-item]');
      const navLinks = document.querySelectorAll('[data-faq-nav]');
      const emptyState = document.getElementById('faq-empty');
      const faqNavCard = document.querySelector('.faq-nav-card');

      const expandBtn = document.getElementById('expand-visible');
      const collapseBtn = document.getElementById('collapse-visible');
      const clearBtn = document.getElementById('clear-filters');

      const metricCategories = document.getElementById('metric-categories');
      const metricQuestions = document.getElementById('metric-questions');
      const metricVisible = document.getElementById('metric-visible');

      const countEls = document.querySelectorAll('[data-faq-count]');

      function syncStackHeightToNav() {
        if (!faqStack || !faqNavCard) return;

        if (window.matchMedia('(max-width: 960px)').matches) {
          faqStack.style.height = '';
          faqStack.style.maxHeight = '';
          return;
        }

        const navHeight = Math.ceil(faqNavCard.getBoundingClientRect().height);
        if (navHeight > 0) {
          faqStack.style.height = navHeight + 'px';
          faqStack.style.maxHeight = navHeight + 'px';
        }
      }

      function setActiveNav(filter) {
        navLinks.forEach(function (a) {
          const isMatch = filter !== 'all' && a.getAttribute('data-faq-nav') === filter;
          a.classList.toggle('is-active', isMatch);
          a.setAttribute('aria-current', isMatch ? 'true' : 'false');
        });
      }

      function setActiveFilter(filter) {
        filterButtons.forEach(function (b) {
          const isMatch = (b.getAttribute('data-faq-filter') === filter);
          b.classList.toggle('is-active', isMatch);
          b.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
          b.setAttribute('aria-selected', isMatch ? 'true' : 'false');
        });
        if (filterSelect) filterSelect.value = filter;
        setActiveNav(filter);
      }

      function getActiveFilter() {
        if (filterSelect && window.matchMedia('(max-width: 720px)').matches) {
          return filterSelect.value || DEFAULT_FILTER;
        }
        const active = document.querySelector('.btn-chip.is-active');
        return active ? active.getAttribute('data-faq-filter') : DEFAULT_FILTER;
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

      function escapeHtml(s) {
        return String(s)
          .replace(/&/g,'&amp;')
          .replace(/</g,'&lt;')
          .replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;')
          .replace(/'/g,'&#039;');
      }

      function buildSuggestions() {
        if (!searchInput || !suggestions) return;
        const q = (searchInput.value || '').toLowerCase().trim();
        if (!q || q.length < 2) { closeSuggestions(); return; }

        const pool = [];

        items.forEach(function (d) {
          const sum = d.querySelector('summary');
          const qText = sum ? sum.textContent.trim() : 'Question';
          const cat = (d.getAttribute('data-faq-category') || 'FAQ').toUpperCase();
          const searchText = (d.getAttribute('data-faq-search') || '').toLowerCase();
          const ansText = (d.querySelector('.faq-a') ? d.querySelector('.faq-a').textContent : '').toLowerCase();

          if (qText.toLowerCase().includes(q) || searchText.includes(q) || ansText.includes(q)) {
            pool.push({ title: qText, tag: cat, el: d });
          }
        });

        const top = pool.slice(0, 7);
        if (!top.length) { closeSuggestions(); return; }

        suggestions.innerHTML = top.map(function (x, idx) {
          return (
            '<div class="faq-suggestion" role="option" data-idx="' + idx + '">' +
              '<span class="faq-sug-tag">' + escapeHtml(x.tag) + '</span>' +
              '<span class="faq-sug-title">' + escapeHtml(x.title) + '</span>' +
            '</div>'
          );
        }).join('');

        openSuggestions();

        suggestions.querySelectorAll('.faq-suggestion').forEach(function (row) {
          row.addEventListener('click', function () {
            const idx = parseInt(row.getAttribute('data-idx'), 10);
            const target = top[idx] ? top[idx].el : null;
            if (!target) return;

            closeSuggestions();
            jumpToItem(target);
          });
        });
      }

      function jumpToItem(item) {
        // ensure it becomes visible
        const category = item.getAttribute('data-faq-category') || 'all';
        // if a filter is set that would hide it, flip to that category
        if (getActiveFilter() !== 'all' && getActiveFilter() !== category) {
          setActiveFilter(category);
        }

        // clear highlights
        items.forEach(function (x) { x.classList.remove('is-highlighted'); });

        // open the details
        item.open = true;

        // scroll
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // highlight
        item.classList.add('is-highlighted');
        setTimeout(function () { item.classList.remove('is-highlighted'); }, 1400);

        applyFilters(); // recompute counts
      }

      function applyFilters() {
        const filter = getActiveFilter();
        const q = (searchInput && searchInput.value ? searchInput.value : '').toLowerCase().trim();

        let visibleItems = 0;
        const perCategoryVisible = {};

        items.forEach(function (d) {
          const category = d.getAttribute('data-faq-category') || '';
          const searchText = (d.getAttribute('data-faq-search') || '').toLowerCase();
          const qText = (d.querySelector('summary') ? d.querySelector('summary').textContent : '').toLowerCase();
          const aText = (d.querySelector('.faq-a') ? d.querySelector('.faq-a').textContent : '').toLowerCase();

          const matchesFilter = (filter === 'all') || (category === filter);
          const matchesSearch = !q || searchText.includes(q) || qText.includes(q) || aText.includes(q);

          const show = matchesFilter && matchesSearch;
          d.style.display = show ? '' : 'none';

          if (show) {
            visibleItems++;
            perCategoryVisible[category] = (perCategoryVisible[category] || 0) + 1;
          }
        });

        // show/hide sections based on visible children
        let visibleCategories = 0;
        sections.forEach(function (sec) {
          const cat = sec.getAttribute('data-faq-section');
          const anyVisible = perCategoryVisible[cat] > 0;
          sec.style.display = anyVisible ? '' : 'none';
          if (anyVisible) visibleCategories++;
        });

        // update nav counts + nav visibility
        countEls.forEach(function (el) {
          const cat = el.getAttribute('data-faq-count');
          const n = perCategoryVisible[cat] || 0;
          el.textContent = String(n).padStart(2,'0');
        });

        navLinks.forEach(function (a) {
          const cat = a.getAttribute('data-faq-nav');
          const n = perCategoryVisible[cat] || 0;
          a.style.display = n > 0 ? '' : 'none';
        });

        // metrics
        if (metricCategories) metricCategories.textContent = String(visibleCategories);
        if (metricQuestions) metricQuestions.textContent = String(items.length);
        if (metricVisible) metricVisible.textContent = String(visibleItems);

        // empty state
        if (emptyState) emptyState.classList.toggle('is-visible', visibleItems === 0);

        // Keep right panel visually aligned to left categories panel.
        syncStackHeightToNav();
      }

      function expandVisible() {
        sections.forEach(function (sec) {
          if (sec.style.display === 'none') return;
          sec.querySelectorAll('details.faq-item').forEach(function (d) {
            if (d.style.display === 'none') return;
            d.open = true;
          });
        });
      }

      function collapseVisible() {
        sections.forEach(function (sec) {
          if (sec.style.display === 'none') return;
          sec.querySelectorAll('details.faq-item').forEach(function (d) {
            if (d.style.display === 'none') return;
            d.open = false;
          });
        });
      }

      function clearAll() {
        if (searchInput) searchInput.value = '';
        closeSuggestions();
        setActiveFilter(DEFAULT_FILTER);
        collapseVisible();
        applyFilters();
      }

      // events
      filterButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          const filter = btn.getAttribute('data-faq-filter') || 'all';
          setActiveFilter(filter);
          applyFilters();
        });
      });

      if (filterSelect) {
        filterSelect.addEventListener('change', function () {
          setActiveFilter(filterSelect.value || DEFAULT_FILTER);
          applyFilters();
        });
      }

      window.addEventListener('resize', syncStackHeightToNav);

      navLinks.forEach(function (link) {
        link.addEventListener('click', function (event) {
          const category = link.getAttribute('data-faq-nav');
          if (!category) return;

          event.preventDefault();
          setActiveFilter(category);
          applyFilters();

          const targetSelector = link.getAttribute('href');
          const target = targetSelector ? document.querySelector(targetSelector) : null;

          if (faqStack) {
            faqStack.scrollTo({ top: 0, behavior: 'smooth' });
          }
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });

      if (searchInput) {
        searchInput.addEventListener('input', function () {
          applyFilters();
          buildSuggestions();
        });
        searchInput.addEventListener('blur', function () {
          setTimeout(closeSuggestions, 120);
        });
      }

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeSuggestions();
      });

      if (expandBtn) expandBtn.addEventListener('click', expandVisible);
      if (collapseBtn) collapseBtn.addEventListener('click', collapseVisible);
      if (clearBtn) clearBtn.addEventListener('click', clearAll);

      // initial counts
      const hashCategory = String(window.location.hash || '').replace(/^#faq-/, '').trim();
      const knownCategories = new Set(Array.from(sections).map(function (sec) {
        return sec.getAttribute('data-faq-section') || '';
      }));
      const initialFilter = knownCategories.has(hashCategory) ? hashCategory : DEFAULT_FILTER;

      setActiveFilter(initialFilter);
      applyFilters();
      syncStackHeightToNav();
    })();
