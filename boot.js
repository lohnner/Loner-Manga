(() => {
  const version = Date.now().toString();
  const stylesheet = document.querySelector("link[data-loner-cache-bust]");
  const mobileViewport = window.matchMedia?.("(max-width: 820px)")?.matches;
  const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches;
  const mobileAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const shouldRefreshStylesheet = !(mobileViewport || coarsePointer || mobileAgent);

  if (stylesheet && shouldRefreshStylesheet) {
    const href = stylesheet.getAttribute("href");
    stylesheet.setAttribute("href", href + (href.includes("?") ? "&" : "?") + "v=" + version);
  }

  const app = document.createElement("script");
  app.type = "module";
  app.src = document.currentScript.dataset.lonerApp + "?v=" + version;
  document.head.append(app);
})();
