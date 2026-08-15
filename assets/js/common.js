$(document).ready(function () {
  // add toggle functionality to abstract, award and bibtex buttons
  $("a.abstract").click(function () {
    $(this).parent().parent().find(".abstract.hidden").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.award").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.bibtex").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden").toggleClass("open");
  });
  $("a").removeClass("waves-effect waves-light");

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
function typeMoreAuthors(el, speed) {
  var $btn = $(el);
  var $list = $btn.siblings('.more-authors-list');
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
        // Bind onclick if needed
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
  var $list = $less.closest('.more-authors-list');
  $list.hide();
  $list.siblings('.more-authors').fadeIn(150);
}

// Expandable Article Titles with Typewriter Animation
function initExpandableTitles() {
  $('ol.bibliography li .title').each(function () {
    var $el = $(this);
    if ($el.data('title-initialized')) return;

    var fullText = $el.text().trim();
    $el.data('full-text', fullText);

    // Create a temporary hidden clone to measure line height and breaks accurately
    var $parent = $el.parent();
    var parentWidth = $parent.width();
    if (!parentWidth || parentWidth <= 0) return;

    var $clone = $('<div></div>').css({
      position: 'absolute',
      visibility: 'hidden',
      height: 'auto',
      width: parentWidth + 'px',
      'max-width': parentWidth + 'px',
      'font-size': $el.css('font-size'),
      'font-weight': $el.css('font-weight'),
      'line-height': $el.css('line-height'),
      'font-family': $el.css('font-family'),
      'letter-spacing': $el.css('letter-spacing'),
      'white-space': 'normal'
    }).appendTo($parent);

    $clone.text('Test');
    var singleLineHeight = $clone.height();
    $clone.text(fullText);
    var fullHeight = $clone.height();

    // If it wraps to 2 or more lines
    if (fullHeight > singleLineHeight * 1.35) {
      var words = fullText.split(/\s+/);
      var line1Words = [];
      var line2Words = [];

      for (var i = 1; i <= words.length; i++) {
        var testStr = words.slice(0, i).join(' ') + ' ...';
        $clone.text(testStr);
        if ($clone.height() > singleLineHeight * 1.25) {
          line1Words = words.slice(0, Math.max(1, i - 1));
          line2Words = words.slice(Math.max(1, i - 1));
          break;
        }
      }

      if (line1Words.length > 0 && line2Words.length > 0) {
        $el.data('title-initialized', true);
        var line1Text = line1Words.join(' ');
        var restText = ' ' + line2Words.join(' ');

        $el.html(
          '<span class="title-primary">' + line1Text + '</span>' +
          '<span class="more-title" role="button" tabindex="0" title="Click to expand full title" onclick="typeMoreTitle(this, 12);">...</span>' +
          '<span class="more-title-rest" style="display: none;" data-full-rest="' + encodeURIComponent(restText) + '">' +
          restText +
          '<span class="less-title" role="button" tabindex="0" title="Click to collapse" onclick="hideMoreTitle(this);">(show less)</span>' +
          '</span>'
        );
      }
    }
    $clone.remove();
  });
}

function typeMoreTitle(el, speed) {
  var $btn = $(el);
  var $rest = $btn.siblings('.more-title-rest');
  $btn.hide();

  var restRaw = decodeURIComponent($rest.data('full-rest') || '');
  var container = $rest[0];
  container.innerHTML = '';
  $rest.show();

  var i = 0;
  var interval = setInterval(function () {
    if (i < restRaw.length) {
      container.appendChild(document.createTextNode(restRaw[i++]));
    } else {
      clearInterval(interval);
      var lessBtn = document.createElement('span');
      lessBtn.className = 'less-title';
      lessBtn.setAttribute('role', 'button');
      lessBtn.setAttribute('tabindex', '0');
      lessBtn.setAttribute('title', 'Click to collapse');
      lessBtn.textContent = ' (show less)';
      lessBtn.onclick = function () { hideMoreTitle(this); };
      container.appendChild(lessBtn);
    }
  }, speed || 12);
}

function hideMoreTitle(el) {
  var $less = $(el);
  var $rest = $less.closest('.more-title-rest');
  var $btn = $rest.siblings('.more-title');
  $rest.hide();
  $btn.fadeIn(150);
}

$(document).ready(function () {
  initExpandableTitles();
  if (document.fonts) {
    document.fonts.ready.then(initExpandableTitles);
  }
});
$(window).on('resize', function () {
  // Re-check on resize if not already expanded
  initExpandableTitles();
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

