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
