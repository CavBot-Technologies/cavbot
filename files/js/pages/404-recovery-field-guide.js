 // ==========
    // TOC active state (clean + subtle)
    // ==========
    (function(){
      var tocLinks = document.querySelectorAll('[data-toc]');
      var ids = ['why','seo','patterns','examples','checklist'];
      var sections = ids.map(function(id){ return document.getElementById(id); }).filter(Boolean);

      function setActive(id){
        tocLinks.forEach(function(a){
          a.classList.remove('is-active');
          if (a.getAttribute('href') === '#' + id) a.classList.add('is-active');
        });
      }

      if (!('IntersectionObserver' in window) || sections.length === 0) {
        setActive('why');
        return;
      }

      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      }, { root: null, threshold: 0.28 });

      sections.forEach(function(sec){ io.observe(sec); });
      setActive('why');
    })();