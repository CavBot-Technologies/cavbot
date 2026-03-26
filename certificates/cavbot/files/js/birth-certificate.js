  // GLOBAL CTA BUTTONS (safe, no conflict)
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

    // Print / Save PDF
    (function () {
      var printBtn = document.getElementById('printCert');
      if (!printBtn) return;
      printBtn.addEventListener('click', function () {
        window.print();
      });
    })();