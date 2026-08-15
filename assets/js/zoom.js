// Initialize medium zoom.
$(document).ready(function () {
  medium_zoom = mediumZoom("[data-zoomable]", {
    background: getComputedStyle(document.documentElement).getPropertyValue("--global-bg-color") + "ee", // + 'ee' for trasparency.
  });

  // Prevent parent <a> navigation and trigger mediumZoom when clicking zoomable images or badge wrappers
  document.addEventListener(
    "click",
    function (e) {
      const zoomTarget = e.target.closest("[data-zoomable], .project-logo-badge, .project-img-wrapper");
      if (zoomTarget) {
        e.preventDefault();
        const img = zoomTarget.matches("[data-zoomable]") ? zoomTarget : zoomTarget.querySelector("[data-zoomable]");
        if (img && typeof medium_zoom !== "undefined" && medium_zoom) {
          medium_zoom.open({ target: img });
        }
      }
    },
    true
  );
});
