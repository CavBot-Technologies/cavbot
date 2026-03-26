 // Copy link
    (function () {
      var btn = document.getElementById('copyLinkBtn');
      if (!btn) return;

      function flashCopied() {
        btn.classList.add('is-copied');
        setTimeout(function () { btn.classList.remove('is-copied'); }, 1000);
      }

      btn.addEventListener('click', function () {
        try {
          var url = window.location.href;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function () {
              flashCopied();
            }).catch(function () {
              btn.classList.remove('is-copied');
            });
          } else {
            var tmp = document.createElement('input');
            tmp.value = url;
            document.body.appendChild(tmp);
            tmp.select();
            document.execCommand('copy');
            document.body.removeChild(tmp);
            flashCopied();
          }
        } catch (e) {
          btn.classList.remove('is-copied');
        }
      });
    })();

    // Print
    (function () {
      var btn = document.getElementById('printBtn');
      if (!btn) return;
      btn.addEventListener('click', function () {
        try { window.print(); } catch (e) {}
      });
    })();

    // Copy boilerplate blocks
    (function () {
      var blocks = document.querySelectorAll('[data-copy-block]');
      if (!blocks || !blocks.length) return;

      function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
          try {
            var tmp = document.createElement('textarea');
            tmp.value = text;
            tmp.setAttribute('readonly', '');
            tmp.style.position = 'fixed';
            tmp.style.opacity = '0';
            document.body.appendChild(tmp);
            tmp.select();
            var ok = document.execCommand('copy');
            document.body.removeChild(tmp);
            ok ? resolve() : reject();
          } catch (e) { reject(e); }
        });
      }

      blocks.forEach(function (block) {
        var btn = block.querySelector('[data-copy-btn]');
        var txt = block.querySelector('[data-copy-text]');
        if (!btn || !txt) return;

        function flashCopied() {
          btn.classList.add('is-copied');
          setTimeout(function () { btn.classList.remove('is-copied'); }, 1000);
        }

        btn.addEventListener('click', function () {
          var value = (txt.textContent || '').trim();
          copyText(value).then(function () {
            flashCopied();
          }).catch(function () {
            btn.classList.remove('is-copied');
          });
        });
      });
    })();
