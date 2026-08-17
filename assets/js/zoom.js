// Initialize medium zoom with viewport fitting bounded below the navbar
$(document).ready(function () {
  const marginSide = 20;
  const marginBottom = 20;

  function getNavbarHeight() {
    const navbar = document.querySelector("#navbar") || document.querySelector("nav.navbar") || document.querySelector("header nav");
    return navbar ? navbar.getBoundingClientRect().height : 60;
  }

  function applyFullscreenZoomTransform(img) {
    if (!img) return;

    const navbarHeight = getNavbarHeight();
    const marginTop = navbarHeight + 20; // Stops cleanly below the navbar
    const viewportWidth = window.innerWidth - 2 * marginSide;
    const viewportHeight = window.innerHeight - marginTop - marginBottom;

    const rect = img.getBoundingClientRect();
    const h = rect.width;
    const z = rect.height;
    const v = rect.left;
    const g = rect.top;

    if (!h || !z || viewportWidth <= 0 || viewportHeight <= 0) return;

    const scaleX = viewportWidth / h;
    const scaleY = viewportHeight / z;
    const E = Math.min(scaleX, scaleY);

    const tx = ((window.innerWidth - h) / 2 - v) / E;
    const ty = (marginTop + (viewportHeight - z) / 2 - g) / E;
    const transform = "scale(" + E + ") translate3d(" + tx + "px, " + ty + "px, 0)";

    const zoomedImg = document.querySelector(".medium-zoom-image--opened");
    if (zoomedImg) {
      zoomedImg.style.transform = transform;
    }
  }

  medium_zoom = mediumZoom("[data-zoomable]", {
    background: getComputedStyle(document.documentElement).getPropertyValue("--global-bg-color") + "ee", // + 'ee' for transparency.
    margin: 20,
  });

  medium_zoom.on("open", function (event) {
    requestAnimationFrame(function () {
      applyFullscreenZoomTransform(event.target);
    });
  });

  // Handle window resize while zoomed
  window.addEventListener("resize", function () {
    const openedImg = document.querySelector(".medium-zoom-image--opened");
    if (openedImg) {
      applyFullscreenZoomTransform(openedImg);
    }
  });

  // Prevent parent <a> navigation and trigger mediumZoom when clicking zoomable images or badge wrappers
  document.addEventListener(
    "click",
    function (e) {
      const zoomTarget = e.target.closest("[data-zoomable], .project-logo-badge, .project-img-wrapper, .preview-container");
      if (zoomTarget) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const img = zoomTarget.matches("[data-zoomable]") ? zoomTarget : zoomTarget.querySelector("[data-zoomable], img");
        if (img && typeof medium_zoom !== "undefined" && medium_zoom) {
          try {
            if (!medium_zoom.getImages().includes(img)) {
              medium_zoom.attach(img);
            }
            medium_zoom.open({ target: img });
          } catch (err) {
            mediumZoom(img, {
              background: getComputedStyle(document.documentElement).getPropertyValue("--global-bg-color") + "ee",
              margin: 20,
            }).open();
          }
        }
      }
    },
    true
  );
});
