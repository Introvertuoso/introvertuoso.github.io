$(document).ready(function () {
  // add robust delegated toggle functionality to abstract, award and bibtex buttons
  $(document).on("click", "a.abstract", function (e) {
    e.preventDefault();
    var $entry = $(this).closest("li");
    $entry.find(".award.hidden.open").removeClass("open");
    $entry.find(".bibtex.hidden.open").removeClass("open");
    $entry.find(".abstract.hidden").toggleClass("open");
  });
  $(document).on("click", "a.award", function (e) {
    e.preventDefault();
    var $entry = $(this).closest("li");
    $entry.find(".abstract.hidden.open").removeClass("open");
    $entry.find(".bibtex.hidden.open").removeClass("open");
    $entry.find(".award.hidden").toggleClass("open");
  });
  $(document).on("click", "a.bibtex", function (e) {
    e.preventDefault();
    var $entry = $(this).closest("li");
    $entry.find(".abstract.hidden.open").removeClass("open");
    $entry.find(".award.hidden.open").removeClass("open");
    $entry.find(".bibtex.hidden").toggleClass("open");
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
    const previewBox = container.querySelector(".preview-container");
    const img = container.querySelector(".preview-container img");
    if (!img || !previewBox) return;

    previewBox.classList.remove("d-none");
    previewBox.style.visibility = "hidden";
    previewBox.style.position = "absolute";
    previewBox.style.width = "200px";
    previewBox.style.height = "auto";

    if (typeof medium_zoom !== "undefined" && medium_zoom) {
      medium_zoom.open({ target: img });

      medium_zoom.on("closed", function onZoomClosed() {
        previewBox.classList.add("d-none");
        previewBox.style.visibility = "";
        previewBox.style.position = "";
        previewBox.style.width = "";
        previewBox.style.height = "";
        medium_zoom.off("closed", onZoomClosed);
      });
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
  }, speed || 12);
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
  }, speed || 12);
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

