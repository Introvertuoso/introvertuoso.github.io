// Smooth high-resolution image zoom bounded below the navbar
$(document).ready(function () {
  function getNavbarHeight() {
    const navbar = document.querySelector("#navbar") || document.querySelector("nav.navbar") || document.querySelector("header nav");
    return navbar ? navbar.getBoundingClientRect().height : 60;
  }

  function getOverlayBg() {
    const themeBg = getComputedStyle(document.documentElement).getPropertyValue("--global-bg-color").trim() || "#ffffff";
    if (themeBg.startsWith("#") && themeBg.length === 7) {
      return themeBg + "f0";
    }
    return themeBg;
  }

  // Create singleton overlay
  let overlay = document.getElementById("zoom-fullscreen-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "zoom-fullscreen-overlay";
    overlay.style.cssText =
      "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:1050;opacity:0;visibility:hidden;" +
      "transition:opacity 0.25s cubic-bezier(0.2, 0, 0.2, 1), visibility 0.25s;cursor:zoom-out;display:block;" +
      "backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);";
    document.body.appendChild(overlay);
  }

  let activeImg = null;
  let activeClone = null;

  function closeZoom() {
    if (!activeClone || !activeImg) {
      if (overlay) {
        overlay.style.opacity = "0";
        overlay.style.visibility = "hidden";
      }
      return;
    }

    const rect = activeImg.getBoundingClientRect();
    activeClone.style.top = rect.top + "px";
    activeClone.style.left = rect.left + "px";
    activeClone.style.width = rect.width + "px";
    activeClone.style.height = rect.height + "px";
    activeClone.style.borderRadius = getComputedStyle(activeImg).borderRadius || "4px";
    activeClone.style.boxShadow = "none";
    overlay.style.opacity = "0";

    const closingClone = activeClone;
    const originalImg = activeImg;

    setTimeout(() => {
      if (closingClone && closingClone.parentNode) {
        closingClone.parentNode.removeChild(closingClone);
      }
      overlay.style.visibility = "hidden";
      if (originalImg) {
        originalImg.style.visibility = "";
      }
    }, 260);

    activeClone = null;
    activeImg = null;
  }

  function openZoom(img) {
    if (!img || activeClone) return;

    activeImg = img;
    const startRect = img.getBoundingClientRect();
    const highResSrc = img.getAttribute("data-zoom-src") || img.currentSrc || img.src;

    overlay.style.backgroundColor = getOverlayBg();
    overlay.style.visibility = "visible";
    overlay.style.opacity = "1";

    const clone = document.createElement("img");
    clone.src = highResSrc;
    clone.alt = img.alt || "";
    clone.style.cssText =
      "position:fixed;z-index:1051;top:" +
      startRect.top +
      "px;left:" +
      startRect.left +
      "px;width:" +
      startRect.width +
      "px;height:" +
      startRect.height +
      "px;object-fit:contain;cursor:zoom-out;border-radius:" +
      (getComputedStyle(img).borderRadius || "4px") +
      ";transition:all 0.28s cubic-bezier(0.2, 0, 0.2, 1);box-shadow:0 12px 36px rgba(0,0,0,0.25);image-rendering:auto;";

    document.body.appendChild(clone);
    activeClone = clone;
    img.style.visibility = "hidden";

    // Calculate fullscreen bounds cleanly below the navbar
    const navbarHeight = getNavbarHeight();
    const margin = 20;
    const topOffset = navbarHeight + margin;
    const maxW = window.innerWidth - margin * 2;
    const maxH = window.innerHeight - topOffset - margin;

    // Use intrinsic image dimensions to preserve natural aspect ratio
    const naturalW = img.naturalWidth || startRect.width;
    const naturalH = img.naturalHeight || startRect.height;
    const aspectRatio = naturalW / naturalH;

    let targetW = maxW;
    let targetH = targetW / aspectRatio;

    if (targetH > maxH) {
      targetH = maxH;
      targetW = targetH * aspectRatio;
    }

    const targetLeft = (window.innerWidth - targetW) / 2;
    const targetTop = topOffset + (maxH - targetH) / 2;

    requestAnimationFrame(() => {
      clone.style.top = targetTop + "px";
      clone.style.left = targetLeft + "px";
      clone.style.width = targetW + "px";
      clone.style.height = targetH + "px";
      clone.style.borderRadius = "6px";
    });

    clone.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeZoom();
    });
  }

  overlay.addEventListener("click", function (e) {
    e.preventDefault();
    closeZoom();
  });

  window.addEventListener(
    "scroll",
    function () {
      if (activeClone) {
        closeZoom();
      }
    },
    { passive: true }
  );

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && activeClone) {
      closeZoom();
    }
  });

  window.addEventListener("resize", function () {
    if (activeClone && activeImg) {
      const navbarHeight = getNavbarHeight();
      const margin = 20;
      const topOffset = navbarHeight + margin;
      const maxW = window.innerWidth - margin * 2;
      const maxH = window.innerHeight - topOffset - margin;

      const naturalW = activeImg.naturalWidth || 1;
      const naturalH = activeImg.naturalHeight || 1;
      const aspectRatio = naturalW / naturalH;

      let targetW = maxW;
      let targetH = targetW / aspectRatio;

      if (targetH > maxH) {
        targetH = maxH;
        targetW = targetH * aspectRatio;
      }

      const targetLeft = (window.innerWidth - targetW) / 2;
      const targetTop = topOffset + (maxH - targetH) / 2;

      activeClone.style.top = targetTop + "px";
      activeClone.style.left = targetLeft + "px";
      activeClone.style.width = targetW + "px";
      activeClone.style.height = targetH + "px";
    }
  });

  // Global click delegator
  document.addEventListener(
    "click",
    function (e) {
      const zoomTarget = e.target.closest("[data-zoomable], .project-logo-badge, .project-img-wrapper, .preview-container");
      if (zoomTarget) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const img = zoomTarget.matches("[data-zoomable]") ? zoomTarget : zoomTarget.querySelector("[data-zoomable], img");
        if (img) {
          openZoom(img);
        }
      }
    },
    true
  );

  // Expose global interface for mobile preview and compatibility
  window.zoomImage = openZoom;
  window.closeZoom = closeZoom;
  window.medium_zoom = {
    open: function (opts) {
      if (opts && opts.target) openZoom(opts.target);
    },
    close: closeZoom,
    update: function () {},
    attach: function () {},
    detach: function () {},
  };
});
