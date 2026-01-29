(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  var pending = new Set();

  function typesetIn(el) {
    // If MathJax isn't ready yet, remember this element and retry when ready.
    if (!window.MathJax || !window.MathJax.typesetPromise) {
      pending.add(el);
      return;
    }

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

  function flushPending() {
    if (!window.MathJax || !window.MathJax.typesetPromise) return;
    if (pending.size === 0) return;
    var els = Array.from(pending);
    pending.clear();
    // Typeset all pending containers.
    if (window.MathJax.startup && window.MathJax.startup.promise) {
      window.MathJax.startup.promise
        .then(function () {
          return window.MathJax.typesetPromise(els);
        })
        .catch(function () {
          // no-op
        });
      return;
    }
    window.MathJax.typesetPromise(els).catch(function () {
      // no-op
    });
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

    // When MathJax finishes loading, typeset anything that was expanded early.
    window.addEventListener("mathjax-ready", flushPending);

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

    // If MathJax was already loaded before this script ran.
    if (window.__mathjax_ready__) {
      flushPending();
    }
  });
})();
