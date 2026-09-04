$(document).ready(function () {
  // Smooth graceful accordion animation for publication abstract, bibtex, and award dropdowns
  var BIB_ANIM_DURATION_EXPAND = 480;
  var BIB_ANIM_DURATION_COLLAPSE = 400;
  var BIB_ANIM_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

  function collapseBibPanel(panel, duration) {
    if (!panel) return;
    duration = duration || BIB_ANIM_DURATION_COLLAPSE;

    if (panel._bibAnimTimeout) {
      clearTimeout(panel._bibAnimTimeout);
      panel._bibAnimTimeout = null;
    }

    var isCurrentlyOpen = panel.classList.contains("open");
    var isCollapsing = panel.classList.contains("collapsing");
    if (!isCurrentlyOpen && !isCollapsing && panel.offsetHeight === 0) {
      return;
    }

    var currentHeight = panel.offsetHeight;

    // Lock starting geometry without transition
    panel.style.transition = "none";
    panel.style.height = currentHeight + "px";
    panel.style.marginTop = getComputedStyle(panel).marginTop;
    panel.style.overflow = "hidden";

    panel.classList.add("collapsing");
    panel.classList.remove("open");

    // Force reflow so starting state is committed
    void panel.offsetHeight;

    // Animate smoothly to 0 with cubic-bezier easing matching the news dropdown
    panel.style.transition =
      "height " + duration + "ms " + BIB_ANIM_EASING + ", " +
      "margin-top " + duration + "ms " + BIB_ANIM_EASING + ", " +
      "opacity " + Math.round(duration * 0.75) + "ms ease, " +
      "border-color " + Math.round(duration * 0.6) + "ms ease";
    panel.style.height = "0px";
    panel.style.marginTop = "0px";
    panel.style.opacity = "0";
    panel.style.borderColor = "transparent";

    panel._bibAnimTimeout = setTimeout(function () {
      panel.classList.remove("collapsing");
      panel.style.transition = "";
      panel.style.height = "";
      panel.style.marginTop = "";
      panel.style.opacity = "";
      panel.style.borderColor = "";
      panel.style.overflow = "";
      panel._bibAnimTimeout = null;
    }, duration);
  }

  function expandBibPanel(panel, duration) {
    if (!panel) return;
    duration = duration || BIB_ANIM_DURATION_EXPAND;

    if (panel._bibAnimTimeout) {
      clearTimeout(panel._bibAnimTimeout);
      panel._bibAnimTimeout = null;
    }

    if (panel.classList.contains("open") && !panel.classList.contains("collapsing") && !panel.style.height) {
      return;
    }

    var startHeight = panel.offsetHeight || 0;
    var startMarginTop = parseFloat(getComputedStyle(panel).marginTop) || 0;

    // Temporarily calculate natural open height
    panel.style.transition = "none";
    panel.style.visibility = "hidden";
    panel.style.height = "auto";
    panel.style.marginTop = "0.5rem";
    panel.classList.remove("collapsing");
    panel.classList.add("open");

    var targetHeight = panel.offsetHeight;

    // Revert to start state before browser paint
    panel.classList.remove("open");
    panel.style.visibility = "";
    panel.style.height = startHeight + "px";
    panel.style.marginTop = startMarginTop + "px";
    panel.style.opacity = startHeight > 0 ? getComputedStyle(panel).opacity : "0";
    panel.style.borderColor = "transparent";
    panel.style.overflow = "hidden";

    // Force reflow
    void panel.offsetHeight;

    // Animate smoothly to natural height
    panel.classList.add("open");
    panel.style.transition =
      "height " + duration + "ms " + BIB_ANIM_EASING + ", " +
      "margin-top " + duration + "ms " + BIB_ANIM_EASING + ", " +
      "opacity " + duration + "ms ease, " +
      "border-color " + Math.round(duration * 0.75) + "ms ease";
    panel.style.height = targetHeight + "px";
    panel.style.marginTop = "0.5rem";
    panel.style.opacity = "1";
    panel.style.borderColor = "";

    panel._bibAnimTimeout = setTimeout(function () {
      if (panel.classList.contains("open") && !panel.classList.contains("collapsing")) {
        panel.style.height = "";
        panel.style.transition = "";
        panel.style.marginTop = "";
        panel.style.opacity = "";
        panel.style.borderColor = "";
        panel.style.overflow = "";
      }
      panel._bibAnimTimeout = null;
    }, duration);
  }

  function handleBibToggle(btn, type) {
    var $entry = $(btn).closest("li, .entry, .row");
    if (!$entry.length) return;

    var targetPanel = null;
    if (type === "bibtex") {
      targetPanel = $entry.find(".bibtex.hidden")[0];
    } else if (type === "award") {
      targetPanel = $entry.find(".award.hidden")[0];
    } else if (type === "abstract") {
      var btnText = $(btn).text().trim().toLowerCase();
      if (btnText === "video") {
        var videoPanel = $entry.find(".abstract.hidden").filter(function () {
          return $(this).find("video, iframe").length > 0;
        })[0];
        targetPanel = videoPanel || $entry.find(".abstract.hidden").last()[0];
      } else {
        targetPanel = $entry.find(".abstract.hidden").first()[0];
      }
    }

    if (!targetPanel) return;

    var isOpen = targetPanel.classList.contains("open") && !targetPanel.classList.contains("collapsing");

    if (isOpen) {
      $(btn).attr("aria-expanded", "false");
      collapseBibPanel(targetPanel);
    } else {
      $entry.find("a.abstract, a.bibtex, a.award").attr("aria-expanded", "false");
      $(btn).attr("aria-expanded", "true");

      // Gracefully collapse any other open panels in this publication entry
      $entry.find(".hidden.open, .hidden.collapsing").each(function () {
        if (this !== targetPanel) {
          collapseBibPanel(this);
        }
      });
      expandBibPanel(targetPanel);
    }
  }

  $(document).on("click", "a.abstract", function (e) {
    e.preventDefault();
    handleBibToggle(this, "abstract");
  });
  $(document).on("click", "a.award", function (e) {
    e.preventDefault();
    handleBibToggle(this, "award");
  });
  $(document).on("click", "a.bibtex", function (e) {
    e.preventDefault();
    handleBibToggle(this, "bibtex");
  });

  // Graceful unraveling and smooth accordion for collapsible categories (.collapsible-category)
  // in Publications, Activities, and Recreation
  var CAT_ANIM_DURATION_EXPAND = 520;
  var CAT_ANIM_DURATION_COLLAPSE = 480;
  var CAT_ANIM_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

  function ensureCategoryWrapper(details) {
    var content = details.querySelector(".collapsible-category-content");
    if (!content) {
      content = document.createElement("div");
      content.className = "collapsible-category-content";
      var children = Array.from(details.children);
      children.forEach(function (child) {
        if (child.tagName.toLowerCase() !== "summary") {
          content.appendChild(child);
        }
      });
      details.appendChild(content);
    }
    return content;
  }

  // Initialize any category without wrapper
  $("details.collapsible-category").each(function () {
    ensureCategoryWrapper(this);
  });

  function collapseCategory(details, duration) {
    if (!details) return;
    duration = duration || CAT_ANIM_DURATION_COLLAPSE;
    var content = ensureCategoryWrapper(details);
    if (!content) return;

    if (details._catAnimTimeout) {
      clearTimeout(details._catAnimTimeout);
      details._catAnimTimeout = null;
    }

    if (!details.open && !details.classList.contains("is-collapsing")) {
      return;
    }

    details.classList.add("is-collapsing");
    details.classList.remove("is-expanding");

    // Current rendered layout height
    var currentHeight = content.offsetHeight;
    content.style.transition = "none";
    content.style.height = currentHeight + "px";
    content.style.overflow = "hidden";

    // Gracefully ravel out child entries
    var items = content.querySelectorAll("ol.bibliography > li, .row > .col, .row > [class*=\"col-\"]");
    var total = items.length;
    items.forEach(function (item, idx) {
      item.classList.remove("category-item-unravel-in");
      var reverseIdx = Math.min((total - 1) - idx, 8);
      item.style.animationDelay = (reverseIdx * 25) + "ms";
      item.classList.add("category-item-ravel-out");
    });

    // Force reflow
    void content.offsetHeight;

    // Smoothly animate height down to 0
    content.style.transition =
      "height " + duration + "ms " + CAT_ANIM_EASING + ", " +
      "opacity " + Math.round(duration * 0.75) + "ms ease";
    content.style.height = "0px";
    content.style.opacity = "0";

    details._catAnimTimeout = setTimeout(function () {
      details.removeAttribute("open");
      details.classList.remove("is-collapsing");
      content.style.transition = "";
      content.style.height = "";
      content.style.opacity = "";
      content.style.overflow = "";
      items.forEach(function (item) {
        item.classList.remove("category-item-ravel-out");
        item.style.animationDelay = "";
      });
      details._catAnimTimeout = null;
    }, duration);
  }

  function expandCategory(details, duration) {
    if (!details) return;
    duration = duration || CAT_ANIM_DURATION_EXPAND;
    var content = ensureCategoryWrapper(details);
    if (!content) return;

    if (details._catAnimTimeout) {
      clearTimeout(details._catAnimTimeout);
      details._catAnimTimeout = null;
    }

    var startHeight = details.classList.contains("is-collapsing") ? content.offsetHeight : 0;

    details.classList.remove("is-collapsing");
    details.classList.add("is-expanding");

    if (!details.open) {
      details.setAttribute("open", "");
    }

    // Measure target natural open height
    content.style.transition = "none";
    content.style.visibility = "hidden";
    content.style.height = "auto";
    content.style.opacity = "1";
    var targetHeight = content.offsetHeight;

    // Restore to start position before next paint
    content.style.visibility = "";
    content.style.height = startHeight + "px";
    content.style.opacity = startHeight > 0 ? getComputedStyle(content).opacity : "0";
    content.style.overflow = "hidden";

    // Force reflow
    void content.offsetHeight;

    // Gracefully unravel in child entries with a subtle stagger
    var items = content.querySelectorAll("ol.bibliography > li, .row > .col, .row > [class*=\"col-\"]");
    items.forEach(function (item, idx) {
      item.classList.remove("category-item-ravel-out");
      item.style.animationDelay = Math.min(idx * 35, 280) + "ms";
      item.classList.add("category-item-unravel-in");
    });

    // Smoothly animate height up to targetHeight
    content.style.transition =
      "height " + duration + "ms " + CAT_ANIM_EASING + ", " +
      "opacity " + duration + "ms ease";
    content.style.height = targetHeight + "px";
    content.style.opacity = "1";

    details._catAnimTimeout = setTimeout(function () {
      if (details.open && !details.classList.contains("is-collapsing")) {
        content.style.transition = "";
        content.style.height = "";
        content.style.opacity = "";
        content.style.overflow = "";
        details.classList.remove("is-expanding");
        items.forEach(function (item) {
          item.classList.remove("category-item-unravel-in");
          item.style.animationDelay = "";
        });
      }
      details._catAnimTimeout = null;
    }, duration + 60);
  }

  $(document).on("click", "details.collapsible-category > summary.category-summary", function (e) {
    e.preventDefault();
    var details = this.closest("details.collapsible-category");
    if (!details) return;

    var isOpen = details.open && !details.classList.contains("is-collapsing");
    if (isOpen) {
      collapseCategory(details);
    } else {
      expandCategory(details);
    }
  });
  $("a, .navbar-nav a, .nav-link").removeClass("waves-effect waves-light");
  if (typeof Waves !== "undefined" && typeof Waves.detach === "function") {
    Waves.detach(".navbar-nav a");
    Waves.detach(".nav-link");
  }

  // Smooth mobile figure magnification handler
  window.openMobilePreview = function (btn) {
    const container = btn.closest(".abbr");
    if (!container) return;
    const img = container.querySelector(".preview-container img");
    if (!img) return;

    if (window.zoomImage) {
      window.zoomImage(img);
    } else if (typeof medium_zoom !== "undefined" && medium_zoom) {
      medium_zoom.open({ target: img });
    }
  };

  // bootstrap-toc
  if ($("#toc-sidebar").length) {
    // remove related publications years from the TOC
    $(".publications h2").each(function () {
      $(this).attr("data-toc-skip", "");
    });
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    Toc.init($myNav);
    $("body").scrollspy({
      target: navSelector,
    });
  }

  // add css to jupyter notebooks
  const cssLink = document.createElement("link");
  cssLink.href = "../css/jupyter.css";
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";

  let jupyterTheme = determineComputedTheme();

  $(".jupyter-notebook-iframe-container iframe").each(function () {
    $(this).contents().find("head").append(cssLink);

    if (jupyterTheme == "dark") {
      $(this).bind("load", function () {
        $(this).contents().find("body").attr({
          "data-jp-theme-light": "false",
          "data-jp-theme-name": "JupyterLab Dark",
        });
      });
    }
  });

  // trigger popovers
  $('[data-toggle="popover"]').popover({
    trigger: "hover",
  });
});

// HTML-preserving typewriter animation for coauthor expansion
function initResponsiveAuthors() {
  $('.author').each(function () {
    var $author = $(this);
    $author.addClass('author-initialized');
    var $items = $author.find('.author-item');
    var $btn = $author.find('.more-authors');
    var $list = $author.find('.more-authors-list');

    if ($items.length <= 1) return;

    // Do not collapse if currently expanded by user
    if ($list.is(':visible') && $list.children().length > 0) {
      return;
    }

    // Reset items to visible to accurately measure height
    $items.show();
    $items.find('.author-and').show();
    $btn.hide();
    $list.hide().empty();

    // Baseline height of a single-line author element
    $items.hide();
    $items.first().show();
    var singleLineHeight = $author.height() || 24;
    $items.show();

    // Check if all authors fit on 1 line
    if ($author.height() <= singleLineHeight + 4) {
      $btn.hide();
      return;
    }

    // Find the maximum number of authors k that fit on line 1 alongside "..."
    var total = $items.length;
    var best = 1;

    for (var k = total - 1; k >= 1; k--) {
      $items.hide();
      for (var i = 0; i < k; i++) {
        $items.eq(i).show();
      }
      $items.find('.author-and').hide();

      $btn.text('...').attr('title', 'Click to expand all ' + total + ' authors').show();

      var isSingleLine = ($author.height() <= singleLineHeight + 4) &&
                         ($btn[0].offsetTop <= $items.first()[0].offsetTop + 6);

      if (isSingleLine) {
        best = k;
        break;
      }
    }

    // Apply the best fitting author count
    $items.hide();
    for (var i = 0; i < best; i++) {
      $items.eq(i).show();
    }
    $items.find('.author-and').hide();

    $btn.text('...').attr('title', 'Click to expand all ' + total + ' authors').show();

    // Prepare full HTML for the hidden authors in $list
    var hiddenHtml = "";
    for (var i = best; i < total; i++) {
      var itemHtml = $items.eq(i).find('.author-name-wrap').html();
      hiddenHtml += ", " + (i === total - 1 ? "and " : "") + itemHtml;
    }
    hiddenHtml += ' <span class="less-authors" role="button" tabindex="0" title="Click to collapse">(show less)</span>';
    $list.data('full-html', hiddenHtml);
  });
}

function typeMoreAuthors(el, speed) {
  var $btn = $(el);
  var $author = $btn.closest('.author');
  var $list = $author.find('.more-authors-list');
  $btn.hide();

  var fullHtml = $list.data('full-html');
  if (!fullHtml) {
    fullHtml = $list.html();
    $list.data('full-html', fullHtml);
  }

  var container = $list[0];
  container.innerHTML = '';
  $list.show();

  var temp = document.createElement('span');
  temp.innerHTML = fullHtml;

  var tasks = [];
  function extractTasks(sourceNode, targetNode) {
    for (var i = 0; i < sourceNode.childNodes.length; i++) {
      var node = sourceNode.childNodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        var text = node.textContent;
        for (var j = 0; j < text.length; j++) {
          tasks.push({ type: 'char', char: text[j], target: targetNode });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        var clone = node.cloneNode(false);
        if (node.classList && node.classList.contains('less-authors')) {
          clone.onclick = function() { hideMoreAuthors(this); };
        }
        tasks.push({ type: 'elem', elem: clone, target: targetNode });
        extractTasks(node, clone);
      }
    }
  }
  extractTasks(temp, container);

  var idx = 0;
  var interval = setInterval(function () {
    if (idx >= tasks.length) {
      clearInterval(interval);
      return;
    }
    var task = tasks[idx++];
    if (task.type === 'elem') {
      task.target.appendChild(task.elem);
    } else if (task.type === 'char') {
      task.target.appendChild(document.createTextNode(task.char));
    }
  }, speed || 10);
}

function hideMoreAuthors(el) {
  var $less = $(el);
  var $author = $less.closest('.author');
  var $list = $author.find('.more-authors-list');
  var $btn = $author.find('.more-authors');
  $list.hide();
  $list.empty();
  $btn.fadeIn(150);
}

function initResponsiveTitles() {
  $('.title[data-full-title]').each(function () {
    var $title = $(this);
    $title.addClass('title-initialized');
    var $primary = $title.find('.title-primary');
    var $btn = $title.find('.more-title');
    var $rest = $title.find('.more-title-rest');

    if (!$primary.length) return;

    // Do not collapse if currently expanded by user
    if ($rest.is(':visible') && $rest.text().trim().length > 0) {
      return;
    }

    var fullTitle = $title.attr('data-full-title') || '';
    if (!fullTitle) return;

    var words = fullTitle.split(/\s+/);
    if (words.length <= 2) {
      $primary.text(fullTitle);
      $btn.hide();
      $rest.hide().empty().attr('data-full-rest', '');
      return;
    }

    // Measure single line height baseline
    $primary.text('Sample');
    $btn.hide();
    $rest.hide().empty();
    var singleLineHeight = $primary.height() || 24;

    // Test if full title fits on a single line
    $primary.text(fullTitle);
    if ($primary.height() <= singleLineHeight + 4) {
      $btn.hide();
      $rest.attr('data-full-rest', '');
      return;
    }

    // Binary search maximum word count that fits on line 1 alongside "..."
    $btn.show();
    var low = 1;
    var high = words.length - 1;
    var best = 1;

    while (low <= high) {
      var mid = Math.floor((low + high) / 2);
      $primary.text(words.slice(0, mid).join(' '));

      var fitsOnSingleLine = ($primary.height() <= singleLineHeight + 4) &&
                            ($btn[0].offsetTop <= $primary[0].offsetTop + 6);

      if (fitsOnSingleLine) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    $primary.text(words.slice(0, best).join(' '));
    $rest.attr('data-full-rest', words.slice(best).join(' '));
    $btn.show();
  });
}

function typeMoreTitle(el, speed) {
  var $btn = $(el);
  var $rest = $btn.siblings(".more-title-rest");
  $btn.hide();

  var restText = ($rest.attr("data-full-rest") || "").trim();
  if (!restText) return;

  var restRaw = " " + restText;
  var container = $rest[0];
  container.innerHTML = "";
  $rest.show();

  var i = 0;
  var interval = setInterval(function () {
    if (i < restRaw.length) {
      container.appendChild(document.createTextNode(restRaw[i++]));
    } else {
      clearInterval(interval);
      var lessBtn = document.createElement("span");
      lessBtn.className = "less-title";
      lessBtn.setAttribute("role", "button");
      lessBtn.setAttribute("tabindex", "0");
      lessBtn.setAttribute("title", "Click to collapse");
      lessBtn.textContent = " (show less)";
      lessBtn.onclick = function () {
        hideMoreTitle(this);
      };
      container.appendChild(lessBtn);
    }
  }, speed || 10);
}

function hideMoreTitle(el) {
  var $less = $(el);
  var $rest = $less.closest(".more-title-rest");
  var $btn = $rest.siblings(".more-title");
  $rest.hide();
  $rest.empty();
  $btn.fadeIn(150);
}

function initResponsiveLayout() {
  initResponsiveTitles();
  initResponsiveAuthors();
}

// Auto-run responsive title & author fitting on ready, load, fonts ready, and resize
$(document).ready(function () {
  initResponsiveLayout();
});
$(window).on('load', function () {
  initResponsiveLayout();
});
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(initResponsiveLayout);
}
var _layoutResizeTimeout = null;
$(window).on('resize', function () {
  if (_layoutResizeTimeout) clearTimeout(_layoutResizeTimeout);
  _layoutResizeTimeout = setTimeout(initResponsiveLayout, 100);
});

// LinkedIn Share with Clipboard Auto-Copy & Feedback
function shareOnLinkedIn(btn, url, title) {
  var articleUrl = url || window.location.href;
  var shareText = title ? (title + '\n' + articleUrl) : articleUrl;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareText).catch(function () {});
  }

  if (btn) {
    var origHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Link Copied!';
    setTimeout(function () {
      btn.innerHTML = origHtml;
    }, 2500);
  }

  var shareUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(articleUrl);
  window.open(shareUrl, '_blank', 'width=620,height=600,resizable=yes,scrollbars=yes');
}

// Blog Reading Progress Bar
$(window).on('scroll', function () {
  var $bar = $('#scroll-progress-bar');
  if ($bar.length) {
    var winTop = $(window).scrollTop();
    var docHeight = $(document).height() - $(window).height();
    if (docHeight > 0) {
      var pct = Math.min(100, Math.max(0, (winTop / docHeight) * 100));
      $bar.css('width', pct + '%');
    }
  }
});

// Navbar Name Move In/Out Transitions (Between About and Other Pages)
$(document).ready(function () {
  var brandTitleEl = document.querySelector('a.navbar-brand.title');
  var homePath = (brandTitleEl ? brandTitleEl.getAttribute('href') : '/') || '/';
  var homeAnchor = document.createElement('a');
  homeAnchor.href = homePath;
  var canonicalHomePath = homeAnchor.pathname.replace(/\/+$/, '') || '/';

  function isHomeUrl(urlStr) {
    if (!urlStr) return false;
    try {
      var a = document.createElement('a');
      a.href = urlStr;
      var path = a.pathname.replace(/\/+$/, '') || '/';
      return path === canonicalHomePath && (a.host === window.location.host);
    } catch (e) {
      return false;
    }
  }

  var currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
  var isCurrentlyHome = (currentPath === canonicalHomePath);

  // 1. If currently on Home/About, track outgoing navigation clicks to any subpage
  if (isCurrentlyHome) {
    $(document).on('click', 'a', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var href = $(this).attr('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
      try {
        var a = document.createElement('a');
        a.href = href;
        if (a.host === window.location.host) {
          var destPath = a.pathname.replace(/\/+$/, '') || '/';
          if (destPath !== canonicalHomePath) {
            sessionStorage.setItem('nav_from_about', 'true');
          }
        }
      } catch (err) {}
    });
  } else {
    // 2. If on a subpage, intercept clicks navigating back to Home/About to play exit animation
    $(document).on('click', 'a', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      var href = $(this).attr('href');
      if (isHomeUrl(href)) {
        var $brandTitle = $('a.navbar-brand.title:not(.title-hidden)');
        if ($brandTitle.length) {
          e.preventDefault();
          var targetHref = this.href;

          $brandTitle.addClass('title-animating-out');
          $brandTitle.next('.navbar-brand-social').addClass('social-animating-out');

          var navigated = false;
          function doNavigate() {
            if (!navigated) {
              navigated = true;
              window.location.href = targetHref;
            }
          }

          $brandTitle.one('animationend webkitAnimationEnd', doNavigate);
          setTimeout(doNavigate, 230);
        }
      }
    });
  }

  // BFCache safety: reset any exit animation classes if page is restored from back/forward cache
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      $('a.navbar-brand.title').removeClass('title-animating-out');
      $('.navbar-brand-social').removeClass('social-animating-out');
    }
  });
});


