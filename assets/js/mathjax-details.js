(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function typesetIn(el) {
    if (!window.MathJax || !window.MathJax.typesetPromise) return;

    var doTypeset = function () {
      window.MathJax.typesetPromise([el]).catch(function () {
        // no-op
      });
    };

    // If MathJax is still initializing, wait for it.
    if (window.MathJax.startup && window.MathJax.startup.promise) {
      window.MathJax.startup.promise.then(doTypeset).catch(doTypeset);
      return;
    }

    doTypeset();
  }

  ready(function () {
    document.addEventListener(
      "toggle",
      function (e) {
        var t = e.target;
        if (!t || t.tagName !== "DETAILS") return;
        if (!t.open) return;
        typesetIn(t);
      },
      true
    );

    // Also typeset once on load in case some math is visible immediately.
    if (window.MathJax && window.MathJax.typesetPromise) {
      var initial = function () {
        window.MathJax.typesetPromise().catch(function () {
          // no-op
        });
      };
      if (window.MathJax.startup && window.MathJax.startup.promise) {
        window.MathJax.startup.promise.then(initial).catch(initial);
      } else {
        initial();
      }
    }
  });
})();
