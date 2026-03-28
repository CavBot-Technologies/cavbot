  // ==========
    // GUIDE LIGHTBOX (epub-style swipe)
    // ==========
    (function(){
      var modal = document.getElementById('installGuide');
      var track = document.getElementById('guideTrack');
      var viewport = document.getElementById('guideViewport');
      var counter = document.getElementById('guideCounter');
      var dots = modal ? modal.querySelectorAll('.dot') : [];
      var toast = document.getElementById('copyToast');

      if (!modal || !track || !viewport) return;

      var pages = track.children;
      var index = 0;

      function lockScroll(on){
        if (on){
          document.documentElement.classList.add('modal-lock');
          document.body.classList.add('modal-lock');
        } else {
          document.documentElement.classList.remove('modal-lock');
          document.body.classList.remove('modal-lock');
        }
      }

      function anyModalOpen(){
        return document.querySelector('.lightbox.is-open');
      }

      function setIndex(i){
        index = Math.max(0, Math.min(i, pages.length - 1));
        track.style.transform = 'translateX(' + (-index * 100) + '%)';
        if (counter) counter.textContent = 'Step ' + (index + 1) + ' of ' + pages.length;

        dots.forEach(function(d){
          d.classList.remove('is-active');
          if (parseInt(d.getAttribute('data-dot'), 10) === index) d.classList.add('is-active');
        });
      }

      function open(){
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden','false');
        lockScroll(true);
        setIndex(index);
        var closeBtn = modal.querySelector('[data-guide-close]');
        if (closeBtn) closeBtn.focus({preventScroll:true});
      }

      function close(){
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden','true');
        if (!anyModalOpen()) lockScroll(false);
      }

      // open triggers (INTENTIONAL: only the guide card uses this now)
      document.querySelectorAll('[data-open-guide]').forEach(function(btn){
        btn.addEventListener('click', function(e){
          e.preventDefault();
          open();
        });
      });

      // close triggers
      modal.querySelectorAll('[data-guide-close]').forEach(function(btn){
        btn.addEventListener('click', function(e){
          e.preventDefault();
          close();
        });
      });

      // next/prev
      modal.querySelector('[data-next]').addEventListener('click', function(){ setIndex(index + 1); });
      modal.querySelector('[data-prev]').addEventListener('click', function(){ setIndex(index - 1); });

      // dots
      dots.forEach(function(d){
        d.addEventListener('click', function(){
          var i = parseInt(d.getAttribute('data-dot'), 10);
          if (!isNaN(i)) setIndex(i);
        });
      });

      // keyboard
      window.addEventListener('keydown', function(e){
        if (!modal.classList.contains('is-open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowRight') setIndex(index + 1);
        if (e.key === 'ArrowLeft') setIndex(index - 1);
      });

      // swipe (touch)
      var startX = 0, currentX = 0, dragging = false;
      function onStart(x){
        dragging = true;
        startX = x;
        currentX = x;
        track.style.transition = 'none';
      }
      function onMove(x){
        if (!dragging) return;
        currentX = x;
        var delta = currentX - startX;
        track.style.transform = 'translateX(calc(' + (-index * 100) + '% + ' + delta + 'px))';
      }
      function onEnd(){
        if (!dragging) return;
        dragging = false;
        track.style.transition = '';
        var delta = currentX - startX;
        var threshold = 60;
        if (delta < -threshold) setIndex(index + 1);
        else if (delta > threshold) setIndex(index - 1);
        else setIndex(index);
      }

      viewport.addEventListener('touchstart', function(e){ onStart(e.touches[0].clientX); }, {passive:true});
      viewport.addEventListener('touchmove', function(e){ onMove(e.touches[0].clientX); }, {passive:true});
      viewport.addEventListener('touchend', function(){ onEnd(); });

      // copy snippet (main + guide)
      function flashToast(){
        if (!toast) return;
        toast.classList.add('is-on');
        window.setTimeout(function(){ toast.classList.remove('is-on'); }, 900);
      }
      function copyText(text){
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(text).then(flashToast).catch(function(){});
        } else {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); flashToast(); } catch(e){}
          document.body.removeChild(ta);
        }
      }

      var snippetEl = document.getElementById('snippetBlock');
      document.querySelectorAll('[data-copy-snippet]').forEach(function(btn){
        btn.addEventListener('click', function(){
          copyText(snippetEl ? snippetEl.textContent : '');
        });
      });

      var guideCopyBtn = modal.querySelector('[data-guide-copy]');
      var guideSnippetEl = document.getElementById('guideSnippet');
      if (guideCopyBtn){
        guideCopyBtn.addEventListener('click', function(){
          copyText(guideSnippetEl ? guideSnippetEl.textContent : '');
        });
      }

      // ==========
      // TOC active state (clean + subtle)
      // ==========
      var tocLinks = document.querySelectorAll('[data-toc]');
      var sections = ['overview','install','surfaces','model','privacy','help'].map(function(id){
        return document.getElementById(id);
      }).filter(Boolean);

      function setActive(id){
        tocLinks.forEach(function(a){
          a.classList.remove('is-active');
          if (a.getAttribute('href') === '#' + id) a.classList.add('is-active');
        });
      }

      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting){
            setActive(entry.target.id);
          }
        });
      }, { root: null, threshold: 0.28 });

      sections.forEach(function(sec){ io.observe(sec); });

      setActive('overview');
    })();
    // ==========
    // NEW LIGHTBOXES (Badge Passport + 404 Implementation Notes)
    // ==========
    (function(){
      var badgeModal = document.getElementById('badgePassport');
      var implModal  = document.getElementById('implNotes');

      function lockScroll(on){
        if (on){
          document.documentElement.classList.add('modal-lock');
          document.body.classList.add('modal-lock');
        } else {
          document.documentElement.classList.remove('modal-lock');
          document.body.classList.remove('modal-lock');
        }
      }

      function anyModalOpen(){
        return !!document.querySelector('.lightbox.is-open');
      }

      function openModal(modal){
        if (!modal) return;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden','false');
        lockScroll(true);
        var closeBtn = modal.querySelector('button.lightbox-close');
        if (closeBtn) closeBtn.focus({preventScroll:true});
      }

      function closeModal(modal){
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden','true');
        if (!anyModalOpen()) lockScroll(false);
      }

      // BADGE PASSPORT triggers
      document.querySelectorAll('[data-open-badge]').forEach(function(btn){
        btn.addEventListener('click', function(e){
          e.preventDefault();
          openModal(badgeModal);
        });
      });
      if (badgeModal){
        badgeModal.querySelectorAll('[data-badge-close]').forEach(function(el){
          el.addEventListener('click', function(e){
            e.preventDefault();
            closeModal(badgeModal);
          });
        });
      }

      // IMPLEMENTATION NOTES triggers
      document.querySelectorAll('[data-open-impl]').forEach(function(btn){
        btn.addEventListener('click', function(e){
          e.preventDefault();
          openModal(implModal);
        });
      });
      if (implModal){
        implModal.querySelectorAll('[data-impl-close]').forEach(function(el){
          el.addEventListener('click', function(e){
            e.preventDefault();
            closeModal(implModal);
          });
        });
      }

      // ESC closes whichever is open (badge/impl)
      window.addEventListener('keydown', function(e){
        if (e.key !== 'Escape') return;
        if (implModal && implModal.classList.contains('is-open')) return closeModal(implModal);
        if (badgeModal && badgeModal.classList.contains('is-open')) return closeModal(badgeModal);
      });

      // Allow cross-page badge click to route here and open the native passport modal.
      var openFromHash = String(window.location.hash || '').toLowerCase() === '#badge-passport';
      if (openFromHash && badgeModal){
        openModal(badgeModal);
      }
    })();
