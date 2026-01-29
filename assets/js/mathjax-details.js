(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function typesetIn(el) {
    if (!window.MathJax || !window.MathJax.typesetPromise) return;
    window.MathJax.typesetPromise([el]).catch(function () {
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

    // Also typeset once on load in case some math is visible immediately.
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch(function () {
        // no-op
      });
    }
  });
})();
