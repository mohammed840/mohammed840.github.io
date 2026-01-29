(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function isTruthy(v) {
    return v !== null && v !== undefined && String(v).trim() !== "";
  }

  ready(async function () {
    var el = document.getElementById("pdfjs-viewer");
    if (!el) return;

    var pdfUrl = el.getAttribute("data-pdf-url");
    if (!isTruthy(pdfUrl)) return;

    if (!window.pdfjsLib) {
      el.innerHTML = "<p>PDF viewer failed to load (pdf.js missing).</p>";
      return;
    }

    var workerSrc = el.getAttribute("data-pdf-worker-src");
    if (isTruthy(workerSrc)) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    }

    var statusEl = document.getElementById("pdfjs-status");
    if (statusEl) statusEl.textContent = "Loading PDF…";

    try {
      var loadingTask = window.pdfjsLib.getDocument({ url: pdfUrl });
      var pdf = await loadingTask.promise;

      if (statusEl) statusEl.textContent = "Rendering " + pdf.numPages + " pages…";

      var scale = parseFloat(el.getAttribute("data-scale") || "1.25");
      var container = document.getElementById("pdfjs-pages");
      if (!container) return;

      for (var pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        var page = await pdf.getPage(pageNum);
        var viewport = page.getViewport({ scale: scale });

        var pageWrap = document.createElement("div");
        pageWrap.className = "pdfjs-page";

        var label = document.createElement("div");
        label.className = "pdfjs-page-label";
        label.textContent = "Page " + pageNum + " / " + pdf.numPages;

        var canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.className = "pdfjs-canvas";

        pageWrap.appendChild(label);
        pageWrap.appendChild(canvas);
        container.appendChild(pageWrap);

        var ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      }

      if (statusEl) statusEl.textContent = "";
    } catch (err) {
      if (statusEl) statusEl.textContent = "";
      el.innerHTML =
        "<p>Could not render the PDF in-page. You can still open it directly: <a href=\"" +
        pdfUrl +
        "\">PDF</a></p>";
    }
  });
})();
